import {
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  getChapterMilestones,
  getJourneyChapter,
  getJourneyMilestone,
  journeyChapters,
  type JourneyChapterId,
  type JourneyMilestoneId,
} from "../../data/journey";
import {
  getJourneyClusterLabels,
  getJourneyMapChapter,
  getJourneyMapMilestones,
  getJourneySatelliteConnections,
  journeyMapChapters,
  journeyMapConnections,
  journeyMapViewBox,
  type JourneyMapChapter,
  type JourneyMapMilestone,
  type JourneyMapPoint,
} from "../../data/journeyMap";
import {
  useJourneyCamera,
  type JourneyCameraView,
} from "./useJourneyCamera";
import styles from "./JourneyConstellation.module.css";

function classes(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function focusedMapView(chapter: JourneyMapChapter): JourneyCameraView {
  const milestones = getJourneyMapMilestones(chapter.id);
  const points = [chapter.point, ...milestones.map((milestone) => milestone.point)];
  const minimumX = Math.min(...points.map((point) => point.x));
  const maximumX = Math.max(...points.map((point) => point.x));
  const minimumY = Math.min(...points.map((point) => point.y));
  const maximumY = Math.max(...points.map((point) => point.y));
  const aspectRatio = journeyMapViewBox.width / journeyMapViewBox.height;
  const contentWidth = maximumX - minimumX + 250;
  const contentHeight = maximumY - minimumY + 160;
  const width = Math.min(
    Math.max(contentWidth, contentHeight * aspectRatio, 570),
    journeyMapViewBox.width,
  );
  const height = width / aspectRatio;
  const centerX = (minimumX + maximumX) / 2;
  const centerY = (minimumY + maximumY) / 2;
  const x = Math.min(Math.max(centerX - width / 2, 0), journeyMapViewBox.width - width);
  const y = Math.min(Math.max(centerY - height / 2, 0), journeyMapViewBox.height - height);
  return { x, y, width, height };
}

function activateWithKeyboard(
  event: ReactKeyboardEvent<SVGGElement>,
  activate: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}

interface ChapterNodeProps {
  readonly chapter: JourneyMapChapter;
  readonly selectedChapterId: JourneyChapterId | null;
  readonly controlsId: string;
  readonly onSelect: (id: JourneyChapterId) => void;
  readonly shouldSuppressPointerActivation: () => boolean;
  readonly registerNode: (id: JourneyChapterId, element: SVGGElement | null) => void;
}

function ChapterNode({
  chapter,
  selectedChapterId,
  controlsId,
  onSelect,
  shouldSuppressPointerActivation,
  registerNode,
}: ChapterNodeProps) {
  const selected = chapter.id === selectedChapterId;
  const dimmed = selectedChapterId !== null && !selected;
  const radius = chapter.prominence === "hub" ? 52 : chapter.prominence === "destination" ? 49 : 46;
  const activate = () => onSelect(chapter.id);

  return (
    <g
      ref={(element) => registerNode(chapter.id, element)}
      className={classes(
        styles.chapterNode,
        selected && styles.chapterNodeSelected,
        dimmed && styles.chapterNodeDimmed,
        chapter.prominence === "hub" && styles.chapterNodeHub,
        chapter.prominence === "destination" && styles.chapterNodeDestination,
      )}
      data-journey-chapter={chapter.id}
      role="button"
      tabIndex={0}
      focusable="true"
      aria-expanded={selected}
      aria-controls={selected ? controlsId : undefined}
      aria-label={`Chapter ${chapter.sequence} of ${journeyMapChapters.length}: ${chapter.title}. ${chapter.subtitle}. ${chapter.summary}`}
      onClick={() => {
        if (!shouldSuppressPointerActivation()) {
          activate();
        }
      }}
      onKeyDown={(event) => activateWithKeyboard(event, activate)}
      transform={`translate(${chapter.point.x} ${chapter.point.y})`}
    >
      <circle className={styles.chapterHalo} r={radius + 15} aria-hidden="true" />
      <circle className={styles.chapterFrame} r={radius} aria-hidden="true" />
      {chapter.icon ? (
        <>
          <rect
            className={styles.chapterImagePlate}
            x={-radius + 14}
            y={-radius + 14}
            width={(radius - 14) * 2}
            height={(radius - 14) * 2}
            rx="15"
            aria-hidden="true"
          />
          <image
            href={chapter.icon}
            x={-radius + 18}
            y={-radius + 18}
            width={(radius - 18) * 2}
            height={(radius - 18) * 2}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
          />
        </>
      ) : (
        <path
          className={styles.chapterGlyph}
          d="M 0 -24 L 6 -7 L 24 0 L 6 7 L 0 24 L -6 7 L -24 0 L -6 -7 Z"
          aria-hidden="true"
        />
      )}
      <circle className={styles.satelliteHint} cx={radius - 2} cy={-radius + 3} r="6" aria-hidden="true" />
      <text className={styles.chapterLabel} y={radius + 27} textAnchor="middle" aria-hidden="true">
        <tspan x="0">{chapter.shortLabel}</tspan>
        {chapter.date ? (
          <tspan className={styles.chapterDate} x="0" dy="17">
            {chapter.date}
          </tspan>
        ) : null}
      </text>
    </g>
  );
}

interface MilestoneNodeProps {
  readonly milestone: JourneyMapMilestone;
  readonly selectedMilestoneId: JourneyMilestoneId | null;
  readonly onSelect: (id: JourneyMilestoneId) => void;
  readonly shouldSuppressPointerActivation: () => boolean;
  readonly registerNode: (id: JourneyMilestoneId, element: SVGGElement | null) => void;
}

function MilestoneNode({
  milestone,
  selectedMilestoneId,
  onSelect,
  shouldSuppressPointerActivation,
  registerNode,
}: MilestoneNodeProps) {
  const selected = selectedMilestoneId === milestone.id;
  const dimmed = selectedMilestoneId !== null && !selected;
  const prominent = milestone.importance === "prominent";
  const radius = prominent ? 29 : 21;
  const activate = () => onSelect(milestone.id);

  return (
    <g
      ref={(element) => registerNode(milestone.id, element)}
      className={classes(
        styles.milestoneNode,
        prominent ? styles.milestoneProminent : styles.milestoneDetail,
        selected && styles.milestoneNodeSelected,
        dimmed && styles.milestoneNodeDimmed,
      )}
      data-journey-milestone={milestone.id}
      data-node-importance={milestone.importance}
      data-label-priority={milestone.labelPriority}
      role="button"
      tabIndex={0}
      focusable="true"
      aria-pressed={selected}
      aria-label={`${prominent ? "Prominent" : "Detail"} milestone: ${milestone.title}${milestone.date ? `, ${milestone.date}` : ""}. ${milestone.summary}`}
      onClick={() => {
        if (!shouldSuppressPointerActivation()) {
          activate();
        }
      }}
      onKeyDown={(event) => activateWithKeyboard(event, activate)}
      transform={`translate(${milestone.point.x} ${milestone.point.y})`}
    >
      <g className={styles.milestoneVisual}>
        <circle className={styles.milestoneHalo} r={radius + 10} aria-hidden="true" />
        <circle className={styles.milestoneFrame} r={radius} aria-hidden="true" />
        {milestone.icon ? (
          <image
            href={milestone.icon}
            x={-radius + 6}
            y={-radius + 6}
            width={(radius - 6) * 2}
            height={(radius - 6) * 2}
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
            focusable="false"
          />
        ) : (
          <path
            className={styles.milestoneGlyph}
            d={prominent ? "M 0 -13 L 4 -4 L 13 0 L 4 4 L 0 13 L -4 4 L -13 0 L -4 -4 Z" : "M 0 -9 L 3 -3 L 9 0 L 3 3 L 0 9 L -3 3 L -9 0 L -3 -3 Z"}
            aria-hidden="true"
          />
        )}
        <text
          className={styles.milestoneLabel}
          x={milestone.labelOffset.x}
          y={milestone.labelOffset.y}
          textAnchor={milestone.labelAnchor}
          aria-hidden="true"
        >
          {milestone.shortLabel ?? milestone.title}
        </text>
      </g>
    </g>
  );
}

interface MobileJourneyProps {
  readonly selectedChapterId: JourneyChapterId | null;
  readonly selectedMilestoneId: JourneyMilestoneId | null;
  readonly onSelectChapter: (id: JourneyChapterId) => void;
  readonly onSelectMilestone: (id: JourneyMilestoneId) => void;
  readonly onBackToChapter: () => void;
  readonly onBackToJourney: () => void;
  readonly registerChapter: (id: JourneyChapterId, element: HTMLButtonElement | null) => void;
  readonly registerHeading: (element: HTMLHeadingElement | null) => void;
}

function MobileJourney({
  selectedChapterId,
  selectedMilestoneId,
  onSelectChapter,
  onSelectMilestone,
  onBackToChapter,
  onBackToJourney,
  registerChapter,
  registerHeading,
}: MobileJourneyProps) {
  if (!selectedChapterId) {
    return (
      <section className={styles.mobileJourney} aria-labelledby="mobile-journey-title">
        <div className={styles.mobileHeading}>
          <p>Guided constellation</p>
          <h2 id="mobile-journey-title">Choose a chapter</h2>
        </div>
        <ol className={styles.mobileChapterList}>
          {journeyChapters.map((chapter, index) => (
            <li key={chapter.id}>
              <button
                ref={(element) => registerChapter(chapter.id, element)}
                className={styles.mobileChapterCard}
                type="button"
                data-mobile-chapter={chapter.id}
                aria-expanded="false"
                onClick={() => onSelectChapter(chapter.id)}
              >
                <span className={styles.mobileIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {chapter.date ? <time>{chapter.date}</time> : <span className={styles.mobileNow}>Now</span>}
                <strong>{chapter.title}</strong>
                <span>{chapter.subtitle}</span>
                <small>{chapter.summary}</small>
                <span className={styles.mobileExplore} aria-hidden="true">
                  Explore chapter →
                </span>
              </button>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const chapter = getJourneyChapter(selectedChapterId);
  const milestones = getChapterMilestones(selectedChapterId);

  return (
    <section className={styles.mobileJourney} aria-labelledby="mobile-chapter-title">
      <div className={styles.mobileBackRow}>
        {selectedMilestoneId ? (
          <button type="button" onClick={onBackToChapter}>
            ← CHAPTER
          </button>
        ) : null}
        <button type="button" onClick={onBackToJourney}>
          ← JOURNEY
        </button>
      </div>
      <header className={styles.mobileChapterHeader}>
        <p>Chapter {String(journeyChapters.findIndex((item) => item.id === chapter.id) + 1).padStart(2, "0")}</p>
        <h2 ref={registerHeading} id="mobile-chapter-title" tabIndex={-1}>
          {chapter.title}
        </h2>
        <span>{chapter.subtitle}</span>
        <p>{chapter.summary}</p>
      </header>
      <ol className={styles.mobileMilestoneList} aria-label={`${chapter.title} milestones`}>
        {milestones.map((milestone) => {
          const selected = milestone.id === selectedMilestoneId;
          const detailsId = `mobile-${milestone.id}-details`;
          return (
            <li key={milestone.id}>
              <button
                className={classes(
                  styles.mobileMilestoneCard,
                  milestone.importance === "prominent" && styles.mobileMilestoneProminent,
                  selected && styles.mobileMilestoneSelected,
                )}
                type="button"
                data-mobile-milestone={milestone.id}
                aria-pressed={selected}
                aria-controls={selected ? detailsId : undefined}
                aria-label={`${milestone.title}${milestone.date ? `, ${milestone.date}` : ""}. ${milestone.summary}`}
                onClick={() => onSelectMilestone(milestone.id)}
              >
                <span className={styles.mobileMilestoneStar} aria-hidden="true" />
                <span>
                  {milestone.date ? <time>{milestone.date}</time> : null}
                  <strong>{milestone.title}</strong>
                </span>
              </button>
              {selected ? (
                <div className={styles.mobileMilestoneDetail} id={detailsId} role="region" aria-live="polite">
                  <p>{milestone.summary}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function JourneyConstellation() {
  const [selectedChapterId, setSelectedChapterId] = useState<JourneyChapterId | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<JourneyMilestoneId | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(true);
  const [cameraAnnouncement, setCameraAnnouncement] = useState("");
  const chapterRefs = useRef(new Map<JourneyChapterId, SVGGElement>());
  const milestoneRefs = useRef(new Map<JourneyMilestoneId, SVGGElement>());
  const mobileChapterRefs = useRef(new Map<JourneyChapterId, HTMLButtonElement>());
  const mobileChapterHeadingRef = useRef<HTMLHeadingElement>(null);
  const generatedId = useId().replaceAll(":", "");
  const mapTitleId = `${generatedId}-map-title`;
  const mapDescriptionId = `${generatedId}-map-description`;
  const satelliteGroupId = `${generatedId}-satellites`;
  const selectedChapter = selectedChapterId ? getJourneyMapChapter(selectedChapterId) : null;
  const selectedMilestone = selectedMilestoneId ? getJourneyMilestone(selectedMilestoneId) : null;
  const visibleMilestones = selectedChapterId ? getJourneyMapMilestones(selectedChapterId) : [];
  const satelliteConnections = selectedChapterId
    ? getJourneySatelliteConnections(selectedChapterId)
    : [];
  const clusterLabels = selectedChapterId ? getJourneyClusterLabels(selectedChapterId) : [];
  const selectedMapMilestone = selectedMilestoneId
    ? visibleMilestones.find((milestone) => milestone.id === selectedMilestoneId) ?? null
    : null;
  const activePoint: JourneyMapPoint | null = selectedMapMilestone?.point ?? selectedChapter?.point ?? null;
  const camera = useJourneyCamera(activePoint);
  const state = selectedMilestoneId ? "milestone" : selectedChapterId ? "chapter" : "overview";

  const isDesktop = () => window.matchMedia("(min-width: 821px)").matches;

  const focusChapter = (id: JourneyChapterId, withinOpenChapter = false) => {
    window.requestAnimationFrame(() => {
      if (isDesktop()) {
        chapterRefs.current.get(id)?.focus({ preventScroll: true });
        return;
      }
      if (withinOpenChapter) {
        mobileChapterHeadingRef.current?.focus({ preventScroll: true });
      } else {
        mobileChapterRefs.current.get(id)?.focus({ preventScroll: true });
      }
    });
  };

  const selectChapter = (id: JourneyChapterId) => {
    setSelectedChapterId(id);
    setSelectedMilestoneId(null);
    setDetailsVisible(true);
    if (!isDesktop()) {
      focusChapter(id, true);
    }
  };

  const selectMilestone = (id: JourneyMilestoneId) => {
    setSelectedMilestoneId(id);
    setDetailsVisible(true);
  };

  const backToChapter = () => {
    if (!selectedChapterId) {
      return;
    }
    setSelectedMilestoneId(null);
    setDetailsVisible(true);
    focusChapter(selectedChapterId, true);
  };

  const backToJourney = () => {
    if (!selectedChapterId) {
      return;
    }
    const chapterId = selectedChapterId;
    setSelectedMilestoneId(null);
    setSelectedChapterId(null);
    setDetailsVisible(true);
    focusChapter(chapterId);
  };

  const handleKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }
    if (event.key === "Escape" && selectedMilestoneId) {
      event.preventDefault();
      backToChapter();
    } else if (event.key === "Escape" && selectedChapterId) {
      event.preventDefault();
      backToJourney();
    } else if (isDesktop() && (event.key === "+" || event.key === "=")) {
      event.preventDefault();
      camera.zoomIn();
    } else if (isDesktop() && event.key === "-") {
      event.preventDefault();
      camera.zoomOut();
    } else if (isDesktop() && event.key === "0") {
      event.preventDefault();
      camera.fitJourney();
      setCameraAnnouncement("Journey camera fitted to the full map.");
    }
  };

  const focusActiveChapter = () => {
    if (!selectedChapter) {
      return;
    }
    camera.focusView(focusedMapView(selectedChapter));
    setCameraAnnouncement(`Camera focused on ${selectedChapter.title}.`);
  };

  return (
    <div
      className={styles.constellation}
      data-journey-state={state}
      data-camera-density={camera.density}
      data-animation-authority="journey-camera-raf"
      onKeyDownCapture={handleKeyboard}
    >
      <p className={styles.selectionAnnouncement} aria-live="polite">
        {selectedMilestone
          ? `Selected milestone ${selectedMilestone.title} within ${selectedChapter?.title}.`
          : selectedChapter
            ? `Opened ${selectedChapter.title} with ${visibleMilestones.length} milestones.`
            : "Journey overview. Seven chapters available."}
      </p>
      <p className={styles.selectionAnnouncement} aria-live="polite">
        {cameraAnnouncement}
      </p>

      <div className={styles.pathBar}>
        <nav className={styles.breadcrumb} aria-label="Journey path">
          <ol>
            <li>{selectedChapter ? "Journey" : <span aria-current="page">Journey overview</span>}</li>
            {selectedChapter ? (
              <li>{selectedMilestone ? selectedChapter.shortLabel : <span aria-current="page">{selectedChapter.shortLabel}</span>}</li>
            ) : null}
            {selectedMilestone ? (
              <li>
                <span aria-current="page">{selectedMilestone.title}</span>
              </li>
            ) : null}
          </ol>
        </nav>
        {selectedChapter ? (
          <div className={styles.mapControls} aria-label="Journey hierarchy controls">
            {selectedMilestone ? (
              <button type="button" onClick={backToChapter}>
                ← CHAPTER
              </button>
            ) : null}
            <button type="button" onClick={backToJourney}>
              ← JOURNEY
            </button>
          </div>
        ) : (
          <p className={styles.overviewHint}>SELECT A MAJOR STAR</p>
        )}
      </div>

      <section className={styles.mapPanel} aria-labelledby={mapTitleId}>
        <div className={styles.mapHeading}>
          <div>
            <p>Interactive constellation</p>
            <h2 id={mapTitleId}>{selectedChapter ? selectedChapter.title : "Seven connected chapters"}</h2>
          </div>
          <p id={mapDescriptionId}>
            {selectedChapter
              ? "Choose a satellite milestone. Escape steps back through the hierarchy."
              : "Choose a major star with a pointer, Enter, or Space to reveal its milestones."}
          </p>
        </div>
        <div className={styles.mapViewport} ref={camera.viewportRef}>
          <svg
            ref={camera.svgRef}
            className={styles.map}
            viewBox={`0 0 ${journeyMapViewBox.width} ${journeyMapViewBox.height}`}
            role="group"
            aria-labelledby={`${mapTitleId} ${mapDescriptionId}`}
            aria-label="Interactive Journey chapter map"
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
              d="M 45 610 C 240 520, 405 620, 560 435 S 905 285, 1120 42"
              aria-hidden="true"
            />
            <g aria-hidden="true">
              {journeyMapConnections.map((connection) => {
                const connected = selectedChapterId
                  ? connection.fromId === selectedChapterId || connection.toId === selectedChapterId
                  : true;
                return (
                  <path
                    className={classes(
                      styles.connection,
                      connected && styles.connectionActive,
                      selectedChapterId !== null && !connected && styles.connectionDimmed,
                    )}
                    d={connection.path}
                    stroke={`url(#${generatedId}-path)`}
                    key={connection.id}
                  />
                );
              })}
            </g>
            {selectedChapter ? (
              <g id={satelliteGroupId} role="group" aria-label={`${selectedChapter.title} milestones`}>
                <g aria-hidden="true">
                  {satelliteConnections.map((connection) => (
                    <path
                      className={classes(
                        styles.satelliteConnection,
                        selectedMilestoneId === connection.milestoneId && styles.satelliteConnectionSelected,
                        selectedMilestoneId !== null &&
                          selectedMilestoneId !== connection.milestoneId &&
                          styles.satelliteConnectionDimmed,
                      )}
                      d={connection.path}
                      key={connection.id}
                    />
                  ))}
                  {clusterLabels.map((cluster) => (
                    <text
                      className={styles.clusterLabel}
                      x={cluster.point.x}
                      y={cluster.point.y}
                      textAnchor={cluster.anchor}
                      key={cluster.id}
                    >
                      {cluster.label}
                    </text>
                  ))}
                </g>
                {visibleMilestones.map((milestone) => (
                  <MilestoneNode
                    milestone={milestone}
                    selectedMilestoneId={selectedMilestoneId}
                    onSelect={selectMilestone}
                    shouldSuppressPointerActivation={camera.consumeSuppressedNodeClick}
                    registerNode={(id, element) => {
                      if (element) {
                        milestoneRefs.current.set(id, element);
                      } else {
                        milestoneRefs.current.delete(id);
                      }
                    }}
                    key={milestone.id}
                  />
                ))}
              </g>
            ) : null}
            {journeyMapChapters.map((chapter) => (
              <ChapterNode
                chapter={chapter}
                selectedChapterId={selectedChapterId}
                controlsId={satelliteGroupId}
                onSelect={selectChapter}
                shouldSuppressPointerActivation={camera.consumeSuppressedNodeClick}
                registerNode={(id, element) => {
                  if (element) {
                    chapterRefs.current.set(id, element);
                  } else {
                    chapterRefs.current.delete(id);
                  }
                }}
                key={chapter.id}
              />
            ))}
          </svg>
          <div className={styles.cameraControls} data-camera-controls aria-label="Journey camera controls">
            <button
              type="button"
              onClick={camera.zoomIn}
              disabled={!camera.bounds.canZoomIn}
              aria-label="Zoom in"
              aria-keyshortcuts="+ ="
            >
              +
            </button>
            <button
              type="button"
              onClick={camera.zoomOut}
              disabled={!camera.bounds.canZoomOut}
              aria-label="Zoom out"
              aria-keyshortcuts="-"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => {
                camera.fitJourney();
                setCameraAnnouncement("Journey camera fitted to the full map.");
              }}
              disabled={!camera.bounds.canZoomOut}
              aria-label="Fit the full Journey map"
              aria-keyshortcuts="0"
            >
              FIT
            </button>
          </div>

          {selectedChapter && detailsVisible ? (
            <aside
              className={classes(
                styles.annotation,
                camera.annotationSide === "left" ? styles.annotationLeft : styles.annotationRight,
              )}
              data-map-annotation
              aria-live="polite"
              aria-label="Selected Journey detail"
            >
              {selectedMilestone ? (
                <article data-selected-milestone={selectedMilestone.id}>
                  <p>{selectedMilestone.importance === "prominent" ? "Prominent milestone" : "Milestone"}</p>
                  <div className={styles.annotationTitleRow}>
                    <h3>{selectedMilestone.title}</h3>
                    {selectedMilestone.date ? <time>{selectedMilestone.date}</time> : null}
                  </div>
                  <p>{selectedMilestone.summary}</p>
                </article>
              ) : (
                <article data-selected-chapter={selectedChapter.id}>
                  <p>Chapter {String(selectedChapter.sequence).padStart(2, "0")}</p>
                  <div className={styles.annotationTitleRow}>
                    <h3>{selectedChapter.title}</h3>
                    {selectedChapter.date ? <time>{selectedChapter.date}</time> : null}
                  </div>
                  <strong>{selectedChapter.subtitle}</strong>
                  <p>{selectedChapter.summary}</p>
                </article>
              )}
              <div className={styles.annotationControls}>
                <button type="button" onClick={focusActiveChapter}>
                  Focus chapter
                </button>
                <button type="button" onClick={() => setDetailsVisible(false)}>
                  Hide details
                </button>
              </div>
            </aside>
          ) : selectedChapter ? (
            <button
              className={classes(
                styles.annotationRestore,
                camera.annotationSide === "left" ? styles.annotationLeft : styles.annotationRight,
              )}
              type="button"
              data-map-annotation
              onClick={() => setDetailsVisible(true)}
            >
              Show details
            </button>
          ) : null}
        </div>
      </section>

      <MobileJourney
        selectedChapterId={selectedChapterId}
        selectedMilestoneId={selectedMilestoneId}
        onSelectChapter={selectChapter}
        onSelectMilestone={selectMilestone}
        onBackToChapter={backToChapter}
        onBackToJourney={backToJourney}
        registerChapter={(id, element) => {
          if (element) {
            mobileChapterRefs.current.set(id, element);
          } else {
            mobileChapterRefs.current.delete(id);
          }
        }}
        registerHeading={(element) => {
          mobileChapterHeadingRef.current = element;
        }}
      />
    </div>
  );
}
