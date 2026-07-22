import { BeyondEngineering } from "./components/BeyondEngineering/BeyondEngineering";
import { ContactSection } from "./components/ContactSection/ContactSection";
import { FocusCard } from "./components/FocusCard/FocusCard";
import { Footer } from "./components/Footer/Footer";
import { JourneyTimeline } from "./components/JourneyTimeline/JourneyTimeline";
import { KnightHero } from "./components/KnightHero/KnightHero";
import { Navigation } from "./components/Navigation/Navigation";
import { ProjectCard } from "./components/ProjectCard/ProjectCard";
import { ResearchPhilosophy } from "./components/ResearchPhilosophy/ResearchPhilosophy";
import { SectionHeading } from "./components/SectionHeading/SectionHeading";
import { contactDetails } from "./data/contact";
import { focusItems } from "./data/focus";
import { journeyEntries } from "./data/journey";
import { archivedProjects, featuredProjects } from "./data/projects";

function ArchitectureBackground() {
  return (
    <div className="architecture-background" aria-hidden="true">
      <svg viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMid slice">
        <path d="M-80 230h260l95 96h220l90-90h280l115 115h260l90-90h330" />
        <path d="M120 790h245l98-98h210l148 148h280l72-72h375" />
        <path d="M310-40v180l92 92m660-272v236l-87 87m338 134v280l-118 118" />
        <circle cx="180" cy="230" r="8" />
        <circle cx="495" cy="326" r="7" />
        <circle cx="865" cy="236" r="8" />
        <circle cx="1220" cy="351" r="7" />
        <circle cx="365" cy="790" r="8" />
        <circle cx="673" cy="692" r="7" />
        <circle cx="1101" cy="840" r="8" />
        <circle cx="1313" cy="768" r="7" />
      </svg>
    </div>
  );
}

function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <ArchitectureBackground />
      <Navigation />

      <main id="main-content">
        <KnightHero />

        <section className="focus section" id="focus" aria-labelledby="focus-title">
          <div className="shell">
            <SectionHeading
              eyebrow="Current focus"
              title="Research questions becoming working systems."
              description="Three connected areas shape my current work: reliable AI interaction, measurable software architecture, and tools that help people act with intention."
            />
            <div className="focus-grid">
              {focusItems.map((item, index) => (
                <FocusCard item={item} index={index} key={item.id} />
              ))}
            </div>
          </div>
        </section>

        <section className="projects section" id="projects" aria-labelledby="projects-title">
          <div className="shell">
            <SectionHeading
              eyebrow="Featured projects"
              title="Tools for understanding, controlling, and building software."
              description="Selected research and engineering work, organized around the problem each system is designed to solve."
            />
            <div className="projects-grid projects-grid--featured">
              {featuredProjects.map((project, index) => (
                <ProjectCard project={project} index={index} key={project.id} />
              ))}
            </div>

            <div className="project-archive">
              <div className="project-archive__heading">
                <p className="eyebrow">Project archive</p>
                <h3>Earlier builds and experiments</h3>
                <p>Open a card to inspect the contribution, technology stack, and original demo.</p>
              </div>
              <div className="projects-grid projects-grid--archive">
                {archivedProjects.map((project, index) => (
                  <ProjectCard
                    project={project}
                    variant="archive"
                    index={index}
                    key={project.id}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <ResearchPhilosophy />

        <section className="journey section" id="journey" aria-labelledby="journey-title">
          <div className="shell">
            <SectionHeading
              eyebrow="Journey"
              title="A path shaped by research, teaching, and community."
              description="A compressed record of the environments that shaped how I learn, explain, and build."
            />
            <JourneyTimeline entries={journeyEntries} />
          </div>
        </section>

        <BeyondEngineering />
        <ContactSection details={contactDetails} />
      </main>

      <Footer />
    </>
  );
}

export default App;
