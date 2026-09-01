import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  getRelatedSkillIds,
  skillCategoryById,
  skillConstellations,
  skillIconSpriteUrl,
  skillNodeById,
  skillNodes,
  skillRelationships,
  type SkillCategory,
  type SkillId,
  type SkillNode,
} from "../../data/technologies";
import styles from "./SkillsConstellation.module.css";

type InteractionOrigin = "keyboard" | "pointer";

interface Point {
  x: number;
  y: number;
}

interface Camera {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DESKTOP_CAMERA: Camera = { x: 0, y: 0, width: 1200, height: 720 };
const MOBILE_CATEGORY_CAMERA: Camera = { x: 0, y: 0, width: 420, height: 360 };

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function cameraDistance(first: Camera, second: Camera) {
  return (
    Math.abs(first.x - second.x) +
    Math.abs(first.y - second.y) +
    Math.abs(first.width - second.width) +
    Math.abs(first.height - second.height)
  );
}

function SkillIconGraphic({ node }: { readonly node: SkillNode }) {
  if (node.icon.kind === "asset") {
    return (
      <image
        className={styles.iconImage}
        href={node.icon.src}
        x="-17"
        y="-22"
        width="34"
        height="34"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      />
    );
  }

  return (
    <svg className={styles.iconImage} x="-17" y="-22" width="34" height="34" aria-hidden="true">
      <use href={`${skillIconSpriteUrl}#${node.icon.id}`} />
    </svg>
  );
}

export function SkillsConstellation() {
  const isMobile = useMediaQuery("(max-width: 820px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [focusedCategory, setFocusedCategory] = useState<SkillCategory | null>(null);
  const [selectedId, setSelectedId] = useState<SkillId | null>(null);
  const [hoveredId, setHoveredId] = useState<SkillId | null>(null);
  const [focusedId, setFocusedId] = useState<SkillId | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const backgroundRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef(new Map<SkillId, SVGGElement>());
  const centerRefs = useRef(new Map<SkillCategory, SVGGElement>());
  const lineRefs = useRef(new Map<string, SVGLineElement>());
  const categoryButtonRefs = useRef(new Map<SkillCategory, HTMLButtonElement>());
  const positionsRef = useRef(new Map<SkillId, Point>());
  const cameraRef = useRef<Camera>({ ...DESKTOP_CAMERA });
  const selectedRef = useRef<SkillId | null>(selectedId);
  const categoryRef = useRef<SkillCategory | null>(focusedCategory);
  const selectionOriginRef = useRef<InteractionOrigin>("pointer");
  const pendingNodeFocusRef = useRef<SkillId | null>(null);
  const pendingCategoryFocusRef = useRef<SkillCategory | null>(null);
  const pendingFirstNodeFocusRef = useRef<SkillId | null>(null);

  selectedRef.current = selectedId;
  categoryRef.current = focusedCategory;

  const selectedNode = selectedId ? skillNodeById.get(selectedId) ?? null : null;
  const relatedIds = useMemo(
    () => (selectedId ? getRelatedSkillIds(selectedId) : []),
    [selectedId],
  );
  const relatedSet = useMemo(() => new Set(relatedIds), [relatedIds]);
  const activeId = selectedId ?? hoveredId ?? focusedId;
  const activeRelatedSet = useMemo(
    () => new Set(activeId ? getRelatedSkillIds(activeId) : []),
    [activeId],
  );

  const renderedNodes = useMemo(() => {
    if (!isMobile) return skillNodes;
    if (selectedId) {
      const visible = new Set<SkillId>([selectedId, ...relatedIds]);
      return skillNodes.filter((node) => visible.has(node.id));
    }
    if (focusedCategory) {
      return skillNodes.filter((node) => node.category === focusedCategory);
    }
    return [];
  }, [focusedCategory, isMobile, relatedIds, selectedId]);

  const renderedNodeIds = useMemo(
    () => new Set(renderedNodes.map((node) => node.id)),
    [renderedNodes],
  );
  const renderedRelationships = useMemo(
    () =>
      skillRelationships.filter(
        (relationship) =>
          renderedNodeIds.has(relationship.source) && renderedNodeIds.has(relationship.target),
      ),
    [renderedNodeIds],
  );
  const renderedCategories = useMemo(() => {
    if (!isMobile) return skillConstellations;
    if (!focusedCategory) return [];
    const category = skillCategoryById.get(focusedCategory);
    return category ? [category] : [];
  }, [focusedCategory, isMobile]);

  useEffect(() => {
    const pendingCategory = pendingCategoryFocusRef.current;
    if (!isMobile || focusedCategory || !pendingCategory) return;
    pendingCategoryFocusRef.current = null;
    requestAnimationFrame(() => categoryButtonRefs.current.get(pendingCategory)?.focus());
  }, [focusedCategory, isMobile]);

  useEffect(() => {
    const firstNode = pendingFirstNodeFocusRef.current;
    if (!firstNode || !focusedCategory) return;
    pendingFirstNodeFocusRef.current = null;
    requestAnimationFrame(() => nodeRefs.current.get(firstNode)?.focus());
  }, [focusedCategory]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let animationFrame = 0;
    let previousTime = performance.now();
    const update = (now: number) => {
      const elapsed = now / 1000;
      const delta = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      const currentSelection = selectedRef.current;
      const currentCategory = categoryRef.current;
      const selectionRelations = currentSelection
        ? getRelatedSkillIds(currentSelection)
        : [];

      skillConstellations.forEach((constellation, constellationIndex) => {
        const selectedCategory = currentSelection
          ? skillNodeById.get(currentSelection)?.category
          : null;
        const speedMultiplier = reducedMotion
          ? 0
          : currentSelection
            ? constellation.id === selectedCategory
              ? 0.14
              : 0.035
            : 1;
        const baseCenterX = isMobile ? constellation.mobileCenterX : constellation.centerX;
        const baseCenterY = isMobile ? constellation.mobileCenterY : constellation.centerY;
        const centerX =
          baseCenterX +
          Math.sin(elapsed * constellation.driftSpeed + constellationIndex * 1.7) *
            constellation.driftX *
            speedMultiplier;
        const centerY =
          baseCenterY +
          Math.cos(elapsed * constellation.driftSpeed * 0.86 + constellationIndex) *
            constellation.driftY *
            speedMultiplier;

        const centerElement = centerRefs.current.get(constellation.id);
        centerElement?.setAttribute("transform", `translate(${centerX} ${centerY})`);

        constellation.nodes.forEach((node) => {
          const element = nodeRefs.current.get(node.id);
          if (!element) return;

          let x: number;
          let y: number;
          if (isMobile && currentSelection) {
            if (node.id === currentSelection) {
              x = 210;
              y = 158;
            } else {
              const relatedIndex = selectionRelations.indexOf(node.id);
              const angle =
                -Math.PI / 2 +
                (Math.PI * 2 * Math.max(relatedIndex, 0)) /
                  Math.max(selectionRelations.length, 1);
              x = 210 + Math.cos(angle) * 128;
              y = 170 + Math.sin(angle) * 88;
            }
          } else {
            const offsetX = isMobile ? node.mobileX : node.x;
            const offsetY = isMobile ? node.mobileY : node.y;
            const nodeMotion = reducedMotion ? 0 : speedMultiplier;
            x =
              centerX +
              offsetX +
              Math.cos(elapsed * node.orbitSpeed + node.phase) * node.orbitX * nodeMotion;
            y =
              centerY +
              offsetY +
              Math.sin(elapsed * node.orbitSpeed * 0.91 + node.phase) *
                node.orbitY *
                nodeMotion;
          }

          positionsRef.current.set(node.id, { x, y });
          element.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
          element.dataset.position = `${x.toFixed(2)},${y.toFixed(2)}`;
        });
      });

      renderedRelationships.forEach((relationship) => {
        const line = lineRefs.current.get(relationship.id);
        const source = positionsRef.current.get(relationship.source);
        const target = positionsRef.current.get(relationship.target);
        if (!line || !source || !target) return;
        line.setAttribute("x1", source.x.toFixed(2));
        line.setAttribute("y1", source.y.toFixed(2));
        line.setAttribute("x2", target.x.toFixed(2));
        line.setAttribute("y2", target.y.toFixed(2));
      });

      if (backgroundRef.current) {
        const backgroundSpeed = currentSelection ? 0.035 : 1;
        backgroundRef.current.setAttribute(
          "transform",
          `translate(${(Math.sin(elapsed * 0.055) * 6 * backgroundSpeed).toFixed(2)} ${(Math.cos(elapsed * 0.047) * 4 * backgroundSpeed).toFixed(2)})`,
        );
      }

      let targetCamera = isMobile ? MOBILE_CATEGORY_CAMERA : DESKTOP_CAMERA;
      if (currentSelection) {
        const selectedPosition = positionsRef.current.get(currentSelection);
        if (selectedPosition) {
          targetCamera = isMobile
            ? { x: 10, y: 10, width: 400, height: 310 }
            : {
                x: selectedPosition.x - 225,
                y: selectedPosition.y - 165,
                width: 450,
                height: 330,
              };
        }
      } else if (isMobile && currentCategory) {
        targetCamera = MOBILE_CATEGORY_CAMERA;
      }

      const camera = cameraRef.current;
      if (reducedMotion) {
        Object.assign(camera, targetCamera);
      } else {
        const blend = 1 - Math.exp(-delta * 5.2);
        camera.x += (targetCamera.x - camera.x) * blend;
        camera.y += (targetCamera.y - camera.y) * blend;
        camera.width += (targetCamera.width - camera.width) * blend;
        camera.height += (targetCamera.height - camera.height) * blend;
      }
      svg.setAttribute(
        "viewBox",
        `${camera.x.toFixed(2)} ${camera.y.toFixed(2)} ${camera.width.toFixed(2)} ${camera.height.toFixed(2)}`,
      );
      svg.dataset.cameraState = currentSelection ? "selected" : currentCategory ? "category" : "overview";

      const pendingFocus = pendingNodeFocusRef.current;
      if (
        pendingFocus &&
        !currentSelection &&
        cameraDistance(camera, isMobile ? MOBILE_CATEGORY_CAMERA : DESKTOP_CAMERA) < 1.5
      ) {
        pendingNodeFocusRef.current = null;
        nodeRefs.current.get(pendingFocus)?.focus();
      }

      if (!reducedMotion && !document.hidden) {
        animationFrame = requestAnimationFrame(update);
      }
    };

    const resume = () => {
      if (document.hidden || reducedMotion) return;
      cancelAnimationFrame(animationFrame);
      previousTime = performance.now();
      animationFrame = requestAnimationFrame(update);
    };
    document.addEventListener("visibilitychange", resume);
    update(performance.now());

    return () => {
      cancelAnimationFrame(animationFrame);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [focusedCategory, isMobile, reducedMotion, renderedRelationships]);

  const selectNode = (id: SkillId, origin: InteractionOrigin) => {
    if (selectedId === id) {
      dismissNode(origin);
      return;
    }
    selectionOriginRef.current = origin;
    if (isMobile) {
      const nodeCategory = skillNodeById.get(id)?.category;
      if (nodeCategory) setFocusedCategory(nodeCategory);
    }
    setSelectedId(id);
  };

  const dismissNode = (origin: InteractionOrigin) => {
    if (!selectedId) return;
    const shouldRestore = selectionOriginRef.current === "keyboard" && origin === "keyboard";
    const selectedCategory = skillNodeById.get(selectedId)?.category ?? null;
    if (shouldRestore) {
      if (isMobile && selectedCategory) pendingCategoryFocusRef.current = selectedCategory;
      else pendingNodeFocusRef.current = selectedId;
    }
    setSelectedId(null);
    if (isMobile) setFocusedCategory(null);
  };

  const dismissCategory = (origin: InteractionOrigin) => {
    if (!focusedCategory) return;
    if (origin === "keyboard") pendingCategoryFocusRef.current = focusedCategory;
    setFocusedCategory(null);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedRef.current) {
        event.preventDefault();
        dismissNode("keyboard");
      } else if (isMobile && categoryRef.current) {
        event.preventDefault();
        dismissCategory("keyboard");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const activateCategory = (category: SkillCategory, origin: InteractionOrigin) => {
    if (isMobile) cameraRef.current = { ...MOBILE_CATEGORY_CAMERA };
    setFocusedCategory(category);
    if (origin === "keyboard") {
      pendingFirstNodeFocusRef.current = skillCategoryById.get(category)?.nodes[0]?.id ?? null;
    }
  };

  const onNodeKeyDown = (event: ReactKeyboardEvent<SVGGElement>, id: SkillId) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    selectNode(id, "keyboard");
  };

  const onCanvasClick = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (event.target !== event.currentTarget && !(event.target as Element).hasAttribute("data-canvas")) {
      return;
    }
    if (selectedId) dismissNode("pointer");
    else if (isMobile && focusedCategory) dismissCategory("pointer");
  };

  const context = selectedNode ? (
    <div className={styles.annotation} aria-live="polite" data-selected-skill={selectedNode.id}>
      <p>{skillCategoryById.get(selectedNode.category)?.title}</p>
      <h2>{selectedNode.name}</h2>
      <span>{selectedNode.shortContext}</span>
      {relatedIds.length > 0 ? (
        <div className={styles.related}>
          <strong>Related</strong>
          <span>
            {relatedIds
              .map((id) => skillNodeById.get(id)?.name)
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      ) : null}
    </div>
  ) : null;

  if (isMobile && !focusedCategory && !selectedId) {
    return (
      <div className={styles.mobileOverview} data-mobile-category-overview>
        <p>Choose a constellation to explore its tools.</p>
        <div className={styles.categoryGrid}>
          {skillConstellations.map((constellation, index) => (
            <button
              key={constellation.id}
              ref={(element) => {
                if (element) categoryButtonRefs.current.set(constellation.id, element);
                else categoryButtonRefs.current.delete(constellation.id);
              }}
              type="button"
              data-category-control={constellation.id}
              onClick={(event) =>
                activateCategory(constellation.id, event.detail === 0 ? "keyboard" : "pointer")
              }
            >
              <span aria-hidden="true">0{index + 1}</span>
              <strong>{constellation.shortTitle}</strong>
              <small>{constellation.nodes.length} skills</small>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.constellation}${selectedId ? ` ${styles.isSelected}` : ""}`}
      data-animation-authority="skills-raf"
    >
      <div className={styles.toolbar}>
        {isMobile && focusedCategory && !selectedId ? (
          <button type="button" onClick={(event) => dismissCategory(event.detail === 0 ? "keyboard" : "pointer")}>
            ← All categories
          </button>
        ) : null}
        {selectedId ? (
          <button type="button" onClick={(event) => dismissNode(event.detail === 0 ? "keyboard" : "pointer")}>
            ← All skills
          </button>
        ) : null}
        {isMobile && focusedCategory ? (
          <span>{skillCategoryById.get(focusedCategory)?.shortTitle}</span>
        ) : null}
      </div>

      <div className={styles.scene}>
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={isMobile ? "0 0 420 360" : "0 0 1200 720"}
          role="group"
          aria-label="Interactive technical constellation map"
          data-camera-state={selectedId ? "selected" : focusedCategory ? "category" : "overview"}
          onClick={onCanvasClick}
        >
          <rect data-canvas="true" className={styles.canvas} x="-1000" y="-1000" width="3200" height="2800" />
          <g ref={backgroundRef} className={styles.background} aria-hidden="true">
            <path d="M-40 110h220l62 62h175l70-70h230l80 80h190l88-88h210" />
            <path d="M70 610h220l72-72h170l95 95h235l70-70h250" />
            {Array.from({ length: 22 }, (_, index) => (
              <circle
                key={index}
                cx={(index * 137 + 48) % 1190}
                cy={(index * 83 + 62) % 700}
                r={index % 4 === 0 ? 2.2 : 1.2}
              />
            ))}
          </g>

          <g className={styles.relationships} aria-hidden="true">
            {renderedRelationships.map((relationship) => {
              const emphasized =
                activeId === relationship.source ||
                activeId === relationship.target ||
                (selectedId !== null &&
                  ((relationship.source === selectedId && relatedSet.has(relationship.target)) ||
                    (relationship.target === selectedId && relatedSet.has(relationship.source))));
              return (
                <line
                  key={relationship.id}
                  ref={(element) => {
                    if (element) lineRefs.current.set(relationship.id, element);
                    else lineRefs.current.delete(relationship.id);
                  }}
                  className={emphasized ? styles.relationshipActive : undefined}
                  data-relationship={relationship.id}
                />
              );
            })}
          </g>

          {!isMobile
            ? renderedCategories.map((constellation) => (
                <g
                  key={constellation.id}
                  ref={(element) => {
                    if (element) centerRefs.current.set(constellation.id, element);
                    else centerRefs.current.delete(constellation.id);
                  }}
                  className={`${styles.categoryCenter}${
                    selectedNode && selectedNode.category !== constellation.id ? ` ${styles.categoryDimmed}` : ""
                  }`}
                  aria-hidden="true"
                >
                  <circle r="4" />
                  <circle r="13" />
                  <text y="-18">{constellation.shortTitle}</text>
                </g>
              ))
            : null}

          <g className={styles.nodes}>
            {renderedNodes.map((node) => {
              const selected = selectedId === node.id;
              const related = relatedSet.has(node.id);
              const activeRelated = activeRelatedSet.has(node.id);
              const dimmed = Boolean(selectedId && !selected && !related);
              return (
                <g
                  key={node.id}
                  ref={(element) => {
                    if (element) nodeRefs.current.set(node.id, element);
                    else nodeRefs.current.delete(node.id);
                  }}
                  className={`${styles.node}${selected ? ` ${styles.nodeSelected}` : ""}${
                    related || activeRelated ? ` ${styles.nodeRelated}` : ""
                  }${dimmed ? ` ${styles.nodeDimmed}` : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected}
                  aria-label={`${node.name}. ${skillCategoryById.get(node.category)?.title}. ${node.shortContext}`}
                  data-skill-node={node.name}
                  data-skill-id={node.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectNode(node.id, event.detail === 0 ? "keyboard" : "pointer");
                  }}
                  onKeyDown={(event) => onNodeKeyDown(event, node.id)}
                  onPointerEnter={() => setHoveredId(node.id)}
                  onPointerLeave={() => setHoveredId((current) => (current === node.id ? null : current))}
                  onFocus={() => setFocusedId(node.id)}
                  onBlur={() => setFocusedId((current) => (current === node.id ? null : current))}
                >
                  <g className={styles.nodeVisual}>
                    <circle className={styles.nodeGlow} r="29" />
                    <circle className={styles.nodeSurface} r="24" />
                    <SkillIconGraphic node={node} />
                    <rect className={styles.labelPlate} x="-42" y="20" width="84" height="20" rx="8" />
                    <text className={styles.nodeLabel} y="33" textAnchor="middle">
                      {node.shortLabel}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
        {!isMobile ? context : null}
      </div>
      {isMobile ? context : null}
    </div>
  );
}
