import hetaIcon from "../../icons/HETA.png";
import jjlIcon from "../../icons/JJL.png";
import macmIcon from "../../icons/MACM.png";
import ndIcon from "../../icons/ND.png";
import necIcon from "../../icons/NEC.png";
import riseIcon from "../../icons/Rise.png";
import {
  getJourneyChapter,
  getJourneyMilestone,
  journeyChapters,
  type JourneyChapter,
  type JourneyChapterId,
  type JourneyMilestone,
  type JourneyMilestoneCluster,
  type JourneyMilestoneId,
} from "./journey";

export interface JourneyMapPoint {
  readonly x: number;
  readonly y: number;
}

interface JourneyChapterPresentation {
  readonly icon?: string;
  readonly point: JourneyMapPoint;
  readonly prominence: "standard" | "hub" | "destination";
}

interface JourneyMilestonePresentation {
  readonly labelPriority: "primary" | "secondary";
  readonly relativePoint: JourneyMapPoint;
  readonly labelAnchor: "start" | "middle" | "end";
  readonly labelOffset: JourneyMapPoint;
  readonly icon?: string;
}

export interface JourneyMapChapter extends JourneyChapter, JourneyChapterPresentation {
  readonly sequence: number;
}

export interface JourneyMapMilestone extends JourneyMilestone, JourneyMilestonePresentation {
  readonly point: JourneyMapPoint;
}

export interface JourneyMapConnection {
  readonly id: string;
  readonly fromId: JourneyChapterId;
  readonly toId: JourneyChapterId;
  readonly path: string;
}

export interface JourneySatelliteConnection {
  readonly id: string;
  readonly chapterId: JourneyChapterId;
  readonly milestoneId: JourneyMilestoneId;
  readonly path: string;
}

export interface JourneyClusterLabel {
  readonly id: string;
  readonly chapterId: JourneyChapterId;
  readonly cluster: JourneyMilestoneCluster;
  readonly label: string;
  readonly point: JourneyMapPoint;
  readonly anchor: "start" | "middle" | "end";
}

export const journeyMapViewBox = {
  width: 1160,
  height: 700,
} as const;

const chapterPresentation = {
  strive: {
    icon: riseIcon,
    point: { x: 105, y: 555 },
    prominence: "standard",
  },
  "northeast-early-college": {
    icon: necIcon,
    point: { x: 260, y: 405 },
    prominence: "standard",
  },
  "make-a-chess-move": {
    icon: macmIcon,
    point: { x: 430, y: 535 },
    prominence: "standard",
  },
  heta: {
    icon: hetaIcon,
    point: { x: 590, y: 370 },
    prominence: "standard",
  },
  "notre-dame": {
    icon: ndIcon,
    point: { x: 765, y: 315 },
    prominence: "hub",
  },
  research: {
    point: { x: 930, y: 190 },
    prominence: "standard",
  },
  ai4se: {
    point: { x: 1080, y: 80 },
    prominence: "destination",
  },
} as const satisfies Record<JourneyChapterId, JourneyChapterPresentation>;

const milestonePresentation = {
  "strive-accelerated-entry": {
    labelPriority: "primary",
    relativePoint: { x: 115, y: -115 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 48 },
  },
  "strive-college-algebra": {
    labelPriority: "secondary",
    relativePoint: { x: 185, y: 15 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
  },
  "nec-salutatorian": {
    labelPriority: "primary",
    relativePoint: { x: -115, y: -115 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "nec-5280-challenge": {
    labelPriority: "primary",
    relativePoint: { x: 130, y: -105 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "nec-computer-science": {
    labelPriority: "primary",
    relativePoint: { x: -125, y: 105 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
  },
  "nec-alumni": {
    labelPriority: "secondary",
    relativePoint: { x: 135, y: 105 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
  },
  "macm-unreal-engine": {
    labelPriority: "secondary",
    relativePoint: { x: -145, y: -100 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
  },
  "macm-multiplayer-systems": {
    labelPriority: "primary",
    relativePoint: { x: 5, y: -150 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "macm-team-development": {
    labelPriority: "secondary",
    relativePoint: { x: 145, y: -80 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
  },
  "macm-google-it": {
    labelPriority: "secondary",
    relativePoint: { x: 110, y: 115 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
  },
  "heta-world-bank": {
    labelPriority: "primary",
    relativePoint: { x: -145, y: -105 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "heta-community-outreach": {
    labelPriority: "primary",
    relativePoint: { x: 145, y: -100 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "heta-stem-outreach": {
    labelPriority: "secondary",
    relativePoint: { x: -125, y: 110 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
  },
  "heta-web-it": {
    labelPriority: "secondary",
    relativePoint: { x: 135, y: 110 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
  },
  "nd-cs-acms": {
    labelPriority: "primary",
    relativePoint: { x: -210, y: -125 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "nd-academic-performance": {
    labelPriority: "secondary",
    relativePoint: { x: -220, y: -5 },
    labelAnchor: "end",
    labelOffset: { x: -34, y: 5 },
  },
  "nd-deans-list": {
    labelPriority: "secondary",
    relativePoint: { x: -180, y: 115 },
    labelAnchor: "end",
    labelOffset: { x: -34, y: 5 },
  },
  "nd-computer-architecture-ta": {
    labelPriority: "primary",
    relativePoint: { x: -30, y: -175 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "nd-fundamentals-ta": {
    labelPriority: "secondary",
    relativePoint: { x: 115, y: -165 },
    labelAnchor: "start",
    labelOffset: { x: 34, y: -4 },
  },
  "nd-math-tutor": {
    labelPriority: "secondary",
    relativePoint: { x: 205, y: -75 },
    labelAnchor: "start",
    labelOffset: { x: 34, y: 5 },
  },
  "nd-visa": {
    labelPriority: "primary",
    relativePoint: { x: 220, y: 55 },
    labelAnchor: "start",
    labelOffset: { x: 38, y: 4 },
  },
  "nd-idea-center": {
    labelPriority: "primary",
    relativePoint: { x: 175, y: 165 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "nd-jjl": {
    labelPriority: "secondary",
    relativePoint: { x: 25, y: 190 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 43 },
    icon: jjlIcon,
  },
  "nd-tapia": {
    labelPriority: "secondary",
    relativePoint: { x: -105, y: 175 },
    labelAnchor: "end",
    labelOffset: { x: -34, y: 5 },
  },
  "research-software-architecture": {
    labelPriority: "primary",
    relativePoint: { x: -135, y: 130 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "research-controlled-dialogue": {
    labelPriority: "primary",
    relativePoint: { x: 125, y: 125 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "ai4se-llm-systems": {
    labelPriority: "primary",
    relativePoint: { x: -155, y: 135 },
    labelAnchor: "middle",
    labelOffset: { x: 0, y: 49 },
  },
  "ai4se-software-quality": {
    labelPriority: "secondary",
    relativePoint: { x: 20, y: 180 },
    labelAnchor: "end",
    labelOffset: { x: -34, y: 5 },
  },
} as const satisfies Record<JourneyMilestoneId, JourneyMilestonePresentation>;

export const journeyMapChapters = journeyChapters.map((chapter, index) => ({
  ...chapter,
  ...chapterPresentation[chapter.id],
  sequence: index + 1,
})) satisfies readonly JourneyMapChapter[];

export function getJourneyMapChapter(id: JourneyChapterId) {
  const chapter = journeyMapChapters.find((candidate) => candidate.id === id);
  if (!chapter) {
    throw new Error(`Missing Journey map chapter: ${id}`);
  }
  return chapter;
}

export function getJourneyMapMilestones(chapterId: JourneyChapterId) {
  const chapter = getJourneyChapter(chapterId);
  const chapterPoint = getJourneyMapChapter(chapterId).point;
  return chapter.milestoneIds.map((id) => {
    const milestone = getJourneyMilestone(id);
    const presentation = milestonePresentation[id];
    return {
      ...milestone,
      ...presentation,
      point: {
        x: chapterPoint.x + presentation.relativePoint.x,
        y: chapterPoint.y + presentation.relativePoint.y,
      },
    };
  }) satisfies readonly JourneyMapMilestone[];
}

function connectionPath(from: JourneyMapPoint, to: JourneyMapPoint) {
  const midpoint = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${midpoint} ${from.y}, ${midpoint} ${to.y}, ${to.x} ${to.y}`;
}

function satellitePath(from: JourneyMapPoint, to: JourneyMapPoint) {
  const controlX = from.x + (to.x - from.x) * 0.58;
  const controlY = from.y + (to.y - from.y) * 0.32;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY}, ${to.x} ${to.y}`;
}

export const journeyMapConnections = journeyMapChapters.slice(0, -1).map((chapter, index) => {
  const nextChapter = journeyMapChapters[index + 1];
  if (!nextChapter) {
    throw new Error(`Missing Journey chapter after ${chapter.id}`);
  }
  return {
    id: `${chapter.id}-${nextChapter.id}`,
    fromId: chapter.id,
    toId: nextChapter.id,
    path: connectionPath(chapter.point, nextChapter.point),
  };
}) satisfies readonly JourneyMapConnection[];

export function getJourneySatelliteConnections(chapterId: JourneyChapterId) {
  const chapter = getJourneyMapChapter(chapterId);
  return getJourneyMapMilestones(chapterId).map((milestone) => ({
    id: `${chapter.id}-${milestone.id}`,
    chapterId,
    milestoneId: milestone.id,
    path: satellitePath(chapter.point, milestone.point),
  })) satisfies readonly JourneySatelliteConnection[];
}

const clusterDefinitions = [
  {
    chapterId: "make-a-chess-move",
    cluster: "game-development",
    label: "GAME / SOFTWARE DEVELOPMENT",
    relativePoint: { x: -180, y: -205 },
    anchor: "start",
  },
  {
    chapterId: "make-a-chess-move",
    cluster: "professional-development",
    label: "PROFESSIONAL / IT DEVELOPMENT",
    relativePoint: { x: 40, y: 180 },
    anchor: "start",
  },
  {
    chapterId: "notre-dame",
    cluster: "academics",
    label: "ACADEMICS",
    relativePoint: { x: -250, y: -205 },
    anchor: "start",
  },
  {
    chapterId: "notre-dame",
    cluster: "teaching",
    label: "TEACHING",
    relativePoint: { x: -20, y: -230 },
    anchor: "start",
  },
  {
    chapterId: "notre-dame",
    cluster: "professional-industry",
    label: "PROFESSIONAL / INDUSTRY",
    relativePoint: { x: 55, y: 235 },
    anchor: "start",
  },
] as const satisfies readonly {
  readonly chapterId: JourneyChapterId;
  readonly cluster: JourneyMilestoneCluster;
  readonly label: string;
  readonly relativePoint: JourneyMapPoint;
  readonly anchor: "start" | "middle" | "end";
}[];

export function getJourneyClusterLabels(chapterId: JourneyChapterId) {
  const chapter = getJourneyMapChapter(chapterId);
  return clusterDefinitions
    .filter((definition) => definition.chapterId === chapterId)
    .map((definition) => ({
      id: `${definition.chapterId}-${definition.cluster}`,
      chapterId,
      cluster: definition.cluster,
      label: definition.label,
      point: {
        x: chapter.point.x + definition.relativePoint.x,
        y: chapter.point.y + definition.relativePoint.y,
      },
      anchor: definition.anchor,
    })) satisfies readonly JourneyClusterLabel[];
}
