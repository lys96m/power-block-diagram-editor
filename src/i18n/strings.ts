export type SupportedLanguage = "en";

type ValidationStrings = {
  heading: string;
  noIssues: string;
  errors: string;
  warnings: string;
  info: string;
  uncertainLoads: string;
  nets: string;
  unassignedEdges: string;
  orphanNets: string;
  target: string;
  copied: string;
};

type StatusStrings = {
  ready: string;
  nets: string;
  errors: string;
  warnings: string;
  unassignedEdges: string;
  orphanNets: string;
  uncertainLoads: string;
};

type HeaderStrings = {
  title: string;
  new: string;
  open: string;
  save: string;
  export: string;
  undo: string;
  redo: string;
  undoTooltip: string;
  redoTooltip: string;
};

type AppStrings = {
  paletteTitle: string;
  propertiesTitle: string;
  add: string;
};

type PropertiesStrings = {
  nothingSelected: string;
  deleteSelected: string;
};

type NodeStrings = {
  nodeLabelPrefix: string;
  label: string;
  category: string;
  input: string;
  output: string;
  efficiency: string;
  fields: {
    V_max: string;
    I_max: string;
    phase: string;
    V_in: string;
    I_in: string;
    P_in: string;
    P_in_max: string;
    P_out_max: string;
    I_in_max: string;
    V_out: string;
    I_out_max: string;
    phase_in: string;
    phase_out: string;
    eta: string;
  };
};

type EdgeStrings = {
  edgeLabelPrefix: string;
  net: string;
  unassigned: string;
  netName: string;
  voltage: string;
  tolerance: string;
  phase: string;
  kind: string;
  addNet: string;
  deleteNet: (inUseCount: number) => string;
};

type NetManagerStrings = {
  title: string;
  selectNet: string;
  nameLabel: string;
  add: string;
  undo: string;
  redo: string;
  noNet: string;
};

type ProjectDialogStrings = {
  openTitle: string;
  saveTitle: string;
  exportTitle: string;
  openHint: string;
  copyHint: string;
  exportInfo: string;
  close: string;
  load: string;
  copy: string;
};

export type Strings = {
  validation: ValidationStrings;
  status: StatusStrings;
  header: HeaderStrings;
  app: AppStrings;
  properties: PropertiesStrings;
  node: NodeStrings;
  edge: EdgeStrings;
  netManager: NetManagerStrings;
  projectDialog: ProjectDialogStrings;
};

const en: Strings = {
  validation: {
    heading: "Validation",
    noIssues: "No validation issues.",
    errors: "Errors",
    warnings: "Warnings",
    info: "Info",
    uncertainLoads: "Uncertain loads",
    nets: "Nets",
    unassignedEdges: "Unassigned edges",
    orphanNets: "Orphan nets",
    target: "Target",
    copied: "copied",
  },
  status: {
    ready: "Status: Ready",
    nets: "Nets",
    errors: "Errors",
    warnings: "Warnings",
    unassignedEdges: "Unassigned edges",
    orphanNets: "Orphan nets",
    uncertainLoads: "Uncertain loads",
  },
  header: {
    title: "Power Block Diagram Editor",
    new: "New",
    open: "Open",
    save: "Save",
    export: "Export",
    undo: "Undo",
    redo: "Redo",
    undoTooltip: "Undo not implemented",
    redoTooltip: "Redo not implemented",
  },
  app: {
    paletteTitle: "Palette",
    propertiesTitle: "Properties",
    add: "Add",
  },
  properties: {
    nothingSelected: "Nothing selected",
    deleteSelected: "Delete Selected",
  },
  node: {
    nodeLabelPrefix: "Node:",
    label: "Label",
    category: "Category",
    input: "Input",
    output: "Output",
    efficiency: "Efficiency",
    fields: {
      V_max: "V_max (V)",
      I_max: "I_max (A)",
      phase: "Phase",
      V_in: "V_in (V)",
      I_in: "I_in (A)",
      P_in: "P_in (W)",
      P_in_max: "P_in_max (W)",
      P_out_max: "P_out_max (W)",
      I_in_max: "I_in_max (A)",
      V_out: "V_out (V)",
      I_out_max: "I_out_max (A)",
      phase_in: "Phase_in",
      phase_out: "Phase_out",
      eta: "eta (0-1)",
    },
  },
  edge: {
    edgeLabelPrefix: "Edge:",
    net: "Net",
    unassigned: "Unassigned",
    netName: "Net Name",
    voltage: "Voltage (V)",
    tolerance: "Tolerance (%)",
    phase: "Phase",
    kind: "Kind",
    addNet: "Add Net",
    deleteNet: (inUseCount: number) =>
      inUseCount > 0 ? `Delete Net (in use: ${inUseCount})` : "Delete Net",
  },
  netManager: {
    title: "Nets",
    selectNet: "Select Net",
    nameLabel: "Name",
    add: "Add",
    undo: "Undo",
    redo: "Redo",
    noNet: "No net selected.",
  },
  projectDialog: {
    openTitle: "Open project (JSON)",
    saveTitle: "Save project (JSON copy)",
    exportTitle: "Export project (JSON copy)",
    openHint: "Paste project.json and press Load.",
    copyHint: "Copy JSON to save it (download not implemented yet).",
    exportInfo: "Export (JSON copy) only. Download will be implemented later.",
    close: "Close",
    load: "Load",
    copy: "Copy JSON",
  },
};

export const defaultLanguage: SupportedLanguage = "en";

export const strings: Record<SupportedLanguage, Strings> = {
  en,
};

export const getStrings = (lang: SupportedLanguage = defaultLanguage): Strings => strings[lang];
