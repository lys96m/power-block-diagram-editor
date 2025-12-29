import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BaseEdge, getSmoothStepPath } from "reactflow";
import type { EdgeProps } from "reactflow";
import { useMemo } from "react";
import { useDiagramState } from "./state/DiagramState";
import { wouldCreateCycle } from "./lib/graph";
import { defaultNet, typeLabels } from "./lib/constants";
import type {
  ValidationResult,
  Block,
  BlockType,
} from "./types/diagram";
import { validateBlockOnNet } from "./services/validation";
import HeaderBar from "./components/HeaderBar";
import DiagramCanvas from "./components/DiagramCanvas";
import PropertiesPanel from "./components/PropertiesPanel";
import StatusBar from "./components/StatusBar";
import ProjectDialog from "./components/ProjectDialog";
import { useProjectIO } from "./hooks/useProjectIO";
import { useNodeEditing } from "./hooks/useNodeEditing";
import "./App.css";
import "reactflow/dist/style.css";

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
  const {
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteItems,
    replaceDiagram,
  } = useDiagramState();
  const {
    selectedNode,
    selectedEdge,
    handleSelectionChange,
    handleNodeLabelChange,
    handleNodeTypeChange,
    handleTypeARatingChange,
    handleTypeBRatingChange,
    handleTypeCRatingChange,
    handleDeleteSelected,
    resetSelection,
  } = useNodeEditing({ nodes, edges, setNodes, deleteItems });
  const {
    dialogState,
    setDialogText,
    closeDialog,
    openNewProject,
    openDialog,
    openSaveOrExport,
    applyOpenProject,
    copyDialogText,
  } = useProjectIO({ nodes, edges, replaceDiagram, resetSelection });

  const edgeTypes = { smooth: SmoothEdge };

  type NodeData = { type?: BlockType; label?: string; rating?: Block["rating"] };

  const validationResults = useMemo(() => {
    const results: ValidationResult[] = [];
    nodes.forEach((node) => {
      const data = (node.data ?? {}) as NodeData;
      const type = data.type;
      const rating = data.rating;
      if (!type || !rating) {
        results.push({
          id: `warn-${node.id}-missing-type`,
          level: "warn",
          message: "Missing type or rating",
          targetId: node.id,
        });
        return;
      }
      const block: Block = {
        id: node.id,
        type,
        name: data.label ?? node.id,
        rating,
        ports: [],
      } as Block;
      const { issues } = validateBlockOnNet(block, defaultNet);
      results.push(...issues);
    });
    return results;
  }, [nodes]);

  const errors = validationResults.filter((r) => r.level === "error").length;
  const warnings = validationResults.filter((r) => r.level === "warn").length;

  return (
    <Box className="app-root">
      <HeaderBar
        onNew={openNewProject}
        onOpen={openDialog}
        onSave={() => openSaveOrExport("save")}
        onExport={() => openSaveOrExport("export")}
      />

      <Box className="app-body">
        <Box className="panel left-panel">
          <Typography variant="subtitle1" fontWeight={600}>
            Palette
          </Typography>
          <Divider />
          <Stack spacing={1} mt={2}>
            <Button variant="contained" size="small" fullWidth onClick={() => addNode("A")}>
              Add {typeLabels.A}
            </Button>
            <Button variant="contained" size="small" fullWidth onClick={() => addNode("B")}>
              Add {typeLabels.B}
            </Button>
            <Button variant="contained" size="small" fullWidth onClick={() => addNode("C")}>
              Add {typeLabels.C}
            </Button>
          </Stack>
        </Box>

        <DiagramCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={(connection) => {
            if (wouldCreateCycle(edges, connection.source, connection.target)) return;
            onConnect(connection);
          }}
          edgeTypes={edgeTypes}
          onSelectionChange={handleSelectionChange}
        />

        <Box className="panel right-panel">
          <Typography variant="subtitle1" fontWeight={600}>
            Properties
          </Typography>
          <Divider />
          <PropertiesPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            typeLabels={typeLabels}
            onLabelChange={handleNodeLabelChange}
            onTypeChange={handleNodeTypeChange}
            onTypeAChange={handleTypeARatingChange}
            onTypeBChange={handleTypeBRatingChange}
            onTypeCChange={handleTypeCRatingChange}
            onDeleteSelected={handleDeleteSelected}
          />

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

      <StatusBar errors={errors} warnings={warnings} />

      <ProjectDialog
        mode={dialogState.mode}
        text={dialogState.text}
        error={dialogState.error}
        onChangeText={setDialogText}
        onClose={closeDialog}
        onLoad={applyOpenProject}
        onCopy={copyDialogText}
      />
    </Box>
  );
}

export default App;
