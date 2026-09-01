import { useState } from "react";
import { PageIntro } from "../components/PageIntro/PageIntro";
import { ProjectCard } from "../components/ProjectCard/ProjectCard";
import { projects } from "../data/projects";

type ProjectFilter = "all" | "featured" | "archive";

const projectFilters = [
  { id: "all", label: "All projects" },
  { id: "featured", label: "Featured work" },
  { id: "archive", label: "Archive" },
] as const satisfies readonly { id: ProjectFilter; label: string }[];

export function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("all");
  const visibleProjects = projects.filter((project) => {
    if (activeFilter === "featured") {
      return project.featured;
    }
    if (activeFilter === "archive") {
      return !project.featured;
    }
    return true;
  });

  return (
    <article className="route-page projects-page">
      <section className="page-hero shell" aria-labelledby="projects-page-title">
        <PageIntro
          id="projects-page-title"
          eyebrow="Projects"
          title="Systems built around problems worth understanding."
          description="Research systems, developer tools, and interactive products—each with a clear purpose and an inspectable implementation story."
        />
      </section>

      <section className="projects projects-page__gallery section" aria-label="Project gallery">
        <div className="shell">
          <div className="project-filter-bar">
            <div className="project-filters" aria-label="Filter projects">
              {projectFilters.map((filter) => (
                <button
                  className={activeFilter === filter.id ? "is-active" : undefined}
                  type="button"
                  aria-pressed={activeFilter === filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  key={filter.id}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <p aria-live="polite">
              Showing {visibleProjects.length} of {projects.length}
            </p>
          </div>

          <div className="projects-grid projects-grid--gallery">
            {visibleProjects.map((project) => (
              <ProjectCard
                project={project}
                variant={project.featured ? "featured" : "archive"}
                key={project.id}
              />
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
