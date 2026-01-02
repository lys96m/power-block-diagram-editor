// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import ValidationPanel from "./ValidationPanel";
import type { ValidationResult } from "../types/diagram";
import type { ValidationStats } from "../hooks/useValidationSummary";

describe("ValidationPanel", () => {
  const stats: ValidationStats = {
    errors: 1,
    warnings: 1,
    uncertainLoads: 0,
    nets: 2,
    unassignedEdges: 0,
    orphanNets: 0,
  };

  const issues: ValidationResult[] = [
    { id: "err-1", level: "error", message: "Voltage mismatch", targetId: "n1" },
    { id: "warn-1", level: "warn", message: "Check rating", targetId: "n2" },
    { id: "info-1", level: "info", message: "Optional note" },
  ];

  it("renders summary chips and grouped issues", () => {
    render(
      <ValidationPanel
        stats={stats}
        issues={issues}
        labelLookup={{ n1: "Block A", n2: "Block B" }}
      />,
    );

    expect(screen.getByText(/Errors: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Warnings: 1/)).toBeInTheDocument();
    expect(screen.getByText(/Nets: 2/)).toBeInTheDocument();

    expect(screen.getByText("Voltage mismatch")).toBeInTheDocument();
    expect(screen.getByText("Check rating")).toBeInTheDocument();
    expect(screen.getByText(/対象: Block A/)).toBeInTheDocument();
  });

  it("allows collapsing a level section", async () => {
    render(<ValidationPanel stats={stats} issues={issues} labelLookup={{}} />);
    const warnToggle = screen.getAllByTestId("validation-toggle-warn")[0];
    const warnSection = screen.getAllByTestId("validation-section-warn")[0];
    fireEvent.click(warnToggle);
    await waitFor(() => expect(within(warnSection).queryByText("Check rating")).toBeNull());
    fireEvent.click(warnToggle);
    await waitFor(() => expect(within(warnSection).getByText("Check rating")).toBeVisible());
  });
});
