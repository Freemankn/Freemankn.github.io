import { JourneyConstellation } from "../components/JourneyConstellation/JourneyConstellation";
import { PageIntro } from "../components/PageIntro/PageIntro";
import { journeyChapters } from "../data/journey";

export function JourneyPage() {
  return (
    <article className="route-page journey-page">
      <section className="page-hero shell" aria-labelledby="journey-page-title">
        <PageIntro
          id="journey-page-title"
          eyebrow="Journey constellation"
          title="A connected path from early foundations to an AI4SE direction."
          description="Explore seven major chapters in Freeman's development. Open a chapter to discover the milestones that shaped each stage of the journey."
          signal={`${journeyChapters.length} major chapters`}
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
