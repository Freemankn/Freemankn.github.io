import { AboutContent } from "../components/AboutContent/AboutContent";
import { PageIntro } from "../components/PageIntro/PageIntro";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  return (
    <article className={`route-page about-page ${styles.page}`}>
      <section className="page-hero shell" aria-labelledby="about-page-title">
        <PageIntro
          id="about-page-title"
          eyebrow="About"
          title="Who I am"
          description="I am Freeman Nkouka, an AI for Software Engineering researcher, software engineer, and systems builder based in Denver. I build ambitious systems that can be inspected, tested, and understood."
        />
      </section>
      <AboutContent />
    </article>
  );
}
