import { useCallback, useEffect, useRef, useState } from "react";
import { journeyMapViewBox, type JourneyMapPoint } from "../../data/journeyMap";

export interface JourneyCameraView {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type JourneyCameraDensity = "overview" | "chapter" | "close";
export type JourneyAnnotationSide = "left" | "right";

interface CameraBounds {
  readonly canZoomIn: boolean;
  readonly canZoomOut: boolean;
}

interface PanGesture {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  lastX: number;
  lastY: number;
  moved: boolean;
}

interface PinchGesture {
  readonly startDistance: number;
  readonly startView: JourneyCameraView;
  readonly anchor: JourneyMapPoint;
}

interface CameraTween {
  readonly start: JourneyCameraView;
  readonly destination: JourneyCameraView;
  readonly startedAt: number;
  readonly duration: number;
}

const FIT_VIEW: JourneyCameraView = {
  x: 0,
  y: 0,
  width: journeyMapViewBox.width,
  height: journeyMapViewBox.height,
};

const MAX_ZOOM = 3.2;
const MIN_VIEW_WIDTH = journeyMapViewBox.width / MAX_ZOOM;
const MAP_ASPECT_RATIO = journeyMapViewBox.width / journeyMapViewBox.height;
const DRAG_THRESHOLD = 5;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function clampView(view: JourneyCameraView): JourneyCameraView {
  const width = clamp(view.width, MIN_VIEW_WIDTH, journeyMapViewBox.width);
  const height = width / MAP_ASPECT_RATIO;
  return {
    x: clamp(view.x, 0, journeyMapViewBox.width - width),
    y: clamp(view.y, 0, journeyMapViewBox.height - height),
    width,
    height,
  };
}

function interpolateView(from: JourneyCameraView, to: JourneyCameraView, progress: number) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    width: from.width + (to.width - from.width) * progress,
    height: from.height + (to.height - from.height) * progress,
  };
}

function densityWithHysteresis(
  current: JourneyCameraDensity,
  scale: number,
): JourneyCameraDensity {
  if (current === "overview") {
    return scale >= 1.36 ? "chapter" : "overview";
  }
  if (current === "chapter") {
    if (scale < 1.24) {
      return "overview";
    }
    return scale >= 2.18 ? "close" : "chapter";
  }
  return scale < 2.02 ? "chapter" : "close";
}

function pointerDistance(first: JourneyMapPoint, second: JourneyMapPoint) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function pointerMidpoint(first: JourneyMapPoint, second: JourneyMapPoint) {
  return {
    x: (first.x + second.x) / 2,
    y: (first.y + second.y) / 2,
  };
}

export function useJourneyCamera(activePoint: JourneyMapPoint | null) {
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<JourneyCameraView>(FIT_VIEW);
  const pendingViewRef = useRef<JourneyCameraView | null>(null);
  const tweenRef = useRef<CameraTween | null>(null);
  const animationFrameRef = useRef(0);
  const densityRef = useRef<JourneyCameraDensity>("overview");
  const boundsRef = useRef<CameraBounds>({ canZoomIn: true, canZoomOut: false });
  const annotationSideRef = useRef<JourneyAnnotationSide>("right");
  const activePointRef = useRef(activePoint);
  const panGestureRef = useRef<PanGesture | null>(null);
  const pinchGestureRef = useRef<PinchGesture | null>(null);
  const touchPointsRef = useRef(new Map<number, JourneyMapPoint>());
  const nodePressesRef = useRef(new Map<number, JourneyMapPoint>());
  const suppressNodeClickUntilRef = useRef(0);
  const [density, setDensity] = useState<JourneyCameraDensity>("overview");
  const [bounds, setBounds] = useState<CameraBounds>(boundsRef.current);
  const [annotationSide, setAnnotationSide] = useState<JourneyAnnotationSide>("right");

  activePointRef.current = activePoint;

  const updateCoarseState = useCallback((view: JourneyCameraView) => {
    const scale = journeyMapViewBox.width / view.width;
    const nextDensity = densityWithHysteresis(densityRef.current, scale);
    if (nextDensity !== densityRef.current) {
      densityRef.current = nextDensity;
      setDensity(nextDensity);
    }

    const nextBounds = {
      canZoomIn: view.width > MIN_VIEW_WIDTH + 0.5,
      canZoomOut: view.width < journeyMapViewBox.width - 0.5,
    };
    if (
      nextBounds.canZoomIn !== boundsRef.current.canZoomIn ||
      nextBounds.canZoomOut !== boundsRef.current.canZoomOut
    ) {
      boundsRef.current = nextBounds;
      setBounds(nextBounds);
    }

    const point = activePointRef.current;
    if (point) {
      const nextSide: JourneyAnnotationSide =
        point.x < view.x + view.width / 2 ? "right" : "left";
      if (nextSide !== annotationSideRef.current) {
        annotationSideRef.current = nextSide;
        setAnnotationSide(nextSide);
      }
    }
  }, []);

  const applyView = useCallback(
    (view: JourneyCameraView) => {
      const next = clampView(view);
      cameraRef.current = next;
      const svg = svgRef.current;
      if (svg) {
        svg.setAttribute("viewBox", `${next.x} ${next.y} ${next.width} ${next.height}`);
        svg.dataset.cameraScale = (journeyMapViewBox.width / next.width).toFixed(3);
        svg.dataset.cameraX = next.x.toFixed(2);
        svg.dataset.cameraY = next.y.toFixed(2);
      }
      updateCoarseState(next);
    },
    [updateCoarseState],
  );

  const runFrame = useCallback(
    (timestamp: number) => {
      animationFrameRef.current = 0;
      const tween = tweenRef.current;
      if (tween) {
        const progress = Math.min((timestamp - tween.startedAt) / tween.duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        applyView(interpolateView(tween.start, tween.destination, eased));
        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(runFrame);
        } else {
          tweenRef.current = null;
        }
        return;
      }

      const pending = pendingViewRef.current;
      if (pending) {
        pendingViewRef.current = null;
        applyView(pending);
      }
    },
    [applyView],
  );

  const requestFrame = useCallback(() => {
    if (!animationFrameRef.current) {
      animationFrameRef.current = window.requestAnimationFrame(runFrame);
    }
  }, [runFrame]);

  const queueManualView = useCallback(
    (view: JourneyCameraView) => {
      tweenRef.current = null;
      pendingViewRef.current = clampView(view);
      requestFrame();
    },
    [requestFrame],
  );

  const workingView = useCallback(
    () => pendingViewRef.current ?? cameraRef.current,
    [],
  );

  const clientToWorld = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) {
      return null;
    }
    const matrix = svg.getScreenCTM();
    if (!matrix) {
      return null;
    }
    return new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  }, []);

  const zoomBy = useCallback(
    (factor: number, clientPoint?: JourneyMapPoint) => {
      const view = workingView();
      const svg = svgRef.current;
      let worldPoint: JourneyMapPoint = {
        x: view.x + view.width / 2,
        y: view.y + view.height / 2,
      };
      if (clientPoint) {
        worldPoint = clientToWorld(clientPoint.x, clientPoint.y) ?? worldPoint;
      } else if (svg) {
        const rectangle = svg.getBoundingClientRect();
        worldPoint =
          clientToWorld(rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2) ??
          worldPoint;
      }

      const nextWidth = clamp(view.width * factor, MIN_VIEW_WIDTH, journeyMapViewBox.width);
      const nextHeight = nextWidth / MAP_ASPECT_RATIO;
      const horizontalRatio = (worldPoint.x - view.x) / view.width;
      const verticalRatio = (worldPoint.y - view.y) / view.height;
      queueManualView({
        x: worldPoint.x - horizontalRatio * nextWidth,
        y: worldPoint.y - verticalRatio * nextHeight,
        width: nextWidth,
        height: nextHeight,
      });
    },
    [clientToWorld, queueManualView, workingView],
  );

  const animateTo = useCallback(
    (destination: JourneyCameraView) => {
      const next = clampView(destination);
      pendingViewRef.current = null;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        tweenRef.current = null;
        applyView(next);
        return;
      }
      tweenRef.current = {
        start: cameraRef.current,
        destination: next,
        startedAt: performance.now(),
        duration: 440,
      };
      requestFrame();
    },
    [applyView, requestFrame],
  );

  const fitJourney = useCallback(() => animateTo(FIT_VIEW), [animateTo]);
  const focusView = useCallback((view: JourneyCameraView) => animateTo(view), [animateTo]);

  const consumeSuppressedNodeClick = useCallback(() => {
    return performance.now() < suppressNodeClickUntilRef.current;
  }, []);

  useEffect(() => {
    updateCoarseState(cameraRef.current);
  }, [activePoint, updateCoarseState]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return undefined;
    }

    const isInteractiveNode = (target: EventTarget | null) =>
      target instanceof Element &&
      Boolean(target.closest("[data-journey-chapter], [data-journey-milestone]"));
    const isOverlay = (target: EventTarget | null) =>
      target instanceof Element &&
      Boolean(target.closest("[data-camera-controls], [data-map-annotation]"));

    const beginPinch = () => {
      const points = [...touchPointsRef.current.values()];
      const first = points[0];
      const second = points[1];
      if (!first || !second) {
        return;
      }
      const midpoint = pointerMidpoint(first, second);
      const anchor = clientToWorld(midpoint.x, midpoint.y);
      if (!anchor) {
        return;
      }
      pinchGestureRef.current = {
        startDistance: Math.max(pointerDistance(first, second), 1),
        startView: cameraRef.current,
        anchor,
      };
      panGestureRef.current = null;
      viewport.dataset.cameraDragging = "true";
      suppressNodeClickUntilRef.current = performance.now() + 350;
    };

    const handleWheel = (event: WheelEvent) => {
      if (isOverlay(event.target) || viewport.getClientRects().length === 0) {
        return;
      }
      event.preventDefault();
      const modeMultiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? viewport.clientHeight
          : 1;
      const normalizedDelta = event.deltaY * modeMultiplier;
      const factor = clamp(Math.exp(normalizedDelta * 0.0015), 0.76, 1.26);
      zoomBy(factor, { x: event.clientX, y: event.clientY });
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (isOverlay(event.target) || (event.pointerType !== "touch" && event.button !== 0)) {
        return;
      }
      const point = { x: event.clientX, y: event.clientY };
      if (event.pointerType === "touch") {
        touchPointsRef.current.set(event.pointerId, point);
        if (touchPointsRef.current.size === 2) {
          for (const pointerId of touchPointsRef.current.keys()) {
            viewport.setPointerCapture(pointerId);
          }
          beginPinch();
          return;
        }
      }

      if (isInteractiveNode(event.target)) {
        nodePressesRef.current.set(event.pointerId, point);
        return;
      }

      viewport.setPointerCapture(event.pointerId);
      panGestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        moved: false,
      };
    };

    const handlePointerMove = (event: PointerEvent) => {
      const nodePress = nodePressesRef.current.get(event.pointerId);
      if (nodePress && pointerDistance(nodePress, { x: event.clientX, y: event.clientY }) > DRAG_THRESHOLD) {
        suppressNodeClickUntilRef.current = performance.now() + 250;
      }

      if (event.pointerType === "touch" && touchPointsRef.current.has(event.pointerId)) {
        touchPointsRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      }

      const pinch = pinchGestureRef.current;
      if (pinch && touchPointsRef.current.size >= 2) {
        const points = [...touchPointsRef.current.values()];
        const first = points[0];
        const second = points[1];
        if (!first || !second) {
          return;
        }
        const midpoint = pointerMidpoint(first, second);
        const distance = Math.max(pointerDistance(first, second), 1);
        const width = clamp(
          pinch.startView.width * (pinch.startDistance / distance),
          MIN_VIEW_WIDTH,
          journeyMapViewBox.width,
        );
        const height = width / MAP_ASPECT_RATIO;
        const rectangle = viewport.getBoundingClientRect();
        const horizontalRatio = clamp((midpoint.x - rectangle.left) / rectangle.width, 0, 1);
        const verticalRatio = clamp((midpoint.y - rectangle.top) / rectangle.height, 0, 1);
        queueManualView({
          x: pinch.anchor.x - horizontalRatio * width,
          y: pinch.anchor.y - verticalRatio * height,
          width,
          height,
        });
        return;
      }

      const pan = panGestureRef.current;
      if (!pan || pan.pointerId !== event.pointerId) {
        return;
      }
      const distanceFromStart = Math.hypot(event.clientX - pan.startX, event.clientY - pan.startY);
      if (!pan.moved && distanceFromStart <= DRAG_THRESHOLD) {
        return;
      }
      pan.moved = true;
      viewport.dataset.cameraDragging = "true";
      const view = workingView();
      const rectangle = viewport.getBoundingClientRect();
      const deltaX = event.clientX - pan.lastX;
      const deltaY = event.clientY - pan.lastY;
      pan.lastX = event.clientX;
      pan.lastY = event.clientY;
      queueManualView({
        ...view,
        x: view.x - (deltaX / rectangle.width) * view.width,
        y: view.y - (deltaY / rectangle.height) * view.height,
      });
    };

    const finishPointer = (event: PointerEvent) => {
      const pan = panGestureRef.current;
      if (pan?.pointerId === event.pointerId) {
        panGestureRef.current = null;
      }
      nodePressesRef.current.delete(event.pointerId);
      touchPointsRef.current.delete(event.pointerId);
      if (touchPointsRef.current.size < 2) {
        pinchGestureRef.current = null;
      }
      if (!panGestureRef.current && !pinchGestureRef.current) {
        delete viewport.dataset.cameraDragging;
      }
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    viewport.addEventListener("pointerdown", handlePointerDown);
    viewport.addEventListener("pointermove", handlePointerMove);
    viewport.addEventListener("pointerup", finishPointer);
    viewport.addEventListener("pointercancel", finishPointer);
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
      viewport.removeEventListener("pointerdown", handlePointerDown);
      viewport.removeEventListener("pointermove", handlePointerMove);
      viewport.removeEventListener("pointerup", finishPointer);
      viewport.removeEventListener("pointercancel", finishPointer);
    };
  }, [clientToWorld, queueManualView, workingView, zoomBy]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    svgRef,
    viewportRef,
    density,
    bounds,
    annotationSide,
    zoomIn: () => zoomBy(0.8),
    zoomOut: () => zoomBy(1.25),
    fitJourney,
    focusView,
    consumeSuppressedNodeClick,
  };
}
