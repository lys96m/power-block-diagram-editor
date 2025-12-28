export type Phase = 0 | 1 | 3; // 0=DC, 1=single-phase, 3=three-phase

export type BlockType = "A" | "B" | "C";

export type PortRole = "power_in" | "power_out" | "pass_through";
export type PortDirection = "in" | "out";

export type Port = {
  id: string;
  role: PortRole;
  direction: PortDirection;
};

export type Props = Record<string, string>;

export type RatingA = {
  V_max: number;
  I_max: number;
  phase: Phase;
};

export type RatingB = {
  V_in: number;
  phase: Phase;
  I_in?: number;
  P_in?: number;
};

export type RatingC = {
  in: {
    V_in: number;
    phase_in: Phase;
    I_in_max?: number;
    P_in_max?: number;
  };
  out: {
    V_out: number;
    phase_out: Phase;
    I_out_max?: number;
    P_out_max?: number;
  };
  eta?: number;
};

export type BlockBase<TType extends BlockType, TRating> = {
  id: string;
  type: TType;
  name: string;
  rating: TRating;
  ports: Port[];
  props?: Props;
  part_id?: string | null;
};

export type BlockA = BlockBase<"A", RatingA>;
export type BlockB = BlockBase<"B", RatingB>;
export type BlockC = BlockBase<"C", RatingC>;

export type Block = BlockA | BlockB | BlockC;

export type NetKind = "AC" | "DC" | "SIGNAL";

export type Net = {
  id: string;
  kind: NetKind;
  voltage: number;
  phase: Phase;
  label: string;
  tolerance?: number; // percent (0-100)
};

export type Connection = {
  from: `${string}:${string}`; // BlockID:PortID
  to: `${string}:${string}`;
  net: string | null;
  label?: string;
};

export type LayoutBlock = {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number; // default 0
};

export type LayoutEdge = {
  routing: "orthogonal";
  points: [number, number][];
};

export type Layout = {
  blocks: Record<string, LayoutBlock>;
  edges: Record<string, LayoutEdge>;
};

export type ProjectMeta = {
  title: string;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
  author: string;
  description?: string;
};

export type Project = {
  schema_version: "1.0.0";
  meta: ProjectMeta;
  nets: Net[];
  blocks: Block[];
  connections: Connection[];
  layout: Layout;
};

export type ValidationLevel = "info" | "warn" | "error";

export type ValidationResult = {
  id: string;
  level: ValidationLevel;
  message: string;
  targetId?: string;
};
