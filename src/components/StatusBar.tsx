import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

type Props = {
  errors: number;
  warnings: number;
  nets: number;
  unassignedEdges: number;
  uncertainLoads: number;
  orphanNets: number;
  labels: {
    ready: string;
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
  labels,
}: Props) => (
  <Box className="status-bar">
    <Typography variant="body2">{labels.ready}</Typography>
    <Typography variant="body2" color="text.secondary">
      {labels.nets}: {nets} | {labels.errors}: {errors} | {labels.warnings}: {warnings} |{" "}
      {labels.unassignedEdges}: {unassignedEdges} | {labels.orphanNets}: {orphanNets} |{" "}
      {labels.uncertainLoads}: {uncertainLoads}
    </Typography>
  </Box>
);

export default StatusBar;
