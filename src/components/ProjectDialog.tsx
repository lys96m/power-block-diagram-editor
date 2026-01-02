import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { Strings } from "../i18n/strings";

export type ProjectDialogMode = "open" | "save" | "export" | null;

type Props = {
  mode: ProjectDialogMode;
  text: string;
  error?: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
  onLoad: () => void;
  onCopy: () => void;
  labels: Strings["projectDialog"];
};

export const ProjectDialog = ({
  mode,
  text,
  error,
  onChangeText,
  onClose,
  onLoad,
  onCopy,
  labels,
}: Props) => {
  const title =
    mode === "open" ? labels.openTitle : mode === "save" ? labels.saveTitle : labels.exportTitle;

  return (
    <Dialog open={mode !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {mode === "open" ? (
          <Typography variant="body2" gutterBottom>
            {labels.openHint}
          </Typography>
        ) : (
          <Typography variant="body2" gutterBottom>
            {labels.copyHint}
          </Typography>
        )}
        <TextField
          fullWidth
          multiline
          minRows={12}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          disabled={mode !== "open"}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {mode === "export" && !error && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {labels.exportInfo}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{labels.close}</Button>
        {mode === "open" ? (
          <Button variant="contained" onClick={onLoad}>
            {labels.load}
          </Button>
        ) : (
          <Button variant="contained" onClick={onCopy}>
            {labels.copy}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
