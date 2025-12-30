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
import type { ValidationResult, Block } from "./types/diagram";
import { validateNet } from "./services/validation";
import HeaderBar from "./components/HeaderBar";
import DiagramCanvas from "./components/DiagramCanvas";
import PropertiesPanel from "./components/PropertiesPanel";
import StatusBar from "./components/StatusBar";
import ProjectDialog from "./components/ProjectDialog";
import { useProjectIO } from "./hooks/useProjectIO";
import { useNodeEditing, type NodeData } from "./hooks/useNodeEditing";
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

  const validationSummary = useMemo(() => {
    const issues: ValidationResult[] = [];
    const blocks: Block[] = [];
    const labelLookup: Record<string, string> = {};
    const connectedNodeIds = new Set<string>();
    const unassignedEdges = edges.filter(
      (e) => !(e.data as { netId?: string } | undefined)?.netId,
    ).length;

    edges.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    nodes.forEach((node) => {
      const data = (node.data ?? {}) as NodeData;
      const type = data.type;
      const rating = data.rating;
      const label = data.label ?? node.id;
      labelLookup[node.id] = label;

      if (!type || !rating) {
        issues.push({
          id: `warn-${node.id}-missing-type`,
          level: "warn",
          message: "Missing type or rating",
          targetId: node.id,
        });
        return;
      }

      blocks.push({
        id: node.id,
        type,
        name: label,
        rating,
        ports: [],
      } as Block);
    });

    const primaryNet = nets[0] ?? defaultNet;
    const { issues: netIssues, uncertainLoads } = validateNet(blocks, primaryNet);
    const allIssues = [...issues, ...netIssues];
    const errors = allIssues.filter((r) => r.level === "error").length;
    const warnings = allIssues.filter((r) => r.level === "warn").length;

    return {
      issues: allIssues,
      labelLookup,
      stats: {
        errors,
        warnings,
        uncertainLoads,
        nets: nets.length || 1,
        unassignedNets: unassignedEdges,
      },
    };
  }, [nodes, edges, nets]);

  const { issues: validationResults, stats: validationStats, labelLookup } = validationSummary;

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
            onDeleteSelected={handleDeleteSelected}
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
        unassignedNets={validationStats.unassignedNets}
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
