import { Link } from "react-router-dom";
import { FocusCard } from "../components/FocusCard/FocusCard";
import { PageIntro } from "../components/PageIntro/PageIntro";
import { SectionHeading } from "../components/SectionHeading/SectionHeading";
import { focusItems } from "../data/focus";
import styles from "./FocusPage.module.css";

export function FocusPage() {
  return (
    <article className={`route-page focus-page ${styles.page}`}>
      <section className="page-hero shell" aria-labelledby="focus-page-title">
        <PageIntro
          id="focus-page-title"
          eyebrow="Research & engineering focus"
          title="Five connected problems. One direction: make complex systems inspectable."
          description="My current work spans controlled coding-assistant interaction, software architecture signals, human–AI collaboration, productivity systems, and execution understanding."
          signal="Problem → evidence → control"
        />
      </section>

      <section className={`section ${styles.focusSection}`} aria-labelledby="focus-title">
        <div className="shell">
          <SectionHeading
            id="focus-title"
            eyebrow="Current focus areas"
            title="Research questions becoming working systems."
            description="Each brief names the problem, why it matters, the approach I am testing, and the project where that work becomes concrete."
          />
          <div className={styles.grid}>
            {focusItems.map((item, index) => (
              <FocusCard item={item} index={index} key={item.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="direction section" aria-labelledby="direction-title">
        <div className="direction__panel shell">
          <p className="eyebrow">Current direction</p>
          <h2 id="direction-title">
            Make complex systems easier to trust because they are easier to inspect.
          </h2>
          <p>
            That direction links interaction controls, architectural signals, execution traces,
            and intentional workflows without losing sight of the people who must understand and
            use the system.
          </p>
          <Link className="button button--secondary" to="/projects">
            Inspect the projects <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </article>
  );
}
