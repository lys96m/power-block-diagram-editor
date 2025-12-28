import { Block, BlockB, BlockC, Net, ValidationLevel, ValidationResult } from "../types/diagram";

const makeIssue = (level: ValidationLevel, message: string, targetId?: string): ValidationResult => ({
  id: `${level}-${targetId ?? "generic"}-${message}`.replace(/\s+/g, "-"),
  level,
  message,
  targetId,
});

const isVoltageWithinTolerance = (netVoltage: number, required: number, tolerancePercent?: number): boolean => {
  const tolerance = tolerancePercent ?? 0;
  if (tolerance < 0 || tolerance > 100) {
    return false;
  }
  const delta = Math.abs(netVoltage - required);
  const allowed = required * (tolerance / 100);
  return delta <= allowed;
};

const validateVoltage = (net: Net, required: number): ValidationResult[] => {
  const within = isVoltageWithinTolerance(net.voltage, required, net.tolerance);
  if (!within) {
    return [makeIssue("error", `Voltage mismatch: net=${net.voltage}V required=${required}V`, net.id)];
  }
  return [];
};

const validatePhase = (net: Net, required: number): ValidationResult[] => {
  if (net.phase !== required) {
    return [makeIssue("error", `Phase mismatch: net=${net.phase} required=${required}`, net.id)];
  }
  return [];
};

const validateTypeBLoad = (block: BlockB, net: Net): { issues: ValidationResult[]; current?: number } => {
  const issues: ValidationResult[] = [];
  issues.push(...validateVoltage(net, block.rating.V_in));
  issues.push(...validatePhase(net, block.rating.phase));

  const { I_in, P_in, V_in } = block.rating;
  if (I_in == null && P_in == null) {
    issues.push(makeIssue("warn", "Load current undetermined (I_in and P_in missing)", block.id));
    return { issues, current: undefined };
  }

  if (I_in != null) {
    if (I_in <= 0) {
      issues.push(makeIssue("error", "I_in must be positive", block.id));
      return { issues, current: undefined };
    }
    return { issues, current: I_in };
  }

  if (P_in != null) {
    if (P_in <= 0) {
      issues.push(makeIssue("error", "P_in must be positive", block.id));
      return { issues, current: undefined };
    }
    const current = P_in / V_in;
    return { issues, current };
  }

  return { issues, current: undefined };
};

const validateTypeC = (block: BlockC, net: Net): ValidationResult[] => {
  const issues: ValidationResult[] = [];
  // 入力側の整合のみチェック（出力側はネット未指定のためここでは省略）
  issues.push(...validateVoltage(net, block.rating.in.V_in));
  issues.push(...validatePhase(net, block.rating.in.phase_in));
  if (block.rating.eta == null) {
    issues.push(makeIssue("warn", "eta is missing; efficiency calculation skipped", block.id));
  } else if (block.rating.eta <= 0 || block.rating.eta > 1) {
    issues.push(makeIssue("error", "eta must be within (0,1]", block.id));
  }
  return issues;
};

/**
 * ネットに接続されたブロックの基本的な整合性チェック。
 * - 電圧/相整合
 * - TypeB: I/P の入力有無と電流計算
 * - TypeC: eta の有無チェック
 */
export const validateBlockOnNet = (
  block: Block,
  net: Net,
): { issues: ValidationResult[]; derivedCurrent?: number } => {
  if (block.type === "B") {
    const { issues, current } = validateTypeBLoad(block, net);
    return { issues, derivedCurrent: current };
  }
  if (block.type === "C") {
    const issues = validateTypeC(block, net);
    return { issues, derivedCurrent: undefined };
  }
  // Type A はここでは電圧/相のチェック対象外（通過扱い）。容量チェックは別途電流集計時に行う。
  return { issues: [], derivedCurrent: undefined };
};

export { isVoltageWithinTolerance };
