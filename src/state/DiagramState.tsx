/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef } from "react";
import { addEdge, useEdgesState, useNodesState } from "reactflow";
import type {
  Edge,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowState,
  Node,
} from "reactflow";

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
};

const DiagramStateContext = createContext<DiagramState | null>(null);

const initialNodes: Node[] = [
  { id: "source", position: { x: 150, y: 120 }, data: { label: "Power Source (Type C)" } },
  { id: "breaker", position: { x: 450, y: 120 }, data: { label: "Breaker (Type A)" } },
  { id: "load", position: { x: 750, y: 120 }, data: { label: "Load (Type B)" } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "source", target: "breaker", type: "smooth" },
  { id: "e2-3", source: "breaker", target: "load", type: "smooth" },
];

export const DiagramProvider = ({ children }: { children: React.ReactNode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const nodeCounter = useRef(3);

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
    const newNode: Node = {
      id,
      position: { x: 200 + offset, y: 200 + offset },
      data: { label: `${labelMap[kind]} ${nodeCounter.current}` },
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
