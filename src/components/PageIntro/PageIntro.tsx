interface PageIntroProps {
  readonly id: string;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly signal?: string;
}

export function PageIntro({ id, eyebrow, title, description, signal }: PageIntroProps) {
  return (
    <header className="page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 id={id} data-route-heading tabIndex={-1}>
          {title}
        </h1>
      </div>
      <div className="page-intro__context">
        {signal ? <p className="page-intro__signal">{signal}</p> : null}
        <p>{description}</p>
      </div>
    </header>
  );
}
