import type { Edge, Node } from "reactflow";
import type { Net } from "../types/diagram";

type Snapshot = { nodes: Node[]; edges: Edge[]; nets: Net[]; nodeCounter: number };

type NetHistory = {
  past: Snapshot[];
  future: Snapshot[];
};

const cloneSnapshot = (
  nodes: Node[],
  edges: Edge[],
  nets: Net[],
  nodeCounter: number,
): Snapshot => ({
  nodes: nodes.map((n) => ({
    ...n,
    data: n.data ? { ...(n.data as Record<string, unknown>) } : undefined,
  })),
  edges: edges.map((e) => ({
    ...e,
    data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
  })),
  nets: nets.map((n) => ({ ...n })),
  nodeCounter,
});

const record = (
  history: NetHistory,
  nodes: Node[],
  edges: Edge[],
  nets: Net[],
  nodeCounter: number,
): void => {
  history.past.push(cloneSnapshot(nodes, edges, nets, nodeCounter));
  history.future = [];
};

const undo = (
  history: NetHistory,
  nodes: Node[],
  edges: Edge[],
  nets: Net[],
  nodeCounter: number,
): Snapshot | null => {
  const last = history.past.pop();
  if (!last) return null;
  history.future.push(cloneSnapshot(nodes, edges, nets, nodeCounter));
  return last;
};

const redo = (
  history: NetHistory,
  nodes: Node[],
  edges: Edge[],
  nets: Net[],
  nodeCounter: number,
): Snapshot | null => {
  const next = history.future.pop();
  if (!next) return null;
  history.past.push(cloneSnapshot(nodes, edges, nets, nodeCounter));
  return next;
};

const historyState = (history: NetHistory) => ({
  canUndo: history.past.length > 0,
  canRedo: history.future.length > 0,
});

const createHistory = (): NetHistory => ({ past: [], future: [] });

export { createHistory, record, undo, redo, historyState };
export type { NetHistory, Snapshot };
