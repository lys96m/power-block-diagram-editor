import { Background, ConnectionLineType, Controls, ReactFlow } from "reactflow";
import type { Edge, EdgeTypes, Node, OnConnect, OnEdgesChange, OnNodesChange } from "reactflow";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";

type Props = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  edgeTypes: EdgeTypes;
  onSelectionChange: (params: { nodes: Node[]; edges: Edge[] }) => void;
};

export const DiagramCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  edgeTypes,
  onSelectionChange,
}: Props): ReactNode => (
  <Box className="canvas-area" component="section">
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      edgeTypes={edgeTypes}
      connectionLineType={ConnectionLineType.SmoothStep}
      onSelectionChange={onSelectionChange}
      snapToGrid
      snapGrid={[16, 16]}
      fitView
    >
      <Background gap={16} size={1} color="rgba(0,0,0,0.1)" />
      <Controls position="top-right" />
    </ReactFlow>
  </Box>
);

export default DiagramCanvas;
