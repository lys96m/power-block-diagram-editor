import type { Edge } from "reactflow";

export const hasPath = (graphEdges: Edge[], start: string, goal: string): boolean => {
  const visited = new Set<string>();
  const stack = [start];
  const adjacency = graphEdges.reduce<Map<string, string[]>>((map, e) => {
    const list = map.get(e.source) ?? [];
    list.push(e.target);
    map.set(e.source, list);
    return map;
  }, new Map());

  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || visited.has(node)) continue;
    if (node === goal) return true;
    visited.add(node);
    const neighbors = adjacency.get(node) ?? [];
    neighbors.forEach((n) => stack.push(n));
  }
  return false;
};

export const wouldCreateCycle = (
  existing: Edge[],
  source?: string | null,
  target?: string | null,
): boolean => {
  if (!source || !target) return true;
  if (source === target) return true;
  const candidate: Edge = { id: "temp", source, target };
  return hasPath([...existing, candidate], target, source);
};
