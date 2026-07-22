export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner shell">
        <a href="#home" className="footer__brand" aria-label="Back to the top">
          FN
        </a>
        <p>Designed and built by Freeman Nkouka.</p>
        <p>© {new Date().getFullYear()} · Denver, Colorado</p>
      </div>
    </footer>
  );
}
