import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { Net } from "../types/diagram";
import { toNumberOrUndefined } from "../lib/ratingHelpers";
import DebouncedTextField from "./DebouncedTextField";
import type { Strings } from "../i18n/strings";

type Props = {
  net: Net;
  edgeCount: number;
  onRename: (netId: string, label: string) => void;
  onUpdateAttributes: (netId: string, updates: Partial<Net>) => void;
  onDelete: (netId: string) => void;
  labels: Strings["edge"];
};

const NetDetailsForm = ({
  net,
  edgeCount,
  onRename,
  onUpdateAttributes,
  onDelete,
  labels,
}: Props) => (
  <Stack spacing={1}>
    <DebouncedTextField
      size="small"
      label={labels.netName}
      value={net.label}
      onCommit={(val) => onRename(net.id, val)}
    />
    <TextField
      size="small"
      label={labels.kind}
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
      label={labels.voltage}
      type="number"
      inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
      value={net.voltage}
      onCommit={(val) => onUpdateAttributes(net.id, { voltage: toNumberOrUndefined(val) })}
    />
    <DebouncedTextField
      size="small"
      label={labels.tolerance}
      type="number"
      inputProps={{ step: 0.1, min: 0, max: 100, inputMode: "decimal" }}
      value={net.tolerance ?? ""}
      onCommit={(val) => onUpdateAttributes(net.id, { tolerance: toNumberOrUndefined(val) })}
    />
    <TextField
      size="small"
      label={labels.phase}
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
      {labels.deleteNet(edgeCount)}
    </Button>
  </Stack>
);

export default NetDetailsForm;
