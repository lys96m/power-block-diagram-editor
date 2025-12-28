import type { Block, BlockB, BlockC, Net, ValidationLevel, ValidationResult } from "../types/diagram";

const issue = (level: ValidationLevel, message: string, targetId?: string): ValidationResult => ({
  id: `${level}-${targetId ?? "global"}-${message}`.replace(/\s+/g, "-"),
  level,
  message,
  targetId,
});

const isToleranceValid = (tolerance?: number): boolean => {
  if (tolerance == null) return true;
  return tolerance >= 0 && tolerance <= 100;
};

export const isVoltageWithinTolerance = (netVoltage: number, required: number, tolerancePercent?: number): boolean => {
  const tolerance = tolerancePercent ?? 0;
  if (!isToleranceValid(tolerance)) return false;
  const delta = Math.abs(netVoltage - required);
  const allowed = required * (tolerance / 100);
  return delta <= allowed;
};

const validateVoltage = (net: Net, required: number): ValidationResult[] => {
  if (!isToleranceValid(net.tolerance)) {
    return [issue("error", "Net tolerance must be within 0-100%", net.id)];
  }
  const within = isVoltageWithinTolerance(net.voltage, required, net.tolerance);
  return within ? [] : [issue("error", `Voltage mismatch: net=${net.voltage}V required=${required}V`, net.id)];
};

const validatePhase = (net: Net, required: number): ValidationResult[] => {
  if (net.phase !== required) {
    return [issue("error", `Phase mismatch: net=${net.phase} required=${required}`, net.id)];
  }
  return [];
};

const validateTypeBLoad = (block: BlockB, net: Net): { issues: ValidationResult[]; current?: number } => {
  const issues: ValidationResult[] = [];
  issues.push(...validateVoltage(net, block.rating.V_in));
  issues.push(...validatePhase(net, block.rating.phase));

  const { I_in, P_in, V_in } = block.rating;
  if (I_in == null && P_in == null) {
    issues.push(issue("warn", "Load current undetermined (I_in and P_in missing)", block.id));
    return { issues, current: undefined };
  }

  if (I_in != null) {
    if (I_in <= 0) {
      issues.push(issue("error", "I_in must be positive", block.id));
      return { issues, current: undefined };
    }
    return { issues, current: I_in };
  }

  if (P_in != null) {
    if (P_in <= 0) {
      issues.push(issue("error", "P_in must be positive", block.id));
      return { issues, current: undefined };
    }
    return { issues, current: P_in / V_in };
  }

  return { issues, current: undefined };
};

const validateTypeC = (block: BlockC, net: Net): ValidationResult[] => {
  const issues: ValidationResult[] = [];
  issues.push(...validateVoltage(net, block.rating.in.V_in));
  issues.push(...validatePhase(net, block.rating.in.phase_in));

  const { eta } = block.rating;
  if (eta == null) {
    issues.push(issue("warn", "eta is missing; efficiency calculation skipped", block.id));
  } else if (eta <= 0 || eta > 1) {
    issues.push(issue("error", "eta must be within (0,1]", block.id));
  }

  return issues;
};

/**
 * ネットに接続されたブロックの基本整合チェック
 * - 電圧/相整合
 * - TypeB: I/P の入力有無と電流計算
 * - TypeC: eta の有無・範囲
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
  // Type A は通過扱いのためここでは電圧/相チェックなし。容量チェックは別途実施。
  return { issues: [], derivedCurrent: undefined };
};
