export type PrimaryRoute =
  | "/"
  | "/about"
  | "/focus"
  | "/skills"
  | "/projects"
  | "/journey"
  | "/contact";

export interface RouteMetadata {
  readonly title: string;
  readonly description: string;
}

export const routeMetadata = {
  "/": {
    title: "Freeman Nkouka | AI4SE Researcher & Software Engineer",
    description:
      "Freeman Nkouka is an AI for Software Engineering researcher and software engineer building reliable human-AI systems, software architecture tools, and interactive developer experiences.",
  },
  "/about": {
    title: "About | Freeman Nkouka",
    description:
      "Meet Freeman Nkouka: a Notre Dame Computer Science and ACMS student, technical educator, community builder, and optimistic-realist systems thinker.",
  },
  "/focus": {
    title: "Research Focus | Freeman Nkouka",
    description:
      "Explore Freeman Nkouka's current AI4SE research, human-AI collaboration, software architecture work, and active developer-tool directions.",
  },
  "/skills": {
    title: "Skills | Freeman Nkouka",
    description:
      "Explore the programming languages, frameworks, libraries, and tools Freeman Nkouka uses across research, coursework, and software projects.",
  },
  "/projects": {
    title: "Projects | Freeman Nkouka",
    description:
      "Explore Freeman Nkouka's research systems, developer tools, productivity software, and interactive engineering projects.",
  },
  "/journey": {
    title: "Journey | Freeman Nkouka",
    description:
      "Explore Freeman Nkouka's academic, research, teaching, industry, and community milestones through an interactive constellation map.",
  },
  "/contact": {
    title: "Contact | Freeman Nkouka",
    description:
      "Contact Freeman Nkouka about AI4SE research, software engineering, developer tools, and thoughtful technical collaboration.",
  },
} as const satisfies Record<PrimaryRoute, RouteMetadata>;
