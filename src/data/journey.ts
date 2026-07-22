export type JourneyId =
  | "jjl"
  | "neca"
  | "notre-dame"
  | "macm"
  | "svl"
  | "heta"
  | "nec"
  | "strive-prep-rise";

export type JourneyCategory =
  | "Notre Dame"
  | "Research"
  | "Teaching"
  | "Industry"
  | "Community"
  | "Early foundations";

export interface JourneyEntry {
  readonly id: JourneyId;
  readonly dateRange: string;
  readonly organization: string;
  readonly role: string;
  readonly categories: readonly JourneyCategory[];
  readonly summary: string;
  readonly details: readonly string[];
}

export const journeyEntries = [
  {
    id: "jjl",
    dateRange: "Summer 2025",
    organization: "Jehovah Jireh Logistics (JJL)",
    role: "Network Specialist Intern",
    categories: ["Industry"],
    summary:
      "Managed shipper outreach and maintained a structured record of communications and follow-up actions.",
    details: [
      "Conducted shipper outreach by phone and email.",
      "Documented communications in Excel as a reference for potential partnerships and follow-up work.",
    ],
  },
  {
    id: "neca",
    dateRange: "Dec 2023–Present",
    organization: "Northeast Early College Alumni",
    role: "Founder",
    categories: ["Community"],
    summary:
      "Built an alumni initiative centered on academic support, graduate recognition, and continued community engagement.",
    details: [
      "Created course study guides to help future students prepare for challenging material.",
      "Recognized the top three graduating seniors in Business, Computer Science, Audio Production, Criminal Justice, and Environmental Science with commemorative gifts.",
      "Attended the 2024 and 2025 graduation ceremonies to support the NEC community and recruit new members.",
    ],
  },
  {
    id: "notre-dame",
    dateRange: "Aug 2023–May 2027",
    organization: "University of Notre Dame",
    role: "Computer Science & ACMS",
    categories: ["Notre Dame", "Teaching"],
    summary:
      "Studies Computer Science and Applied and Computational Mathematics and Statistics while supporting peers through mathematics tutoring.",
    details: [
      "Tutored Pre-Calculus, Calculus I–III and A–B, Linear Algebra, and Differential Equations through the Learning Resource Center.",
      "Served as a Calculus Huddle Leader for seven Calculus I students in weekly Sunday sessions.",
      "Adapted explanations to individual learning styles and encouraged stronger participation and collaboration.",
      "Coursework includes engineering computing, data structures, systems programming, statistical methods, and scientific programming.",
    ],
  },
  {
    id: "macm",
    dateRange: "Summers of 2022–2023",
    organization: "Make A Chess Move (MACM)",
    role: "Game Design Intern",
    categories: ["Industry"],
    summary:
      "Learned Unreal Engine 5 from low-level movement and animation systems through a working multiplayer-shooter prototype.",
    details: [
      "Built a UE5 multiplayer-shooter prototype with custom UI and weapon logic.",
      "Documented the development process in a detailed, tutorial-style Word report.",
      "Earned a Google IT Support Certificate and developed a patient, root-cause-focused support approach.",
    ],
  },
  {
    id: "svl",
    dateRange: "Springs of 2022–2023",
    organization: "Student Voice and Leadership (SVL)",
    role: "Member",
    categories: ["Research", "Community"],
    summary:
      "Led student research on motivation and counselor access and contributed to an award-winning community-safety proposal.",
    details: [
      "Led a 15-person team surveying more than 100 NEC students for the 2023 Annual 5280 Challenge.",
      "Found that fewer than 50% of 9th–11th graders regularly used Remind, compared with 75% of seniors.",
      "Found that 49.2% of surveyed students felt confident relying on counselors for academic and post-graduation guidance.",
      "As part of a 10-person NEC team, earned first place in the 2022 Annual 5280 Challenge for a community-safety proposal addressing sexual-assault prevention.",
      "Coordinated internal deadlines and tracked project progress.",
    ],
  },
  {
    id: "heta",
    dateRange: "June 2021–Present",
    organization: "Health Education To All (HETA)",
    role: "IT Assistant",
    categories: ["Community"],
    summary:
      "Supports HETA through technology, international representation, STEM outreach, and community service.",
    details: [
      "Represented HETA at the 2024 World Bank Group & IMF Annual Meeting.",
      "Reviewed a presentation delivered to the Togolese Secretary to the President advocating for postal addresses across Africa.",
      "Helped run a 2023 STEM outreach booth at the Denver Museum of Nature and Science.",
      "Donated 50 canned goods during HETA's 2022 Showing Love to the Community event.",
      "Updated HETA's Wix website with content and community events.",
    ],
  },
  {
    id: "nec",
    dateRange: "Aug 2020–May 2023",
    organization: "Northeast Early College (NEC)",
    role: "Computer Science Pathway",
    categories: ["Early foundations"],
    summary:
      "Built early programming and mathematics foundations while completing high school as salutatorian.",
    details: [
      "Completed dual-enrollment College Algebra, Trigonometry, Intro to Statistics, and Calculus I–III through Community College of Aurora.",
      "Began programming in Python and studied JavaScript, introductory web development, and object-oriented Java.",
      "Built a Battleship simulator using Merge Sort to track hits and optimize ship targeting.",
      "Scored 4s on both AP Computer Science Principles and AP Computer Science A.",
    ],
  },
  {
    id: "strive-prep-rise",
    dateRange: "Aug 2019–May 2020",
    organization: "Strive Prep Rise High School",
    role: "9th Grade (Accelerated Entry)",
    categories: ["Early foundations"],
    summary:
      "Entered high school two grades early and qualified for dual-enrollment College Algebra.",
    details: [
      "Advanced directly from seventh grade at Strive Prep Green Valley Ranch Middle School to ninth grade.",
      "Qualified through the Accuplacer test to enroll in College Algebra while in high school.",
    ],
  },
] as const satisfies readonly JourneyEntry[];
