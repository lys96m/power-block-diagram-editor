// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { DiagramProvider, useDiagramState } from "./DiagramState";
import type { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <DiagramProvider>{children}</DiagramProvider>
);

describe("DiagramState net helpers", () => {
  it("adds a new net with unique id", () => {
    const { result } = renderHook(() => useDiagramState(), { wrapper });
    act(() => {
      result.current.addNet();
    });
    const firstId = result.current.nets[result.current.nets.length - 1]?.id;
    act(() => {
      result.current.addNet();
    });
    const secondId = result.current.nets[result.current.nets.length - 1]?.id;
    expect(firstId).not.toBe(secondId);
    expect(result.current.nets.find((n) => n.id === firstId)).toBeTruthy();
    expect(result.current.nets.find((n) => n.id === secondId)).toBeTruthy();
  });

  it("updates net label and attributes", () => {
    const { result } = renderHook(() => useDiagramState(), { wrapper });
    const netId = result.current.nets[0].id;

    act(() => {
      result.current.updateNetLabel(netId, "TestNet");
      result.current.updateNetAttributes(netId, { voltage: 400, phase: 3, tolerance: 5 });
    });

    const updated = result.current.nets.find((n) => n.id === netId);
    expect(updated?.label).toBe("TestNet");
    expect(updated?.voltage).toBe(400);
    expect(updated?.phase).toBe(3);
    expect(updated?.tolerance).toBe(5);
  });

  it("prevents deleting net when referenced by edges", () => {
    const { result } = renderHook(() => useDiagramState(), { wrapper });
    const netId = result.current.nets[0].id;

    act(() => {
      result.current.updateEdgeNet("e1-2", netId);
    });

    const removed = result.current.removeNet(netId);
    expect(removed).toBe(false);
    expect(result.current.nets.find((n) => n.id === netId)).toBeTruthy();
  });

  it("allows deleting net when not referenced", () => {
    const { result } = renderHook(() => useDiagramState(), { wrapper });
    const netId = result.current.addNet();

    const removed = result.current.removeNet(netId);
    expect(removed).toBe(true);
    expect(result.current.nets.find((n) => n.id === netId)).toBeUndefined();
  });
});
