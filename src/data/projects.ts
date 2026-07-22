import algorithmVisualizerVideo from "../../videos/Algorithm_Visualizer.mp4";
import pomodoroTimerVideo from "../../videos/PomodoroTimer.mp4";
import taskManagerVideo from "../../videos/Task_Manager_Backend.mp4";

export type ProjectId =
  | "codegraph"
  | "controlled-dialogue-simulator"
  | "flowboard"
  | "codereplay"
  | "algorithm-visualizer"
  | "task-manager"
  | "pomodoro-timer";

export type ProjectCategory =
  | "Software architecture research"
  | "Human–AI systems"
  | "Productivity systems"
  | "Developer tools"
  | "AI-assisted learning"
  | "Task management";

export type ProjectStatus = "Current focus" | "Exploration" | "Archive";

export interface ProjectVideo {
  readonly kind: "video";
  readonly src: string;
  readonly label: string;
}

export interface ProjectImage {
  readonly kind: "image";
  readonly src: string;
  readonly alt: string;
}

export type ProjectMedia = ProjectVideo | ProjectImage;

export interface Project {
  readonly id: ProjectId;
  readonly title: string;
  readonly category: ProjectCategory;
  readonly problem: string;
  readonly description: string;
  readonly contribution: string;
  readonly technologies: readonly string[];
  readonly repositoryUrl?: string;
  readonly demoUrl?: string;
  readonly media?: ProjectMedia;
  readonly featured: boolean;
  readonly status: ProjectStatus;
}

export const projects = [
  {
    id: "codegraph",
    title: "CodeGraph",
    category: "Software architecture research",
    problem:
      "Architectural structure and risk can be difficult to identify in Python repositories.",
    description:
      "Uses dependency graphs and software metrics to surface architectural structure and risk in Python repositories.",
    contribution:
      "Researching dependency-graph and software-metric approaches for repository analysis.",
    technologies: ["Python", "Dependency graphs", "Software metrics"],
    repositoryUrl:
      "https://github.com/Freemankn/software-architecture-research",
    featured: true,
    status: "Current focus",
  },
  {
    id: "controlled-dialogue-simulator",
    title: "Controlled Dialogue Simulator",
    category: "Human–AI systems",
    problem:
      "Coding assistants need structured interaction and evaluation controls to behave more reliably.",
    description:
      "A research system for designing structured interaction and evaluation around coding assistants.",
    contribution:
      "Designing the interaction structure and evaluation controls that support more reliable coding-assistant behavior.",
    technologies: ["AI evaluation", "Structured interaction"],
    // TODO: Add a repository URL when a public, verified URL is available.
    featured: true,
    status: "Current focus",
  },
  {
    id: "flowboard",
    title: "FlowBoard",
    category: "Productivity systems",
    problem:
      "Productivity tools often leave a gap between deciding what matters and taking focused action.",
    description:
      "A task and focus system designed to reduce the gap between intention and action.",
    contribution:
      "Designing and building the React and TypeScript task-management and focus experience.",
    technologies: ["React", "TypeScript"],
    repositoryUrl: "https://github.com/Freemankn/FlowBoard",
    featured: true,
    status: "Current focus",
  },
  {
    id: "codereplay",
    title: "CodeReplay",
    category: "Developer tools",
    problem:
      "A completed Python run does not by itself show how execution moved through the program.",
    description:
      "An early developer-tool exploration of using sys.settrace to turn Python execution events into a replayable timeline.",
    contribution:
      "Documenting the trace model and defining how calls, lines, locals, returns, and exceptions could become a visual replay.",
    technologies: ["Python", "sys.settrace"],
    repositoryUrl: "https://github.com/Freemankn/CodeReplay",
    featured: true,
    status: "Exploration",
  },
  {
    id: "algorithm-visualizer",
    title: "Algorithm Visualizer",
    category: "AI-assisted learning",
    problem:
      "Algorithm implementation is easier to study when execution is paired with visual and explanatory feedback.",
    description:
      "An algorithm visualizer built with ChatGPT during a Generative AI course to explore AI-assisted implementation, debugging, and on-demand explanation.",
    contribution:
      "Built the Python visualizer while using GPT-4o and o3-mini-high as development partners for code generation and real-time debugging.",
    technologies: ["Python", "OpenAI API", "Pygame"],
    repositoryUrl:
      "https://github.com/Freemankn/AI_Algorithm_Visualizer",
    media: {
      kind: "video",
      src: algorithmVisualizerVideo,
      label: "Algorithm Visualizer demonstration",
    },
    featured: false,
    status: "Archive",
  },
  {
    id: "task-manager",
    title: "Task Manager (Backend)",
    category: "Task management",
    problem:
      "A task workflow needs structured creation, assignment, editing, filtering, and role-aware views.",
    description:
      "A Java command-line task manager with task creation, editing, assignment, and filters for status, due date, and user role.",
    contribution:
      "Designed the object-oriented task and user workflows as a backend foundation for a future frontend.",
    technologies: ["Java"],
    repositoryUrl: "https://github.com/Freemankn/TaskManager",
    media: {
      kind: "video",
      src: taskManagerVideo,
      label: "Task Manager backend demonstration",
    },
    featured: false,
    status: "Archive",
  },
  {
    id: "pomodoro-timer",
    title: "Pomodoro Timer",
    category: "Productivity systems",
    problem:
      "Maintaining concentration and managing time benefit from lightweight, structured work intervals.",
    description:
      "A lightweight productivity tool using 25-minute focus sessions followed by short breaks.",
    contribution:
      "Designed and built the timer interface with HTML, CSS, TypeScript, and Figma.",
    technologies: ["HTML", "CSS", "TypeScript", "Figma"],
    repositoryUrl: "https://github.com/Freemankn/PomodoroTimer",
    media: {
      kind: "video",
      src: pomodoroTimerVideo,
      label: "Pomodoro Timer demonstration",
    },
    featured: false,
    status: "Archive",
  },
] as const satisfies readonly Project[];

export const featuredProjects = projects.filter((project) => project.featured);

export const archivedProjects = projects.filter((project) => !project.featured);
