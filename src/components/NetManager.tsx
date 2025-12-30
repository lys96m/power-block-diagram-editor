import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Net } from "../types/diagram";
import { toNumberOrUndefined } from "../lib/ratingHelpers";

type Props = {
  nets: Net[];
  netEdgeCounts: Record<string, number>;
  addNet: () => string;
  updateNetLabel: (netId: string, label: string) => void;
  updateNetAttributes: (netId: string, updates: Partial<Net>) => void;
  removeNet: (netId: string) => boolean;
  undoNetAction: () => boolean;
  redoNetAction: () => boolean;
  canUndoNet: boolean;
  canRedoNet: boolean;
};

const NetManager = ({
  nets,
  netEdgeCounts,
  addNet,
  updateNetLabel,
  updateNetAttributes,
  removeNet,
  undoNetAction,
  redoNetAction,
  canUndoNet,
  canRedoNet,
}: Props) => {
  const [selectedNetId, setSelectedNetId] = useState<string | null>(nets[0]?.id ?? null);
  const effectiveNetId = useMemo(() => {
    if (selectedNetId && nets.find((net) => net.id === selectedNetId)) return selectedNetId;
    return nets[0]?.id ?? null;
  }, [nets, selectedNetId]);

  const selectedNet = useMemo(
    () => nets.find((net) => net.id === effectiveNetId) ?? null,
    [nets, effectiveNetId],
  );

  const handleAdd = () => {
    const id = addNet();
    setSelectedNetId(id);
  };

  const handleDelete = () => {
    if (!selectedNet) return;
    removeNet(selectedNet.id);
  };

  const edgeCount = selectedNet ? (netEdgeCounts[selectedNet.id] ?? 0) : 0;

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>
        Nets
      </Typography>
      <Divider />
      <Stack spacing={1} mt={1}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label="Select Net"
            select
            value={effectiveNetId ?? ""}
            onChange={(e) => setSelectedNetId(e.target.value || null)}
            sx={{ flex: 1 }}
          >
            {nets.map((net) => (
              <MenuItem key={net.id} value={net.id}>
                {net.label}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" size="small" onClick={handleAdd}>
            Add
          </Button>
          <Button variant="outlined" size="small" disabled={!canUndoNet} onClick={undoNetAction}>
            Undo
          </Button>
          <Button variant="outlined" size="small" disabled={!canRedoNet} onClick={redoNetAction}>
            Redo
          </Button>
        </Stack>

        {selectedNet ? (
          <Stack spacing={1}>
            <TextField
              size="small"
              label="Name"
              value={selectedNet.label}
              onChange={(e) => updateNetLabel(selectedNet.id, e.target.value)}
            />
            <TextField
              size="small"
              label="Kind"
              select
              value={selectedNet.kind}
              onChange={(e) =>
                updateNetAttributes(selectedNet.id, { kind: e.target.value as Net["kind"] })
              }
            >
              <MenuItem value="AC">AC</MenuItem>
              <MenuItem value="DC">DC</MenuItem>
              <MenuItem value="SIGNAL">SIGNAL</MenuItem>
            </TextField>
            <TextField
              size="small"
              label="Voltage (V)"
              type="number"
              inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
              value={selectedNet.voltage}
              onChange={(e) =>
                updateNetAttributes(selectedNet.id, {
                  voltage: toNumberOrUndefined(e.target.value),
                })
              }
            />
            <TextField
              size="small"
              label="Tolerance (%)"
              type="number"
              inputProps={{ step: 0.1, min: 0, max: 100, inputMode: "decimal" }}
              value={selectedNet.tolerance ?? ""}
              onChange={(e) =>
                updateNetAttributes(selectedNet.id, {
                  tolerance: toNumberOrUndefined(e.target.value),
                })
              }
            />
            <TextField
              size="small"
              label="Phase"
              select
              value={selectedNet.phase}
              onChange={(e) =>
                updateNetAttributes(selectedNet.id, {
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
            <Button
              variant="outlined"
              size="small"
              color="warning"
              disabled={edgeCount > 0}
              onClick={handleDelete}
            >
              Delete Net {edgeCount > 0 ? `(in use: ${edgeCount})` : ""}
            </Button>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No net selected.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default NetManager;
