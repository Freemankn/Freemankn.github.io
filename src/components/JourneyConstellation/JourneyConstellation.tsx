import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  journeyMapConnections,
  journeyMapNodes,
  journeyMapRegions,
  journeyMapViewBox,
  type JourneyMapNode,
} from "../../data/journeyMap";
import type { JourneyId } from "../../data/journey";
import styles from "./JourneyConstellation.module.css";

const totalMilestones = journeyMapNodes.length;

function classes(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function nodeById(id: JourneyId | undefined) {
  return journeyMapNodes.find((node) => node.id === id) ?? null;
}

interface JourneyMapView {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

const overviewMapView: JourneyMapView = {
  x: 0,
  y: 0,
  width: journeyMapViewBox.width,
  height: journeyMapViewBox.height,
};

function focusedMapView(node: JourneyMapNode): JourneyMapView {
  const width = 470;
  const height = 340;
  const maximumX = journeyMapViewBox.width - width;
  const maximumY = journeyMapViewBox.height - height;
  const x = Math.min(Math.max(node.point.x - width / 2, 0), maximumX);
  const y = Math.min(Math.max(node.point.y - height / 2, 0), maximumY);
  return { x, y, width, height };
}

function viewBoxValue(view: JourneyMapView) {
  return `${view.x} ${view.y} ${view.width} ${view.height}`;
}

function useAnimatedMapView(target: JourneyMapView) {
  const [current, setCurrent] = useState<JourneyMapView>(target);
  const currentRef = useRef(target);
  const targetX = target.x;
  const targetY = target.y;
  const targetWidth = target.width;
  const targetHeight = target.height;

  useEffect(() => {
    const destination = {
      x: targetX,
      y: targetY,
      width: targetWidth,
      height: targetHeight,
    };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      currentRef.current = destination;
      setCurrent(destination);
      return undefined;
    }

    const start = currentRef.current;
    const startedAt = performance.now();
    const duration = 560;
    let animationFrame = 0;

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const next = {
        x: start.x + (destination.x - start.x) * easedProgress,
        y: start.y + (destination.y - start.y) * easedProgress,
        width: start.width + (destination.width - start.width) * easedProgress,
        height: start.height + (destination.height - start.height) * easedProgress,
      };

      currentRef.current = next;
      setCurrent(next);
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [targetHeight, targetWidth, targetX, targetY]);

  return viewBoxValue(current);
}

interface JourneyNodeProps {
  readonly node: JourneyMapNode;
  readonly selectedId: JourneyId | null;
  readonly onSelect: (id: JourneyId) => void;
  readonly registerNode: (id: JourneyId, element: SVGGElement | null) => void;
}

function JourneyNode({ node, selectedId, onSelect, registerNode }: JourneyNodeProps) {
  const selected = selectedId === node.id;
  const selectedNode = nodeById(selectedId ?? undefined);
  const connected = selectedNode?.connectedNodeIds.includes(node.id) ?? false;
  const dimmed = selectedId !== null && !selected && !connected;

  const activate = () => onSelect(node.id);
  const handleKeyDown = (event: ReactKeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  return (
    <g
      ref={(element) => registerNode(node.id, element)}
      className={classes(
        styles.node,
        selected && styles.nodeSelected,
        connected && styles.nodeConnected,
        dimmed && styles.nodeDimmed,
      )}
      role="button"
      tabIndex={0}
      focusable="true"
      aria-label={`Milestone ${node.sequence} of ${totalMilestones}: ${node.organization}, ${node.role}, ${node.dateRange}`}
      aria-pressed={selected}
      onClick={activate}
      onKeyDown={handleKeyDown}
      transform={`translate(${node.point.x} ${node.point.y})`}
    >
      <circle className={styles.nodeHalo} r="58" aria-hidden="true" />
      <circle className={styles.nodeFrame} r="46" aria-hidden="true" />
      <rect
        className={styles.nodeImagePlate}
        x="-31"
        y="-31"
        width="62"
        height="62"
        rx="16"
        aria-hidden="true"
      />
      <image
        href={node.icon}
        x="-26"
        y="-26"
        width="52"
        height="52"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      />
      <text className={styles.nodeLabel} y="72" textAnchor="middle" aria-hidden="true">
        <tspan x="0">{node.shortLabel}</tspan>
        <tspan className={styles.nodeDate} x="0" dy="18">
          {node.dateRange}
        </tspan>
      </text>
    </g>
  );
}

interface MobileGuideProps {
  readonly selectedId: JourneyId | null;
  readonly detailsId: string;
  readonly onSelect: (id: JourneyId) => void;
  readonly registerCard: (id: JourneyId, element: HTMLButtonElement | null) => void;
}

function MobileGuide({ selectedId, detailsId, onSelect, registerCard }: MobileGuideProps) {
  return (
    <section className={styles.mobileGuide} aria-labelledby={`${detailsId}-guide-title`}>
      <div className={styles.mobileGuideHeading}>
        <p>Guided milestone cards</p>
        <h2 id={`${detailsId}-guide-title`}>Follow the path chronologically</h2>
      </div>
      <ol>
        {journeyMapNodes.map((node) => {
          const selected = selectedId === node.id;
          return (
            <li key={node.id}>
              <button
                ref={(element) => registerCard(node.id, element)}
                className={classes(styles.mobileCard, selected && styles.mobileCardSelected)}
                type="button"
                aria-pressed={selected}
                aria-controls={detailsId}
                onClick={() => onSelect(node.id)}
              >
                <span className={styles.mobileCardIndex} aria-hidden="true">
                  {String(node.sequence).padStart(2, "0")}
                </span>
                <time>{node.dateRange}</time>
                <strong>{node.organization}</strong>
                <span>{node.role}</span>
                <small>{node.summary}</small>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function ChronologicalFallback({ headingId }: { readonly headingId: string }) {
  return (
    <details className={styles.chronology}>
      <summary>Read the complete chronological journey</summary>
      <div className={styles.chronologyContent}>
        <h2 id={headingId}>Chronological record</h2>
        <ol aria-labelledby={headingId}>
          {journeyMapNodes.map((node) => (
            <li key={node.id}>
              <article>
                <div className={styles.chronologyMarker} aria-hidden="true">
                  {String(node.sequence).padStart(2, "0")}
                </div>
                <div>
                  <time>{node.dateRange}</time>
                  <h3>{node.organization}</h3>
                  <p className={styles.chronologyRole}>{node.role}</p>
                  <p>{node.summary}</p>
                  <ul>
                    {node.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </details>
  );
}

export function JourneyConstellation() {
  const [selectedId, setSelectedId] = useState<JourneyId | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const nodeRefs = useRef(new Map<JourneyId, SVGGElement>());
  const mobileCardRefs = useRef(new Map<JourneyId, HTMLButtonElement>());
  const resetButtonRef = useRef<HTMLButtonElement>(null);
  const generatedId = useId().replaceAll(":", "");
  const mapTitleId = `${generatedId}-map-title`;
  const mapDescriptionId = `${generatedId}-map-description`;
  const detailsId = `${generatedId}-details`;
  const chronologyHeadingId = `${generatedId}-chronology-title`;
  const selectedNode = nodeById(selectedId ?? undefined);
  const previousNode = nodeById(selectedNode?.previousId);
  const nextNode = nodeById(selectedNode?.nextId);
  const targetMapView = zoomed && selectedNode ? focusedMapView(selectedNode) : overviewMapView;
  const viewBox = useAnimatedMapView(targetMapView);

  const selectNode = (id: JourneyId) => {
    setSelectedId(id);
    setZoomed(true);
  };

  const resetJourney = () => {
    setSelectedId(null);
    setZoomed(false);
  };

  const handleEscape = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || (!selectedId && !zoomed)) {
      return;
    }
    event.preventDefault();
    resetJourney();
    window.requestAnimationFrame(() => resetButtonRef.current?.focus());
  };

  const returnToMap = () => {
    setZoomed(false);
    if (!selectedId) {
      return;
    }

    window.requestAnimationFrame(() => {
      const desktopMapIsVisible = window.matchMedia("(min-width: 821px)").matches;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const target = desktopMapIsVisible
        ? nodeRefs.current.get(selectedId)
        : mobileCardRefs.current.get(selectedId);
      target?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
        inline: "center",
      });
      target?.focus({ preventScroll: true });
    });
  };

  return (
    <div className={styles.constellation} onKeyDownCapture={handleEscape}>
      <p className={styles.selectionAnnouncement} aria-live="polite">
        {selectedNode
          ? `Selected ${selectedNode.organization}, milestone ${selectedNode.sequence} of ${totalMilestones}.`
          : "Journey overview selected."}
      </p>

      <div className={styles.pathBar}>
        <nav className={styles.breadcrumb} aria-label="Journey path">
          <ol>
            <li>Journey</li>
            <li>{selectedNode ? `Milestone ${String(selectedNode.sequence).padStart(2, "0")}` : "Overview"}</li>
            {selectedNode ? <li aria-current="page">{selectedNode.shortLabel}</li> : null}
          </ol>
        </nav>
        <div className={styles.mapControls} aria-label="Journey map controls">
          <button
            className={styles.mapViewControl}
            type="button"
            disabled={!selectedNode || zoomed}
            onClick={() => setZoomed(true)}
          >
            Zoom to selected
          </button>
          {zoomed ? (
            <button className={styles.mapViewControl} type="button" onClick={returnToMap}>
              Return to Map
            </button>
          ) : null}
          <button ref={resetButtonRef} type="button" onClick={resetJourney}>
            Reset map
          </button>
        </div>
      </div>

      <div className={styles.explorer}>
        <section className={styles.mapPanel} aria-labelledby={mapTitleId}>
          <div className={styles.mapHeading}>
            <div>
              <p>Interactive constellation</p>
              <h2 id={mapTitleId}>Connected milestones</h2>
            </div>
            <p id={mapDescriptionId}>
              Select a node with a pointer, Enter, or Space. Press Escape to reset the map.
            </p>
          </div>
          <div className={styles.mapViewport}>
            <svg
              className={styles.map}
              viewBox={viewBox}
              role="group"
              aria-labelledby={`${mapTitleId} ${mapDescriptionId}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <defs aria-hidden="true">
                <pattern id={`${generatedId}-grid`} width="36" height="36" patternUnits="userSpaceOnUse">
                  <path d="M 36 0 L 0 0 0 36" className={styles.gridLine} />
                </pattern>
                <linearGradient id={`${generatedId}-path`} x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor="#4da3ff" />
                  <stop offset="0.58" stopColor="#61e8ff" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <rect
                width={journeyMapViewBox.width}
                height={journeyMapViewBox.height}
                fill={`url(#${generatedId}-grid)`}
                aria-hidden="true"
              />
              <path
                className={styles.mapAxis}
                d="M 45 575 C 260 500, 410 610, 575 410 S 885 330, 1035 90"
                aria-hidden="true"
              />
              <g className={styles.regionLabels} aria-hidden="true">
                {journeyMapRegions.map((region) => (
                  <text
                    x={region.point.x}
                    y={region.point.y}
                    textAnchor={region.anchor}
                    key={region.label}
                  >
                    {region.label}
                  </text>
                ))}
              </g>
              <g aria-hidden="true">
                {journeyMapConnections.map((connection) => {
                  const connected =
                    selectedId === connection.fromId || selectedId === connection.toId;
                  const dimmed = selectedId !== null && !connected;
                  return (
                    <path
                      className={classes(
                        styles.connection,
                        connected && styles.connectionActive,
                        dimmed && styles.connectionDimmed,
                      )}
                      d={connection.path}
                      stroke={`url(#${generatedId}-path)`}
                      key={connection.id}
                    />
                  );
                })}
              </g>
              {journeyMapNodes.map((node) => (
                <JourneyNode
                  node={node}
                  selectedId={selectedId}
                  onSelect={selectNode}
                  registerNode={(id, element) => {
                    if (element) {
                      nodeRefs.current.set(id, element);
                    } else {
                      nodeRefs.current.delete(id);
                    }
                  }}
                  key={node.id}
                />
              ))}
            </svg>
          </div>
        </section>

        <MobileGuide
          selectedId={selectedId}
          detailsId={detailsId}
          onSelect={selectNode}
          registerCard={(id, element) => {
            if (element) {
              mobileCardRefs.current.set(id, element);
            } else {
              mobileCardRefs.current.delete(id);
            }
          }}
        />

        <section className={styles.details} id={detailsId} aria-labelledby={`${detailsId}-title`}>
          {selectedNode ? (
            <>
              <header className={styles.detailsHeader}>
                <img src={selectedNode.icon} alt="" width="64" height="64" />
                <div>
                  <p>
                    Milestone {String(selectedNode.sequence).padStart(2, "0")} / {String(totalMilestones).padStart(2, "0")}
                  </p>
                  <h2 id={`${detailsId}-title`}>{selectedNode.organization}</h2>
                </div>
              </header>
              <div className={styles.detailsMeta}>
                <time>{selectedNode.dateRange}</time>
                <span>{selectedNode.role}</span>
              </div>
              <ul className={styles.categoryList} aria-label="Journey categories">
                {selectedNode.categories.map((category) => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
              <p className={styles.detailsSummary}>{selectedNode.summary}</p>
              <div className={styles.detailsRecord}>
                <h3>Details</h3>
                <ul>
                  {selectedNode.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>
              <nav className={styles.connectedNavigation} aria-label="Connected journey milestones">
                <button
                  type="button"
                  disabled={!previousNode}
                  onClick={() => previousNode && selectNode(previousNode.id)}
                >
                  <span>Previous</span>
                  <strong>{previousNode?.shortLabel ?? "Start of path"}</strong>
                </button>
                <button
                  type="button"
                  disabled={!nextNode}
                  onClick={() => nextNode && selectNode(nextNode.id)}
                >
                  <span>Next</span>
                  <strong>{nextNode?.shortLabel ?? "End of path"}</strong>
                </button>
              </nav>
              <button className={styles.returnToNode} type="button" onClick={returnToMap}>
                Return to Map
              </button>
            </>
          ) : (
            <div className={styles.detailsEmpty}>
              <p>Journey overview</p>
              <h2 id={`${detailsId}-title`}>Choose a milestone to inspect</h2>
              <p>
                The connected path moves from early foundations through community, research,
                teaching, and industry work. Every detail comes from the existing journey record.
              </p>
            </div>
          )}
        </section>
      </div>

      <ChronologicalFallback headingId={chronologyHeadingId} />
    </div>
  );
}
