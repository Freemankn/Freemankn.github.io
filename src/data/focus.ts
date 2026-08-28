export type FocusId =
  | "controlled-dialogue-systems"
  | "codegraph"
  | "human-ai-collaboration"
  | "flowboard"
  | "codereplay";

export type FocusIcon = "dialogue" | "graph" | "collaboration" | "flow" | "replay";

export type FocusStatus = "Current focus" | "Exploration";

export interface AssociatedProject {
  readonly title: string;
  readonly path: string;
}

export interface FocusItem {
  readonly id: FocusId;
  readonly title: string;
  readonly category: string;
  readonly problem: string;
  readonly whyItMatters: string;
  readonly currentApproach: string;
  readonly icon: FocusIcon;
  readonly status: FocusStatus;
  readonly associatedProject: AssociatedProject;
}

export const focusItems = [
  {
    id: "controlled-dialogue-systems",
    title: "Controlled Dialogue",
    category: "Interaction controls",
    problem:
      "Coding assistants need structured interaction and evaluation controls to behave more reliably.",
    whyItMatters:
      "Ambitious assistants become useful engineering partners only when their behavior can be inspected, evaluated, and corrected.",
    currentApproach:
      "Designing explicit dialogue structure and evaluation controls around coding-assistant work.",
    icon: "dialogue",
    status: "Current focus",
    associatedProject: {
      title: "Controlled Dialogue Simulator",
      path: "/projects#project-controlled-dialogue-simulator",
    },
  },
  {
    id: "codegraph",
    title: "CodeGraph",
    category: "Architecture signals",
    problem:
      "Architectural structure and risk can be difficult to identify in Python repositories.",
    whyItMatters:
      "Developers need inspectable signals that help them reason about coupling, structure, and where architectural attention is most useful.",
    currentApproach:
      "Modeling repositories as dependency graphs and pairing graph structure with software metrics.",
    icon: "graph",
    status: "Current focus",
    associatedProject: {
      title: "CodeGraph",
      path: "/projects#project-codegraph",
    },
  },
  {
    id: "human-ai-collaboration",
    title: "Human–AI Collaboration",
    category: "Research question",
    problem:
      "Powerful AI behavior is not enough when people cannot understand, steer, or evaluate how the work is being done.",
    whyItMatters:
      "Reliable collaboration depends on preserving human judgment while making the system's state and decisions legible.",
    currentApproach:
      "Studying interaction structures that combine AI capability with clear human control and evidence-backed evaluation.",
    icon: "collaboration",
    status: "Current focus",
    associatedProject: {
      title: "Controlled Dialogue Simulator",
      path: "/projects#project-controlled-dialogue-simulator",
    },
  },
  {
    id: "flowboard",
    title: "FlowBoard",
    category: "Intention into action",
    problem:
      "Productivity tools often leave a gap between deciding what matters and taking focused action.",
    whyItMatters:
      "A useful planning system should reduce friction between choosing a task, scheduling it, and doing the work.",
    currentApproach:
      "Building a typed React and TypeScript task-and-focus experience around a coherent workflow.",
    icon: "flow",
    status: "Current focus",
    associatedProject: {
      title: "FlowBoard",
      path: "/projects#project-flowboard",
    },
  },
  {
    id: "codereplay",
    title: "CodeReplay",
    category: "Execution understanding",
    problem:
      "A completed Python run does not show how execution moved through the program.",
    whyItMatters:
      "A replayable history can make program behavior easier to inspect, explain, and debug.",
    currentApproach:
      "Exploring how sys.settrace events can become a timeline of calls, lines, locals, returns, and exceptions.",
    icon: "replay",
    status: "Exploration",
    associatedProject: {
      title: "CodeReplay",
      path: "/projects#project-codereplay",
    },
  },
] as const satisfies readonly FocusItem[];
