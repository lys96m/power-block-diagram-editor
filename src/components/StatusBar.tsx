import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  errors: number;
  warnings: number;
};

export const StatusBar = ({ errors, warnings }: Props) => (
  <Box className="status-bar">
    <Typography variant="body2">Status: Ready</Typography>
    <Typography variant="body2" color="text.secondary">
      Nets: 0 | Errors: {errors} | Warnings: {warnings} | Unassigned nets: 0 | Uncertain loads: 0
    </Typography>
  </Box>
);

export default StatusBar;
