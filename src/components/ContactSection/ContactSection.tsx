import type { ContactDetails, ContactLinkId } from "../../data/contact";

function ContactIcon({ id }: { id: ContactLinkId }) {
  if (id === "email") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 5.5h17v13h-17z" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (id === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.9v-2.3c-2.4.5-2.9-1-2.9-1-.4-1-.9-1.3-.9-1.3-.8-.5 0-.5 0-.5.8.1 1.3.8 1.3.8.8 1.3 2 1 2.5.7.1-.6.3-1 .6-1.2-1.9-.2-3.9-1-3.9-4.1 0-.9.3-1.7.8-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.5.9a8.6 8.6 0 0 1 4.5 0c1.7-1.2 2.5-.9 2.5-.9.5 1.2.2 2.1.1 2.3.5.6.8 1.4.8 2.3 0 3.2-2 3.9-3.9 4.1.3.3.6.8.6 1.6v3a9.2 9.2 0 0 0-3-17.9Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9.5v9M5 5.5v.1M9.5 18.5v-9h4v1.3c.8-1 1.9-1.6 3.2-1.5 2.3 0 3.3 1.5 3.3 4.1v5.1h-4v-4.7c0-1.2-.4-2-1.5-2-1.2 0-1.7.8-1.7 2v4.7z" />
    </svg>
  );
}

export function ContactSection({ details }: { details: ContactDetails }) {
  return (
    <section className="contact section" id="contact" aria-labelledby="contact-title">
      <div className="contact__panel shell">
        <div className="contact__heading">
          <p className="eyebrow">Open channel</p>
          <h2 id="contact-title">Let’s build something that matters.</h2>
          <p>
            I’m interested in research, engineering, and collaborations that make ambitious
            software more understandable and reliable.
          </p>
          <a className="contact__email" href={`mailto:${details.email}`}>
            {details.email} <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="contact__links" aria-label="Contact links">
          {details.links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              aria-label={link.ariaLabel}
              target={link.opensInNewTab ? "_blank" : undefined}
              rel={link.opensInNewTab ? "noreferrer noopener" : undefined}
            >
              <span className="contact__link-icon">
                <ContactIcon id={link.id} />
              </span>
              <span>{link.label}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
          {details.resumeUrl ? (
            <a
              href={details.resumeUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Open Freeman Nkouka's résumé"
            >
              <span>Résumé</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
