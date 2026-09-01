import cIcon from "../../icons/c-icon.png";
import cssIcon from "../../icons/css-icon.png";
import htmlIcon from "../../icons/html5-icon.png";
import javaIcon from "../../icons/java-icon.png";
import javascriptIcon from "../../icons/js-icon.png";
import openAiIcon from "../../icons/OpenAI-icon.png";
import pythonIcon from "../../icons/python-icon.png";
import typescriptIcon from "../../icons/ts-icon3.png";
import skillIconSprite from "../assets/skill-icons/technology-icons.svg";

export type SkillCategory =
  | "languages"
  | "software-engineering"
  | "ai-data"
  | "backend-databases"
  | "frontend-mobile";

export type SkillId =
  | "python"
  | "java"
  | "c"
  | "cpp"
  | "typescript"
  | "javascript"
  | "kotlin"
  | "bash"
  | "pytest"
  | "git"
  | "github"
  | "linux-unix"
  | "docker"
  | "rest-apis"
  | "openai-api"
  | "networkx"
  | "numpy"
  | "pandas"
  | "scikit-learn"
  | "django"
  | "sqlite"
  | "firebase-firestore"
  | "firebase-authentication"
  | "roomdb"
  | "react"
  | "html"
  | "css"
  | "bootstrap"
  | "kotlin-android";

export type SkillIcon =
  | { readonly kind: "asset"; readonly src: string }
  | { readonly kind: "sprite"; readonly id: string };

export interface SkillNode {
  readonly id: SkillId;
  readonly name: string;
  readonly shortLabel: string;
  readonly icon: SkillIcon;
  readonly category: SkillCategory;
  readonly shortContext: string;
  readonly relatedSkillIds: readonly SkillId[];
  readonly x: number;
  readonly y: number;
  readonly mobileX: number;
  readonly mobileY: number;
  readonly orbitX: number;
  readonly orbitY: number;
  readonly orbitSpeed: number;
  readonly phase: number;
}

export interface SkillConstellation {
  readonly id: SkillCategory;
  readonly title: string;
  readonly shortTitle: string;
  readonly centerX: number;
  readonly centerY: number;
  readonly mobileCenterX: number;
  readonly mobileCenterY: number;
  readonly driftSpeed: number;
  readonly driftX: number;
  readonly driftY: number;
  readonly nodes: readonly SkillNode[];
}

const asset = (src: string): SkillIcon => ({ kind: "asset", src });
const sprite = (id: string): SkillIcon => ({ kind: "sprite", id });

export const skillIconSpriteUrl = skillIconSprite;

export const skillConstellations: readonly SkillConstellation[] = [
  {
    id: "languages",
    title: "Languages",
    shortTitle: "Languages",
    centerX: 600,
    centerY: 155,
    mobileCenterX: 210,
    mobileCenterY: 180,
    driftSpeed: 0.12,
    driftX: 10,
    driftY: 7,
    nodes: [
      { id: "python", name: "Python", shortLabel: "Python", icon: asset(pythonIcon), category: "languages", shortContext: "Primary language for research tooling, program analysis, data work, and AI systems.", relatedSkillIds: ["pytest", "openai-api", "networkx", "numpy", "django"], x: -214, y: -16, mobileX: -120, mobileY: -66, orbitX: 7, orbitY: 4, orbitSpeed: 0.19, phase: 0.2 },
      { id: "java", name: "Java", shortLabel: "Java", icon: asset(javaIcon), category: "languages", shortContext: "Used for object-oriented application design and software engineering foundations.", relatedSkillIds: ["kotlin"], x: -154, y: 70, mobileX: -42, mobileY: -82, orbitX: 5, orbitY: 7, orbitSpeed: 0.15, phase: 1.1 },
      { id: "c", name: "C", shortLabel: "C", icon: asset(cIcon), category: "languages", shortContext: "Used for systems programming and low-level computing foundations.", relatedSkillIds: ["cpp"], x: -86, y: -65, mobileX: 46, mobileY: -72, orbitX: 6, orbitY: 4, orbitSpeed: 0.22, phase: 2.2 },
      { id: "cpp", name: "C++", shortLabel: "C++", icon: sprite("cpp"), category: "languages", shortContext: "Used for performance-aware programming and systems-oriented problem solving.", relatedSkillIds: [], x: -15, y: 52, mobileX: 120, mobileY: -22, orbitX: 8, orbitY: 5, orbitSpeed: 0.17, phase: 0.8 },
      { id: "typescript", name: "TypeScript", shortLabel: "TypeScript", icon: asset(typescriptIcon), category: "languages", shortContext: "Used to build typed interactive systems with explicit state and behavior.", relatedSkillIds: ["react"], x: 67, y: -63, mobileX: 102, mobileY: 63, orbitX: 5, orbitY: 8, orbitSpeed: 0.14, phase: 2.8 },
      { id: "javascript", name: "JavaScript", shortLabel: "JavaScript", icon: asset(javascriptIcon), category: "languages", shortContext: "Used for browser behavior, web foundations, and interactive applications.", relatedSkillIds: ["typescript", "html"], x: 148, y: 52, mobileX: 18, mobileY: 86, orbitX: 7, orbitY: 5, orbitSpeed: 0.2, phase: 1.7 },
      { id: "kotlin", name: "Kotlin", shortLabel: "Kotlin", icon: sprite("kotlin"), category: "languages", shortContext: "Used for modern Android application development and typed mobile systems.", relatedSkillIds: ["kotlin-android", "firebase-authentication"], x: 220, y: -25, mobileX: -74, mobileY: 75, orbitX: 6, orbitY: 6, orbitSpeed: 0.16, phase: 3.6 },
      { id: "bash", name: "Bash", shortLabel: "Bash", icon: sprite("bash"), category: "languages", shortContext: "Used for shell automation, repeatable development workflows, and command-line tooling.", relatedSkillIds: ["linux-unix"], x: 4, y: -92, mobileX: -128, mobileY: 18, orbitX: 8, orbitY: 4, orbitSpeed: 0.13, phase: 4.2 },
    ],
  },
  {
    id: "software-engineering",
    title: "Software Engineering & Testing",
    shortTitle: "Software Engineering",
    centerX: 264,
    centerY: 365,
    mobileCenterX: 210,
    mobileCenterY: 180,
    driftSpeed: 0.09,
    driftX: 8,
    driftY: 11,
    nodes: [
      { id: "pytest", name: "pytest", shortLabel: "pytest", icon: sprite("pytest"), category: "software-engineering", shortContext: "Used for focused Python testing, contracts, and regression protection.", relatedSkillIds: [], x: -128, y: -66, mobileX: -104, mobileY: -58, orbitX: 5, orbitY: 7, orbitSpeed: 0.18, phase: 0.5 },
      { id: "git", name: "Git", shortLabel: "Git", icon: sprite("git"), category: "software-engineering", shortContext: "Used for version control, safe iteration, and inspectable change history.", relatedSkillIds: ["github"], x: -38, y: 62, mobileX: -18, mobileY: -82, orbitX: 7, orbitY: 4, orbitSpeed: 0.14, phase: 1.9 },
      { id: "github", name: "GitHub", shortLabel: "GitHub", icon: sprite("github"), category: "software-engineering", shortContext: "Used for repository collaboration, review, and project distribution.", relatedSkillIds: [], x: 50, y: -68, mobileX: 85, mobileY: -54, orbitX: 6, orbitY: 6, orbitSpeed: 0.16, phase: 3.1 },
      { id: "linux-unix", name: "Linux/Unix", shortLabel: "Linux / Unix", icon: sprite("linux"), category: "software-engineering", shortContext: "Primary environment for command-line development and research workflows.", relatedSkillIds: ["docker"], x: 132, y: 28, mobileX: 110, mobileY: 34, orbitX: 7, orbitY: 5, orbitSpeed: 0.12, phase: 4.4 },
      { id: "docker", name: "Docker", shortLabel: "Docker", icon: sprite("docker"), category: "software-engineering", shortContext: "Used to package reproducible development and service environments.", relatedSkillIds: ["django"], x: 52, y: 88, mobileX: 25, mobileY: 88, orbitX: 5, orbitY: 8, orbitSpeed: 0.2, phase: 2.4 },
      { id: "rest-apis", name: "REST APIs", shortLabel: "REST APIs", icon: sprite("rest"), category: "software-engineering", shortContext: "Used to define clear service boundaries and application integrations.", relatedSkillIds: ["react"], x: -116, y: 44, mobileX: -87, mobileY: 63, orbitX: 8, orbitY: 5, orbitSpeed: 0.15, phase: 5.1 },
    ],
  },
  {
    id: "ai-data",
    title: "AI, Data & Program Analysis",
    shortTitle: "AI + Data",
    centerX: 930,
    centerY: 350,
    mobileCenterX: 210,
    mobileCenterY: 180,
    driftSpeed: 0.105,
    driftX: 12,
    driftY: 8,
    nodes: [
      { id: "openai-api", name: "OpenAI API", shortLabel: "OpenAI API", icon: asset(openAiIcon), category: "ai-data", shortContext: "Used to build and evaluate AI-assisted research and software systems.", relatedSkillIds: ["rest-apis"], x: -130, y: -52, mobileX: -104, mobileY: -52, orbitX: 6, orbitY: 5, orbitSpeed: 0.13, phase: 0.9 },
      { id: "networkx", name: "NetworkX", shortLabel: "NetworkX", icon: sprite("networkx"), category: "ai-data", shortContext: "Used to model and inspect repository structure as dependency graphs.", relatedSkillIds: [], x: -42, y: 72, mobileX: -28, mobileY: -86, orbitX: 5, orbitY: 8, orbitSpeed: 0.18, phase: 2.1 },
      { id: "numpy", name: "NumPy", shortLabel: "NumPy", icon: sprite("numpy"), category: "ai-data", shortContext: "Used for numerical arrays, transformations, and quantitative computing.", relatedSkillIds: ["pandas"], x: 45, y: -78, mobileX: 72, mobileY: -55, orbitX: 8, orbitY: 4, orbitSpeed: 0.16, phase: 3.3 },
      { id: "pandas", name: "Pandas", shortLabel: "Pandas", icon: sprite("pandas"), category: "ai-data", shortContext: "Used to structure, analyze, and inspect tabular research data.", relatedSkillIds: ["scikit-learn"], x: 132, y: 12, mobileX: 104, mobileY: 38, orbitX: 7, orbitY: 6, orbitSpeed: 0.14, phase: 4.8 },
      { id: "scikit-learn", name: "Scikit-learn", shortLabel: "Scikit-learn", icon: sprite("sklearn"), category: "ai-data", shortContext: "Used for applied machine-learning experiments and evaluation workflows.", relatedSkillIds: [], x: 22, y: 88, mobileX: -45, mobileY: 84, orbitX: 6, orbitY: 7, orbitSpeed: 0.19, phase: 5.5 },
    ],
  },
  {
    id: "frontend-mobile",
    title: "Frontend & Mobile",
    shortTitle: "Frontend + Mobile",
    centerX: 370,
    centerY: 585,
    mobileCenterX: 210,
    mobileCenterY: 180,
    driftSpeed: 0.115,
    driftX: 9,
    driftY: 6,
    nodes: [
      { id: "react", name: "React", shortLabel: "React", icon: sprite("react"), category: "frontend-mobile", shortContext: "Used to build stateful, accessible, and component-driven interfaces.", relatedSkillIds: ["html"], x: -138, y: -48, mobileX: -105, mobileY: -52, orbitX: 6, orbitY: 6, orbitSpeed: 0.15, phase: 0.4 },
      { id: "html", name: "HTML", shortLabel: "HTML", icon: asset(htmlIcon), category: "frontend-mobile", shortContext: "Used to give web experiences semantic and accessible structure.", relatedSkillIds: ["css"], x: -46, y: 72, mobileX: -24, mobileY: -86, orbitX: 5, orbitY: 7, orbitSpeed: 0.18, phase: 1.6 },
      { id: "css", name: "CSS", shortLabel: "CSS", icon: asset(cssIcon), category: "frontend-mobile", shortContext: "Used for responsive systems, visual hierarchy, and interaction feedback.", relatedSkillIds: ["bootstrap"], x: 40, y: -72, mobileX: 75, mobileY: -52, orbitX: 8, orbitY: 4, orbitSpeed: 0.13, phase: 2.7 },
      { id: "bootstrap", name: "Bootstrap", shortLabel: "Bootstrap", icon: sprite("bootstrap"), category: "frontend-mobile", shortContext: "Used for responsive layout foundations and familiar interface patterns.", relatedSkillIds: [], x: 134, y: 30, mobileX: 103, mobileY: 45, orbitX: 6, orbitY: 8, orbitSpeed: 0.17, phase: 4.1 },
      { id: "kotlin-android", name: "Kotlin/Android", shortLabel: "Android", icon: sprite("android"), category: "frontend-mobile", shortContext: "Used to build native Android experiences with Kotlin.", relatedSkillIds: ["roomdb", "firebase-firestore"], x: 12, y: 92, mobileX: -55, mobileY: 82, orbitX: 7, orbitY: 5, orbitSpeed: 0.2, phase: 5.3 },
    ],
  },
  {
    id: "backend-databases",
    title: "Backend & Databases",
    shortTitle: "Backend + Databases",
    centerX: 830,
    centerY: 585,
    mobileCenterX: 210,
    mobileCenterY: 180,
    driftSpeed: 0.085,
    driftX: 7,
    driftY: 10,
    nodes: [
      { id: "django", name: "Django", shortLabel: "Django", icon: sprite("django"), category: "backend-databases", shortContext: "Used to build structured Python backends and web services.", relatedSkillIds: ["rest-apis", "sqlite"], x: -140, y: -50, mobileX: -105, mobileY: -50, orbitX: 5, orbitY: 8, orbitSpeed: 0.16, phase: 0.7 },
      { id: "sqlite", name: "SQLite", shortLabel: "SQLite", icon: sprite("sqlite"), category: "backend-databases", shortContext: "Used for compact relational persistence and local application data.", relatedSkillIds: [], x: -48, y: 75, mobileX: -26, mobileY: -85, orbitX: 7, orbitY: 4, orbitSpeed: 0.13, phase: 1.8 },
      { id: "firebase-firestore", name: "Firebase Firestore", shortLabel: "Firestore", icon: sprite("firebase"), category: "backend-databases", shortContext: "Used for cloud-hosted document data in connected applications.", relatedSkillIds: [], x: 48, y: -74, mobileX: 76, mobileY: -52, orbitX: 6, orbitY: 6, orbitSpeed: 0.18, phase: 3.2 },
      { id: "firebase-authentication", name: "Firebase Authentication", shortLabel: "Firebase Auth", icon: sprite("firebase"), category: "backend-databases", shortContext: "Used to manage application identity and authenticated access.", relatedSkillIds: ["firebase-firestore"], x: 142, y: 24, mobileX: 104, mobileY: 45, orbitX: 8, orbitY: 5, orbitSpeed: 0.14, phase: 4.6 },
      { id: "roomdb", name: "RoomDB", shortLabel: "RoomDB", icon: sprite("roomdb"), category: "backend-databases", shortContext: "Used for structured local persistence in Android applications.", relatedSkillIds: [], x: 18, y: 92, mobileX: -56, mobileY: 82, orbitX: 5, orbitY: 7, orbitSpeed: 0.19, phase: 5.7 },
    ],
  },
];

export const skillNodes = skillConstellations.flatMap((constellation) => constellation.nodes);

export const skillNodeById = new Map<SkillId, SkillNode>(
  skillNodes.map((node) => [node.id, node]),
);

export const skillCategoryById = new Map<SkillCategory, SkillConstellation>(
  skillConstellations.map((constellation) => [constellation.id, constellation]),
);

export const skillRelationships = skillNodes.flatMap((node) =>
  node.relatedSkillIds.map((relatedId) => ({
    id: [node.id, relatedId].sort().join("--"),
    source: node.id,
    target: relatedId,
  })),
);

export function getRelatedSkillIds(id: SkillId): readonly SkillId[] {
  return skillRelationships.flatMap((relationship) => {
    if (relationship.source === id) return [relationship.target];
    if (relationship.target === id) return [relationship.source];
    return [];
  });
}
