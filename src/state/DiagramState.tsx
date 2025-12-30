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
import { initialNodes, initialEdges, nextCounterFromNodes } from "./initialDiagram";
import { createHistory, record, undo, redo, historyState as calcHistoryState } from "./netHistory";

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

export const DiagramProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeCounter = useRef(nextCounterFromNodes(initialNodes));
  const [nets, setNets] = useState<Net[]>([defaultNet]);
  const historyRef = useRef(createHistory());
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
    record(historyRef.current, nets, edges);
    setHistoryState(calcHistoryState(historyRef.current));
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
    record(historyRef.current, nets, edges);
    setEdges((prev) =>
      prev.map((e) =>
        e.id === edgeId ? { ...e, data: { ...(e.data ?? {}), netId: netId ?? null } } : e,
      ),
    );
    setHistoryState(calcHistoryState(historyRef.current));
  };

  const updateNetLabel = (netId: string, label: string) => {
    record(historyRef.current, nets, edges);
    setNets((prev) => prev.map((net) => (net.id === netId ? { ...net, label } : net)));
    setHistoryState(calcHistoryState(historyRef.current));
  };

  const updateNetAttributes = (netId: string, updates: Partial<Net>) => {
    record(historyRef.current, nets, edges);
    setNets((prev) => prev.map((net) => (net.id === netId ? { ...net, ...updates } : net)));
    setHistoryState(calcHistoryState(historyRef.current));
  };

  const removeNet = (netId: string) => {
    const inUse = edges.some(
      (e) => (e.data as { netId?: string | null } | undefined)?.netId === netId,
    );
    if (inUse) return false;
    record(historyRef.current, nets, edges);
    setNets((prev) => prev.filter((net) => net.id !== netId));
    setHistoryState(calcHistoryState(historyRef.current));
    return true;
  };

  const undoNetAction = () => {
    const last = undo(historyRef.current, nets, edges);
    if (!last) return false;
    setNets(last.nets);
    setEdges(last.edges);
    setHistoryState(calcHistoryState(historyRef.current));
    return true;
  };

  const redoNetAction = () => {
    const next = redo(historyRef.current, nets, edges);
    if (!next) return false;
    setNets(next.nets);
    setEdges(next.edges);
    setHistoryState(calcHistoryState(historyRef.current));
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
