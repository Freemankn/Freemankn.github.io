import { PageIntro } from "../components/PageIntro/PageIntro";
import { SectionHeading } from "../components/SectionHeading/SectionHeading";
import { TechnologyOrbit } from "../components/TechnologyOrbit/TechnologyOrbit";
import styles from "./SkillsPage.module.css";

const skillContexts = [
  {
    title: "Repository & execution analysis",
    body: "Python supports dependency-graph analysis, execution tracing, and interactive learning tools.",
  },
  {
    title: "Typed interactive systems",
    body: "TypeScript and React support productivity tools and interfaces where state and behavior need to remain explicit.",
  },
  {
    title: "Quantitative computing",
    body: "R and MATLAB connect software work with statistical methods, numerical work, and scientific-computing coursework.",
  },
  {
    title: "Interface communication",
    body: "HTML, CSS, and Figma support the visual structure and interaction design used to explain a system clearly.",
  },
] as const;

export function SkillsPage() {
  return (
    <article className={`route-page skills-page ${styles.page}`}>
      <section className="page-hero shell" aria-labelledby="skills-page-title">
        <PageIntro
          id="skills-page-title"
          eyebrow="Skills & working toolkit"
          title="Technology in service of the system."
          description="A map of the languages and tools I have used across research, projects, coursework, and interface design—not a proficiency ranking."
          signal="Select a node · inspect the context"
        />
      </section>

      <section className={`section ${styles.orbitSection}`} aria-labelledby="technology-title">
        <div className="shell">
          <SectionHeading
            id="technology-title"
            eyebrow="Technical constellation"
            title="Languages and tools supporting the work."
            description="Select a language node to see documented uses, related projects, and the technologies around it. Hover or focus pauses the orbit."
          />
          <TechnologyOrbit />
        </div>
      </section>

      <section className={`section ${styles.contextSection}`} aria-labelledby="skills-context-title">
        <div className="shell">
          <div className={styles.contextHeading}>
            <p className={`eyebrow ${styles.contextEyebrow}`}>Skills in context</p>
            <h2 id="skills-context-title">What the toolkit helps me do.</h2>
            <p>
              The useful unit is not a technology in isolation; it is the problem, system, or
              explanation that technology helps make possible.
            </p>
          </div>
          <div className={styles.contextGrid}>
            {skillContexts.map((context, index) => (
              <article key={context.title}>
                <span aria-hidden="true">0{index + 1}</span>
                <h3>{context.title}</h3>
                <p>{context.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
