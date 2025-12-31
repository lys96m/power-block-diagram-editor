import type { Edge, Node } from "reactflow";

const initialNodes: Node[] = [
  {
    id: "source",
    position: { x: 150, y: 120 },
    data: {
      label: "Power Source (Type C)",
      type: "C",
      rating: {
        in: { V_in: 200, phase_in: 1 },
        out: { V_out: 24, phase_out: 0 },
      },
    },
  },
  {
    id: "breaker",
    position: { x: 450, y: 120 },
    data: { label: "Breaker (Type A)", type: "A", rating: { V_max: 250, I_max: 20, phase: 1 } },
  },
  {
    id: "load",
    position: { x: 750, y: 120 },
    data: { label: "Load (Type B)", type: "B", rating: { V_in: 200, phase: 1, I_in: 5 } },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "source", target: "breaker", type: "smooth" },
  { id: "e2-3", source: "breaker", target: "load", type: "smooth" },
];

const nextCounterFromNodes = (nodes: Node[]): number => {
  const maxNumericId = nodes.reduce<number>((max, node) => {
    const match = node.id.match(/(\\d+)$/);
    const num = match ? Number(match[1]) : Number.NaN;
    if (!Number.isNaN(num) && num > max) return num;
    return max;
  }, 0);
  return Math.max(maxNumericId, nodes.length);
};

export { initialNodes, initialEdges, nextCounterFromNodes };
