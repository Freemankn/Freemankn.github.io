import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FnShield } from "../FnShield/FnShield";

const navigationItems = [
  { label: "Home", path: "/", end: true },
  { label: "About", path: "/about", end: false },
  { label: "Focus", path: "/focus", end: false },
  { label: "Skills", path: "/skills", end: false },
  { label: "Projects", path: "/projects", end: false },
  { label: "Journey", path: "/journey", end: false },
  { label: "Contact", path: "/contact", end: false },
] as const;

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        window.requestAnimationFrame(() => toggleRef.current?.focus());
      }
    };
    const closeAtDesktopWidth = () => {
      if (window.matchMedia("(min-width: 821px)").matches) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeAtDesktopWidth);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeAtDesktopWidth);
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <nav className="navigation shell" aria-label="Primary navigation">
        <Link
          className="brand"
          to="/"
          aria-label="Freeman Nkouka — Home"
          onClick={() => setMenuOpen(false)}
        >
          <FnShield />
          <span className="brand__label">AI4SE Researcher</span>
        </Link>

        <button
          ref={toggleRef}
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
          {navigationItems.map(({ label, path, end }) => (
            <li key={path}>
              <NavLink
                className={({ isActive }) =>
                  [
                    isActive ? "is-active" : "",
                    label === "Contact" ? "navigation__contact-link" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
                end={end}
                to={path}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
