import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  Background,
  ConnectionLineType,
  Controls,
  ReactFlow,
  BaseEdge,
  getSmoothStepPath,
} from "reactflow";
import type { Edge, EdgeProps } from "reactflow";
import { useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import { useDiagramState } from "./state/DiagramState";
import type {
  ValidationResult,
  Block,
  BlockType,
  Net,
  RatingA,
  RatingB,
  RatingC,
} from "./types/diagram";
import { validateBlockOnNet } from "./services/validation";
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

const defaultNet: Net = {
  id: "net-ac200",
  kind: "AC",
  voltage: 200,
  phase: 1,
  label: "AC200V",
  tolerance: 10,
};

const defaultRatings: Record<BlockType, Block["rating"]> = {
  A: { V_max: 250, I_max: 20, phase: 1 },
  B: { V_in: 200, phase: 1 },
  C: {
    in: { V_in: 200, phase_in: 1 },
    out: { V_out: 24, phase_out: 0 },
  },
};

const typeLabels: Record<BlockType, string> = {
  A: "Breaker / Passive",
  B: "Load",
  C: "Converter / Source",
};

function App() {
  const { nodes, edges, setNodes, onNodesChange, onEdgesChange, onConnect, addNode, deleteItems } =
    useDiagramState();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

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

  const toNumberOrUndefined = (value: string): number | undefined => {
    if (value === "") return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : Math.round(num * 100) / 100;
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
          rating[field] = value;
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
          rating[field] = value;
        }
        return { ...n, data: { ...data, rating } };
      }),
    );
  };

  const ensureTypeCRating = (rating?: Block["rating"]): RatingC => {
    const fallback = defaultRatings.C as RatingC;
    if (!rating || typeof rating !== "object") {
      return { ...fallback, in: { ...fallback.in }, out: { ...fallback.out } };
    }
    const cast = rating as RatingC;
    return {
      in: { ...fallback.in, ...(cast.in ?? {}) },
      out: { ...fallback.out, ...(cast.out ?? {}) },
      eta: cast.eta,
    };
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
          if (value == null) delete (next.in as Record<string, number | undefined>)[key];
          else next.in[key] = value;
        } else if (scope === "out" && field in next.out) {
          const key = field as keyof RatingC["out"];
          if (value == null) delete (next.out as Record<string, number | undefined>)[key];
          else next.out[key] = value;
        }

        return { ...n, data: { ...data, rating: next } };
      }),
    );
  };

  const handleDeleteSelected = () => {
    const nodesToDelete = selectedNodeId ? [selectedNodeId] : [];
    const edgesToDelete = selectedEdgeId ? [selectedEdgeId] : [];
    if (nodesToDelete.length === 0 && edgesToDelete.length === 0) return;
    deleteItems(nodesToDelete, edgesToDelete);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
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

        <Box className="canvas-area" component="section">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={(connection) => {
              if (wouldCreateCycle(edges, connection.source, connection.target)) return;
              onConnect(connection);
            }}
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
                  value={(selectedNode.data as NodeData)?.label ?? ""}
                  onChange={(e) => handleNodeLabelChange(e.target.value)}
                />
                <TextField
                  size="small"
                  label="Category"
                  select
                  value={(selectedNode.data as NodeData)?.type ?? ""}
                  onChange={(e) => handleNodeTypeChange(e.target.value as BlockType)}
                >
                  {(["A", "B", "C"] as BlockType[]).map((option) => (
                    <MenuItem key={option} value={option}>
                      {typeLabels[option]}
                    </MenuItem>
                  ))}
                </TextField>
                {((selectedNode.data ?? {}) as NodeData).type === "A" && (
                  <Stack spacing={1}>
                    <TextField
                      size="small"
                      label="V_max (V)"
                      type="number"
                      inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                      value={
                        ((selectedNode.data as NodeData)?.rating as RatingA | undefined)?.V_max ??
                        ""
                      }
                      onChange={(e) =>
                        handleTypeARatingChange("V_max", toNumberOrUndefined(e.target.value))
                      }
                    />
                    <TextField
                      size="small"
                      label="I_max (A)"
                      type="number"
                      inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                      value={
                        ((selectedNode.data as NodeData)?.rating as RatingA | undefined)?.I_max ??
                        ""
                      }
                      onChange={(e) =>
                        handleTypeARatingChange("I_max", toNumberOrUndefined(e.target.value))
                      }
                    />
                    <TextField
                      size="small"
                      label="Phase"
                      select
                      value={
                        ((selectedNode.data as NodeData)?.rating as RatingA | undefined)?.phase ??
                        ""
                      }
                      onChange={(e) =>
                        handleTypeARatingChange("phase", Number(e.target.value) as RatingA["phase"])
                      }
                    >
                      {[0, 1, 3].map((phase) => (
                        <MenuItem key={phase} value={phase}>
                          {phase}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                )}
                {((selectedNode.data ?? {}) as NodeData).type === "B" && (
                  <Stack spacing={1}>
                    <TextField
                      size="small"
                      label="V_in (V)"
                      type="number"
                      inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                      value={
                        ((selectedNode.data as NodeData)?.rating as RatingB | undefined)?.V_in ?? ""
                      }
                      onChange={(e) =>
                        handleTypeBRatingChange("V_in", toNumberOrUndefined(e.target.value))
                      }
                    />
                    <TextField
                      size="small"
                      label="I_in (A)"
                      type="number"
                      inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                      value={
                        ((selectedNode.data as NodeData)?.rating as RatingB | undefined)?.I_in ?? ""
                      }
                      onChange={(e) =>
                        handleTypeBRatingChange("I_in", toNumberOrUndefined(e.target.value))
                      }
                    />
                    <TextField
                      size="small"
                      label="P_in (W)"
                      type="number"
                      inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                      value={
                        ((selectedNode.data as NodeData)?.rating as RatingB | undefined)?.P_in ?? ""
                      }
                      onChange={(e) =>
                        handleTypeBRatingChange("P_in", toNumberOrUndefined(e.target.value))
                      }
                    />
                    <TextField
                      size="small"
                      label="Phase"
                      select
                      value={
                        ((selectedNode.data as NodeData)?.rating as RatingB | undefined)?.phase ??
                        ""
                      }
                      onChange={(e) =>
                        handleTypeBRatingChange("phase", Number(e.target.value) as RatingB["phase"])
                      }
                    >
                      {[0, 1, 3].map((phase) => (
                        <MenuItem key={phase} value={phase}>
                          {phase}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>
                )}
                {((selectedNode.data ?? {}) as NodeData).type === "C" &&
                  (() => {
                    const rating = ensureTypeCRating((selectedNode.data as NodeData)?.rating);
                    return (
                      <Stack spacing={1}>
                        <Typography variant="body2" fontWeight={600}>
                          Input
                        </Typography>
                        <TextField
                          size="small"
                          label="V_in (V)"
                          type="number"
                          inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                          value={rating.in.V_in ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "in",
                              "V_in",
                              toNumberOrUndefined(e.target.value),
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="I_in_max (A)"
                          type="number"
                          inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                          value={rating.in.I_in_max ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "in",
                              "I_in_max",
                              toNumberOrUndefined(e.target.value),
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="P_in_max (W)"
                          type="number"
                          inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                          value={rating.in.P_in_max ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "in",
                              "P_in_max",
                              toNumberOrUndefined(e.target.value),
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="Phase_in"
                          select
                          value={rating.in.phase_in ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "in",
                              "phase_in",
                              Number(e.target.value) as RatingC["in"]["phase_in"],
                            )
                          }
                        >
                          {[0, 1, 3].map((phase) => (
                            <MenuItem key={phase} value={phase}>
                              {phase}
                            </MenuItem>
                          ))}
                        </TextField>

                        <Typography variant="body2" fontWeight={600}>
                          Output
                        </Typography>
                        <TextField
                          size="small"
                          label="V_out (V)"
                          type="number"
                          inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                          value={rating.out.V_out ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "out",
                              "V_out",
                              toNumberOrUndefined(e.target.value),
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="I_out_max (A)"
                          type="number"
                          inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                          value={rating.out.I_out_max ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "out",
                              "I_out_max",
                              toNumberOrUndefined(e.target.value),
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="P_out_max (W)"
                          type="number"
                          inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                          value={rating.out.P_out_max ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "out",
                              "P_out_max",
                              toNumberOrUndefined(e.target.value),
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="Phase_out"
                          select
                          value={rating.out.phase_out ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "out",
                              "phase_out",
                              Number(e.target.value) as RatingC["out"]["phase_out"],
                            )
                          }
                        >
                          {[0, 1, 3].map((phase) => (
                            <MenuItem key={phase} value={phase}>
                              {phase}
                            </MenuItem>
                          ))}
                        </TextField>

                        <Typography variant="body2" fontWeight={600}>
                          Efficiency
                        </Typography>
                        <TextField
                          size="small"
                          label="eta (0-1)"
                          type="number"
                          inputProps={{ step: 0.01, min: 0, max: 1, inputMode: "decimal" }}
                          value={rating.eta ?? ""}
                          onChange={(e) =>
                            handleTypeCRatingChange(
                              "eta",
                              "eta",
                              toNumberOrUndefined(e.target.value),
                            )
                          }
                        />
                      </Stack>
                    );
                  })()}
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
            {(selectedNode || selectedEdge) && (
              <Button variant="outlined" color="error" size="small" onClick={handleDeleteSelected}>
                Delete Selected
              </Button>
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
          Nets: 0 | Errors: {errors} | Warnings: {warnings} | Unassigned nets: 0 | Uncertain loads:
          0
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
