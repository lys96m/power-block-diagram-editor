import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Node } from "reactflow";
import type { BlockType, RatingA, RatingB, RatingC } from "../types/diagram";
import { ensureTypeCRating, toNumberOrUndefined, toPhase } from "../lib/ratingHelpers";
import type { NodeData } from "../hooks/useNodeEditing";
import DebouncedTextField from "./DebouncedTextField";

type Props = {
  selectedNode: Node | null;
  typeLabels: Record<BlockType, string>;
  onLabelChange: (value: string) => void;
  onTypeChange: (value: BlockType) => void;
  onTypeAChange: (field: keyof RatingA, value: number | undefined) => void;
  onTypeBChange: (field: keyof RatingB, value: number | undefined) => void;
  onTypeCChange: (
    scope: "in" | "out" | "eta",
    field: keyof RatingC["in"] | keyof RatingC["out"] | "eta",
    value: number | undefined,
  ) => void;
};

const NodeProperties = ({
  selectedNode,
  typeLabels,
  onLabelChange,
  onTypeChange,
  onTypeAChange,
  onTypeBChange,
  onTypeCChange,
}: Props) => {
  if (!selectedNode) return null;

  const data = (selectedNode.data ?? {}) as NodeData;

  return (
    <>
      <Typography variant="body2" fontWeight={600}>
        Node: {selectedNode.id}
      </Typography>
      <DebouncedTextField
        size="small"
        label="Label"
        value={data?.label ?? ""}
        onCommit={(value) => onLabelChange(value)}
      />
      <TextField
        size="small"
        label="Category"
        select
        value={data?.type ?? ""}
        onChange={(e) => onTypeChange(e.target.value as BlockType)}
      >
        {(["A", "B", "C"] as BlockType[]).map((option) => (
          <MenuItem key={option} value={option}>
            {typeLabels[option]}
          </MenuItem>
        ))}
      </TextField>

      {data.type === "A" && (
        <Stack spacing={1}>
          <DebouncedTextField
            size="small"
            label="V_max (V)"
            type="number"
            inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
            value={(data.rating as RatingA | undefined)?.V_max ?? ""}
            onCommit={(val) => onTypeAChange("V_max", toNumberOrUndefined(val))}
          />
          <DebouncedTextField
            size="small"
            label="I_max (A)"
            type="number"
            inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
            value={(data.rating as RatingA | undefined)?.I_max ?? ""}
            onCommit={(val) => onTypeAChange("I_max", toNumberOrUndefined(val))}
          />
          <TextField
            size="small"
            label="Phase"
            select
            value={(data.rating as RatingA | undefined)?.phase ?? ""}
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

      {data.type === "B" && (
        <Stack spacing={1}>
          <DebouncedTextField
            size="small"
            label="V_in (V)"
            type="number"
            inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
            value={(data.rating as RatingB | undefined)?.V_in ?? ""}
            onCommit={(val) => onTypeBChange("V_in", toNumberOrUndefined(val))}
          />
          <DebouncedTextField
            size="small"
            label="I_in (A)"
            type="number"
            inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
            value={(data.rating as RatingB | undefined)?.I_in ?? ""}
            onCommit={(val) => onTypeBChange("I_in", toNumberOrUndefined(val))}
          />
          <DebouncedTextField
            size="small"
            label="P_in (W)"
            type="number"
            inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
            value={(data.rating as RatingB | undefined)?.P_in ?? ""}
            onCommit={(val) => onTypeBChange("P_in", toNumberOrUndefined(val))}
          />
          <TextField
            size="small"
            label="Phase"
            select
            value={(data.rating as RatingB | undefined)?.phase ?? ""}
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

      {data.type === "C" &&
        (() => {
          const rating = ensureTypeCRating(data?.rating);
          return (
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={600}>
                Input
              </Typography>
              <DebouncedTextField
                size="small"
                label="V_in (V)"
                type="number"
                inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                value={rating.in.V_in ?? ""}
                onCommit={(val) => onTypeCChange("in", "V_in", toNumberOrUndefined(val))}
              />
              <DebouncedTextField
                size="small"
                label="I_in_max (A)"
                type="number"
                inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                value={rating.in.I_in_max ?? ""}
                onCommit={(val) => onTypeCChange("in", "I_in_max", toNumberOrUndefined(val))}
              />
              <DebouncedTextField
                size="small"
                label="P_in_max (W)"
                type="number"
                inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                value={rating.in.P_in_max ?? ""}
                onCommit={(val) => onTypeCChange("in", "P_in_max", toNumberOrUndefined(val))}
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
              <DebouncedTextField
                size="small"
                label="V_out (V)"
                type="number"
                inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                value={rating.out.V_out ?? ""}
                onCommit={(val) => onTypeCChange("out", "V_out", toNumberOrUndefined(val))}
              />
              <DebouncedTextField
                size="small"
                label="I_out_max (A)"
                type="number"
                inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                value={rating.out.I_out_max ?? ""}
                onCommit={(val) => onTypeCChange("out", "I_out_max", toNumberOrUndefined(val))}
              />
              <DebouncedTextField
                size="small"
                label="P_out_max (W)"
                type="number"
                inputProps={{ step: 0.01, min: 0, inputMode: "decimal" }}
                value={rating.out.P_out_max ?? ""}
                onCommit={(val) => onTypeCChange("out", "P_out_max", toNumberOrUndefined(val))}
              />
              <TextField
                size="small"
                label="Phase_out"
                select
                value={rating.out.phase_out ?? ""}
                onChange={(e) => onTypeCChange("out", "phase_out", toPhase(Number(e.target.value)))}
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
              <DebouncedTextField
                size="small"
                label="eta (0-1)"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1, inputMode: "decimal" }}
                value={rating.eta ?? ""}
                onCommit={(val) => onTypeCChange("eta", "eta", toNumberOrUndefined(val))}
              />
            </Stack>
          );
        })()}
    </>
  );
};

export default NodeProperties;
