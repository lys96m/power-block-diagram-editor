import type { BlockType, Net } from "../types/diagram";

export const defaultNet: Net = {
  id: "net-ac200",
  kind: "AC",
  voltage: 200,
  phase: 1,
  label: "AC200V",
  tolerance: 10,
};

export const typeLabels: Record<BlockType, string> = {
  A: "Breaker / Passive",
  B: "Load",
  C: "Converter / Source",
};
