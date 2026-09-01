export type ContactLinkId = "email" | "github" | "linkedin";

export interface ContactLink {
  readonly id: ContactLinkId;
  readonly label: string;
  readonly href: string;
  readonly ariaLabel: string;
  readonly opensInNewTab: boolean;
}

export interface ContactDetails {
  readonly email: string;
  readonly links: readonly ContactLink[];
  readonly resumeUrl?: string;
  readonly academicCvUrl?: string;
}

export const contactDetails: ContactDetails = {
  email: "nkouka788@gmail.com",
  links: [
    {
      id: "email",
      label: "Email",
      href: "mailto:nkouka788@gmail.com",
      ariaLabel: "Email Freeman Nkouka",
      opensInNewTab: false,
    },
    {
      id: "github",
      label: "GitHub",
      href: "https://github.com/freemankn",
      ariaLabel: "View Freeman Nkouka's GitHub profile",
      opensInNewTab: true,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/freeman-nkouka/",
      ariaLabel: "View Freeman Nkouka's LinkedIn profile",
      opensInNewTab: true,
    },
  ],
};
