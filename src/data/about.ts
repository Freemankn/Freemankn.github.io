export type AboutPillarId = "notre-dame" | "heritage" | "teaching" | "systems";

export interface AboutPillar {
  readonly id: AboutPillarId;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
}

export const aboutIntroduction = [
  "I am Freeman Nkouka, an AI for Software Engineering researcher, software engineer, and systems builder based in Denver. I am interested in how people and AI can build software more reliably—and in turning that question into systems that can be inspected and tested.",
  "At the University of Notre Dame, I study Computer Science and Applied and Computational Mathematics and Statistics (ACMS). That combination lets me bring the structure of mathematics and the creativity of programming to the same problem.",
] as const;

export const aboutPillars = [
  {
    id: "notre-dame",
    eyebrow: "Academic foundation",
    title: "Computer science meets applied mathematics.",
    body:
      "My Notre Dame work spans programming, systems, statistics, and scientific computing. I value the different questions each discipline teaches me to ask about a system.",
  },
  {
    id: "heritage",
    eyebrow: "Heritage & community",
    title: "Grounded in Denver and connected across communities.",
    body:
      "My family is from Togo, and I also have roots in Ghana and the Republic of Congo (Congo-Brazzaville). Community work with HETA and Northeast Early College Alumni keeps practical impact close to how I think about technology.",
  },
  {
    id: "teaching",
    eyebrow: "Teaching & communication",
    title: "Understanding grows when an explanation meets the learner.",
    body:
      "Through mathematics tutoring and a Calculus I huddle at Notre Dame, I have practiced adapting explanations, asking better questions, and helping students build durable intuition.",
  },
  {
    id: "systems",
    eyebrow: "Systems mindset",
    title: "Make hidden behavior easier to reason about.",
    body:
      "I gravitate toward interactions, dependencies, execution paths, and workflows—the places where a promising system becomes difficult to understand unless its structure is made visible.",
  },
] as const satisfies readonly AboutPillar[];

export const optimisticRealism =
  "I preserve the ambition of an idea, study its failure modes, and design the controls that make it achievable.";

export const aboutDirection =
  "I want to build ambitious human–AI and developer systems that earn trust through clear structure, observable behavior, and thoughtful interaction design.";
