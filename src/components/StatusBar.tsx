import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  errors: number;
  warnings: number;
  nets: number;
  unassignedEdges: number;
  uncertainLoads: number;
  orphanNets: number;
};

export const StatusBar = ({
  errors,
  warnings,
  nets,
  unassignedEdges,
  uncertainLoads,
  orphanNets,
}: Props) => (
  <Box className="status-bar">
    <Typography variant="body2">Status: Ready</Typography>
    <Typography variant="body2" color="text.secondary">
      Nets: {nets} | Errors: {errors} | Warnings: {warnings} | Unassigned edges: {unassignedEdges} |
      Orphan nets: {orphanNets} | Uncertain loads: {uncertainLoads}
    </Typography>
  </Box>
);

export default StatusBar;
