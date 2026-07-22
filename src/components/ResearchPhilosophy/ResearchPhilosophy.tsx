export function ResearchPhilosophy() {
  return (
    <section className="philosophy section" id="philosophy" aria-labelledby="philosophy-title">
      <div className="philosophy__panel shell">
        <div className="philosophy__diagram" aria-hidden="true">
          <svg viewBox="0 0 260 360">
            <path d="M46 45h76v66H75v74h113v71h-66v63" />
            <path d="m188 185 30-31m-96 165-39-32M46 45 20 72" />
            <circle cx="46" cy="45" r="9" />
            <circle cx="75" cy="111" r="7" />
            <circle cx="188" cy="185" r="10" />
            <circle cx="122" cy="319" r="9" />
            <circle cx="218" cy="154" r="5" />
            <circle cx="83" cy="287" r="5" />
            <circle cx="20" cy="72" r="5" />
          </svg>
          <span>vision</span>
          <span>failure modes</span>
          <span>controls</span>
        </div>
        <div className="philosophy__content">
          <p className="eyebrow">Research philosophy</p>
          <span className="philosophy__quote-mark" aria-hidden="true">
            “
          </span>
          <h2 id="philosophy-title">
            I am interested in ambitious AI systems, but I approach them as an optimistic
            realist: preserve the vision, understand the failure modes, and design controls that
            make the vision achievable.
          </h2>
          <p className="philosophy__signature">Freeman Nkouka · AI4SE</p>
        </div>
      </div>
    </section>
  );
}
