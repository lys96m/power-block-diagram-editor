/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useState } from "react";
import { addEdge, useEdgesState, useNodesState } from "reactflow";
import type {
  Edge,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowState,
  Node,
} from "reactflow";
import type { Net } from "../types/diagram";
import { defaultNet } from "../lib/constants";

type DiagramState = {
  nodes: Node[];
  edges: Edge[];
  setNodes: ReturnType<typeof useNodesState>[1];
  setEdges: ReturnType<typeof useEdgesState>[1];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (kind: "A" | "B" | "C") => void;
  deleteItems: (nodeIds: string[], edgeIds: string[]) => void;
  updateNodeData: (nodeId: string, data: Partial<Node["data"]>) => void;
  replaceDiagram: (nodes: Node[], edges: Edge[], nets: Net[]) => void;
  nets: Net[];
  addNet: () => string;
  updateEdgeNet: (edgeId: string, netId: string | null) => void;
  updateNetLabel: (netId: string, label: string) => void;
  updateNetAttributes: (netId: string, updates: Partial<Net>) => void;
  removeNet: (netId: string) => boolean;
  undoNetAction: () => boolean;
  redoNetAction: () => boolean;
  canUndoNet: boolean;
  canRedoNet: boolean;
};

const DiagramStateContext = createContext<DiagramState | null>(null);

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
    const match = node.id.match(/(\d+)$/);
    const num = match ? Number(match[1]) : Number.NaN;
    if (!Number.isNaN(num) && num > max) return num;
    return max;
  }, 0);
  return Math.max(maxNumericId, nodes.length);
};

export const DiagramProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeCounter = useRef(3);
  const [nets, setNets] = useState<Net[]>([defaultNet]);
  const historyRef = useRef<{
    past: { nets: Net[]; edges: Edge[] }[];
    future: { nets: Net[]; edges: Edge[] }[];
  }>({
    past: [],
    future: [],
  });
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });

  const onConnect: OnConnect = (connection) =>
    setEdges((eds) => addEdge({ ...connection, type: "smooth" }, eds));

  const addNode = (kind: "A" | "B" | "C") => {
    const id = `${kind}${nodeCounter.current + 1}`;
    nodeCounter.current += 1;
    const offset = nodeCounter.current * 30;
    const labelMap: Record<"A" | "B" | "C", string> = {
      A: "Type A",
      B: "Type B",
      C: "Type C",
    };
    const ratingMap: Record<"A" | "B" | "C", Node["data"]> = {
      A: { rating: { V_max: 250, I_max: 20, phase: 1 } },
      B: { rating: { V_in: 200, phase: 1, I_in: 5 } },
      C: { rating: { in: { V_in: 200, phase_in: 1 }, out: { V_out: 24, phase_out: 0 } } },
    };
    const newNode: Node = {
      id,
      position: { x: 200 + offset, y: 200 + offset },
      data: {
        label: `${labelMap[kind]} ${nodeCounter.current}`,
        type: kind,
        ...(ratingMap[kind] ?? {}),
      },
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const deleteItems = (nodeIds: string[], edgeIds: string[]) => {
    setEdges((prev) =>
      prev.filter(
        (e) =>
          !edgeIds.includes(e.id) &&
          !nodeIds.includes(e.source ?? "") &&
          !nodeIds.includes(e.target ?? ""),
      ),
    );
    setNodes((prev) => prev.filter((n) => !nodeIds.includes(n.id)));
  };

  const updateNodeData = (nodeId: string, data: Partial<Node["data"]>) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, data: { ...(n.data ?? {}), ...data } } : n)),
    );
  };

  const replaceDiagram = (nextNodes: Node[], nextEdges: Edge[], nextNets: Net[]) => {
    setNodes(nextNodes);
    setEdges(nextEdges);
    setNets(nextNets.length > 0 ? nextNets : [defaultNet]);
    nodeCounter.current = nextCounterFromNodes(nextNodes);
  };

  const addNet = () => {
    const snapshot = {
      nets: nets.map((n) => ({ ...n })),
      edges: edges.map((e) => ({
        ...e,
        data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
      })),
    };
    historyRef.current.past.push(snapshot);
    historyRef.current.future = [];
    setHistoryState({ canUndo: historyRef.current.past.length > 0, canRedo: false });
    let newId = "";
    setNets((prev) => {
      const index = prev.length + 1;
      newId = `net-${index}`;
      const label = `Net ${index}`;
      const next: Net = { ...defaultNet, id: newId, label };
      return [...prev, next];
    });
    return newId;
  };

  const updateEdgeNet = (edgeId: string, netId: string | null) => {
    const snapshot = {
      nets: nets.map((n) => ({ ...n })),
      edges: edges.map((e) => ({
        ...e,
        data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
      })),
    };
    historyRef.current.past.push(snapshot);
    historyRef.current.future = [];
    setEdges((prev) =>
      prev.map((e) =>
        e.id === edgeId ? { ...e, data: { ...(e.data ?? {}), netId: netId ?? null } } : e,
      ),
    );
    setHistoryState({ canUndo: historyRef.current.past.length > 0, canRedo: false });
  };

  const updateNetLabel = (netId: string, label: string) => {
    const snapshot = {
      nets: nets.map((n) => ({ ...n })),
      edges: edges.map((e) => ({
        ...e,
        data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
      })),
    };
    historyRef.current.past.push(snapshot);
    historyRef.current.future = [];
    setNets((prev) => prev.map((net) => (net.id === netId ? { ...net, label } : net)));
    setHistoryState({ canUndo: historyRef.current.past.length > 0, canRedo: false });
  };

  const updateNetAttributes = (netId: string, updates: Partial<Net>) => {
    const snapshot = {
      nets: nets.map((n) => ({ ...n })),
      edges: edges.map((e) => ({
        ...e,
        data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
      })),
    };
    historyRef.current.past.push(snapshot);
    historyRef.current.future = [];
    setNets((prev) => prev.map((net) => (net.id === netId ? { ...net, ...updates } : net)));
    setHistoryState({ canUndo: historyRef.current.past.length > 0, canRedo: false });
  };

  const removeNet = (netId: string) => {
    const inUse = edges.some(
      (e) => (e.data as { netId?: string | null } | undefined)?.netId === netId,
    );
    if (inUse) return false;
    const snapshot = {
      nets: nets.map((n) => ({ ...n })),
      edges: edges.map((e) => ({
        ...e,
        data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
      })),
    };
    historyRef.current.past.push(snapshot);
    historyRef.current.future = [];
    setNets((prev) => prev.filter((net) => net.id !== netId));
    setHistoryState({ canUndo: historyRef.current.past.length > 0, canRedo: false });
    return true;
  };

  const undoNetAction = () => {
    const last = historyRef.current.past.pop();
    if (!last) return false;
    const currentSnapshot = {
      nets: nets.map((n) => ({ ...n })),
      edges: edges.map((e) => ({
        ...e,
        data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
      })),
    };
    historyRef.current.future.push(currentSnapshot);
    setNets(last.nets);
    setEdges(last.edges);
    setHistoryState({
      canUndo: historyRef.current.past.length > 0,
      canRedo: historyRef.current.future.length > 0,
    });
    return true;
  };

  const redoNetAction = () => {
    const next = historyRef.current.future.pop();
    if (!next) return false;
    const currentSnapshot = {
      nets: nets.map((n) => ({ ...n })),
      edges: edges.map((e) => ({
        ...e,
        data: e.data ? { ...(e.data as Record<string, unknown>) } : undefined,
      })),
    };
    historyRef.current.past.push(currentSnapshot);
    setNets(next.nets);
    setEdges(next.edges);
    setHistoryState({
      canUndo: historyRef.current.past.length > 0,
      canRedo: historyRef.current.future.length > 0,
    });
    return true;
  };

  return (
    <DiagramStateContext.Provider
      value={{
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        deleteItems,
        updateNodeData,
        replaceDiagram,
        nets,
        addNet,
        updateEdgeNet,
        updateNetLabel,
        updateNetAttributes,
        removeNet,
        undoNetAction,
        redoNetAction,
        canUndoNet: historyState.canUndo,
        canRedoNet: historyState.canRedo,
      }}
    >
      {children}
    </DiagramStateContext.Provider>
  );
};

export const useDiagramState = (): DiagramState => {
  const ctx = useContext(DiagramStateContext);
  if (!ctx) {
    throw new Error("useDiagramState must be used within DiagramProvider");
  }
  return ctx;
};

// For future expansion if React Flow store access is needed
export type { ReactFlowState };
