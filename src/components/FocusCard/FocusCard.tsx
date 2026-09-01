import { useState } from "react";
import { Link } from "react-router-dom";
import type { FocusIcon as FocusIconName, FocusItem } from "../../data/focus";
import styles from "./FocusCard.module.css";

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

  if (icon === "replay") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M18 20v42M18 27h15l8 9h20M18 45h18l8 10h17" />
        <circle cx="18" cy="27" r="5" />
        <circle cx="41" cy="36" r="5" />
        <circle cx="44" cy="55" r="5" />
        <path d="m56 28 7 8-7 8m0 3 7 8-7 8" />
      </svg>
    );
  }

  if (icon === "collaboration") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="25" cy="30" r="9" />
        <circle cx="55" cy="30" r="9" />
        <path d="M13 58c2-10 8-15 17-15m37 15c-2-10-8-15-17-15" />
        <path d="M32 53h16M36 47l-6 6 6 6m8-12 6 6-6 6" />
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
  const [expanded, setExpanded] = useState(false);
  const titleId = `focus-${item.id}-title`;
  const contextId = `focus-${item.id}-context`;

  return (
    <article className={`focus-card ${styles.card}`} aria-labelledby={titleId}>
      <div className="focus-card__topline">
        <span>{item.category}</span>
        <span aria-hidden="true">0{index + 1}</span>
      </div>
      <div className="focus-card__icon">
        <FocusIcon icon={item.icon} />
      </div>
      <h3 id={titleId}>{item.title}</h3>

      <dl className={styles.details}>
        <div>
          <dt>Problem</dt>
          <dd>{item.problem}</dd>
        </div>
        <div>
          <dt>Current approach</dt>
          <dd>{item.currentApproach}</dd>
        </div>
      </dl>

      <button
        className={styles.disclosure}
        type="button"
        aria-expanded={expanded}
        aria-controls={contextId}
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? "Hide context" : "Why it matters"}
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>
      <div className={styles.more} id={contextId} hidden={!expanded}>
        <p>{item.whyItMatters}</p>
      </div>

      <div className={`focus-card__footer ${styles.footer}`}>
        <span className="focus-card__status">
          <span aria-hidden="true" />
          {item.status}
        </span>
        <Link
          to={item.associatedProject.path}
          aria-label={`See ${item.associatedProject.title}, associated with ${item.title}`}
        >
          <span className={styles.projectLabel}>Associated project</span>
          {item.associatedProject.title} <span aria-hidden="true">↘</span>
        </Link>
      </div>
      <span className="focus-card__node focus-card__node--one" aria-hidden="true" />
      <span className="focus-card__node focus-card__node--two" aria-hidden="true" />
    </article>
  );
}
