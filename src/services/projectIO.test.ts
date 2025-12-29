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
});
