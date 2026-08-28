import hetaIcon from "../../icons/HETA.png";
import jjlIcon from "../../icons/JJL.png";
import macmIcon from "../../icons/MACM.png";
import ndIcon from "../../icons/ND.png";
import necIcon from "../../icons/NEC.png";
import necaIcon from "../../icons/NECA.png";
import riseIcon from "../../icons/Rise.png";
import svlIcon from "../../icons/SVL.png";
import {
  journeyEntries,
  type JourneyEntry,
  type JourneyId,
} from "./journey";

export interface JourneyMapPoint {
  readonly x: number;
  readonly y: number;
}

interface JourneyNodePresentation {
  readonly shortLabel: string;
  readonly icon: string;
  readonly point: JourneyMapPoint;
}

export interface JourneyMapNode extends JourneyEntry {
  readonly sequence: number;
  readonly shortLabel: string;
  readonly icon: string;
  readonly point: JourneyMapPoint;
  readonly connectedNodeIds: readonly JourneyId[];
  readonly previousId?: JourneyId;
  readonly nextId?: JourneyId;
}

export interface JourneyMapRegion {
  readonly label:
    | "Early foundations"
    | "Northeast Early College"
    | "Research"
    | "Community"
    | "Industry"
    | "Notre Dame"
    | "Teaching"
    | "Current AI4SE Direction";
  readonly point: JourneyMapPoint;
  readonly anchor: "start" | "middle" | "end";
}

export interface JourneyMapConnection {
  readonly id: string;
  readonly fromId: JourneyId;
  readonly toId: JourneyId;
  readonly path: string;
}

export const journeyMapViewBox = {
  width: 1080,
  height: 650,
} as const;

export const journeyMapRegions = [
  {
    label: "Early foundations",
    point: { x: 64, y: 612 },
    anchor: "start",
  },
  {
    label: "Northeast Early College",
    point: { x: 184, y: 326 },
    anchor: "middle",
  },
  {
    label: "Research",
    point: { x: 470, y: 162 },
    anchor: "middle",
  },
  {
    label: "Community",
    point: { x: 420, y: 602 },
    anchor: "middle",
  },
  {
    label: "Industry",
    point: { x: 662, y: 540 },
    anchor: "middle",
  },
  {
    label: "Notre Dame",
    point: { x: 790, y: 150 },
    anchor: "middle",
  },
  {
    label: "Teaching",
    point: { x: 720, y: 84 },
    anchor: "middle",
  },
  {
    label: "Current AI4SE Direction",
    point: { x: 1022, y: 52 },
    anchor: "end",
  },
] as const satisfies readonly JourneyMapRegion[];

const chronologicalIds = [
  "strive-prep-rise",
  "nec",
  "heta",
  "svl",
  "macm",
  "notre-dame",
  "neca",
  "jjl",
] as const satisfies readonly JourneyId[];

const nodePresentation = {
  "strive-prep-rise": {
    shortLabel: "STRIVE",
    icon: riseIcon,
    point: { x: 105, y: 510 },
  },
  nec: {
    shortLabel: "NEC",
    icon: necIcon,
    point: { x: 235, y: 405 },
  },
  heta: {
    shortLabel: "HETA",
    icon: hetaIcon,
    point: { x: 365, y: 510 },
  },
  svl: {
    shortLabel: "SVL",
    icon: svlIcon,
    point: { x: 490, y: 305 },
  },
  macm: {
    shortLabel: "MACM",
    icon: macmIcon,
    point: { x: 620, y: 420 },
  },
  "notre-dame": {
    shortLabel: "NOTRE DAME",
    icon: ndIcon,
    point: { x: 735, y: 220 },
  },
  neca: {
    shortLabel: "NECA",
    icon: necaIcon,
    point: { x: 865, y: 335 },
  },
  jjl: {
    shortLabel: "JJL",
    icon: jjlIcon,
    point: { x: 980, y: 145 },
  },
} as const satisfies Record<JourneyId, JourneyNodePresentation>;

const entriesById = new Map<JourneyId, JourneyEntry>(
  journeyEntries.map((entry) => [entry.id, entry]),
);

function requiredEntry(id: JourneyId) {
  const entry = entriesById.get(id);
  if (!entry) {
    throw new Error(`Missing journey entry for ${id}`);
  }
  return entry;
}

export const journeyMapNodes = chronologicalIds.map((id, index) => {
  const previousId = chronologicalIds[index - 1];
  const nextId = chronologicalIds[index + 1];
  const connectedNodeIds: JourneyId[] = [];

  if (previousId) {
    connectedNodeIds.push(previousId);
  }
  if (nextId) {
    connectedNodeIds.push(nextId);
  }

  return {
    ...requiredEntry(id),
    ...nodePresentation[id],
    sequence: index + 1,
    connectedNodeIds,
    previousId,
    nextId,
  };
}) satisfies readonly JourneyMapNode[];

function connectionPath(from: JourneyMapPoint, to: JourneyMapPoint) {
  const midpoint = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} C ${midpoint} ${from.y}, ${midpoint} ${to.y}, ${to.x} ${to.y}`;
}

export const journeyMapConnections = journeyMapNodes
  .slice(0, -1)
  .map((node, index) => {
    const nextNode = journeyMapNodes[index + 1];
    if (!nextNode) {
      throw new Error(`Missing connected journey node after ${node.id}`);
    }

    return {
      id: `${node.id}-${nextNode.id}`,
      fromId: node.id,
      toId: nextNode.id,
      path: connectionPath(node.point, nextNode.point),
    };
  }) satisfies readonly JourneyMapConnection[];
