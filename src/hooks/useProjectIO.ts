import { useState } from "react";
import type { Edge, Node } from "reactflow";
import { createEmptyProject, parseProject, serializeProject } from "../services/projectIO";
import type { Block, BlockType, Net, Project, RatingA, RatingB, RatingC } from "../types/diagram";
import { defaultRatings, ensureTypeCRating } from "../lib/ratingHelpers";
import type { ProjectDialogMode } from "../components/ProjectDialog";
import type { AlertColor } from "@mui/material/Alert";

type NodeData = { type?: BlockType; label?: string; rating?: Block["rating"] };

const diagramToProject = (nodes: Node[], edges: Edge[], nets: Net[]): Project => {
  const now = new Date().toISOString();
  const toBlock = (n: Node): Block => {
    const data = (n.data ?? {}) as NodeData;
    const type = (data.type as BlockType | undefined) ?? "A";
    if (type === "A") {
      const rating: RatingA = (data.rating as RatingA) ?? (defaultRatings.A as RatingA);
      return {
        id: n.id,
        type: "A",
        name: data.label ?? n.id,
        rating,
        ports: [
          { id: "in", role: "power_in", direction: "in" },
          { id: "out", role: "power_out", direction: "out" },
        ],
      };
    }
    if (type === "B") {
      const rating: RatingB = (data.rating as RatingB) ?? (defaultRatings.B as RatingB);
      return {
        id: n.id,
        type: "B",
        name: data.label ?? n.id,
        rating,
        ports: [{ id: "in", role: "power_in", direction: "in" }],
      };
    }
    const rating: RatingC = ensureTypeCRating(data.rating);
    return {
      id: n.id,
      type: "C",
      name: data.label ?? n.id,
      rating,
      ports: [
        { id: "in", role: "power_in", direction: "in" },
        { id: "out", role: "power_out", direction: "out" },
      ],
    };
  };

  return {
    schema_version: "1.0.0",
    meta: { title: "Untitled", created_at: now, updated_at: now, author: "unknown" },
    nets,
    blocks: nodes.map((n) => toBlock(n)),
    connections: edges.map((e, idx) => ({
      from: `${e.source}:out`,
      to: `${e.target}:in`,
      net: (e.data as { netId?: string | null } | undefined)?.netId ?? null,
      label: typeof e.label === "string" ? e.label : `conn-${idx + 1}`,
    })),
    layout: {
      blocks: nodes.reduce<Record<string, { x: number; y: number; w: number; h: number }>>(
        (acc, n) => {
          acc[n.id] = {
            x: n.position?.x ?? 0,
            y: n.position?.y ?? 0,
            w: 160,
            h: 80,
          };
          return acc;
        },
        {},
      ),
      edges: {},
    },
  };
};

const projectToDiagram = (project: Project): { nodes: Node[]; edges: Edge[]; nets: Net[] } => {
  const layoutBlocks = project.layout?.blocks ?? {};
  const nodesFromProject: Node[] = project.blocks.map((b, idx) => {
    const layout = layoutBlocks[b.id];
    return {
      id: b.id,
      position: { x: layout?.x ?? 100 + idx * 80, y: layout?.y ?? 100 },
      data: { label: b.name, type: b.type, rating: b.rating },
    };
  });

  const edgesFromProject: Edge[] = project.connections.map((c, idx) => {
    const source = c.from.split(":")[0];
    const target = c.to.split(":")[0];
    return {
      id: c.label ?? `edge-${idx + 1}`,
      source,
      target,
      type: "smooth",
      data: { netId: c.net },
    };
  });

  return { nodes: nodesFromProject, edges: edgesFromProject, nets: project.nets ?? [] };
};

type UseProjectIOArgs = {
  nodes: Node[];
  edges: Edge[];
  nets: Net[];
  replaceDiagram: (nodes: Node[], edges: Edge[], nets: Net[]) => void;
  resetSelection: () => void;
};

export const useProjectIO = ({
  nodes,
  edges,
  nets,
  replaceDiagram,
  resetSelection,
}: UseProjectIOArgs) => {
  const [dialogState, setDialogState] = useState<{
    mode: ProjectDialogMode;
    text: string;
    error?: string;
  }>({ mode: null, text: "" });
  const [toast, setToast] = useState<{ message: string; severity: AlertColor } | null>(null);

  const closeDialog = () => setDialogState({ mode: null, text: "", error: undefined });
  const clearToast = () => setToast(null);

  const openNewProject = () => {
    const emptyProject = createEmptyProject();
    const { nodes: nextNodes, edges: nextEdges, nets: nextNets } = projectToDiagram(emptyProject);
    replaceDiagram(nextNodes, nextEdges, nextNets);
    resetSelection();
    closeDialog();
    setToast({ severity: "success", message: "新しいプロジェクトを開始しました。" });
  };

  const openDialog = () => setDialogState({ mode: "open", text: "", error: undefined });

  const openSaveOrExport = (mode: Exclude<ProjectDialogMode, "open" | null>) => {
    const json = serializeProject(diagramToProject(nodes, edges, nets));
    setDialogState({ mode, text: json, error: undefined });
  };

  const applyOpenProject = () => {
    try {
      const project = parseProject(dialogState.text);
      const { nodes: nextNodes, edges: nextEdges, nets: nextNets } = projectToDiagram(project);
      replaceDiagram(nextNodes, nextEdges, nextNets);
      resetSelection();
      closeDialog();
      setToast({ severity: "success", message: "プロジェクトを読み込みました。" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load project";
      setDialogState((prev) => ({ ...prev, error: message }));
      setToast({ severity: "error", message: `読み込みに失敗しました: ${message}` });
    }
  };

  const copyDialogText = () => {
    if (!navigator?.clipboard?.writeText) {
      setToast({ severity: "error", message: "クリップボードへのコピーをサポートしていません。" });
      return;
    }

    navigator.clipboard
      .writeText(dialogState.text)
      .then(() => setToast({ severity: "success", message: "JSON をコピーしました。" }))
      .catch(() => setToast({ severity: "error", message: "コピーに失敗しました。" }));
  };

  return {
    dialogState,
    setDialogText: (text: string) => setDialogState((prev) => ({ ...prev, text })),
    closeDialog,
    openNewProject,
    openDialog,
    openSaveOrExport,
    applyOpenProject,
    copyDialogText,
    toast,
    clearToast,
  };
};

export { diagramToProject, projectToDiagram };
