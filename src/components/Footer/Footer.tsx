import { Link } from "react-router-dom";
import { FnShield } from "../FnShield/FnShield";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner shell">
        <Link to="/" className="footer__brand" aria-label="Freeman Nkouka — Home">
          <FnShield />
        </Link>
        <p>Designed and built by Freeman Nkouka.</p>
        <p>© {new Date().getFullYear()} · Denver, Colorado</p>
      </div>
    </footer>
  );
}
