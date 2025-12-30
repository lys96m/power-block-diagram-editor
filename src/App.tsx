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
import { typeLabels } from "./lib/constants";
import HeaderBar from "./components/HeaderBar";
import DiagramCanvas from "./components/DiagramCanvas";
import PropertiesPanel from "./components/PropertiesPanel";
import StatusBar from "./components/StatusBar";
import ProjectDialog from "./components/ProjectDialog";
import NetManager from "./components/NetManager";
import { useProjectIO } from "./hooks/useProjectIO";
import { useNodeEditing } from "./hooks/useNodeEditing";
import { useValidationSummary } from "./hooks/useValidationSummary";
import { defaultRatings } from "./lib/ratingHelpers";
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
  } = useProjectIO({ nodes, edges, nets, replaceDiagram, resetSelection });

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
          />

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Validation
          </Typography>
          <Stack spacing={0.5} mt={1}>
            <Typography variant="body2">Errors: {validationStats.errors}</Typography>
            <Typography variant="body2">Warnings: {validationStats.warnings}</Typography>
            <Typography variant="body2">
              Uncertain loads: {validationStats.uncertainLoads}
            </Typography>
            <Typography variant="body2">Nets: {validationStats.nets}</Typography>
            <Typography variant="body2">
              Unassigned edges: {validationStats.unassignedEdges}
            </Typography>
            <Typography variant="body2">Orphan nets: {validationStats.orphanNets}</Typography>
          </Stack>

          <Box mt={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              Details
            </Typography>
            <Stack spacing={0.5} mt={0.5}>
              {validationResults.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No validation issues.
                </Typography>
              ) : (
                validationResults.map((issue) => {
                  const targetLabel = issue.targetId
                    ? (labelLookup[issue.targetId] ?? issue.targetId)
                    : null;
                  const prefix =
                    issue.level === "error" ? "Error" : issue.level === "warn" ? "Warning" : "Info";
                  return (
                    <Typography
                      key={issue.id}
                      variant="body2"
                      sx={{
                        color:
                          issue.level === "error"
                            ? "error.main"
                            : issue.level === "warn"
                              ? "warning.main"
                              : "text.secondary",
                      }}
                    >
                      {prefix}: {issue.message}
                      {targetLabel ? ` (${targetLabel})` : ""}
                    </Typography>
                  );
                })
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      <StatusBar
        errors={validationStats.errors}
        warnings={validationStats.warnings}
        nets={validationStats.nets}
        unassignedEdges={validationStats.unassignedEdges}
        orphanNets={validationStats.orphanNets}
        uncertainLoads={validationStats.uncertainLoads}
      />

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
