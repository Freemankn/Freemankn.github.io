import worldBankPhoto from "../../../pictures/WorldBank Pic.jpg";
import { SectionHeading } from "../SectionHeading/SectionHeading";

const personalThreads = [
  {
    number: "01",
    title: "Teaching with clarity",
    description:
      "Tutoring mathematics and leading Calculus huddles taught me to adapt an explanation until the idea becomes usable.",
  },
  {
    number: "02",
    title: "Community with continuity",
    description:
      "From HETA outreach to Northeast Early College alumni work, I value showing up, sharing knowledge, and building durable support.",
  },
  {
    number: "03",
    title: "Ideas made tangible",
    description:
      "I am drawn to prototypes, visualizers, and systems that turn an abstract idea into something people can see and use.",
  },
] as const;

export function BeyondEngineering() {
  return (
    <section className="beyond section" id="beyond" aria-labelledby="beyond-title">
      <div className="shell">
        <SectionHeading
          eyebrow="Beyond engineering"
          title="The person behind the systems."
          description="Technical work matters most to me when it helps people understand, participate, or move an idea forward."
        />
        <div className="beyond__layout">
          <figure className="beyond__image-frame">
            <img
              src={worldBankPhoto}
              alt="Freeman Nkouka at the 2024 World Bank Group and IMF Annual Meeting"
              width="900"
              height="1600"
              loading="lazy"
            />
            <figcaption>
              <span>2024</span>
              World Bank Group & IMF Annual Meeting
            </figcaption>
          </figure>
          <div className="beyond__threads">
            {personalThreads.map((thread) => (
              <article key={thread.number}>
                <span>{thread.number}</span>
                <div>
                  <h3>{thread.title}</h3>
                  <p>{thread.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
