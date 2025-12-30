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

  const netIds = new Set<string>();
  parsed.nets.forEach((net) => {
    if (!net.id) {
      throw new Error("Net id is required");
    }
    if (netIds.has(net.id)) {
      throw new Error(`Duplicate net id found: ${net.id}`);
    }
    netIds.add(net.id);
  });

  parsed.connections.forEach((conn, idx) => {
    const net = (conn as { net?: string | null }).net;
    if (net === undefined) {
      throw new Error(`Connection at index ${idx} is missing 'net'`);
    }
    if (net !== null && typeof net !== "string") {
      throw new Error(`Connection at index ${idx} has invalid net value`);
    }
    if (typeof net === "string" && !netIds.has(net)) {
      throw new Error(`Connection references unknown net id: ${net}`);
    }
  });

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
