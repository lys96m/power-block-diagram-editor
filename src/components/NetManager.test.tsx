// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import NetManager from "./NetManager";
import type { Net } from "../types/diagram";
import { getStrings } from "../i18n/strings";

describe("NetManager", () => {
  const nets: Net[] = [{ id: "net-1", label: "N1", kind: "AC", voltage: 200, phase: 1 }];
  const noop = () => {};
  const labels = getStrings().netManager;

  it("renders nets dropdown and buttons", () => {
    render(
      <NetManager
        nets={nets}
        netEdgeCounts={{}}
        addNet={() => "net-2"}
        updateNetLabel={noop}
        updateNetAttributes={noop}
        removeNet={() => true}
        undoNetAction={() => true}
        redoNetAction={() => true}
        canUndoNet
        canRedoNet
        labels={labels}
      />,
    );

    expect(screen.getByLabelText(/Select Net/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Undo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Redo/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toHaveValue("N1");
  });
});
