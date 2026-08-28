import worldBankPhoto from "../../../pictures/WorldBank Pic.jpg";
import {
  aboutDirection,
  aboutIntroduction,
  aboutPillars,
  optimisticRealism,
} from "../../data/about";
import { SectionHeading } from "../SectionHeading/SectionHeading";
import styles from "./AboutContent.module.css";

export function AboutContent() {
  return (
    <>
      <section className={`section ${styles.introduction}`} aria-labelledby="about-introduction-title">
        <div className={`shell ${styles.introductionGrid}`}>
          <figure className={styles.figure}>
            <div className={styles.imageFrame}>
              <img
                src={worldBankPhoto}
                alt="Freeman Nkouka at the 2024 World Bank Group and IMF Annual Meeting"
                width="900"
                height="1600"
                loading="lazy"
              />
            </div>
            <figcaption>
              <span>Community in practice</span>
              2024 World Bank Group &amp; IMF Annual Meeting · HETA
            </figcaption>
          </figure>

          <div className={styles.introductionCopy}>
            <p className="eyebrow">Introduction</p>
            <h2 id="about-introduction-title">I build to understand—and to make ideas useful.</h2>
            {aboutIntroduction.map((paragraph) => (
              <p className={styles.introductionParagraph} key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.pillars}`} aria-labelledby="about-pillars-title">
        <div className="shell">
          <SectionHeading
            id="about-pillars-title"
            eyebrow="What shapes the work"
            title="Four threads behind the systems I build."
            description="These are themes rather than a chronology: the academic, cultural, teaching, and engineering perspectives I bring to a problem."
          />
          <div className={styles.pillarGrid}>
            {aboutPillars.map((pillar, index) => (
              <article className={styles.pillar} key={pillar.id}>
                <span className={styles.pillarIndex} aria-hidden="true">
                  0{index + 1}
                </span>
                <p>{pillar.eyebrow}</p>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`section ${styles.philosophy}`} aria-labelledby="about-philosophy-title">
        <div className={`shell ${styles.philosophyPanel}`}>
          <div>
            <p className="eyebrow">Optimistic realism</p>
            <h2 id="about-philosophy-title">Keep the ambition. Engineer for reality.</h2>
          </div>
          <blockquote>“{optimisticRealism}”</blockquote>
          <div className={styles.direction}>
            <span>Direction / 01</span>
            <p>{aboutDirection}</p>
          </div>
        </div>
      </section>
    </>
  );
}
