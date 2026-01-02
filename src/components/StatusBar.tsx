import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  errors: number;
  warnings: number;
  nets: number;
  unassignedEdges: number;
  uncertainLoads: number;
  orphanNets: number;
  readyLabel: string;
  counts: {
    nets: string;
    errors: string;
    warnings: string;
    unassignedEdges: string;
    orphanNets: string;
    uncertainLoads: string;
  };
};

export const StatusBar = ({
  errors,
  warnings,
  nets,
  unassignedEdges,
  uncertainLoads,
  orphanNets,
  readyLabel,
  counts,
}: Props) => (
  <Box className="status-bar">
    <Typography variant="body2">{readyLabel}</Typography>
    <Typography variant="body2" color="text.secondary">
      {counts.nets}: {nets} | {counts.errors}: {errors} | {counts.warnings}: {warnings} |{" "}
      {counts.unassignedEdges}: {unassignedEdges} | {counts.orphanNets}: {orphanNets} |{" "}
      {counts.uncertainLoads}: {uncertainLoads}
    </Typography>
  </Box>
);

export default StatusBar;
