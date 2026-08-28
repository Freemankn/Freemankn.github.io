import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { contactDetails } from "../../data/contact";
import { capabilities, homeStatistics } from "../../data/home";
import "./KnightHero.css";

type ConstellationPhase = "closed" | "opening" | "open" | "closing";
type SigilIconName = "scholar" | "strategist" | "ai";

interface IdentitySigil {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly icon: SigilIconName;
  readonly path: "/about" | "/journey" | "/focus";
  readonly accessibleLabel: string;
}

type SigilStyle = CSSProperties & {
  "--sigil-index": number;
};

const identitySigils = [
  {
    id: "scholar",
    title: "Notre Dame Scholar",
    description: "Education, research, mathematics, computer science, and teaching.",
    icon: "scholar",
    path: "/journey",
    accessibleLabel: "Explore Freeman Nkouka's Notre Dame scholar journey",
  },
  {
    id: "strategist",
    title: "Gamer and Strategist",
    description: "Gaming, strategic thinking, creativity, and systems thinking.",
    icon: "strategist",
    path: "/about",
    accessibleLabel: "Learn about Freeman Nkouka as a gamer and strategist",
  },
  {
    id: "ai",
    title: "AI Systems Thinker",
    description: "AI4SE, controlled dialogue, software architecture, and developer tools.",
    icon: "ai",
    path: "/focus",
    accessibleLabel: "Explore Freeman Nkouka's AI systems focus",
  },
] as const satisfies readonly IdentitySigil[];

function SigilIcon({ icon }: { readonly icon: SigilIconName }) {
  if (icon === "scholar") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 13.5c6.5-1.3 11.8.4 16 4.7 4.2-4.3 9.5-6 16-4.7v22c-6.4-1.2-11.7.3-16 4.5-4.3-4.2-9.6-5.7-16-4.5z" />
        <path d="M24 18.2V40M13 20h6.5m9 0H35M13 25h6.5m9 0H35" />
        <path d="m24 7 2 3.3L24 14l-2-3.7z" />
      </svg>
    );
  }

  if (icon === "strategist") {
    return (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M15 16h18c5.5 0 9.2 4.4 8 9.7l-2.3 9.6c-.8 3.4-5.2 4.3-7.2 1.5l-2.6-3.6h-9.8l-2.6 3.6c-2 2.8-6.4 1.9-7.2-1.5L7 25.7C5.8 20.4 9.5 16 15 16Z" />
        <path d="M15.5 23v7m-3.5-3.5h7M32.5 23.5h.1m3.4 4h.1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 9c-4.4-3.1-10.2.1-10.2 5.4-4.7.7-6.4 6.6-2.9 9.7-3.2 4.2-.2 10.3 5.2 10.3 1.1 5.2 7.9 6.3 10.5 1.7 4.6 2.5 10-.9 9.2-6.1 4.7-2.2 4.5-9-.3-10.8 1.3-5.2-4.2-9.5-8.6-6.5A6.8 6.8 0 0 0 24 9Z" />
      <path d="M24 10v27M16 18h8m-10 7h10m0 6h8m-8-13 5-5m-5 12 7-7m-7 13-5 5" />
      <circle cx="16" cy="18" r="1.8" />
      <circle cx="14" cy="25" r="1.8" />
      <circle cx="32" cy="31" r="1.8" />
      <circle cx="29" cy="13" r="1.8" />
    </svg>
  );
}

function activateLinkWithSpace(event: ReactKeyboardEvent<HTMLAnchorElement>) {
  if (event.key === " ") {
    event.preventDefault();
    event.currentTarget.click();
  }
}

export function KnightHero() {
  const [phase, setPhase] = useState<ConstellationPhase>("closed");
  const [isPortraitVisible, setIsPortraitVisible] = useState(true);
  const portraitRef = useRef<HTMLButtonElement>(null);
  const phaseRef = useRef<ConstellationPhase>("closed");
  const pendingCloseRef = useRef(false);
  const restoreFocusRef = useRef(false);
  const focusFrameRef = useRef(0);
  const location = useLocation();

  const moveToPhase = useCallback((nextPhase: ConstellationPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const requestClose = useCallback(
    (restoreFocus: boolean) => {
      const currentPhase = phaseRef.current;

      if (currentPhase === "opening") {
        pendingCloseRef.current = true;
        restoreFocusRef.current = restoreFocusRef.current || restoreFocus;
        return;
      }

      if (currentPhase !== "open") {
        return;
      }

      restoreFocusRef.current = restoreFocus;
      moveToPhase("closing");
    },
    [moveToPhase],
  );

  useEffect(() => {
    const portrait = portraitRef.current;
    if (!portrait) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsPortraitVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    observer.observe(portrait);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase === "closed" || phase === "closing") {
      return;
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose(true);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [phase, requestClose]);

  useEffect(() => {
    if (location.pathname !== "/" && phaseRef.current !== "closed") {
      pendingCloseRef.current = false;
      restoreFocusRef.current = false;
      moveToPhase("closed");
    }
  }, [location.pathname, moveToPhase]);

  useEffect(
    () => () => {
      phaseRef.current = "closed";
      pendingCloseRef.current = false;
      restoreFocusRef.current = false;
      window.cancelAnimationFrame(focusFrameRef.current);
    },
    [],
  );

  const toggleConstellation = () => {
    const currentPhase = phaseRef.current;

    if (currentPhase === "closed") {
      pendingCloseRef.current = false;
      restoreFocusRef.current = false;
      moveToPhase("opening");
      return;
    }

    if (currentPhase === "open") {
      restoreFocusRef.current = false;
      moveToPhase("closing");
    }
  };

  const completeTransition = () => {
    const currentPhase = phaseRef.current;

    if (currentPhase === "opening") {
      if (pendingCloseRef.current) {
        pendingCloseRef.current = false;
        moveToPhase("closing");
      } else {
        moveToPhase("open");
      }
      return;
    }

    if (currentPhase === "closing") {
      moveToPhase("closed");
      if (restoreFocusRef.current) {
        restoreFocusRef.current = false;
        focusFrameRef.current = window.requestAnimationFrame(() => portraitRef.current?.focus());
      }
    }
  };

  const cleanUpForNavigation = () => {
    phaseRef.current = "closed";
    pendingCloseRef.current = false;
    restoreFocusRef.current = false;
    setPhase("closed");
  };

  const constellationExpanded = phase === "opening" || phase === "open";
  const sigilsInteractive = phase === "open";
  const hintText =
    phase === "closed"
      ? "Reveal the identity constellation"
      : phase === "opening"
        ? "Revealing identity constellation"
        : phase === "open"
          ? "Activate again or press Escape to close"
          : "Closing identity constellation";
  const statusMessage =
    phase === "opening"
      ? "Opening Freeman Nkouka's identity constellation."
      : phase === "open"
        ? "Identity constellation open. Three identity links are available."
        : phase === "closing"
          ? "Closing identity constellation."
          : "";

  return (
    <section className="hero home-hero" aria-labelledby="hero-title">
      <div className="home-hero__composition shell">
        <div className="hero__layout">
          <div className="hero__content">
            <p className="eyebrow hero__eyebrow">
              <span className="status-pulse" aria-hidden="true" />
              AI4SE <span aria-hidden="true">·</span> Software Engineering{" "}
              <span aria-hidden="true">·</span> Systems Design
            </p>
            <h1 id="hero-title" data-route-heading tabIndex={-1}>
              <span>Engineer.</span>
              <span>Builder.</span>
              <span className="hero__headline-accent">Strategist.</span>
            </h1>
            <span className="hero__divider" aria-hidden="true" />
            <p className="hero__supporting">
              I build reliable software, intelligent developer tools, and human–AI systems that
              turn ambitious ideas into practical results.
            </p>
            <div className="hero__actions">
              <Link className="button button--primary" to="/projects">
                View My Work <span aria-hidden="true">→</span>
              </Link>
              <Link className="button button--secondary" to="/contact">
                Contact Me
              </Link>
            </div>
            <div className="hero__signal" aria-label="Research themes">
              <span>Human–AI systems</span>
              <span>Architecture</span>
              <span>Developer tools</span>
            </div>
          </div>

          <div
            className={`portrait-stage identity-constellation identity-constellation--${phase}${
              isPortraitVisible ? "" : " is-paused"
            }`}
            data-constellation-state={phase}
          >
            <div className="identity-portrait-shell">
              <div className="identity-nameplate">
                <svg
                  className="identity-nameplate__crest"
                  viewBox="0 0 440 104"
                  preserveAspectRatio="xMidYMid meet"
                  aria-hidden="true"
                  focusable="false"
                >
                  <defs>
                    <linearGradient id="nameplate-fill" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#201643" />
                      <stop offset="0.46" stopColor="#0b1020" />
                      <stop offset="0.54" stopColor="#0b1020" />
                      <stop offset="1" stopColor="#0b2848" />
                    </linearGradient>
                    <linearGradient id="nameplate-rim" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#8b5cf6" />
                      <stop offset="0.24" stopColor="#c7d2e0" />
                      <stop offset="0.5" stopColor="#f4f7ff" />
                      <stop offset="0.76" stopColor="#c7d2e0" />
                      <stop offset="1" stopColor="#4da3ff" />
                    </linearGradient>
                  </defs>
                  <path
                    className="identity-nameplate__aura"
                    d="M18 91 42 66Q88 27 168 22 220 5 272 22q80 5 126 44l24 25q-101-15-202-15T18 91Z"
                  />
                  <path
                    className="identity-nameplate__plate"
                    d="M22 89 46 67Q91 31 171 26 220 11 269 26q80 5 125 41l24 22q-99-13-198-13T22 89Z"
                  />
                  <path
                    className="identity-nameplate__rim"
                    d="M22 89 46 67Q91 31 171 26 220 11 269 26q80 5 125 41l24 22q-99-13-198-13T22 89Z"
                  />
                  <path
                    className="identity-nameplate__inner-rim"
                    d="M45 81q89-16 175-16t175 16M58 65q44-29 116-34 46-14 92 0 72 5 116 34"
                  />
                  <g className="identity-nameplate__fleur" transform="translate(220 16) scale(.58)">
                    <path d="M0-13c-6 7-8 12-7 17 1 4 3 7 7 10 4-3 6-6 7-10 1-5-1-10-7-17Zm-5 25c-6-9-14-12-23-8 8 3 12 8 13 16h-8c3 6 8 9 17 8l2 8h8l2-8c9 1 14-2 17-8h-8c1-8 5-13 13-16-9-4-17-1-23 8l-5 7-5-7Z" />
                  </g>
                </svg>
                <span className="identity-nameplate__text">Freeman Nkouka</span>
              </div>

              <button
                ref={portraitRef}
                className={`portrait-control${isPortraitVisible ? "" : " is-paused"}`}
                type="button"
                onClick={toggleConstellation}
                aria-label={
                  constellationExpanded
                    ? "Close Freeman Nkouka's identity constellation"
                    : "Reveal Freeman Nkouka's identity constellation"
                }
                aria-describedby="portrait-hint"
                aria-expanded={constellationExpanded}
                aria-controls="portrait-identity-sigils"
              >
                <span className="portrait-aura" aria-hidden="true" />
                <span className="portrait-orbit portrait-orbit--outer" aria-hidden="true" />
                <span className="portrait-orbit portrait-orbit--inner" aria-hidden="true" />

                <span className="identity-energy-orbit identity-energy-orbit--rear" aria-hidden="true">
                  <span className="identity-energy-boost">
                    <span className="identity-energy-track" />
                  </span>
                </span>

                <span className="portrait-frame">
                  <picture>
                    <source srcSet="/assets/knight-profile.webp" type="image/webp" />
                    <img
                      src="/assets/knight-profile.png"
                      width="1254"
                      height="1254"
                      alt="Stylized portrait of Freeman Nkouka in silver and navy knight armor"
                      fetchPriority="high"
                    />
                  </picture>
                  <span className="portrait-vignette" aria-hidden="true" />
                </span>

                <span className="identity-sword-glow" aria-hidden="true" />
                <span className="identity-energy-orbit identity-energy-orbit--front" aria-hidden="true">
                  <span className="identity-energy-boost">
                    <span className="identity-energy-track" />
                  </span>
                </span>
              </button>

              <ul
                className="identity-sigils"
                id="portrait-identity-sigils"
                aria-hidden={!sigilsInteractive}
              >
                {identitySigils.map((sigil, index) => (
                  <li
                    className={`identity-sigil identity-sigil--${sigil.id}`}
                    style={{ "--sigil-index": index } as SigilStyle}
                    key={sigil.id}
                  >
                    <Link
                      className="identity-sigil__link"
                      to={sigil.path}
                      aria-label={sigil.accessibleLabel}
                      tabIndex={sigilsInteractive ? 0 : -1}
                      onClick={cleanUpForNavigation}
                      onKeyDown={activateLinkWithSpace}
                    >
                      <span className="identity-sigil__icon">
                        <SigilIcon icon={sigil.icon} />
                      </span>
                      <span className="identity-sigil__copy">
                        <strong>{sigil.title}</strong>
                        <small>{sigil.description}</small>
                      </span>
                      <span className="identity-sigil__arrow" aria-hidden="true">
                        ↗
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <span
                className="identity-transition-sentinel"
                aria-hidden="true"
                onAnimationEnd={completeTransition}
              />
              <span className="identity-sr-only" aria-live="polite">
                {statusMessage}
              </span>
            </div>

            <p className="portrait-stage__hint" id="portrait-hint">
              <span aria-hidden="true">◇</span> {hintText}
            </p>
            <ul className="home-statistics" aria-label="Portfolio highlights">
              {homeStatistics.map((statistic) => (
                <li aria-label={statistic.accessibleLabel} key={statistic.label}>
                  <strong>{statistic.value}</strong>
                  <span>{statistic.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="home-hero__lower">
          <div className="capability-grid" aria-label="Core capabilities">
            {capabilities.map((capability, index) => (
              <Link className="capability-card" to={capability.path} key={capability.id}>
                <span className="capability-card__index" aria-hidden="true">
                  0{index + 1}
                </span>
                <span>
                  <strong>{capability.title}</strong>
                  <small>{capability.description}</small>
                </span>
                <span className="capability-card__arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>

          <nav className="home-socials" aria-label="Freeman Nkouka's social links">
            {contactDetails.links.map((link) => (
              <a
                href={link.href}
                aria-label={link.ariaLabel}
                target={link.opensInNewTab ? "_blank" : undefined}
                rel={link.opensInNewTab ? "noreferrer noopener" : undefined}
                key={link.id}
              >
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
