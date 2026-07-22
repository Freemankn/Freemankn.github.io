import { useState } from "react";
import hetaIcon from "../../../icons/HETA.png";
import jjlIcon from "../../../icons/JJL.png";
import macmIcon from "../../../icons/MACM.png";
import ndIcon from "../../../icons/ND.png";
import necIcon from "../../../icons/NEC.png";
import necaIcon from "../../../icons/NECA.png";
import riseIcon from "../../../icons/Rise.png";
import svlIcon from "../../../icons/SVL.png";
import type { JourneyCategory, JourneyEntry } from "../../data/journey";

const categories: readonly (JourneyCategory | "All")[] = [
  "All",
  "Notre Dame",
  "Research",
  "Teaching",
  "Industry",
  "Community",
  "Early foundations",
];

const organizationIcons: Record<JourneyEntry["id"], string> = {
  jjl: jjlIcon,
  neca: necaIcon,
  "notre-dame": ndIcon,
  macm: macmIcon,
  svl: svlIcon,
  heta: hetaIcon,
  nec: necIcon,
  "strive-prep-rise": riseIcon,
};

export function JourneyTimeline({ entries }: { entries: readonly JourneyEntry[] }) {
  const [activeCategory, setActiveCategory] = useState<JourneyCategory | "All">("All");
  const [expandedEntries, setExpandedEntries] = useState<ReadonlySet<string>>(new Set());

  const visibleEntries = entries.filter(
    (entry) => activeCategory === "All" || entry.categories.includes(activeCategory),
  );

  const toggleEntry = (id: string) => {
    setExpandedEntries((currentEntries) => {
      const nextEntries = new Set(currentEntries);
      if (nextEntries.has(id)) {
        nextEntries.delete(id);
      } else {
        nextEntries.add(id);
      }
      return nextEntries;
    });
  };

  return (
    <div>
      <div className="journey-filters" aria-label="Filter journey entries">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={activeCategory === category ? "is-active" : undefined}
            aria-pressed={activeCategory === category}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="journey-timeline" aria-live="polite">
        {visibleEntries.map((entry, index) => {
          const expanded = expandedEntries.has(entry.id);
          const detailsId = `journey-${entry.id}-details`;

          return (
            <article className="journey-entry" key={entry.id}>
              <div className="journey-entry__rail" aria-hidden="true">
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="journey-entry__logo">
                <img
                  src={organizationIcons[entry.id]}
                  alt=""
                  width="56"
                  height="56"
                  loading="lazy"
                />
              </div>
              <div className="journey-entry__content">
                <div className="journey-entry__meta">
                  <time>{entry.dateRange}</time>
                  <span>{entry.categories.join(" · ")}</span>
                </div>
                <h3>{entry.organization}</h3>
                <p className="journey-entry__role">{entry.role}</p>
                <p>{entry.summary}</p>
                <button
                  className="text-button journey-entry__toggle"
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                  onClick={() => toggleEntry(entry.id)}
                >
                  {expanded ? "Show less" : "Read details"}
                  <span aria-hidden="true">{expanded ? "−" : "+"}</span>
                </button>
                <div
                  className={`journey-entry__details${expanded ? " journey-entry__details--open" : ""}`}
                  id={detailsId}
                >
                  <ul>
                    {entry.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
