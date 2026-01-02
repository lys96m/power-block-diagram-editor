import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Edge, Node } from "reactflow";
import type { BlockType, Net, RatingA, RatingB, RatingC } from "../types/diagram";
import NodeProperties from "./NodeProperties";
import EdgeProperties from "./EdgeProperties";
import type { Strings } from "../i18n/strings";

type Props = {
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  typeLabels: Record<BlockType, string>;
  nets: Net[];
  netEdgeCounts: Record<string, number>;
  onLabelChange: (value: string) => void;
  onTypeChange: (value: BlockType) => void;
  onTypeAChange: (field: keyof RatingA, value: number | undefined) => void;
  onTypeBChange: (field: keyof RatingB, value: number | undefined) => void;
  onTypeCChange: (
    scope: "in" | "out" | "eta",
    field: keyof RatingC["in"] | keyof RatingC["out"] | "eta",
    value: number | undefined,
  ) => void;
  onEdgeNetChange: (edgeId: string, netId: string | null) => void;
  onCreateNet: (edgeId: string) => void;
  onRenameNet: (netId: string, label: string) => void;
  onUpdateNetAttributes: (netId: string, updates: Partial<Net>) => void;
  onDeleteNet: (netId: string) => boolean;
  onDeleteSelected: () => void;
  labels: {
    properties: Strings["properties"];
    node: Strings["node"];
    edge: Strings["edge"];
    netManager: Strings["netManager"];
  };
};

export const PropertiesPanel = ({
  selectedNode,
  selectedEdge,
  typeLabels,
  nets,
  netEdgeCounts,
  onLabelChange,
  onTypeChange,
  onTypeAChange,
  onTypeBChange,
  onTypeCChange,
  onEdgeNetChange,
  onCreateNet,
  onRenameNet,
  onUpdateNetAttributes,
  onDeleteNet,
  onDeleteSelected,
  labels,
}: Props) => (
  <Stack spacing={1} mt={2}>
    <NodeProperties
      selectedNode={selectedNode}
      typeLabels={typeLabels}
      onLabelChange={onLabelChange}
      onTypeChange={onTypeChange}
      onTypeAChange={onTypeAChange}
      onTypeBChange={onTypeBChange}
      onTypeCChange={onTypeCChange}
      labels={labels.node}
    />

    <EdgeProperties
      selectedEdge={selectedEdge}
      nets={nets}
      netEdgeCounts={netEdgeCounts}
      onEdgeNetChange={onEdgeNetChange}
      onCreateNet={onCreateNet}
      onRenameNet={onRenameNet}
      onUpdateNetAttributes={onUpdateNetAttributes}
      onDeleteNet={onDeleteNet}
      labels={labels.edge}
    />

    {!selectedNode && !selectedEdge && (
      <Typography variant="body2" color="text.secondary">
        {labels.properties.nothingSelected}
      </Typography>
    )}
    {(selectedNode || selectedEdge) && (
      <Button variant="outlined" color="error" size="small" onClick={onDeleteSelected}>
        {labels.properties.deleteSelected}
      </Button>
    )}
  </Stack>
);

export default PropertiesPanel;
