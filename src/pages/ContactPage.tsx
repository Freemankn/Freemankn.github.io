import { ContactSection } from "../components/ContactSection/ContactSection";
import { contactDetails } from "../data/contact";

export function ContactPage() {
  return (
    <article className="route-page contact-page">
      <ContactSection details={contactDetails} headingLevel={1} />
    </article>
  );
}
