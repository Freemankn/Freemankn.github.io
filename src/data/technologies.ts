import cIcon from "../../icons/c-icon.png";
import javaIcon from "../../icons/java-icon.png";
import javascriptIcon from "../../icons/js-icon.png";
import matlabIcon from "../../icons/matlab-icon.png";
import pythonIcon from "../../icons/python-icon.png";
import rIcon from "../../icons/R-icon.png";
import typescriptIcon from "../../icons/ts-icon3.png";

export type TechnologyId =
  | "python"
  | "java"
  | "c"
  | "javascript"
  | "typescript"
  | "r"
  | "matlab";

export interface OrbitTechnology {
  readonly id: TechnologyId;
  readonly name: string;
  readonly icon: string;
  readonly category: "Programming language";
  readonly usage: string;
  readonly relatedProjects: readonly string[];
  readonly relatedTechnologies: readonly string[];
  readonly ring: "inner" | "outer";
}

export interface TechnologyGroup {
  readonly title: string;
  readonly technologies: readonly string[];
}

export const orbitTechnologies = [
  {
    id: "python",
    name: "Python",
    icon: pythonIcon,
    category: "Programming language",
    usage:
      "Used for repository analysis, execution tracing, and interactive learning tools.",
    relatedProjects: ["CodeGraph", "CodeReplay", "Algorithm Visualizer"],
    relatedTechnologies: ["Dependency graphs", "sys.settrace", "Pygame"],
    ring: "inner",
  },
  {
    id: "typescript",
    name: "TypeScript",
    icon: typescriptIcon,
    category: "Programming language",
    usage: "Used to build typed, interactive productivity and portfolio interfaces.",
    relatedProjects: ["FlowBoard", "Pomodoro Timer"],
    relatedTechnologies: ["React", "HTML", "CSS"],
    ring: "inner",
  },
  {
    id: "java",
    name: "Java",
    icon: javaIcon,
    category: "Programming language",
    usage: "Used for object-oriented application design and task-management workflows.",
    relatedProjects: ["Task Manager"],
    relatedTechnologies: ["Object-oriented design"],
    ring: "inner",
  },
  {
    id: "c",
    name: "C",
    icon: cIcon,
    category: "Programming language",
    usage: "Used in systems-programming coursework and low-level computing foundations.",
    relatedProjects: [],
    relatedTechnologies: ["Systems programming"],
    ring: "outer",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: javascriptIcon,
    category: "Programming language",
    usage: "Used for web-development foundations and interactive application work.",
    relatedProjects: [],
    relatedTechnologies: ["HTML", "CSS"],
    ring: "outer",
  },
  {
    id: "r",
    name: "R",
    icon: rIcon,
    category: "Programming language",
    usage: "Used for statistical computing and applied mathematics coursework.",
    relatedProjects: [],
    relatedTechnologies: ["Statistical methods"],
    ring: "outer",
  },
  {
    id: "matlab",
    name: "MATLAB",
    icon: matlabIcon,
    category: "Programming language",
    usage: "Used for numerical and scientific-computing coursework.",
    relatedProjects: [],
    relatedTechnologies: ["Scientific programming"],
    ring: "outer",
  },
] as const satisfies readonly OrbitTechnology[];

export const technologyGroups = [
  {
    title: "Languages",
    technologies: orbitTechnologies.map((technology) => technology.name),
  },
  {
    title: "Frontend",
    technologies: ["React", "HTML5", "CSS", "Figma"],
  },
  {
    title: "Architecture & data",
    technologies: ["Dependency graphs", "Software metrics", "R", "MATLAB"],
  },
  {
    title: "APIs & libraries",
    technologies: ["OpenAI API", "Pygame", "sys.settrace"],
  },
] as const satisfies readonly TechnologyGroup[];
