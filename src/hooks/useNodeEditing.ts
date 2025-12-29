import { useMemo, useState } from "react";
import type { Edge, Node } from "reactflow";
import type { Block, BlockType, RatingA, RatingB, RatingC } from "../types/diagram";
import { ensureTypeCRating, toPhase } from "../lib/ratingHelpers";

type NodeData = { type?: BlockType; label?: string; rating?: Block["rating"] };

type UseNodeEditingArgs = {
  nodes: Node[];
  edges: Edge[];
  setNodes: (updater: (prev: Node[]) => Node[]) => void;
  deleteItems: (nodeIds: string[], edgeIds: string[]) => void;
  defaultRatings: Record<BlockType, Block["rating"]>;
};

export const useNodeEditing = ({
  nodes,
  edges,
  setNodes,
  deleteItems,
  defaultRatings,
}: UseNodeEditingArgs) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );
  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) ?? null,
    [edges, selectedEdgeId],
  );

  const handleSelectionChange = ({
    nodes: selectedNodes,
    edges: selectedEdges,
  }: {
    nodes: typeof nodes;
    edges: typeof edges;
  }) => {
    setSelectedNodeId(selectedNodes[0]?.id ?? null);
    setSelectedEdgeId(selectedEdges[0]?.id ?? null);
  };

  const handleNodeLabelChange = (value: string) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId ? { ...n, data: { ...(n.data ?? {}), label: value } } : n,
      ),
    );
  };

  const handleNodeTypeChange = (value: BlockType) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === selectedNodeId
          ? {
              ...n,
              data: {
                ...(n.data ?? {}),
                type: value,
                rating:
                  ((n.data as NodeData | undefined)?.type === value &&
                    (n.data as NodeData | undefined)?.rating) ??
                  defaultRatings[value],
              },
            }
          : n,
      ),
    );
  };

  const handleTypeARatingChange = (field: keyof RatingA, value: number | undefined) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNodeId) return n;
        const data = (n.data ?? {}) as NodeData;
        if (data.type !== "A") return n;
        const rating: RatingA = { ...(data.rating as RatingA) };
        if (value == null) {
          delete (rating as Record<string, number | undefined>)[field];
        } else if (field === "phase") {
          const phaseVal = toPhase(value);
          if (phaseVal == null) delete (rating as Record<string, number | undefined>)[field];
          else rating.phase = phaseVal;
        } else {
          rating[field] = value;
        }
        return { ...n, data: { ...data, rating } };
      }),
    );
  };

  const handleTypeBRatingChange = (field: keyof RatingB, value: number | undefined) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNodeId) return n;
        const data = (n.data ?? {}) as NodeData;
        if (data.type !== "B") return n;
        const rating: RatingB = { ...(data.rating as RatingB) };
        if (value == null) {
          delete (rating as Record<string, number | undefined>)[field];
        } else if (field === "phase") {
          const phaseVal = toPhase(value);
          if (phaseVal == null) delete (rating as Record<string, number | undefined>)[field];
          else rating.phase = phaseVal;
        } else {
          rating[field] = value;
        }
        return { ...n, data: { ...data, rating } };
      }),
    );
  };

  const handleTypeCRatingChange = (
    scope: "in" | "out" | "eta",
    field: keyof RatingC["in"] | keyof RatingC["out"] | "eta",
    value: number | undefined,
  ) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id !== selectedNodeId) return n;
        const data = (n.data ?? {}) as NodeData;
        if (data.type !== "C") return n;
        const rating = ensureTypeCRating(data.rating);
        const next: RatingC = {
          ...rating,
          in: { ...rating.in },
          out: { ...rating.out },
        };

        if (scope === "eta" && field === "eta") {
          if (value == null) delete next.eta;
          else next.eta = value;
        } else if (scope === "in" && field in next.in) {
          const key = field as keyof RatingC["in"];
          if (key === "phase_in") {
            const phaseVal = toPhase(value);
            if (phaseVal == null) delete (next.in as Record<string, number | undefined>)[key];
            else next.in.phase_in = phaseVal;
          } else if (value == null) {
            delete (next.in as Record<string, number | undefined>)[key];
          } else {
            next.in[key] = value;
          }
        } else if (scope === "out" && field in next.out) {
          const key = field as keyof RatingC["out"];
          if (key === "phase_out") {
            const phaseVal = toPhase(value);
            if (phaseVal == null) delete (next.out as Record<string, number | undefined>)[key];
            else next.out.phase_out = phaseVal;
          } else if (value == null) {
            delete (next.out as Record<string, number | undefined>)[key];
          } else {
            next.out[key] = value;
          }
        }

        return { ...n, data: { ...data, rating: next } };
      }),
    );
  };

  const handleDeleteSelected = () => {
    const nodesToDelete = selectedNodeId ? [selectedNodeId] : [];
    const edgesToDelete = selectedEdgeId ? [selectedEdgeId] : [];
    if (nodesToDelete.length === 0 && edgesToDelete.length === 0) return;
    deleteItems(nodesToDelete, edgesToDelete);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  const resetSelection = () => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  };

  return {
    selectedNode,
    selectedEdge,
    handleSelectionChange,
    handleNodeLabelChange,
    handleNodeTypeChange,
    handleTypeARatingChange,
    handleTypeBRatingChange,
    handleTypeCRatingChange,
    handleDeleteSelected,
    resetSelection,
  };
};

export type { NodeData };
