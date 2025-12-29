import type { Block, BlockType, RatingC, Phase } from "../types/diagram";

export const toNumberOrUndefined = (value: string): number | undefined => {
  if (value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : Math.round(num * 100) / 100;
};

export const toPhase = (value: number | undefined): Phase | undefined => {
  if (value === 0 || value === 1 || value === 3) return value;
  return undefined;
};

export const ensureTypeCRating = (rating?: Block["rating"]): RatingC => {
  const fallback: RatingC = {
    in: { V_in: 200, phase_in: 1 },
    out: { V_out: 24, phase_out: 0 },
  };
  if (!rating || typeof rating !== "object") {
    return { ...fallback, in: { ...fallback.in }, out: { ...fallback.out } };
  }
  const cast = rating as RatingC;
  return {
    in: { ...fallback.in, ...(cast.in ?? {}) },
    out: { ...fallback.out, ...(cast.out ?? {}) },
    eta: cast.eta,
  };
};

export const defaultRatings: Record<BlockType, Block["rating"]> = {
  A: { V_max: 250, I_max: 20, phase: 1 },
  B: { V_in: 200, phase: 1 },
  C: {
    in: { V_in: 200, phase_in: 1 },
    out: { V_out: 24, phase_out: 0 },
  },
};
