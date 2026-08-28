import { useEffect, useLayoutEffect, useRef } from "react";
import {
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import {
  routeMetadata,
  type PrimaryRoute,
} from "../../data/routeMetadata";

interface ScrollPosition {
  readonly left: number;
  readonly top: number;
}

const scrollPositions = new Map<string, ScrollPosition>();
const canonicalOrigin = "https://freemankn.github.io";

function normalizedPath(pathname: string): PrimaryRoute | null {
  const normalized = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  return normalized in routeMetadata ? (normalized as PrimaryRoute) : null;
}

function setMetaContent(selector: string, content: string) {
  document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", content);
}

function setScrollPosition(position: ScrollPosition) {
  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(position.left, position.top);
  root.style.scrollBehavior = previousBehavior;
}

export function RouteEffects() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const previousPath = useRef(location.pathname);
  const isInitialRender = useRef(true);

  useEffect(() => {
    const path = normalizedPath(location.pathname) ?? "/";
    const metadata = routeMetadata[path];
    const canonicalUrl = `${canonicalOrigin}${path}`;

    document.title = metadata.title;
    setMetaContent('meta[name="description"]', metadata.description);
    setMetaContent('meta[property="og:title"]', metadata.title);
    setMetaContent('meta[property="og:description"]', metadata.description);
    setMetaContent('meta[property="og:url"]', canonicalUrl);
    setMetaContent('meta[name="twitter:title"]', metadata.title);
    setMetaContent('meta[name="twitter:description"]', metadata.description);
    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute("href", canonicalUrl);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/") {
      return;
    }

    const legacyRoutes: Record<string, PrimaryRoute> = {
      "#about": "/about",
      "#focus": "/focus",
      "#skills": "/skills",
      "#projects": "/projects",
      "#journey": "/journey",
      "#contact": "/contact",
    };
    const target = legacyRoutes[location.hash];
    if (target) {
      navigate(target, { replace: true });
    }
  }, [location.hash, location.pathname, navigate]);

  useLayoutEffect(() => {
    return () => {
      scrollPositions.set(location.key, {
        left: window.scrollX,
        top: window.scrollY,
      });
    };
  }, [location.key]);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const routeChanged = previousPath.current !== location.pathname;
    const frame = window.requestAnimationFrame(() => {
      const hashTarget = location.hash
        ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
        : null;

      if (hashTarget) {
        hashTarget.scrollIntoView({ block: "start" });
      } else if (navigationType === "POP") {
        const savedPosition = scrollPositions.get(location.key);
        setScrollPosition(savedPosition ?? { left: 0, top: 0 });
      } else {
        setScrollPosition({ left: 0, top: 0 });
      }

      if (!isInitialRender.current && routeChanged) {
        const focusTarget = hashTarget ?? document.querySelector<HTMLElement>("[data-route-heading]");
        focusTarget?.focus({ preventScroll: true });
      }

      previousPath.current = location.pathname;
      isInitialRender.current = false;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.key, location.pathname, navigationType]);

  return null;
}
