import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { Net } from "../types/diagram";
import { toNumberOrUndefined } from "../lib/ratingHelpers";
import DebouncedTextField from "./DebouncedTextField";

type Props = {
  net: Net;
  edgeCount: number;
  onRename: (netId: string, label: string) => void;
  onUpdateAttributes: (netId: string, updates: Partial<Net>) => void;
  onDelete: (netId: string) => void;
};

const NetDetailsForm = ({ net, edgeCount, onRename, onUpdateAttributes, onDelete }: Props) => (
  <Stack spacing={1}>
    <DebouncedTextField
      size="small"
      label="Name"
      value={net.label}
      onCommit={(val) => onRename(net.id, val)}
    />
    <TextField
      size="small"
      label="Kind"
      select
      value={net.kind}
      onChange={(e) => onUpdateAttributes(net.id, { kind: e.target.value as Net["kind"] })}
    >
      <MenuItem value="AC">AC</MenuItem>
      <MenuItem value="DC">DC</MenuItem>
      <MenuItem value="SIGNAL">SIGNAL</MenuItem>
    </TextField>
    <DebouncedTextField
      size="small"
      label="Voltage (V)"
      type="number"
      inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
      value={net.voltage}
      onCommit={(val) => onUpdateAttributes(net.id, { voltage: toNumberOrUndefined(val) })}
    />
    <DebouncedTextField
      size="small"
      label="Tolerance (%)"
      type="number"
      inputProps={{ step: 0.1, min: 0, max: 100, inputMode: "decimal" }}
      value={net.tolerance ?? ""}
      onCommit={(val) => onUpdateAttributes(net.id, { tolerance: toNumberOrUndefined(val) })}
    />
    <TextField
      size="small"
      label="Phase"
      select
      value={net.phase}
      onChange={(e) => onUpdateAttributes(net.id, { phase: Number(e.target.value) as 0 | 1 | 3 })}
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
      onClick={() => onDelete(net.id)}
    >
      Delete Net {edgeCount > 0 ? `(in use: ${edgeCount})` : ""}
    </Button>
  </Stack>
);

export default NetDetailsForm;
