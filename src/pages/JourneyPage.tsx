import { JourneyConstellation } from "../components/JourneyConstellation/JourneyConstellation";
import { PageIntro } from "../components/PageIntro/PageIntro";
import { journeyMapNodes } from "../data/journeyMap";

export function JourneyPage() {
  return (
    <article className="route-page journey-page">
      <section className="page-hero shell" aria-labelledby="journey-page-title">
        <PageIntro
          id="journey-page-title"
          eyebrow="Journey constellation"
          title="A connected path from early foundations to an AI4SE direction."
          description="Explore Freeman's education, research, teaching, community, and industry milestones as one chronological system. Select any point for the existing record behind it."
          signal={`${journeyMapNodes.length} connected milestones`}
        />
      </section>

      <section className="section" aria-label="Interactive journey constellation">
        <div className="shell">
          <JourneyConstellation />
        </div>
      </section>
    </article>
  );
}
