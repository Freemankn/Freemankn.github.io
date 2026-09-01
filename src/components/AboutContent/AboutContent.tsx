import worldBankPhoto from "../../../pictures/WorldBank Pic.jpg";
import { aboutSections } from "../../data/about";
import styles from "./AboutContent.module.css";

export function AboutContent() {
  return (
    <section className={`section ${styles.content}`} aria-label="About Freeman">
      <div className={`shell ${styles.layout}`}>
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

        <div className={styles.sections}>
          {aboutSections.map((section, index) => (
            <article key={section.id}>
              <span aria-hidden="true">0{index + 1}</span>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
