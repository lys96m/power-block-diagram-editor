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

export type Strings = {
  validation: ValidationStrings;
  status: StatusStrings;
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
};

export const defaultLanguage: SupportedLanguage = "en";

export const strings: Record<SupportedLanguage, Strings> = {
  en,
};

export const getStrings = (lang: SupportedLanguage = defaultLanguage): Strings => strings[lang];
