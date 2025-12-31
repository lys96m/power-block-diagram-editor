// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import PropertiesPanel from "./PropertiesPanel";
import type { Edge, Node } from "reactflow";
import type { Net } from "../types/diagram";

describe("PropertiesPanel", () => {
  const nets: Net[] = [{ id: "net-1", label: "N1", kind: "AC", voltage: 200, phase: 1 }];
  const node: Node = {
    id: "n1",
    data: { type: "A", label: "L1", rating: { V_max: 100, I_max: 10, phase: 1 } },
    position: { x: 0, y: 0 },
  };
  const edge: Edge = {
    id: "e1",
    source: "n1",
    target: "n2",
    type: "smooth",
    data: { netId: "net-1" },
  };
  const noop = () => {};

  it("renders node fields when node selected", () => {
    render(
      <PropertiesPanel
        selectedNode={node}
        selectedEdge={null}
        typeLabels={{ A: "A", B: "B", C: "C" }}
        nets={nets}
        netEdgeCounts={{}}
        onLabelChange={noop}
        onTypeChange={noop}
        onTypeAChange={noop}
        onTypeBChange={noop}
        onTypeCChange={noop}
        onEdgeNetChange={noop}
        onCreateNet={noop}
        onRenameNet={noop}
        onUpdateNetAttributes={noop}
        onDeleteNet={() => true}
        onDeleteSelected={noop}
      />,
    );

    expect(screen.getByLabelText(/Label/i)).toHaveValue("L1");
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
  });

  it("renders edge fields when edge selected", () => {
    render(
      <PropertiesPanel
        selectedNode={null}
        selectedEdge={edge}
        typeLabels={{ A: "A", B: "B", C: "C" }}
        nets={nets}
        netEdgeCounts={{ "net-1": 1 }}
        onLabelChange={noop}
        onTypeChange={noop}
        onTypeAChange={noop}
        onTypeBChange={noop}
        onTypeCChange={noop}
        onEdgeNetChange={noop}
        onCreateNet={noop}
        onRenameNet={noop}
        onUpdateNetAttributes={noop}
        onDeleteNet={() => true}
        onDeleteSelected={noop}
      />,
    );

    expect(screen.getByText(/Edge:/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/Net/i).length).toBeGreaterThan(0);
  });
});
