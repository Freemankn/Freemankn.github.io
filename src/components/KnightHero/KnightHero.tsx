import { useEffect, useRef, useState } from "react";

const fragmentCount = 5;

export function KnightHero() {
  const [isSlashing, setIsSlashing] = useState(false);
  const [isPortraitVisible, setIsPortraitVisible] = useState(true);
  const portraitRef = useRef<HTMLButtonElement>(null);

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

  const activateSlash = () => {
    if (!isSlashing) {
      setIsSlashing(true);
    }
  };

  return (
    <section className="hero section" id="home" aria-labelledby="hero-title">
      <div className="hero__layout shell">
        <div className="hero__content">
          <p className="eyebrow hero__eyebrow">
            <span className="status-pulse" aria-hidden="true" />
            AI for Software Engineering
          </p>
          <h1 id="hero-title">Freeman Nkouka</h1>
          <p className="hero__role">AI4SE Researcher · Software Engineer · Systems Builder</p>
          <p className="hero__thesis">
            I study how humans and AI can build software more reliably.
          </p>
          <p className="hero__supporting">
            I design research systems, developer tools, and interactive experiences that turn
            ambitious ideas into practical software.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#projects">
              Explore My Work
              <span aria-hidden="true">↘</span>
            </a>
            <a className="button button--secondary" href="#contact">
              Contact Me
            </a>
          </div>
          <div className="hero__signal" aria-label="Research themes">
            <span>Human–AI systems</span>
            <span>Architecture</span>
            <span>Developer tools</span>
          </div>
        </div>

        <div className="portrait-stage">
          <div className="portrait-stage__coordinates" aria-hidden="true">
            <span>41.7032° N</span>
            <span>AI4SE / 01</span>
          </div>
          <button
            ref={portraitRef}
            className={`portrait-control${isSlashing ? " is-slashing" : ""}${isPortraitVisible ? "" : " is-paused"}`}
            type="button"
            onClick={activateSlash}
            aria-label="Activate the energy slash effect on Freeman Nkouka's knight portrait"
            aria-describedby="portrait-hint"
          >
            <span className="portrait-aura" aria-hidden="true" />
            <span className="portrait-orbit portrait-orbit--outer" aria-hidden="true" />
            <span className="portrait-orbit portrait-orbit--inner" aria-hidden="true" />
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
            <span className="portrait-name" aria-hidden="true">
              <span className="portrait-name__base">Freeman Nkouka</span>
              <span className="portrait-name__slice portrait-name__slice--upper">
                Freeman Nkouka
              </span>
              <span className="portrait-name__slice portrait-name__slice--lower">
                Freeman Nkouka
              </span>
            </span>
            <span
              className="energy-slash"
              aria-hidden="true"
              onAnimationEnd={() => setIsSlashing(false)}
            />
            <span className="portrait-flash" aria-hidden="true" />
            <span className="energy-fragments" aria-hidden="true">
              {Array.from({ length: fragmentCount }, (_, index) => (
                <span className={`energy-fragment energy-fragment--${index + 1}`} key={index} />
              ))}
            </span>
          </button>
          <p className="portrait-stage__hint" id="portrait-hint">
            <span aria-hidden="true">◇</span> Activate the portrait
          </p>
        </div>
      </div>
    </section>
  );
}
