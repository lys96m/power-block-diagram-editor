import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

type Props = {
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onExport: () => void;
};

export const HeaderBar = ({ onNew, onOpen, onSave, onExport }: Props) => (
  <AppBar position="static" className="app-bar" elevation={1}>
    <Toolbar className="toolbar" variant="dense">
      <Typography variant="h6" component="div">
        Power Block Diagram Editor
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button color="inherit" size="small" variant="text" onClick={onNew}>
          New
        </Button>
        <Button color="inherit" size="small" variant="text" onClick={onOpen}>
          Open
        </Button>
        <Button color="inherit" size="small" variant="text" onClick={onSave}>
          Save
        </Button>
        <Button color="inherit" size="small" variant="text" onClick={onExport}>
          Export
        </Button>
        <Button color="inherit" size="small" variant="text" disabled title="Undo not implemented">
          Undo
        </Button>
        <Button color="inherit" size="small" variant="text" disabled title="Redo not implemented">
          Redo
        </Button>
      </Stack>
    </Toolbar>
  </AppBar>
);

export default HeaderBar;
