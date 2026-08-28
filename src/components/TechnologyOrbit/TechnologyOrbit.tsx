import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FnShield } from "../FnShield/FnShield";
import {
  orbitTechnologies,
  technologyGroups,
  type OrbitTechnology,
  type TechnologyId,
} from "../../data/technologies";

type OrbitStyle = CSSProperties & {
  "--orbit-angle": string;
  "--orbit-counter-angle": string;
};

function OrbitRing({
  ring,
  technologies,
  selectedId,
  onSelect,
}: {
  readonly ring: "inner" | "outer";
  readonly technologies: readonly OrbitTechnology[];
  readonly selectedId: TechnologyId;
  readonly onSelect: (id: TechnologyId) => void;
}) {
  return (
    <ul className={`technology-orbit__ring technology-orbit__ring--${ring}`}>
      {technologies.map((technology, index) => {
        const angleInDegrees = (360 / technologies.length) * index - 90;
        const angle = `${angleInDegrees}deg`;
        const selected = selectedId === technology.id;

        return (
          <li
            className="technology-orbit__item"
            style={
              {
                "--orbit-angle": angle,
                "--orbit-counter-angle": `${-angleInDegrees}deg`,
              } as OrbitStyle
            }
            key={technology.id}
          >
            <button
              className={`technology-orbit__button${selected ? " is-selected" : ""}`}
              type="button"
              aria-pressed={selected}
              aria-label={`Show details for ${technology.name}`}
              onClick={() => onSelect(technology.id)}
            >
              <img src={technology.icon} alt="" width="52" height="52" loading="lazy" />
              <span>{technology.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function TechnologyOrbit() {
  const [selectedId, setSelectedId] = useState<TechnologyId>("python");
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const orbitRef = useRef<HTMLDivElement>(null);
  const selectedTechnology =
    orbitTechnologies.find((technology) => technology.id === selectedId) ??
    orbitTechnologies[0];
  const innerTechnologies = orbitTechnologies.filter(
    (technology) => technology.ring === "inner",
  );
  const outerTechnologies = orbitTechnologies.filter(
    (technology) => technology.ring === "outer",
  );

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(orbit);
    return () => observer.disconnect();
  }, []);

  const paused = interactionPaused || !isVisible;

  return (
    <div
      ref={orbitRef}
      className={`technology-orbit${paused ? " is-paused" : ""}`}
      onPointerEnter={() => setInteractionPaused(true)}
      onPointerLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setInteractionPaused(false);
        }
      }}
    >
      <div className="technology-orbit__visual">
        <div className="technology-orbit__blueprint" aria-hidden="true" />
        <div className="technology-orbit__core" aria-hidden="true">
          <span>language system</span>
          <FnShield size="large" />
          <span>select a node</span>
        </div>
        <OrbitRing
          ring="outer"
          technologies={outerTechnologies}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <OrbitRing
          ring="inner"
          technologies={innerTechnologies}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className="technology-orbit__information">
        <div className="technology-orbit__details" aria-live="polite">
          <p className="eyebrow">Selected node</p>
          <div className="technology-orbit__details-heading">
            <img
              src={selectedTechnology.icon}
              alt=""
              width="58"
              height="58"
              loading="lazy"
            />
            <div>
              <h3>{selectedTechnology.name}</h3>
              <p>{selectedTechnology.category}</p>
            </div>
          </div>
          <p className="technology-orbit__usage">{selectedTechnology.usage}</p>
          {selectedTechnology.relatedProjects.length > 0 ? (
            <div className="technology-orbit__detail-group">
              <p>Related projects</p>
              <ul>
                {selectedTechnology.relatedProjects.map((project) => (
                  <li key={project}>{project}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="technology-orbit__detail-group">
            <p>Related technologies</p>
            <ul>
              {selectedTechnology.relatedTechnologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="technology-groups" aria-label="Supporting technology groups">
          {technologyGroups.map((group) => (
            <section key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
