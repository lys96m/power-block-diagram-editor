import type { Project } from "../types/diagram";

export const serializeProject = (project: Project): string => {
  return JSON.stringify(project, null, 2);
};

export const parseProject = (json: string): Project => {
  const parsed = JSON.parse(json) as Partial<Project>;

  if (parsed.schema_version !== "1.0.0") {
    throw new Error(`Unsupported schema_version: ${parsed.schema_version ?? "unknown"}`);
  }

  if (!parsed.meta || !parsed.nets || !parsed.blocks || !parsed.connections || !parsed.layout) {
    throw new Error("Missing required fields in project.json");
  }

  return parsed as Project;
};

export const createEmptyProject = (): Project => ({
  schema_version: "1.0.0",
  meta: {
    title: "Untitled",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    author: "unknown",
  },
  nets: [],
  blocks: [],
  connections: [],
  layout: { blocks: {}, edges: {} },
});
