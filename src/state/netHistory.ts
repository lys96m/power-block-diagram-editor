import type { Edge } from "reactflow";
import type { Net } from "../types/diagram";

type Snapshot = { nets: Net[]; edges: Edge[] };

type NetHistory = {
  past: Snapshot[];
  future: Snapshot[];
};

const cloneSnapshot = (nets: Net[], edges: Edge[]): Snapshot => ({
  nets: nets.map((n) => ({ ...n })),
  edges: edges.map((e) => ({
    ...e,
    data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
  })),
});

const record = (history: NetHistory, nets: Net[], edges: Edge[]): void => {
  history.past.push(cloneSnapshot(nets, edges));
  history.future = [];
};

const undo = (history: NetHistory, nets: Net[], edges: Edge[]): Snapshot | null => {
  const last = history.past.pop();
  if (!last) return null;
  history.future.push(cloneSnapshot(nets, edges));
  return last;
};

const redo = (history: NetHistory, nets: Net[], edges: Edge[]): Snapshot | null => {
  const next = history.future.pop();
  if (!next) return null;
  history.past.push(cloneSnapshot(nets, edges));
  return next;
};

const historyState = (history: NetHistory) => ({
  canUndo: history.past.length > 0,
  canRedo: history.future.length > 0,
});

const createHistory = (): NetHistory => ({ past: [], future: [] });

export { createHistory, record, undo, redo, historyState };
export type { NetHistory, Snapshot };
