import { describe, expect, it } from "vitest";
import { createEmptyProject, parseProject, serializeProject } from "./projectIO";

describe("projectIO", () => {
  it("serializes and parses a project", () => {
    const project = createEmptyProject();
    const json = serializeProject(project);
    const parsed = parseProject(json);
    expect(parsed.schema_version).toBe("1.0.0");
    expect(parsed.meta.title).toBe("Untitled");
  });

  it("throws on unsupported schema version", () => {
    const json = JSON.stringify({ schema_version: "2.0.0" });
    expect(() => parseProject(json)).toThrow(/Unsupported schema_version/);
  });

  it("throws when required fields are missing", () => {
    const json = JSON.stringify({ schema_version: "1.0.0", meta: {} });
    expect(() => parseProject(json)).toThrow(/Missing required fields/);
  });

  it("throws when a connection references an unknown net", () => {
    const project = {
      schema_version: "1.0.0",
      meta: { title: "t", created_at: "", updated_at: "", author: "" },
      nets: [{ id: "net-1", kind: "AC", voltage: 100, phase: 1, label: "N1" }],
      blocks: [],
      connections: [{ from: "A:out", to: "B:in", net: "net-missing", label: "c1" }],
      layout: { blocks: {}, edges: {} },
    };
    expect(() => parseProject(JSON.stringify(project))).toThrow(/unknown net id/i);
  });

  it("throws when a connection is missing net field", () => {
    const project = {
      schema_version: "1.0.0",
      meta: { title: "t", created_at: "", updated_at: "", author: "" },
      nets: [{ id: "net-1", kind: "AC", voltage: 100, phase: 1, label: "N1" }],
      blocks: [],
      connections: [{ from: "A:out", to: "B:in", label: "c1" }],
      layout: { blocks: {}, edges: {} },
    };
    expect(() => parseProject(JSON.stringify(project))).toThrow(/missing 'net'/i);
  });

  it("throws when net ids are duplicated", () => {
    const project = {
      schema_version: "1.0.0",
      meta: { title: "t", created_at: "", updated_at: "", author: "" },
      nets: [
        { id: "net-1", kind: "AC", voltage: 100, phase: 1, label: "N1" },
        { id: "net-1", kind: "AC", voltage: 200, phase: 1, label: "N2" },
      ],
      blocks: [],
      connections: [{ from: "A:out", to: "B:in", net: "net-1", label: "c1" }],
      layout: { blocks: {}, edges: {} },
    };
    expect(() => parseProject(JSON.stringify(project))).toThrow(/duplicate net id/i);
  });
});
