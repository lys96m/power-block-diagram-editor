import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Edge, Node } from "reactflow";
import type { Block, BlockType, Net, RatingA, RatingB, RatingC } from "../types/diagram";
import { ensureTypeCRating, toNumberOrUndefined, toPhase } from "../lib/ratingHelpers";

type NodeData = { type?: BlockType; label?: string; rating?: Block["rating"] };

type Props = {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  typeLabels: Record<BlockType, string>;
  nets: Net[];
  netEdgeCounts: Record<string, number>;
  onLabelChange: (value: string) => void;
  onTypeChange: (value: BlockType) => void;
  onTypeAChange: (field: keyof RatingA, value: number | undefined) => void;
  onTypeBChange: (field: keyof RatingB, value: number | undefined) => void;
  onTypeCChange: (
    scope: "in" | "out" | "eta",
    field: keyof RatingC["in"] | keyof RatingC["out"] | "eta",
    value: number | undefined,
  ) => void;
  onEdgeNetChange: (edgeId: string, netId: string | null) => void;
  onCreateNet: (edgeId: string) => void;
  onRenameNet: (netId: string, label: string) => void;
  onUpdateNetAttributes: (netId: string, updates: Partial<Net>) => void;
  onDeleteNet: (netId: string) => boolean;
  onDeleteSelected: () => void;
};

export const PropertiesPanel = ({
  selectedNode,
  selectedEdge,
  typeLabels,
  nets,
  netEdgeCounts,
  onLabelChange,
  onTypeChange,
  onTypeAChange,
  onTypeBChange,
  onTypeCChange,
  onEdgeNetChange,
  onCreateNet,
  onRenameNet,
  onUpdateNetAttributes,
  onDeleteNet,
  onDeleteSelected,
}: Props) => (
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
          onChange={(e) => onLabelChange(e.target.value)}
        />
        <TextField
          size="small"
          label="Category"
          select
          value={(selectedNode.data as NodeData)?.type ?? ""}
          onChange={(e) => onTypeChange(e.target.value as BlockType)}
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
              value={((selectedNode.data as NodeData)?.rating as RatingA | undefined)?.V_max ?? ""}
              onChange={(e) => onTypeAChange("V_max", toNumberOrUndefined(e.target.value))}
            />
            <TextField
              size="small"
              label="I_max (A)"
              type="number"
              inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
              value={((selectedNode.data as NodeData)?.rating as RatingA | undefined)?.I_max ?? ""}
              onChange={(e) => onTypeAChange("I_max", toNumberOrUndefined(e.target.value))}
            />
            <TextField
              size="small"
              label="Phase"
              select
              value={((selectedNode.data as NodeData)?.rating as RatingA | undefined)?.phase ?? ""}
              onChange={(e) => onTypeAChange("phase", toPhase(Number(e.target.value)))}
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
              value={((selectedNode.data as NodeData)?.rating as RatingB | undefined)?.V_in ?? ""}
              onChange={(e) => onTypeBChange("V_in", toNumberOrUndefined(e.target.value))}
            />
            <TextField
              size="small"
              label="I_in (A)"
              type="number"
              inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
              value={((selectedNode.data as NodeData)?.rating as RatingB | undefined)?.I_in ?? ""}
              onChange={(e) => onTypeBChange("I_in", toNumberOrUndefined(e.target.value))}
            />
            <TextField
              size="small"
              label="P_in (W)"
              type="number"
              inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
              value={((selectedNode.data as NodeData)?.rating as RatingB | undefined)?.P_in ?? ""}
              onChange={(e) => onTypeBChange("P_in", toNumberOrUndefined(e.target.value))}
            />
            <TextField
              size="small"
              label="Phase"
              select
              value={((selectedNode.data as NodeData)?.rating as RatingB | undefined)?.phase ?? ""}
              onChange={(e) => onTypeBChange("phase", toPhase(Number(e.target.value)))}
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
                  onChange={(e) => onTypeCChange("in", "V_in", toNumberOrUndefined(e.target.value))}
                />
                <TextField
                  size="small"
                  label="I_in_max (A)"
                  type="number"
                  inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                  value={rating.in.I_in_max ?? ""}
                  onChange={(e) =>
                    onTypeCChange("in", "I_in_max", toNumberOrUndefined(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="P_in_max (W)"
                  type="number"
                  inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                  value={rating.in.P_in_max ?? ""}
                  onChange={(e) =>
                    onTypeCChange("in", "P_in_max", toNumberOrUndefined(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Phase_in"
                  select
                  value={rating.in.phase_in ?? ""}
                  onChange={(e) => onTypeCChange("in", "phase_in", toPhase(Number(e.target.value)))}
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
                    onTypeCChange("out", "V_out", toNumberOrUndefined(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="I_out_max (A)"
                  type="number"
                  inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                  value={rating.out.I_out_max ?? ""}
                  onChange={(e) =>
                    onTypeCChange("out", "I_out_max", toNumberOrUndefined(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="P_out_max (W)"
                  type="number"
                  inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                  value={rating.out.P_out_max ?? ""}
                  onChange={(e) =>
                    onTypeCChange("out", "P_out_max", toNumberOrUndefined(e.target.value))
                  }
                />
                <TextField
                  size="small"
                  label="Phase_out"
                  select
                  value={rating.out.phase_out ?? ""}
                  onChange={(e) =>
                    onTypeCChange("out", "phase_out", toPhase(Number(e.target.value)))
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
                  onChange={(e) => onTypeCChange("eta", "eta", toNumberOrUndefined(e.target.value))}
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
        {(() => {
          const currentNetId =
            (selectedEdge.data as { netId?: string | null } | undefined)?.netId ?? "";
          const currentNet = nets.find((net) => net.id === currentNetId);
          const inUseCount = currentNetId ? (netEdgeCounts[currentNetId] ?? 0) : 0;
          return (
            <>
              <TextField
                size="small"
                label="Net"
                select
                value={currentNetId}
                onChange={(e) =>
                  onEdgeNetChange(selectedEdge.id, e.target.value === "" ? null : e.target.value)
                }
              >
                <MenuItem value="">Unassigned</MenuItem>
                {nets.map((net) => (
                  <MenuItem key={net.id} value={net.id}>
                    {net.label}
                  </MenuItem>
                ))}
              </TextField>
              {currentNet && (
                <Stack spacing={1}>
                  <TextField
                    size="small"
                    label="Net Name"
                    value={currentNet.label}
                    onChange={(e) => onRenameNet(currentNet.id, e.target.value)}
                  />
                  <TextField
                    size="small"
                    label="Voltage (V)"
                    type="number"
                    inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                    value={currentNet.voltage}
                    onChange={(e) =>
                      onUpdateNetAttributes(currentNet.id, {
                        voltage: toNumberOrUndefined(e.target.value),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="Tolerance (%)"
                    type="number"
                    inputProps={{ step: 0.1, min: 0, max: 100, inputMode: "decimal" }}
                    value={currentNet.tolerance ?? ""}
                    onChange={(e) =>
                      onUpdateNetAttributes(currentNet.id, {
                        tolerance: toNumberOrUndefined(e.target.value),
                      })
                    }
                  />
                  <TextField
                    size="small"
                    label="Phase"
                    select
                    value={currentNet.phase}
                    onChange={(e) =>
                      onUpdateNetAttributes(currentNet.id, {
                        phase: Number(e.target.value) as 0 | 1 | 3,
                      })
                    }
                  >
                    {[0, 1, 3].map((phase) => (
                      <MenuItem key={phase} value={phase}>
                        {phase}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    size="small"
                    label="Kind"
                    select
                    value={currentNet.kind}
                    onChange={(e) =>
                      onUpdateNetAttributes(currentNet.id, {
                        kind: e.target.value as Net["kind"],
                      })
                    }
                  >
                    <MenuItem value="AC">AC</MenuItem>
                    <MenuItem value="DC">DC</MenuItem>
                    <MenuItem value="SIGNAL">SIGNAL</MenuItem>
                  </TextField>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => onCreateNet(selectedEdge.id)}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Add Net
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="warning"
                    disabled={inUseCount > 0}
                    onClick={() => onDeleteNet(currentNet.id)}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Delete Net {inUseCount > 0 ? `(in use: ${inUseCount})` : ""}
                  </Button>
                </Stack>
              )}
              {!currentNet && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onCreateNet(selectedEdge.id)}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Add Net
                </Button>
              )}
            </>
          );
        })()}
      </>
    )}
    {!selectedNode && !selectedEdge && (
      <Typography variant="body2" color="text.secondary">
        Nothing selected
      </Typography>
    )}
    {(selectedNode || selectedEdge) && (
      <Button variant="outlined" color="error" size="small" onClick={onDeleteSelected}>
        Delete Selected
      </Button>
    )}
  </Stack>
);

export default PropertiesPanel;
