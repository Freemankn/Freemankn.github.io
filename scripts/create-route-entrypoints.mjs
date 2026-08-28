import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const distDirectory = new URL("../dist/", import.meta.url);
const distPath = fileURLToPath(distDirectory);

const routes = [
  {
    path: "about",
    title: "About | Freeman Nkouka",
    description:
      "Meet Freeman Nkouka: a Notre Dame Computer Science and ACMS student, technical educator, community builder, and optimistic-realist systems thinker.",
  },
  {
    path: "focus",
    title: "Research Focus | Freeman Nkouka",
    description:
      "Explore Freeman Nkouka's current AI4SE research, human-AI collaboration, software architecture work, and active developer-tool directions.",
  },
  {
    path: "skills",
    title: "Skills | Freeman Nkouka",
    description:
      "Explore the programming languages, frameworks, libraries, and tools Freeman Nkouka uses across research, coursework, and software projects.",
  },
  {
    path: "projects",
    title: "Projects | Freeman Nkouka",
    description:
      "Explore Freeman Nkouka's research systems, developer tools, productivity software, and interactive engineering projects.",
  },
  {
    path: "journey",
    title: "Journey | Freeman Nkouka",
    description:
      "Explore Freeman Nkouka's academic, research, teaching, industry, and community milestones through an interactive constellation map.",
  },
  {
    path: "contact",
    title: "Contact | Freeman Nkouka",
    description:
      "Contact Freeman Nkouka about AI4SE research, software engineering, developer tools, and thoughtful technical collaboration.",
  },
];

const htmlEscape = (value) =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

function replaceRequired(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Could not find ${label} in the built index.html`);
  }
  return html.replace(pattern, replacement);
}

const rootHtml = await readFile(new URL("index.html", distDirectory), "utf8");

for (const route of routes) {
  const title = htmlEscape(route.title);
  const description = htmlEscape(route.description);
  const canonicalUrl = `https://freemankn.github.io/${route.path}`;
  let routeHtml = rootHtml;

  routeHtml = replaceRequired(
    routeHtml,
    /<title>[^<]*<\/title>/,
    `<title>${title}</title>`,
    "document title",
  );
  routeHtml = replaceRequired(
    routeHtml,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${description}" />`,
    "description metadata",
  );
  routeHtml = replaceRequired(
    routeHtml,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${title}" />`,
    "Open Graph title",
  );
  routeHtml = replaceRequired(
    routeHtml,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${description}" />`,
    "Open Graph description",
  );
  routeHtml = replaceRequired(
    routeHtml,
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    "Open Graph URL",
  );
  routeHtml = replaceRequired(
    routeHtml,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${title}" />`,
    "Twitter title",
  );
  routeHtml = replaceRequired(
    routeHtml,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${description}" />`,
    "Twitter description",
  );
  routeHtml = replaceRequired(
    routeHtml,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    "canonical URL",
  );
  routeHtml = replaceRequired(
    routeHtml,
    /\s*<link\s+rel="preload"\s+href="\/assets\/knight-profile\.webp"[\s\S]*?\/>/,
    "",
    "home-only knight image preload",
  );

  const routeDirectory = join(distPath, route.path);
  await mkdir(routeDirectory, { recursive: true });
  await writeFile(join(routeDirectory, "index.html"), routeHtml, "utf8");
}
