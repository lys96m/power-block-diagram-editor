import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Net } from "../types/diagram";
import NetDetailsForm from "./NetDetailsForm";
import type { Strings } from "../i18n/strings";

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
  labels: Strings["netManager"];
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
  labels,
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
        {labels.title}
      </Typography>
      <Divider />
      <Stack spacing={1} mt={1}>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            label={labels.selectNet}
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
            {labels.add}
          </Button>
          <Button variant="outlined" size="small" disabled={!canUndoNet} onClick={undoNetAction}>
            {labels.undo}
          </Button>
          <Button variant="outlined" size="small" disabled={!canRedoNet} onClick={redoNetAction}>
            {labels.redo}
          </Button>
        </Stack>

        {selectedNet ? (
          <NetDetailsForm
            net={selectedNet}
            edgeCount={edgeCount}
            onRename={updateNetLabel}
            onUpdateAttributes={updateNetAttributes}
            onDelete={handleDelete}
            labels={labels}
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {labels.noNet}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default NetManager;
