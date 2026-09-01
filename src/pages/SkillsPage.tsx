import { SkillsConstellation } from "../components/SkillsConstellation/SkillsConstellation";
import styles from "./SkillsPage.module.css";

export function SkillsPage() {
  return (
    <article className={`route-page skills-page ${styles.page}`}>
      <header className={`shell ${styles.intro}`} aria-labelledby="skills-page-title">
        <p className="eyebrow">Skills</p>
        <h1 id="skills-page-title" data-route-heading tabIndex={-1}>
          Technical Constellations
        </h1>
        <p>Explore the tools I use. Select a node to focus.</p>
      </header>
      <section className={`shell ${styles.galaxy}`} aria-label="Technical skills galaxy">
        <SkillsConstellation />
      </section>
    </article>
  );
}
