import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Edge } from "reactflow";
import type { Net } from "../types/diagram";
import { toNumberOrUndefined } from "../lib/ratingHelpers";
import DebouncedTextField from "./DebouncedTextField";

type Props = {
  selectedEdge: Edge | null;
  nets: Net[];
  netEdgeCounts: Record<string, number>;
  onEdgeNetChange: (edgeId: string, netId: string | null) => void;
  onCreateNet: (edgeId: string) => void;
  onRenameNet: (netId: string, label: string) => void;
  onUpdateNetAttributes: (netId: string, updates: Partial<Net>) => void;
  onDeleteNet: (netId: string) => boolean;
};

const EdgeProperties = ({
  selectedEdge,
  nets,
  netEdgeCounts,
  onEdgeNetChange,
  onCreateNet,
  onRenameNet,
  onUpdateNetAttributes,
  onDeleteNet,
}: Props) => {
  if (!selectedEdge) return null;

  const currentNetId = (selectedEdge.data as { netId?: string | null } | undefined)?.netId ?? "";
  const currentNet = nets.find((net) => net.id === currentNetId);
  const inUseCount = currentNetId ? (netEdgeCounts[currentNetId] ?? 0) : 0;

  return (
    <>
      <Typography variant="body2" fontWeight={600}>
        Edge: {selectedEdge.id}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {selectedEdge.source} → {selectedEdge.target}
      </Typography>

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
          <DebouncedTextField
            size="small"
            label="Net Name"
            value={currentNet.label}
            onCommit={(val) => onRenameNet(currentNet.id, val)}
          />
          <DebouncedTextField
            size="small"
            label="Voltage (V)"
            type="number"
            inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
            value={currentNet.voltage}
            onCommit={(val) =>
              onUpdateNetAttributes(currentNet.id, {
                voltage: toNumberOrUndefined(val),
              })
            }
          />
          <DebouncedTextField
            size="small"
            label="Tolerance (%)"
            type="number"
            inputProps={{ step: 0.1, min: 0, max: 100, inputMode: "decimal" }}
            value={currentNet.tolerance ?? ""}
            onCommit={(val) =>
              onUpdateNetAttributes(currentNet.id, {
                tolerance: toNumberOrUndefined(val),
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
};

export default EdgeProperties;
