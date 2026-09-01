export type JourneyChapterId =
  | "strive"
  | "northeast-early-college"
  | "make-a-chess-move"
  | "heta"
  | "notre-dame"
  | "research"
  | "ai4se";

export type JourneyMilestoneId =
  | "strive-accelerated-entry"
  | "strive-college-algebra"
  | "nec-salutatorian"
  | "nec-5280-challenge"
  | "nec-computer-science"
  | "nec-alumni"
  | "macm-unreal-engine"
  | "macm-multiplayer-systems"
  | "macm-team-development"
  | "macm-google-it"
  | "heta-world-bank"
  | "heta-community-outreach"
  | "heta-stem-outreach"
  | "heta-web-it"
  | "nd-cs-acms"
  | "nd-academic-performance"
  | "nd-deans-list"
  | "nd-computer-architecture-ta"
  | "nd-fundamentals-ta"
  | "nd-math-tutor"
  | "nd-visa"
  | "nd-idea-center"
  | "nd-jjl"
  | "nd-tapia"
  | "research-software-architecture"
  | "research-controlled-dialogue"
  | "ai4se-llm-systems"
  | "ai4se-software-quality";

export type JourneyMilestoneImportance = "prominent" | "detail";

export type JourneyMilestoneCluster =
  | "foundations"
  | "academic-leadership"
  | "game-development"
  | "professional-development"
  | "community-impact"
  | "academics"
  | "teaching"
  | "professional-industry"
  | "research-systems"
  | "research-direction";

export interface JourneyChapter {
  readonly id: JourneyChapterId;
  readonly title: string;
  readonly shortLabel: string;
  readonly subtitle: string;
  readonly date?: string;
  readonly summary: string;
  readonly milestoneIds: readonly JourneyMilestoneId[];
  readonly connectedChapterIds: readonly JourneyChapterId[];
}

export interface JourneyMilestone {
  readonly id: JourneyMilestoneId;
  readonly parentId: JourneyChapterId;
  readonly title: string;
  readonly shortLabel?: string;
  readonly date?: string;
  readonly summary: string;
  readonly importance: JourneyMilestoneImportance;
  readonly cluster: JourneyMilestoneCluster;
}

export const journeyChapters: readonly JourneyChapter[] = [
  {
    id: "strive",
    title: "STRIVE / Early Foundations",
    shortLabel: "STRIVE",
    subtitle: "Early foundations",
    date: "Aug 2019–May 2020",
    summary:
      "An accelerated academic transition established the mathematics foundation for the journey ahead.",
    milestoneIds: ["strive-accelerated-entry", "strive-college-algebra"],
    connectedChapterIds: ["northeast-early-college"],
  },
  {
    id: "northeast-early-college",
    title: "Northeast Early College",
    shortLabel: "NORTHEAST",
    subtitle: "Academic foundation · Computer science · Leadership",
    date: "Aug 2020–May 2023",
    summary:
      "High school became the foundation for formal computer-science study, academic achievement, and continued community leadership.",
    milestoneIds: [
      "nec-salutatorian",
      "nec-5280-challenge",
      "nec-computer-science",
      "nec-alumni",
    ],
    connectedChapterIds: ["strive", "make-a-chess-move"],
  },
  {
    id: "make-a-chess-move",
    title: "Make A Chess Move",
    shortLabel: "MACM",
    subtitle: "Game Design · Summers 2022–2023",
    date: "Summers 2022–2023",
    summary:
      "A two-summer game-design internship expanded from collaborative Unreal Engine development into broader IT foundations.",
    milestoneIds: [
      "macm-unreal-engine",
      "macm-multiplayer-systems",
      "macm-team-development",
      "macm-google-it",
    ],
    connectedChapterIds: ["northeast-early-college", "heta"],
  },
  {
    id: "heta",
    title: "HETA",
    shortLabel: "HETA",
    subtitle: "IT · Community Outreach · 2021–Present",
    date: "June 2021–Present",
    summary:
      "As HETA’s IT & Community Outreach Assistant, technology support and outreach created opportunities to contribute locally and internationally.",
    milestoneIds: [
      "heta-world-bank",
      "heta-community-outreach",
      "heta-stem-outreach",
      "heta-web-it",
    ],
    connectedChapterIds: ["make-a-chess-move", "notre-dame"],
  },
  {
    id: "notre-dame",
    title: "University of Notre Dame",
    shortLabel: "NOTRE DAME",
    subtitle: "Computer Science · ACMS · Teaching · Professional Growth",
    date: "Aug 2023–Expected May 2027",
    summary:
      "Undergraduate study connects rigorous academics with teaching, professional programs, and industry experience.",
    milestoneIds: [
      "nd-cs-acms",
      "nd-academic-performance",
      "nd-deans-list",
      "nd-computer-architecture-ta",
      "nd-fundamentals-ta",
      "nd-math-tutor",
      "nd-visa",
      "nd-idea-center",
      "nd-jjl",
      "nd-tapia",
    ],
    connectedChapterIds: ["heta", "research"],
  },
  {
    id: "research",
    title: "Research",
    shortLabel: "RESEARCH",
    subtitle: "Software architecture · Reliable coding agents",
    date: "2026–Present",
    summary:
      "The journey turns toward research on software structure and reliable human–AI development workflows.",
    milestoneIds: ["research-software-architecture", "research-controlled-dialogue"],
    connectedChapterIds: ["notre-dame", "ai4se"],
  },
  {
    id: "ai4se",
    title: "Current AI4SE Direction",
    shortLabel: "AI4SE",
    subtitle: "Reliable human–AI software systems",
    summary:
      "The current direction focuses on making AI-assisted software development more reliable, secure, and verifiable.",
    milestoneIds: ["ai4se-llm-systems", "ai4se-software-quality"],
    connectedChapterIds: ["research"],
  },
];

export const journeyMilestones: readonly JourneyMilestone[] = [
  {
    id: "strive-accelerated-entry",
    parentId: "strive",
    title: "Accelerated Entry",
    date: "2019",
    summary:
      "Advanced directly from seventh grade at STRIVE Prep Green Valley Ranch to ninth grade at STRIVE Prep RISE.",
    importance: "prominent",
    cluster: "foundations",
  },
  {
    id: "strive-college-algebra",
    parentId: "strive",
    title: "College Algebra",
    date: "2019–2020",
    summary:
      "Qualified through the Accuplacer test to enroll in dual-enrollment College Algebra while in high school.",
    importance: "detail",
    cluster: "foundations",
  },
  {
    id: "nec-salutatorian",
    parentId: "northeast-early-college",
    title: "Salutatorian",
    date: "May 2023",
    summary: "Graduated from Northeast Early College as salutatorian.",
    importance: "prominent",
    cluster: "academic-leadership",
  },
  {
    id: "nec-5280-challenge",
    parentId: "northeast-early-college",
    title: "5280 Challenge — 1st Place",
    shortLabel: "5280 Challenge",
    date: "2022",
    summary:
      "Earned 1st place at the Denver Public Schools 5280 Challenge through a team project focused on Student Voice & Leadership.",
    importance: "prominent",
    cluster: "academic-leadership",
  },
  {
    id: "nec-computer-science",
    parentId: "northeast-early-college",
    title: "Computer Science Foundation",
    shortLabel: "CS Foundation",
    date: "2020–2023",
    summary:
      "Began programming in Python and studied JavaScript, introductory web development, and object-oriented Java.",
    importance: "detail",
    cluster: "academic-leadership",
  },
  {
    id: "nec-alumni",
    parentId: "northeast-early-college",
    title: "NEC Alumni Initiative",
    date: "Dec 2023–Present",
    summary:
      "Founded an alumni initiative centered on academic support, graduate recognition, and continued community engagement.",
    importance: "detail",
    cluster: "academic-leadership",
  },
  {
    id: "macm-unreal-engine",
    parentId: "make-a-chess-move",
    title: "Unreal Engine 5",
    summary: "Built gameplay systems using Unreal Engine 5.",
    importance: "detail",
    cluster: "game-development",
  },
  {
    id: "macm-multiplayer-systems",
    parentId: "make-a-chess-move",
    title: "Multiplayer Systems",
    summary:
      "Implemented grouped multiplayer systems for player health, movement, weapon effects, respawning, and synchronized interface behavior.",
    importance: "prominent",
    cluster: "game-development",
  },
  {
    id: "macm-team-development",
    parentId: "make-a-chess-move",
    title: "Team Development",
    summary: "Developed the multiplayer prototype within a three-person team.",
    importance: "detail",
    cluster: "game-development",
  },
  {
    id: "macm-google-it",
    parentId: "make-a-chess-move",
    title: "Google IT Support Certificate",
    shortLabel: "Google IT Certificate",
    summary:
      "Completed as part of the Make A Chess Move internship through an opportunity provided by Freeman’s internship supervisor.",
    importance: "detail",
    cluster: "professional-development",
  },
  {
    id: "heta-world-bank",
    parentId: "heta",
    title: "World Bank · Fall 2024",
    date: "Fall 2024",
    summary:
      "Contributed to a presentation delivered by HETA’s CFO at the World Bank Fall 2024 Meeting to the Togolese Secretary to the President, supporting advocacy for the implementation of nationwide postal addresses in Africa.",
    importance: "prominent",
    cluster: "community-impact",
  },
  {
    id: "heta-community-outreach",
    parentId: "heta",
    title: "Community Outreach",
    date: "Thanksgiving 2022",
    summary:
      "Organized and donated food and utilities supporting the Colorado Coalition for the Homeless and the Veterans Community Living Center.",
    importance: "prominent",
    cluster: "community-impact",
  },
  {
    id: "heta-stem-outreach",
    parentId: "heta",
    title: "STEM Outreach",
    date: "2023",
    summary:
      "Helped run a STEM outreach booth at the Denver Museum of Nature and Science.",
    importance: "detail",
    cluster: "community-impact",
  },
  {
    id: "heta-web-it",
    parentId: "heta",
    title: "Web & IT Support",
    date: "2021–Present",
    summary: "Updates HETA’s Wix website with organizational content and community events.",
    importance: "detail",
    cluster: "community-impact",
  },
  {
    id: "nd-cs-acms",
    parentId: "notre-dame",
    title: "CS + ACMS",
    date: "Expected May 2027",
    summary:
      "Pursuing a double major: a B.S. in Computer Science and Applied and Computational Mathematics and Statistics.",
    importance: "prominent",
    cluster: "academics",
  },
  {
    id: "nd-academic-performance",
    parentId: "notre-dame",
    title: "Academic Performance",
    shortLabel: "3.79 GPA",
    summary: "3.79 / 4.00 overall GPA · Three 4.00 semesters.",
    importance: "detail",
    cluster: "academics",
  },
  {
    id: "nd-deans-list",
    parentId: "notre-dame",
    title: "Dean’s List ×3",
    summary: "Fall 2024 · Fall 2025 · Spring 2026.",
    importance: "detail",
    cluster: "academics",
  },
  {
    id: "nd-computer-architecture-ta",
    parentId: "notre-dame",
    title: "Computer Architecture TA",
    shortLabel: "Architecture TA",
    date: "Aug 2026–Present",
    summary:
      "Helps students reason about CPU organization and hardware/software interaction, including execution, datapaths, memory, and processor-level concepts.",
    importance: "prominent",
    cluster: "teaching",
  },
  {
    id: "nd-fundamentals-ta",
    parentId: "notre-dame",
    title: "Fundamentals of Computing TA",
    shortLabel: "Fundamentals TA",
    date: "Aug–Dec 2025",
    summary: "Led C programming labs and mentored students in debugging and program execution.",
    importance: "detail",
    cluster: "teaching",
  },
  {
    id: "nd-math-tutor",
    parentId: "notre-dame",
    title: "Math Tutor",
    date: "Sep 2024–Present",
    summary:
      "Tutors students across Precalculus, Calculus I–III, Linear Algebra, and Differential Equations.",
    importance: "detail",
    cluster: "teaching",
  },
  {
    id: "nd-visa",
    parentId: "notre-dame",
    title: "Visa FinTech Foundations",
    shortLabel: "Visa FinTech",
    date: "Sep 2025–Jan 2026",
    summary:
      "Participated in the project-based Visa FinTech Foundations Program, developing a website-risk assessment framework within a four-person team and presenting its traffic-light recommendations to Visa executives.",
    importance: "prominent",
    cluster: "professional-industry",
  },
  {
    id: "nd-idea-center",
    parentId: "notre-dame",
    title: "IDEA Center Innovation Sprint",
    shortLabel: "IDEA Center Sprint",
    date: "Sep–Dec 2025",
    summary:
      "As UX & Frontend Developer, led a five-person agile sprint to deliver a React-based ClickUp extension and a network visualization of task relationships.",
    importance: "prominent",
    cluster: "professional-industry",
  },
  {
    id: "nd-jjl",
    parentId: "notre-dame",
    title: "JJL Network Specialist Internship",
    shortLabel: "JJL Internship",
    date: "Summer 2025",
    summary:
      "Sophomore-summer industry experience conducting shipper outreach and maintaining structured communication records for Jehovah Jireh Logistics.",
    importance: "detail",
    cluster: "professional-industry",
  },
  {
    id: "nd-tapia",
    parentId: "notre-dame",
    title: "2026 Richard Tapia Celebration of Diversity in Computing",
    shortLabel: "Tapia 2026",
    date: "2026",
    summary: "Selected for University of Notre Dame CSE Department sponsorship to attend.",
    importance: "detail",
    cluster: "professional-industry",
  },
  {
    id: "research-software-architecture",
    parentId: "research",
    title: "Software Architecture Research",
    shortLabel: "Architecture Research",
    date: "Jan 2026–Present",
    summary:
      "Built a Python and NetworkX framework that models repositories as dependency graphs and uses graph-theoretic metrics to investigate architectural risk and software quality.",
    importance: "prominent",
    cluster: "research-systems",
  },
  {
    id: "research-controlled-dialogue",
    parentId: "research",
    title: "Controlled Dialogue Systems",
    shortLabel: "Controlled Dialogue",
    date: "May–Aug 2026",
    summary:
      "Worked on reliability mechanisms for LLM coding agents through workflow controls, structured editing, verification, error recovery, and context management.",
    importance: "prominent",
    cluster: "research-systems",
  },
  {
    id: "ai4se-llm-systems",
    parentId: "ai4se",
    title: "Reliable LLM Systems",
    summary:
      "Explores AI for Software Engineering alongside LLM reliability, verification, and secure code generation.",
    importance: "prominent",
    cluster: "research-direction",
  },
  {
    id: "ai4se-software-quality",
    parentId: "ai4se",
    title: "Secure & Reliable Software",
    shortLabel: "Secure Software",
    summary:
      "Connects software security and program analysis with machine learning for software quality and reliability.",
    importance: "detail",
    cluster: "research-direction",
  },
];

export function getJourneyChapter(id: JourneyChapterId) {
  const chapter = journeyChapters.find((candidate) => candidate.id === id);
  if (!chapter) {
    throw new Error(`Missing Journey chapter: ${id}`);
  }
  return chapter;
}

export function getJourneyMilestone(id: JourneyMilestoneId) {
  const milestone = journeyMilestones.find((candidate) => candidate.id === id);
  if (!milestone) {
    throw new Error(`Missing Journey milestone: ${id}`);
  }
  return milestone;
}

export function getChapterMilestones(chapterId: JourneyChapterId) {
  const chapter = getJourneyChapter(chapterId);
  return chapter.milestoneIds.map(getJourneyMilestone);
}
