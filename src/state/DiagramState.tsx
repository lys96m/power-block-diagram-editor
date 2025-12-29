/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
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

  const onConnect: OnConnect = (connection) =>
    setEdges((eds) => addEdge({ ...connection, type: "smooth" }, eds));

  return (
    <DiagramStateContext.Provider
      value={{ nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect }}
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
