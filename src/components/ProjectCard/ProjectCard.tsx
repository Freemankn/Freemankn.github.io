import { useState } from "react";
import type { Project } from "../../data/projects";

function ProjectDiagram({ projectId }: { projectId: string }) {
  return (
    <svg className="project-diagram" viewBox="0 0 520 190" aria-hidden="true">
      <path d="M35 128 126 57l84 47 96-65 88 68 91-43" />
      <path d="M126 57v80l84-33 96 42 88-39" />
      {["35,128", "126,57", "126,137", "210,104", "306,39", "306,146", "394,107", "485,64"].map(
        (point) => {
          const [cx, cy] = point.split(",");
          return <circle key={point} cx={cx} cy={cy} r="7" />;
        },
      )}
      <rect x="202" y="96" width="16" height="16" rx="3" />
      <text x="34" y="168">{projectId.replaceAll("-", "_").toUpperCase()}</text>
    </svg>
  );
}

interface ProjectCardProps {
  project: Project;
  variant?: "featured" | "archive";
}

export function ProjectCard({ project, variant = "featured" }: ProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const detailsId = `${project.id}-details`;
  const titleId = `${project.id}-title`;

  return (
    <article
      className={`project-card project-card--${variant}`}
      id={`project-${project.id}`}
      tabIndex={-1}
      aria-labelledby={titleId}
    >
      <div className="project-card__visual">
        <ProjectDiagram projectId={project.id} />
        <div className="project-card__status">
          <span aria-hidden="true" />
          {project.status}
        </div>
      </div>

      <div className="project-card__body">
        <p className="project-card__category">{project.category}</p>
        <h2 id={titleId}>{project.title}</h2>
        <p className="project-card__description">{project.description}</p>
        <div className="project-card__summary-technologies">
          <p className="detail-label">Technologies</p>
          <ul className="technology-list" aria-label={`${project.title} technologies`}>
            {project.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </div>

        <div className="project-card__actions">
          <button
            className="text-button"
            type="button"
            aria-expanded={expanded}
            aria-controls={detailsId}
            onClick={() => setExpanded((isExpanded) => !isExpanded)}
          >
            {expanded ? "Hide details" : "View details"}
            <span aria-hidden="true">{expanded ? "−" : "+"}</span>
          </button>
          {project.repositoryUrl ? (
            <a
              className="icon-link"
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`View the ${project.title} repository on GitHub`}
            >
              Repository <span aria-hidden="true">↗</span>
            </a>
          ) : null}
          {project.demoUrl ? (
            <a
              className="icon-link"
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Open the ${project.title} demo`}
            >
              Live demo <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>

        <div
          className={`project-details${expanded ? " project-details--open" : ""}`}
          id={detailsId}
          hidden={!expanded}
        >
          <div className="project-details__inner">
            <div>
              <p className="detail-label">Problem</p>
              <p>{project.problem}</p>
            </div>
            <div>
              <p className="detail-label">My contribution</p>
              <p>{project.contribution}</p>
            </div>
            {expanded && project.media?.kind === "video" ? (
              <div className="project-media">
                <video controls playsInline preload="none" aria-label={project.media.label}>
                  <source src={project.media.src} type="video/mp4" />
                  Your browser does not support embedded video.
                </video>
              </div>
            ) : null}
            {expanded && project.media?.kind === "image" ? (
              <div className="project-media">
                <img src={project.media.src} alt={project.media.alt} loading="lazy" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <span className="project-card__corner" aria-hidden="true" />
    </article>
  );
}
