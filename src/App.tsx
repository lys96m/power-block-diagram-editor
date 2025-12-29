import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Background, Controls, ReactFlow, addEdge, useEdgesState, useNodesState } from "reactflow";
import "./App.css";
import "reactflow/dist/style.css";

const actions = ["New", "Open", "Save", "Export", "Undo", "Redo"];

function App() {
  const initialNodes = [
    { id: "source", position: { x: 150, y: 120 }, data: { label: "Power Source (Type C)" } },
    { id: "breaker", position: { x: 450, y: 120 }, data: { label: "Breaker (Type A)" } },
    { id: "load", position: { x: 750, y: 120 }, data: { label: "Load (Type B)" } },
  ];

  const initialEdges = [
    { id: "e1-2", source: "source", target: "breaker" },
    { id: "e2-3", source: "breaker", target: "load" },
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
            onConnect={(connection) => setEdges((eds) => addEdge(connection, eds))}
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
            <Typography variant="body2" color="text.secondary">
              Nothing selected
            </Typography>
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
