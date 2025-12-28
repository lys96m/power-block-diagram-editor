import { describe, expect, it } from "vitest";
import { validateBlockOnNet, isVoltageWithinTolerance } from "./validation";
import { BlockB, BlockC, Net } from "../types/diagram";

const baseNet: Net = {
  id: "N1",
  kind: "AC",
  voltage: 200,
  phase: 1,
  label: "AC200",
};

describe("isVoltageWithinTolerance", () => {
  it("allows values within percent tolerance", () => {
    expect(isVoltageWithinTolerance(100, 95, 10)).toBe(true); // 5% diff within 10%
    expect(isVoltageWithinTolerance(100, 80, 10)).toBe(false); // 20% diff
  });
});

describe("validateBlockOnNet for TypeB", () => {
  const blockBBase: Omit<BlockB, "rating"> = {
    id: "B1",
    type: "B",
    name: "Load",
    ports: [{ id: "in", role: "power_in", direction: "in" }],
  };

  it("prefers I_in when both I_in and P_in exist", () => {
    const block: BlockB = {
      ...blockBBase,
      rating: { V_in: 200, phase: 1, I_in: 5, P_in: 1500 },
    };
    const { issues, derivedCurrent } = validateBlockOnNet(block, baseNet);
    expect(issues.length).toBe(0);
    expect(derivedCurrent).toBe(5);
  });

  it("warns when both I_in and P_in are missing", () => {
    const block: BlockB = {
      ...blockBBase,
      rating: { V_in: 200, phase: 1 },
    };
    const { issues, derivedCurrent } = validateBlockOnNet(block, baseNet);
    expect(issues.some((i) => i.level === "warn")).toBe(true);
    expect(derivedCurrent).toBeUndefined();
  });

  it("produces error on voltage or phase mismatch", () => {
    const block: BlockB = {
      ...blockBBase,
      rating: { V_in: 220, phase: 3, I_in: 5 },
    };
    const { issues } = validateBlockOnNet(block, baseNet);
    const messages = issues.map((i) => i.message);
    expect(messages.some((m) => m.includes("Voltage mismatch"))).toBe(true);
    expect(messages.some((m) => m.includes("Phase mismatch"))).toBe(true);
  });

  it("respects net tolerance", () => {
    const block: BlockB = {
      ...blockBBase,
      rating: { V_in: 210, phase: 1, I_in: 5 },
    };
    const tolerantNet: Net = { ...baseNet, tolerance: 10 }; // ±10%
    const { issues } = validateBlockOnNet(block, tolerantNet);
    expect(issues.length).toBe(0);
  });
});

describe("validateBlockOnNet for TypeC", () => {
  const blockCBase: BlockC = {
    id: "C1",
    type: "C",
    name: "Converter",
    ports: [
      { id: "in", role: "power_in", direction: "in" },
      { id: "out", role: "power_out", direction: "out" },
    ],
    rating: {
      in: { V_in: 200, phase_in: 1 },
      out: { V_out: 24, phase_out: 0 },
    },
  };

  it("warns when eta is missing", () => {
    const { issues } = validateBlockOnNet(blockCBase, baseNet);
    expect(issues.some((i) => i.level === "warn")).toBe(true);
  });

  it("errors when eta is out of range", () => {
    const block: BlockC = {
      ...blockCBase,
      rating: { ...blockCBase.rating, eta: 1.5 },
    };
    const { issues } = validateBlockOnNet(block, baseNet);
    expect(issues.some((i) => i.level === "error")).toBe(true);
  });
});
