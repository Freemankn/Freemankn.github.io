import { useEffect, useState } from "react";

const navigationItems = [
  { label: "Home", href: "#home", sectionId: "home" },
  { label: "Focus", href: "#focus", sectionId: "focus" },
  { label: "Projects", href: "#projects", sectionId: "projects" },
  { label: "Journey", href: "#journey", sectionId: "journey" },
  { label: "Contact", href: "#contact", sectionId: "contact" },
] as const;

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = navigationItems
      .map(({ sectionId }) => document.getElementById(sectionId))
      .filter((section): section is HTMLElement => section !== null);
    let animationFrame = 0;

    const updateActiveSection = () => {
      const navigationHeight =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 76;
      const marker = window.scrollY + navigationHeight + window.innerHeight * 0.35;
      const currentSection = sections.reduce(
        (current, section) => (section.offsetTop <= marker ? section : current),
        sections[0],
      );
      if (currentSection) {
        setActiveSection(currentSection.id);
      }
      animationFrame = 0;
    };

    const queueUpdate = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(updateActiveSection);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
    window.addEventListener("hashchange", queueUpdate);
    return () => {
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
      window.removeEventListener("hashchange", queueUpdate);
      window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <nav className="navigation shell" aria-label="Primary navigation">
        <a className="brand" href="#home" onClick={closeMenu} aria-label="Freeman Nkouka, home">
          <span className="brand__mark" aria-hidden="true">
            FN
          </span>
          <span className="brand__label">AI4SE Researcher</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="primary-navigation"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <ul
          id="primary-navigation"
          className={`navigation__links${menuOpen ? " navigation__links--open" : ""}`}
        >
          {navigationItems.map(({ label, href, sectionId }) => (
            <li key={sectionId}>
              <a
                className={activeSection === sectionId ? "is-active" : undefined}
                href={href}
                aria-current={activeSection === sectionId ? "location" : undefined}
                onClick={() => {
                  setActiveSection(sectionId);
                  closeMenu();
                }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
