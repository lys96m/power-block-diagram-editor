import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  Background,
  ConnectionLineType,
  Controls,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
  BaseEdge,
  getSmoothStepPath,
} from "reactflow";
import type { Edge, EdgeProps } from "reactflow";
import TextField from "@mui/material/TextField";
import { useCallback, useMemo, useState } from "react";
import "./App.css";
import "reactflow/dist/style.css";

const actions = ["New", "Open", "Save", "Export", "Undo", "Redo"];

const SmoothEdge = (props: EdgeProps) => {
  const [path] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    borderRadius: 8,
  });

  return <BaseEdge {...props} path={path} />;
};

function App() {
  const initialNodes = [
    { id: "source", position: { x: 150, y: 120 }, data: { label: "Power Source (Type C)" } },
    { id: "breaker", position: { x: 450, y: 120 }, data: { label: "Breaker (Type A)" } },
    { id: "load", position: { x: 750, y: 120 }, data: { label: "Load (Type B)" } },
  ];

  const initialEdges: Edge[] = [
    { id: "e1-2", source: "source", target: "breaker", type: "smooth" },
    { id: "e2-3", source: "breaker", target: "load", type: "smooth" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const edgeTypes = { smooth: SmoothEdge };

  const hasPath = (graphEdges: Edge[], start: string, goal: string): boolean => {
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

  const wouldCreateCycle = (
    existing: Edge[],
    source?: string | null,
    target?: string | null,
  ): boolean => {
    if (!source || !target) return true;
    if (source === target) return true;
    const candidate: Edge = { id: "temp", source, target };
    return hasPath([...existing, candidate], target, source);
  };

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );

  const handleSelectionChange = useCallback(
    ({
      nodes: selectedNodes,
      edges: selectedEdges,
    }: {
      nodes: typeof nodes;
      edges: typeof edges;
    }) => {
      setSelectedNodeId(selectedNodes[0]?.id ?? null);
      setSelectedEdgeId(selectedEdges[0]?.id ?? null);
    },
    [setSelectedEdgeId, setSelectedNodeId],
  );

  const handleNodeLabelChange = useCallback(
    (value: string) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === selectedNodeId ? { ...n, data: { ...n.data, label: value } } : n,
        ),
      );
    },
    [selectedNodeId, setNodes],
  );

  return (
    <Box className="app-root">
      <AppBar position="static" className="app-bar" elevation={1}>
        <Toolbar className="toolbar" variant="dense">
          <Typography variant="h6" component="div">
            Power Block Diagram Editor
          </Typography>
          <Stack direction="row" spacing={1}>
            {actions.map((label) => (
              <Button key={label} color="inherit" size="small" variant="text">
                {label}
              </Button>
            ))}
          </Stack>
        </Toolbar>
      </AppBar>

      <Box className="app-body">
        <Box className="panel left-panel">
          <Typography variant="subtitle1" fontWeight={600}>
            Palette
          </Typography>
          <Divider />
          <Stack spacing={1} mt={2}>
            <Button variant="contained" size="small" fullWidth>
              Add Type A
            </Button>
            <Button variant="contained" size="small" fullWidth>
              Add Type B
            </Button>
            <Button variant="contained" size="small" fullWidth>
              Add Type C
            </Button>
          </Stack>
        </Box>

        <Box className="canvas-area" component="section">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(connection) =>
              setEdges((eds) => {
                if (wouldCreateCycle(eds, connection.source, connection.target)) {
                  return eds;
                }
                return addEdge({ ...connection, type: "smooth" }, eds);
              })
            }
            edgeTypes={edgeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            onSelectionChange={handleSelectionChange}
            snapToGrid
            snapGrid={[16, 16]}
            fitView
          >
            <Background gap={16} size={1} color="rgba(0,0,0,0.1)" />
            <Controls position="top-right" />
          </ReactFlow>
        </Box>

        <Box className="panel right-panel">
          <Typography variant="subtitle1" fontWeight={600}>
            Properties
          </Typography>
          <Divider />
          <Stack spacing={1} mt={2}>
            {selectedNode && (
              <>
                <Typography variant="body2" fontWeight={600}>
                  Node: {selectedNode.id}
                </Typography>
                <TextField
                  size="small"
                  label="Label"
                  value={selectedNode.data?.label ?? ""}
                  onChange={(e) => handleNodeLabelChange(e.target.value)}
                />
              </>
            )}
            {selectedEdge && (
              <>
                <Typography variant="body2" fontWeight={600}>
                  Edge: {selectedEdge.id}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedEdge.source} → {selectedEdge.target}
                </Typography>
              </>
            )}
            {!selectedNode && !selectedEdge && (
              <Typography variant="body2" color="text.secondary">
                Nothing selected
              </Typography>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Validation
          </Typography>
          <Stack spacing={0.5} mt={1}>
            <Typography variant="body2">Errors: 0</Typography>
            <Typography variant="body2">Warnings: 0</Typography>
            <Typography variant="body2">Uncertain loads: 0</Typography>
          </Stack>
        </Box>
      </Box>

      <Box className="status-bar">
        <Typography variant="body2">Status: Ready</Typography>
        <Typography variant="body2" color="text.secondary">
          Nets: 0 | Errors: 0 | Warnings: 0 | Unassigned nets: 0 | Uncertain loads: 0
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
