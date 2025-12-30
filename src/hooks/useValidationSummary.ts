import { useMemo } from "react";
import type { Edge, Node } from "reactflow";
import { defaultNet } from "../lib/constants";
import { validateNet } from "../services/validation";
import type { Block, Net, ValidationResult } from "../types/diagram";
import type { NodeData } from "./useNodeEditing";

type ValidationStats = {
  errors: number;
  warnings: number;
  uncertainLoads: number;
  nets: number;
  unassignedEdges: number;
  orphanNets: number;
};

export const useValidationSummary = (nodes: Node[], edges: Edge[], nets: Net[]) => {
  return useMemo(() => {
    const issues: ValidationResult[] = [];
    const labelLookup: Record<string, string> = {};
    const unassignedEdges = edges.filter(
      (e) => !(e.data as { netId?: string } | undefined)?.netId,
    ).length;
    const netMap = nets.reduce<Record<string, (typeof nets)[number]>>((acc, net) => {
      acc[net.id] = net;
      return acc;
    }, {});
    const nodeNets = new Map<string, Set<string>>();
    const netBlocks = new Map<string, Block[]>();
    const invalidNetRefs: string[] = [];
    const referencedNets = new Set<string>();

    edges.forEach((edge) => {
      const netId = (edge.data as { netId?: string } | undefined)?.netId;
      if (netId) {
        if (!netMap[netId] && !invalidNetRefs.includes(netId)) invalidNetRefs.push(netId);
        if (!nodeNets.has(edge.source)) nodeNets.set(edge.source, new Set());
        if (!nodeNets.has(edge.target)) nodeNets.set(edge.target, new Set());
        nodeNets.get(edge.source)?.add(netId);
        nodeNets.get(edge.target)?.add(netId);
        referencedNets.add(netId);
      }
    });

    nodes.forEach((node) => {
      const data = (node.data ?? {}) as NodeData;
      const type = data.type;
      const rating = data.rating;
      const label = data.label ?? node.id;
      labelLookup[node.id] = label;

      if (!type || !rating) {
        issues.push({
          id: `warn-${node.id}-missing-type`,
          level: "warn",
          message: "Missing type or rating",
          targetId: node.id,
        });
        return;
      }

      const block: Block = {
        id: node.id,
        type,
        name: label,
        rating,
        ports: [],
      } as Block;

      const netsForNode = nodeNets.get(node.id);
      const targetNetIds =
        netsForNode && netsForNode.size > 0
          ? Array.from(netsForNode)
          : nets.length > 0
            ? [nets[0].id]
            : [defaultNet.id];

      targetNetIds.forEach((netId) => {
        const arr = netBlocks.get(netId) ?? [];
        if (!arr.find((b) => b.id === block.id)) arr.push(block);
        netBlocks.set(netId, arr);
      });
    });

    invalidNetRefs.forEach((netId) => {
      issues.push({
        id: `warn-missing-net-${netId}`,
        level: "warn",
        message: `Edge references missing net: ${netId}`,
      });
    });

    let totalUncertain = 0;
    netBlocks.forEach((blocksForNet, netId) => {
      const net = netMap[netId] ?? defaultNet;
      const { issues: netIssues, uncertainLoads } = validateNet(blocksForNet, net);
      issues.push(...netIssues);
      totalUncertain += uncertainLoads;
    });

    const errors = issues.filter((r) => r.level === "error").length;
    const warnings = issues.filter((r) => r.level === "warn").length;
    const orphanNets = nets.filter((net) => !referencedNets.has(net.id)).length;

    const stats: ValidationStats = {
      errors,
      warnings,
      uncertainLoads: totalUncertain,
      nets: nets.length || 1,
      unassignedEdges,
      orphanNets,
    };

    return { issues, labelLookup, stats };
  }, [nodes, edges, nets]);
};

export type { ValidationStats };
