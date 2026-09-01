export interface AboutSection {
  readonly id: "study" | "thinking" | "beyond";
  readonly title: string;
  readonly paragraphs: readonly string[];
}

export const aboutSections = [
  {
    id: "study",
    title: "What I study",
    paragraphs: [
      "At the University of Notre Dame, I study Computer Science and Applied and Computational Mathematics and Statistics (ACMS).",
      "That combination lets me bring mathematical structure, software engineering, and evidence-driven analysis to the same problem.",
    ],
  },
  {
    id: "thinking",
    title: "How I think",
    paragraphs: [
      "I am an optimistic realist: preserve the ambition of an idea, study its failure modes, and design the controls that make it achievable.",
      "I gravitate toward interactions, dependencies, execution paths, and workflows—the places where hidden behavior must become inspectable.",
    ],
  },
  {
    id: "beyond",
    title: "Beyond engineering",
    paragraphs: [
      "My family is from Togo, with roots in Ghana and the Republic of Congo, and community keeps practical impact close to how I think about technology.",
      "Mathematics tutoring, Calculus huddles, HETA outreach, and Northeast Early College alumni work have taught me to adapt explanations and build durable support.",
    ],
  },
] as const satisfies readonly AboutSection[];
