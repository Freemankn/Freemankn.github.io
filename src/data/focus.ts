export type FocusId =
  | "controlled-dialogue-systems"
  | "codegraph"
  | "flowboard";

export type FocusIcon = "dialogue" | "graph" | "flow";

export interface FocusItem {
  readonly id: FocusId;
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly icon: FocusIcon;
}

export const focusItems = [
  {
    id: "controlled-dialogue-systems",
    title: "Controlled Dialogue Systems",
    category: "Human–AI systems",
    description:
      "Designing structured interaction and evaluation systems that make coding assistants more reliable.",
    icon: "dialogue",
  },
  {
    id: "codegraph",
    title: "CodeGraph",
    category: "Software architecture research",
    description:
      "Using dependency graphs and software metrics to identify architectural structure and risk in Python repositories.",
    icon: "graph",
  },
  {
    id: "flowboard",
    title: "FlowBoard",
    category: "Productivity systems",
    description:
      "Designing productivity systems that reduce the gap between intention and action.",
    icon: "flow",
  },
] as const satisfies readonly FocusItem[];
