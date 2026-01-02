import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import type { Strings } from "../i18n/strings";

type Props = {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
  labels: Strings["header"];
};

export const HeaderBar = ({ onNew, onOpen, onSave, onExport, labels }: Props) => (
  <AppBar position="static" className="app-bar" elevation={1}>
    <Toolbar className="toolbar" variant="dense">
      <Typography variant="h6" component="div">
        {labels.title}
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button color="inherit" size="small" variant="text" onClick={onNew}>
          {labels.new}
        </Button>
        <Button color="inherit" size="small" variant="text" onClick={onOpen}>
          {labels.open}
        </Button>
        <Button color="inherit" size="small" variant="text" onClick={onSave}>
          {labels.save}
        </Button>
        <Button color="inherit" size="small" variant="text" onClick={onExport}>
          {labels.export}
        </Button>
        <Button color="inherit" size="small" variant="text" disabled title={labels.undoTooltip}>
          {labels.undo}
        </Button>
        <Button color="inherit" size="small" variant="text" disabled title={labels.redoTooltip}>
          {labels.redo}
        </Button>
      </Stack>
    </Toolbar>
  </AppBar>
);

export default HeaderBar;
