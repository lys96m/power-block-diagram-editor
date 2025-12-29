import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { BaseEdge, getSmoothStepPath } from "reactflow";
import type { Edge, EdgeProps, Node } from "reactflow";
import { useMemo, useState } from "react";
import { useDiagramState } from "./state/DiagramState";
import { wouldCreateCycle } from "./lib/graph";
import type {
  ValidationResult,
  Block,
  BlockType,
  Net,
  RatingA,
  RatingB,
  RatingC,
  Project,
} from "./types/diagram";
import { createEmptyProject, parseProject, serializeProject } from "./services/projectIO";
import { defaultRatings, ensureTypeCRating, toPhase } from "./lib/ratingHelpers";
import { validateBlockOnNet } from "./services/validation";
import HeaderBar from "./components/HeaderBar";
import DiagramCanvas from "./components/DiagramCanvas";
import PropertiesPanel from "./components/PropertiesPanel";
import StatusBar from "./components/StatusBar";
import ProjectDialog from "./components/ProjectDialog";
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

const defaultNet: Net = {
  id: "net-ac200",
  kind: "AC",
  voltage: 200,
  phase: 1,
  label: "AC200V",
  tolerance: 10,
};

const typeLabels: Record<BlockType, string> = {
  A: "Breaker / Passive",
  B: "Load",
  C: "Converter / Source",
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [projectDialog, setProjectDialog] = useState<{
    mode: "open" | "save" | "export" | null;
    text: string;
    error?: string;
  }>({ mode: null, text: "" });

  const edgeTypes = { smooth: SmoothEdge };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );

  const handleSelectionChange = ({
    nodes: selectedNodes,
    edges: selectedEdges,
  }: {
    nodes: typeof nodes;
    edges: typeof edges;
  }) => {
    setSelectedNodeId(selectedNodes[0]?.id ?? null);
    setSelectedEdgeId(selectedEdges[0]?.id ?? null);
  };

  const handleNodeLabelChange = (value: string) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId ? { ...n, data: { ...(n.data ?? {}), label: value } } : n,
      ),
    );
  };

  const handleNodeTypeChange = (value: BlockType) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId
          ? {
              ...n,
              data: {
                ...(n.data ?? {}),
                type: value,
                rating:
                  ((n.data as NodeData | undefined)?.type === value &&
                    (n.data as NodeData | undefined)?.rating) ??
                  defaultRatings[value],
              },
            }
          : n,
      ),
    );
  };

  const handleTypeARatingChange = (field: keyof RatingA, value: number | undefined) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNodeId) return n;
        const data = (n.data ?? {}) as NodeData;
        if (data.type !== "A") return n;
        const rating: RatingA = { ...(data.rating as RatingA) };
        if (value == null) {
          delete (rating as Record<string, number | undefined>)[field];
        } else {
          if (field === "phase") {
            const phaseVal = toPhase(value);
            if (phaseVal == null) delete (rating as Record<string, number | undefined>)[field];
            else rating.phase = phaseVal;
          } else {
            rating[field] = value;
          }
        }
        return { ...n, data: { ...data, rating } };
      }),
    );
  };

  const handleTypeBRatingChange = (field: keyof RatingB, value: number | undefined) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNodeId) return n;
        const data = (n.data ?? {}) as NodeData;
        if (data.type !== "B") return n;
        const rating: RatingB = { ...(data.rating as RatingB) };
        if (value == null) {
          delete (rating as Record<string, number | undefined>)[field];
        } else {
          if (field === "phase") {
            const phaseVal = toPhase(value);
            if (phaseVal == null) delete (rating as Record<string, number | undefined>)[field];
            else rating.phase = phaseVal;
          } else {
            rating[field] = value;
          }
        }
        return { ...n, data: { ...data, rating } };
      }),
    );
  };

  const handleTypeCRatingChange = (
    scope: "in" | "out" | "eta",
    field: keyof RatingC["in"] | keyof RatingC["out"] | "eta",
    value: number | undefined,
  ) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNodeId) return n;
        const data = (n.data ?? {}) as NodeData;
        if (data.type !== "C") return n;
        const rating = ensureTypeCRating(data.rating);
        const next: RatingC = {
          ...rating,
          in: { ...rating.in },
          out: { ...rating.out },
        };

        if (scope === "eta" && field === "eta") {
          if (value == null) delete next.eta;
          else next.eta = value;
        } else if (scope === "in" && field in next.in) {
          const key = field as keyof RatingC["in"];
          if (key === "phase_in") {
            const phaseVal = toPhase(value);
            if (phaseVal == null) delete (next.in as Record<string, number | undefined>)[key];
            else next.in.phase_in = phaseVal;
          } else {
            if (value == null) delete (next.in as Record<string, number | undefined>)[key];
            else next.in[key] = value;
          }
        } else if (scope === "out" && field in next.out) {
          const key = field as keyof RatingC["out"];
          if (key === "phase_out") {
            const phaseVal = toPhase(value);
            if (phaseVal == null) delete (next.out as Record<string, number | undefined>)[key];
            else next.out.phase_out = phaseVal;
          } else {
            if (value == null) delete (next.out as Record<string, number | undefined>)[key];
            else next.out[key] = value;
          }
        }

        return { ...n, data: { ...data, rating: next } };
      }),
    );
  };

  const diagramToProject = (): Project => {
    const now = new Date().toISOString();
    const toBlock = (n: Node): Block => {
      const data = (n.data ?? {}) as NodeData;
      const type = (data.type as BlockType | undefined) ?? "A";
      if (type === "A") {
        const rating: RatingA = (data.rating as RatingA) ?? (defaultRatings.A as RatingA);
        return {
          id: n.id,
          type: "A",
          name: data.label ?? n.id,
          rating,
          ports: [
            { id: "in", role: "power_in", direction: "in" },
            { id: "out", role: "power_out", direction: "out" },
          ],
        };
      }
      if (type === "B") {
        const rating: RatingB = (data.rating as RatingB) ?? (defaultRatings.B as RatingB);
        return {
          id: n.id,
          type: "B",
          name: data.label ?? n.id,
          rating,
          ports: [{ id: "in", role: "power_in", direction: "in" }],
        };
      }
      const rating: RatingC = ensureTypeCRating(data.rating);
      return {
        id: n.id,
        type: "C",
        name: data.label ?? n.id,
        rating,
        ports: [
          { id: "in", role: "power_in", direction: "in" },
          { id: "out", role: "power_out", direction: "out" },
        ],
      };
    };

    return {
      schema_version: "1.0.0",
      meta: { title: "Untitled", created_at: now, updated_at: now, author: "unknown" },
      nets: [],
      blocks: nodes.map((n) => toBlock(n)),
      connections: edges.map((e, idx) => ({
        from: `${e.source}:out`,
        to: `${e.target}:in`,
        net: null,
        label: typeof e.label === "string" ? e.label : `conn-${idx + 1}`,
      })),
      layout: {
        blocks: nodes.reduce<Record<string, { x: number; y: number; w: number; h: number }>>(
          (acc, n) => {
            acc[n.id] = {
              x: n.position?.x ?? 0,
              y: n.position?.y ?? 0,
              w: 160,
              h: 80,
            };
            return acc;
          },
          {},
        ),
        edges: {},
      },
    };
  };

  const projectToDiagram = (project: Project): { nodes: Node[]; edges: Edge[] } => {
    const layoutBlocks = project.layout?.blocks ?? {};
    const nodesFromProject: Node[] = project.blocks.map((b, idx) => {
      const layout = layoutBlocks[b.id];
      return {
        id: b.id,
        position: { x: layout?.x ?? 100 + idx * 80, y: layout?.y ?? 100 },
        data: { label: b.name, type: b.type, rating: b.rating },
      };
    });

    const edgesFromProject: Edge[] = project.connections.map((c, idx) => {
      const source = c.from.split(":")[0];
      const target = c.to.split(":")[0];
      return { id: c.label ?? `edge-${idx + 1}`, source, target, type: "smooth" };
    });

    return { nodes: nodesFromProject, edges: edgesFromProject };
  };

  const handleDeleteSelected = () => {
    const nodesToDelete = selectedNodeId ? [selectedNodeId] : [];
    const edgesToDelete = selectedEdgeId ? [selectedEdgeId] : [];
    if (nodesToDelete.length === 0 && edgesToDelete.length === 0) return;
    deleteItems(nodesToDelete, edgesToDelete);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const resetSelection = () => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const handleNewProject = () => {
    const emptyProject = createEmptyProject();
    const { nodes: nextNodes, edges: nextEdges } = projectToDiagram(emptyProject);
    replaceDiagram(nextNodes, nextEdges);
    resetSelection();
  };

  const handleOpenDialog = () => {
    setProjectDialog({ mode: "open", text: "", error: undefined });
  };

  const handleSaveDialog = (mode: "save" | "export") => {
    const json = serializeProject(diagramToProject());
    setProjectDialog({ mode, text: json, error: undefined });
  };

  const closeProjectDialog = () => setProjectDialog({ mode: null, text: "", error: undefined });

  const applyOpenProject = () => {
    try {
      const project = parseProject(projectDialog.text);
      const { nodes: nextNodes, edges: nextEdges } = projectToDiagram(project);
      replaceDiagram(nextNodes, nextEdges);
      resetSelection();
      closeProjectDialog();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load project";
      setProjectDialog((prev) => ({ ...prev, error: message }));
    }
  };

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
        onNew={handleNewProject}
        onOpen={handleOpenDialog}
        onSave={() => handleSaveDialog("save")}
        onExport={() => handleSaveDialog("export")}
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
        mode={projectDialog.mode}
        text={projectDialog.text}
        error={projectDialog.error}
        onChangeText={(text) => setProjectDialog((prev) => ({ ...prev, text }))}
        onClose={closeProjectDialog}
        onLoad={applyOpenProject}
        onCopy={() => {
          if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(projectDialog.text);
        }}
      />
    </Box>
  );
}

export default App;
