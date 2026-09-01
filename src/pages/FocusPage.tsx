import { Link } from "react-router-dom";
import { FocusCard } from "../components/FocusCard/FocusCard";
import { PageIntro } from "../components/PageIntro/PageIntro";
import { focusItems } from "../data/focus";
import styles from "./FocusPage.module.css";

export function FocusPage() {
  return (
    <article className={`route-page focus-page ${styles.page}`}>
      <section className="page-hero shell" aria-labelledby="focus-page-title">
        <PageIntro
          id="focus-page-title"
          eyebrow="Focus"
          title="What I am working on now."
          description="Five connected efforts in reliable human–AI collaboration, software understanding, and intentional work."
        />
      </section>

      <section className={`section ${styles.focusSection}`} aria-label="Current focus areas">
        <div className="shell">
          <div className={styles.grid}>
            {focusItems.map((item, index) => (
              <FocusCard item={item} index={index} key={item.id} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.direction} aria-label="Current direction">
        <div className={`shell ${styles.directionInner}`}>
          <p>Make complex systems easier to trust by making them easier to inspect.</p>
          <Link className="button button--secondary" to="/projects">
            Explore the projects <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </article>
  );
}
