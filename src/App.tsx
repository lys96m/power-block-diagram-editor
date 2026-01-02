import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Snackbar, { type SnackbarCloseReason } from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { BaseEdge, getSmoothStepPath } from "reactflow";
import type { EdgeProps } from "reactflow";
import { useMemo } from "react";
import { useDiagramState } from "./state/DiagramState";
import { wouldCreateCycle } from "./lib/graph";
import { typeLabels } from "./lib/constants";
import HeaderBar from "./components/HeaderBar";
import DiagramCanvas from "./components/DiagramCanvas";
import PropertiesPanel from "./components/PropertiesPanel";
import StatusBar from "./components/StatusBar";
import ProjectDialog from "./components/ProjectDialog";
import NetManager from "./components/NetManager";
import ValidationPanel from "./components/ValidationPanel";
import { useProjectIO } from "./hooks/useProjectIO";
import { useNodeEditing } from "./hooks/useNodeEditing";
import { useValidationSummary } from "./hooks/useValidationSummary";
import { defaultRatings } from "./lib/ratingHelpers";
import { getStrings } from "./i18n/strings";
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
    nets,
    addNet,
    updateEdgeNet,
    updateNetLabel,
    updateNetAttributes,
    removeNet,
    undoNetAction,
    redoNetAction,
    canUndoNet,
    canRedoNet,
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
  } = useNodeEditing({ nodes, edges, setNodes, deleteItems, defaultRatings });
  const {
    dialogState,
    setDialogText,
    closeDialog,
    openNewProject,
    openDialog,
    openSaveOrExport,
    applyOpenProject,
    copyDialogText,
    toast,
    clearToast,
  } = useProjectIO({ nodes, edges, nets, replaceDiagram, resetSelection });

  const strings = getStrings();

  const edgeTypes = { smooth: SmoothEdge };
  const netEdgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    edges.forEach((e) => {
      const netId = (e.data as { netId?: string | null } | undefined)?.netId;
      if (!netId) return;
      counts[netId] = (counts[netId] ?? 0) + 1;
    });
    return counts;
  }, [edges]);

  const {
    issues: validationResults,
    stats: validationStats,
    labelLookup,
  } = useValidationSummary(nodes, edges, nets);

  return (
    <Box className="app-root">
      <HeaderBar
        onNew={openNewProject}
        onOpen={openDialog}
        onSave={() => openSaveOrExport("save")}
        onExport={() => openSaveOrExport("export")}
        labels={strings.header}
      />

      <Box className="app-body">
        <Box className="panel left-panel">
          <Typography variant="subtitle1" fontWeight={600}>
            {strings.app.paletteTitle}
          </Typography>
          <Divider />
          <Stack spacing={1} mt={2}>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => addNode("A")}
              aria-label={`${strings.app.add} ${typeLabels.A}`}
            >
              {strings.app.add} {typeLabels.A}
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => addNode("B")}
              aria-label={`${strings.app.add} ${typeLabels.B}`}
            >
              {strings.app.add} {typeLabels.B}
            </Button>
            <Button
              variant="contained"
              size="small"
              fullWidth
              onClick={() => addNode("C")}
              aria-label={`${strings.app.add} ${typeLabels.C}`}
            >
              {strings.app.add} {typeLabels.C}
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
            {strings.app.propertiesTitle}
          </Typography>
          <Divider />
          <PropertiesPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            typeLabels={typeLabels}
            nets={nets}
            netEdgeCounts={netEdgeCounts}
            onLabelChange={handleNodeLabelChange}
            onTypeChange={handleNodeTypeChange}
            onTypeAChange={handleTypeARatingChange}
            onTypeBChange={handleTypeBRatingChange}
            onTypeCChange={handleTypeCRatingChange}
            onEdgeNetChange={(edgeId, netId) => updateEdgeNet(edgeId, netId)}
            onCreateNet={(edgeId) => {
              const netId = addNet();
              updateEdgeNet(edgeId, netId);
            }}
            onRenameNet={updateNetLabel}
            onUpdateNetAttributes={updateNetAttributes}
            onDeleteNet={removeNet}
            onDeleteSelected={handleDeleteSelected}
            labels={{
              properties: strings.properties,
              node: strings.node,
              edge: strings.edge,
              netManager: strings.netManager,
            }}
          />

          <Divider sx={{ my: 2 }} />
          <NetManager
            nets={nets}
            netEdgeCounts={netEdgeCounts}
            addNet={addNet}
            updateNetLabel={updateNetLabel}
            updateNetAttributes={updateNetAttributes}
            removeNet={removeNet}
            undoNetAction={undoNetAction}
            redoNetAction={redoNetAction}
            canUndoNet={canUndoNet}
            canRedoNet={canRedoNet}
            labels={strings.netManager}
          />

          <Divider sx={{ my: 2 }} />
          <ValidationPanel
            stats={validationStats}
            issues={validationResults}
            labelLookup={labelLookup}
            labels={strings.validation}
          />
        </Box>
      </Box>

      <StatusBar
        errors={validationStats.errors}
        warnings={validationStats.warnings}
        nets={validationStats.nets}
        unassignedEdges={validationStats.unassignedEdges}
        orphanNets={validationStats.orphanNets}
        uncertainLoads={validationStats.uncertainLoads}
        labels={strings.status}
      />

      <ProjectDialog
        mode={dialogState.mode}
        text={dialogState.text}
        error={dialogState.error}
        onChangeText={setDialogText}
        onClose={closeDialog}
        onLoad={applyOpenProject}
        onCopy={copyDialogText}
        labels={strings.projectDialog}
      />
      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={(_event, reason?: SnackbarCloseReason) => {
          if (reason === "clickaway") return;
          clearToast();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert onClose={() => clearToast()} severity={toast.severity} sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}

export default App;
