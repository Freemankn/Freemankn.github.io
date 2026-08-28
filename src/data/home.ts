import { focusItems } from "./focus";
import { featuredProjects } from "./projects";

export type CapabilityId = "research" | "systems" | "teaching";

export interface Capability {
  readonly id: CapabilityId;
  readonly title: string;
  readonly description: string;
  readonly path: "/about" | "/focus" | "/projects";
}

export interface HomeStatistic {
  readonly value: string;
  readonly label: string;
  readonly accessibleLabel: string;
}

export const capabilities = [
  {
    id: "research",
    title: "AI4SE Researcher",
    description: "Designing and evaluating more reliable human–AI software systems.",
    path: "/focus",
  },
  {
    id: "systems",
    title: "Systems Builder",
    description:
      "Building practical tools with thoughtful architecture and interaction design.",
    path: "/projects",
  },
  {
    id: "teaching",
    title: "Technical Educator",
    description:
      "Explaining complex computer science and mathematics concepts clearly.",
    path: "/about",
  },
] as const satisfies readonly Capability[];

export const homeStatistics = [
  {
    value: String(featuredProjects.length),
    label: "Featured projects",
    accessibleLabel: `${featuredProjects.length} featured projects`,
  },
  {
    value: String(focusItems.filter((item) => item.status === "Current focus").length),
    label: "Current focus areas",
    accessibleLabel: `${focusItems.filter((item) => item.status === "Current focus").length} current focus areas`,
  },
  {
    value: "2",
    label: "Teaching roles",
    accessibleLabel: "2 verified teaching roles at Notre Dame",
  },
] as const satisfies readonly HomeStatistic[];
