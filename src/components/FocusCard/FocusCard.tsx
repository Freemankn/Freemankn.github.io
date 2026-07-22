import type { FocusIcon as FocusIconName, FocusItem } from "../../data/focus";

const projectTargets: Record<FocusItem["id"], string> = {
  "controlled-dialogue-systems": "#project-controlled-dialogue-simulator",
  codegraph: "#project-codegraph",
  flowboard: "#project-flowboard",
};

function FocusIcon({ icon }: { icon: FocusIconName }) {
  if (icon === "dialogue") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M18 21h30v20H30l-9 8v-8h-3z" />
        <path d="M38 39h24v17H49l-7 6v-6h-4z" />
        <circle cx="27" cy="31" r="2" />
        <circle cx="34" cy="31" r="2" />
        <circle cx="41" cy="31" r="2" />
      </svg>
    );
  }

  if (icon === "graph") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="m20 54 16-29 24 12-9 22-31-5Z" />
        <path d="m36 25 3 25m21-13-21 13m12 9L39 50 20 54" />
        <circle cx="20" cy="54" r="5" />
        <circle cx="36" cy="25" r="5" />
        <circle cx="60" cy="37" r="5" />
        <circle cx="51" cy="59" r="5" />
        <circle cx="39" cy="50" r="4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <path d="M17 24h18v14H17zm28 0h18v14H45zM31 49h18v14H31z" />
      <path d="M35 31h10M54 38v7H40v4M26 38v7h14" />
      <path d="m40 18 4 5-4 5-4-5 4-5Z" />
    </svg>
  );
}

export function FocusCard({ item, index }: { item: FocusItem; index: number }) {
  return (
    <article className="focus-card" style={{ "--card-index": index } as React.CSSProperties}>
      <div className="focus-card__topline">
        <span>{item.category}</span>
        <span aria-hidden="true">0{index + 1}</span>
      </div>
      <div className="focus-card__icon">
        <FocusIcon icon={item.icon} />
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <a href={projectTargets[item.id]} aria-label={`See project details for ${item.title}`}>
        See related work <span aria-hidden="true">↘</span>
      </a>
      <span className="focus-card__node focus-card__node--one" aria-hidden="true" />
      <span className="focus-card__node focus-card__node--two" aria-hidden="true" />
    </article>
  );
}
