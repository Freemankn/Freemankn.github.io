import { AboutContent } from "../components/AboutContent/AboutContent";
import { PageIntro } from "../components/PageIntro/PageIntro";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  return (
    <article className={`route-page about-page ${styles.page}`}>
      <section className="page-hero shell" aria-labelledby="about-page-title">
        <PageIntro
          id="about-page-title"
          eyebrow="About Freeman"
          title="Engineering ambition, grounded in people and evidence."
          description="Computer science, applied mathematics, teaching, community, and a systems mindset shape how I approach reliable human–AI software."
          signal="Denver · Notre Dame · AI4SE"
        />
      </section>
      <AboutContent />
    </article>
  );
}
