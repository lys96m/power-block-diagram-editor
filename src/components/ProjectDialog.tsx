import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

export type ProjectDialogMode = "open" | "save" | "export" | null;

type Props = {
  mode: ProjectDialogMode;
  text: string;
  error?: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
  onLoad: () => void;
  onCopy: () => void;
};

export const ProjectDialog = ({ mode, text, error, onChangeText, onClose, onLoad, onCopy }: Props) => {
  const title =
    mode === "open"
      ? "Open project (JSON)"
      : mode === "save"
        ? "Save project (JSON copy)"
        : "Export project (JSON copy)";

  return (
    <Dialog open={mode !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {mode === "open" ? (
          <Typography variant="body2" gutterBottom>
            project.json を貼り付けて「Load」を押してください。
          </Typography>
        ) : (
          <Typography variant="body2" gutterBottom>
            JSON をコピーして保存してください（ダウンロードは未実装）。
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
            Export (JSON コピー) のみ対応中。ダウンロードは後続対応。
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {mode === "open" ? (
          <Button variant="contained" onClick={onLoad}>
            Load
          </Button>
        ) : (
          <Button variant="contained" onClick={onCopy}>
            Copy JSON
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProjectDialog;
