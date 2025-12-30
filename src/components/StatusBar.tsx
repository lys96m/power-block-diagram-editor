import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  errors: number;
  warnings: number;
  nets: number;
  unassignedNets: number;
  uncertainLoads: number;
};

export const StatusBar = ({ errors, warnings, nets, unassignedNets, uncertainLoads }: Props) => (
  <Box className="status-bar">
    <Typography variant="body2">Status: Ready</Typography>
    <Typography variant="body2" color="text.secondary">
      Nets: {nets} | Errors: {errors} | Warnings: {warnings} | Unassigned nets: {unassignedNets} |
      Uncertain loads: {uncertainLoads}
    </Typography>
  </Box>
);

export default StatusBar;
