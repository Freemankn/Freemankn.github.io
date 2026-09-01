import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const baseUrl = process.argv.find((argument) => argument.startsWith("http")) ?? "http://127.0.0.1:5173";
const captureScreenshots = process.argv.includes("--screenshots");
const interactionsOnly = process.argv.includes("--interactions-only");
const debugInteractions = process.argv.includes("--debug-interactions");
const chromeEndpoint = "http://127.0.0.1:9222";
const routes = [
  "/",
  "/about",
  "/focus",
  "/skills",
  "/projects",
  "/journey",
  "/contact",
];
const viewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1920, height: 1080 },
];
const viewportHeightByWidth = new Map(viewports.map(({ width, height }) => [width, height]));
const failures = [];
const consoleErrors = [];
const routeResults = [];

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

const target = await fetch(`${chromeEndpoint}/json/new?about:blank`, { method: "PUT" }).then((response) => {
  if (!response.ok) {
    throw new Error(`Chrome target creation failed with ${response.status}`);
  }
  return response.json();
});

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener("open", resolveOpen, { once: true });
  socket.addEventListener("error", rejectOpen, { once: true });
});

let commandId = 0;
const pendingCommands = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const pending = pendingCommands.get(message.id);
    if (!pending) {
      return;
    }
    pendingCommands.delete(message.id);
    if (message.error) {
      pending.reject(new Error(`${pending.method}: ${message.error.message}`));
    } else {
      pending.resolve(message.result);
    }
    return;
  }

  if (message.method === "Runtime.exceptionThrown") {
    consoleErrors.push(message.params.exceptionDetails.text);
  }
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
    consoleErrors.push(message.params.entry.text);
  }
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
    consoleErrors.push(
      message.params.args.map((argument) => argument.value ?? argument.description).join(" "),
    );
  }
});

function send(method, params = {}) {
  commandId += 1;
  const id = commandId;
  return new Promise((resolveCommand, rejectCommand) => {
    pendingCommands.set(id, { method, resolve: resolveCommand, reject: rejectCommand });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(expression, awaitPromise = false) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(
      result.exceptionDetails.exception?.description ??
        result.exceptionDetails.exception?.value ??
        result.exceptionDetails.text,
    );
  }
  return result.result.value;
}

async function settle(milliseconds = 260) {
  await evaluate(
    `new Promise((resolve) => window.setTimeout(resolve, ${milliseconds}))`,
    true,
  );
}

async function traceKnight(label) {
  if (!debugInteractions) {
    return;
  }
  const state = await evaluate(`(() => {
    const constellation = document.querySelector(".identity-constellation");
    const sentinel = document.querySelector(".identity-transition-sentinel");
    return {
      phase: constellation?.dataset.constellationState,
      sentinelAnimation: sentinel ? getComputedStyle(sentinel).animationName : null,
      sentinelDuration: sentinel ? getComputedStyle(sentinel).animationDuration : null,
      expanded: document.querySelector(".portrait-control")?.getAttribute("aria-expanded"),
    };
  })()`);
  console.log(label, state);
}

async function waitFor(expression, label, timeout = 4000) {
  const passed = await evaluate(
    `new Promise((resolve) => {
      const started = performance.now();
      const check = () => {
        if (${expression}) return resolve(true);
        if (performance.now() - started > ${timeout}) return resolve(false);
        window.setTimeout(check, 30);
      };
      check();
    })`,
    true,
  );
  assert(passed, `Timed out waiting for ${label}`);
  return passed;
}

async function setViewport(width, reducedMotion = false, height = viewportHeightByWidth.get(width) ?? 900) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 768,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [
      {
        name: "prefers-reduced-motion",
        value: reducedMotion ? "reduce" : "no-preference",
      },
    ],
  });
}

async function navigate(path) {
  await send("Page.navigate", { url: `${baseUrl}${path}` });
  await new Promise((resolveDelay) => setTimeout(resolveDelay, 350));
  await waitFor(
    `document.readyState === "complete" && document.querySelector("#root .site-header") !== null`,
    `${path} to render`,
  );
  await settle();
}

async function capture(name) {
  if (!captureScreenshots) {
    return;
  }
  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const directory = resolve("dist", "audit");
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, `${name}.png`), screenshot.data, "base64");
}

async function tap(selector) {
  const point = await evaluate(`(() => {
    const rectangle = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
    return { x: rectangle.left + rectangle.width / 2, y: rectangle.top + rectangle.height / 2 };
  })()`);
  await send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: point.x, y: point.y }],
  });
  await send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");
await send("Page.bringToFront");

if (!interactionsOnly) {
for (const { width, height } of viewports) {
  await setViewport(width, false, height);
  for (const route of routes) {
    await navigate(route);
    const result = await evaluate(`(() => {
      const normalize = (path) => path !== "/" ? path.replace(/\\/$/, "") : path;
      const activeLinks = [...document.querySelectorAll("#primary-navigation a[aria-current='page']")]
        .map((link) => new URL(link.href).pathname.replace(/\\/$/, "") || "/");
      const navigationLinks = [...document.querySelectorAll("#primary-navigation a")].map((link) => {
        const rectangle = link.getBoundingClientRect();
        const style = getComputedStyle(link);
        return {
          label: link.textContent.trim(),
          left: rectangle.left,
          right: rectangle.right,
          visibility: style.visibility,
          opacity: Number.parseFloat(style.opacity),
        };
      });
      return {
        route: normalize(location.pathname),
        title: document.title,
        h1Count: document.querySelectorAll("h1").length,
        activeLinks,
        navigationLinks,
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.currentSrc || image.src),
        missingAriaReferences: [...document.querySelectorAll("[aria-labelledby], [aria-describedby], [aria-controls]")]
          .flatMap((element) => ["aria-labelledby", "aria-describedby", "aria-controls"].flatMap((attribute) => {
            const value = element.getAttribute(attribute);
            if (!value) return [];
            return value.split(/\\s+/).filter((id) => document.getElementById(id) === null)
              .map((id) => ({ attribute, id, element: element.tagName }));
          })),
        menuVisible: getComputedStyle(document.querySelector(".menu-toggle")).display !== "none",
        primaryContentTop: document.querySelector(".route-page > section:nth-of-type(2)")?.getBoundingClientRect().top ?? null,
        homeLowerTop: document.querySelector(".home-hero__lower")?.getBoundingClientRect().top ?? null,
        heroNameCount: document.querySelectorAll(".hero__name").length,
        portraitCloseCount: document.querySelectorAll(".identity-constellation__close").length,
        hasArchedCrest: document.querySelectorAll(".identity-nameplate__crest .identity-nameplate__rim").length === 1,
        aboutImageHeight: document.querySelector("[class*='imageFrame'] img")?.getBoundingClientRect().height ?? null,
      };
    })()`);
    routeResults.push({ width, height, expectedRoute: route, ...result });
    assert(result.route === route, `${width}px ${route}: rendered pathname ${result.route}`);
    assert(result.h1Count === 1, `${width}px ${route}: expected one h1, found ${result.h1Count}`);
    assert(
      result.activeLinks.length === 1 && result.activeLinks[0] === route,
      `${width}px ${route}: incorrect active navigation ${JSON.stringify(result.activeLinks)}`,
    );
    assert(
      result.navigationLinks.length === 7,
      width + "px " + route + ": expected seven navigation links, found " + result.navigationLinks.length,
    );
    if (!result.menuVisible) {
      assert(
        result.navigationLinks.every(
          (link) =>
            link.left >= 0 &&
            link.right <= result.innerWidth &&
            link.visibility === "visible" &&
            link.opacity > 0.5,
        ),
        width + "px " + route + ": a desktop navigation link is clipped or hidden " +
          JSON.stringify(result.navigationLinks),
      );
    }
    assert(
      result.scrollWidth <= result.innerWidth,
      `${width}px ${route}: horizontal overflow ${result.scrollWidth - result.innerWidth}px`,
    );
    assert(result.brokenImages.length === 0, `${width}px ${route}: broken images ${result.brokenImages.join(", ")}`);
    assert(
      result.missingAriaReferences.length === 0,
      `${width}px ${route}: missing ARIA references ${JSON.stringify(result.missingAriaReferences)}`,
    );
    if (route === "/") {
      assert(result.heroNameCount === 0, `${width}px Home still renders the duplicate hero name`);
      assert(result.portraitCloseCount === 0, `${width}px Home still renders a portrait X control`);
      assert(result.hasArchedCrest, `${width}px Home is missing the SVG portrait crest`);
      if (width >= 1024) {
        assert(result.homeLowerTop < height, `${width}x${height} Home lower rail starts below the viewport`);
      }
    }
    if (route === "/about") {
      assert(result.aboutImageHeight <= 650, `${width}px About image is ${result.aboutImageHeight}px tall`);
    }

    if (route === "/") {
      await capture(`home-${width}x${height}`);
    }
    if (width === 1440 && route !== "/") {
      await capture(`${route.slice(1)}-${width}x${height}`);
    }
    if (width === 375 && route === "/skills") {
      await capture("skills-375");
    }
    if (captureScreenshots && route === "/skills" && (width === 1440 || width === 375)) {
      await evaluate(`document.querySelector("[data-animation-authority='skills-raf']").scrollIntoView()`);
      await settle(350);
      await capture(`orbit-${width}`);
      await evaluate(`document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 0)`);
    }

    await send("Page.reload", { ignoreCache: true });
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 350));
    await waitFor(`document.readyState === "complete" && document.querySelector("h1") !== null`, `${route} refresh`);
    const refreshedRoute = await evaluate(`location.pathname !== "/" ? location.pathname.replace(/\\/$/, "") : "/"`);
    assert(refreshedRoute === route, `${width}px ${route}: refresh ended at ${refreshedRoute}`);
  }
}
}

await setViewport(1024);
await navigate("/");
await evaluate(`document.querySelector("#primary-navigation a[href='/focus']").click()`);
await waitFor(`location.pathname === "/focus"`, "route-link navigation to Focus");
await settle();
assert(
  await evaluate(`document.activeElement?.matches("[data-route-heading]") === true`),
  "Route navigation did not focus the new page heading",
);

await evaluate(`document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 650)`);
await settle(80);
assert((await evaluate(`window.scrollY`)) >= 600, "Scroll-restoration setup did not reach the requested position");
await evaluate(`document.querySelector("#primary-navigation a[href='/projects']").click()`);
await waitFor(`location.pathname === "/projects"`, "navigation to Projects");
await evaluate(`history.back()`);
await waitFor(`location.pathname === "/focus"`, "browser Back to Focus");
await settle();
const restoredScroll = await evaluate(`window.scrollY`);
assert(restoredScroll >= 500, `Browser Back restored scroll to ${restoredScroll}, expected near 650`);
await evaluate(`history.forward()`);
await waitFor(`location.pathname === "/projects"`, "browser Forward to Projects");

await setViewport(375);
await navigate("/");
await evaluate(`document.querySelector(".menu-toggle").click()`);
assert(await evaluate(`document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "true"`), "Mobile menu did not open");
await evaluate(`document.querySelector(".menu-toggle").focus()`);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await settle(50);
assert(await evaluate(`document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "false"`), "Escape did not close the mobile menu");
assert(await evaluate(`document.activeElement === document.querySelector(".menu-toggle")`), "Escape did not restore focus to the mobile-menu toggle");
await evaluate(`document.querySelector(".menu-toggle").click(); document.querySelector(".brand").click()`);
await settle(80);
assert(
  await evaluate(`document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "false"`),
  "FN shield did not close the mobile menu on the current Home route",
);
await evaluate(`document.querySelector(".menu-toggle").click(); document.querySelector("#primary-navigation a[href='/contact']").click()`);
await waitFor(`location.pathname === "/contact"`, "mobile navigation to Contact");
assert(await evaluate(`document.querySelector(".menu-toggle").getAttribute("aria-expanded") === "false"`), "Mobile menu stayed open after navigation");

await navigate("/");
await tap(".portrait-control");
await settle(60);
await traceKnight("touch after first activation");
assert(
  await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "opening"`),
  "Knight touch activation did not start opening the identity constellation",
);
await waitFor(
  `document.querySelector(".identity-constellation").dataset.constellationState === "open"`,
  "touch-open identity constellation",
  1600,
);
await traceKnight("touch after opening duration");
assert(
  await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "open"`),
  "Touch activation did not leave the identity constellation open",
);
assert(
  await evaluate(`document.querySelectorAll("#portrait-identity-sigils a").length === 3 && [...document.querySelectorAll("#portrait-identity-sigils a")].every((link) => link.tabIndex === 0)`),
  "The open identity constellation did not expose three keyboard-accessible sigils",
);
await tap(".portrait-control");
await waitFor(
  `document.querySelector(".identity-constellation").dataset.constellationState === "closed"`,
  "touch-close identity constellation",
  1400,
);
await traceKnight("touch after portrait close");
assert(
  await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "closed"`),
  "The second touch activation did not retract the identity constellation",
);

await setViewport(1024);
await navigate("/");
await evaluate(`(() => {
  const portrait = document.querySelector(".portrait-control");
  portrait.click();
  portrait.click();
})()`);
assert(
  await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "opening"`),
  "Portrait retriggered while the identity constellation was opening",
);
await waitFor(
  `document.querySelector(".identity-constellation").dataset.constellationState === "open"`,
  "mouse-open identity constellation",
  1600,
);
await traceKnight("mouse after open");
await capture("identity-open-1024");
assert(
  await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "open"`),
  "Mouse activation did not open the identity constellation",
);
await evaluate(`document.querySelector(".portrait-control").click()`);
await waitFor(
  `document.querySelector(".identity-constellation").dataset.constellationState === "closed"`,
  "mouse-close identity constellation",
  1400,
);
await traceKnight("mouse after close");
assert(
  await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "closed"`),
  "Second portrait activation did not close the identity constellation",
);

for (const key of ["Enter", " "]) {
  await navigate("/");
  await evaluate(`document.querySelector(".portrait-control").focus()`);
  await send("Input.dispatchKeyEvent", {
    type: "rawKeyDown",
    key,
    code: key === "Enter" ? "Enter" : "Space",
    windowsVirtualKeyCode: key === "Enter" ? 13 : 32,
    nativeVirtualKeyCode: key === "Enter" ? 13 : 32,
    text: key === "Enter" ? "\r" : " ",
    unmodifiedText: key === "Enter" ? "\r" : " ",
  });
  if (key === "Enter") {
    await send("Input.dispatchKeyEvent", {
      type: "char",
      key,
      code: "Enter",
      windowsVirtualKeyCode: 13,
      nativeVirtualKeyCode: 13,
      text: "\r",
      unmodifiedText: "\r",
    });
  }
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key,
    code: key === "Enter" ? "Enter" : "Space",
    windowsVirtualKeyCode: key === "Enter" ? 13 : 32,
    nativeVirtualKeyCode: key === "Enter" ? 13 : 32,
  });
  await settle(60);
  await traceKnight(`keyboard ${key === " " ? "Space" : key}`);
  assert(
    await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "opening"`),
    `Knight ${key === " " ? "Space" : key} activation did not open the identity constellation`,
  );
  await settle(800);
}

await evaluate(`document.querySelector(".portrait-control").focus()`);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await waitFor(
  `document.querySelector(".identity-constellation").dataset.constellationState === "closed"`,
  "Escape-close identity constellation",
  1400,
);
await traceKnight("after Escape");
assert(
  await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "closed"`),
  "Escape did not close the identity constellation",
);
assert(
  await evaluate(`document.activeElement === document.querySelector(".portrait-control")`),
  "Escape did not restore focus to the portrait control",
);

await setViewport(1024, true);
await navigate("/");
const reducedKnight = await evaluate(`({
  auraAnimation: getComputedStyle(document.querySelector(".portrait-aura")).animationName,
  energyAnimation: getComputedStyle(document.querySelector(".identity-energy-track")).animationName,
  crestTransition: getComputedStyle(document.querySelector(".identity-nameplate__crest")).transitionDuration,
})`);
assert(reducedKnight.auraAnimation === "none", "Reduced motion did not stop the knight aura");
assert(reducedKnight.energyAnimation === "none", "Reduced motion did not stop the identity orbit");
assert(reducedKnight.crestTransition === "0s", "Reduced motion did not make the portrait crest static");
await evaluate(`document.querySelector(".portrait-control").click()`);
await waitFor(
  `document.querySelector(".identity-constellation").dataset.constellationState === "open"`,
  "reduced-motion identity constellation",
  800,
);
assert(
  await evaluate(`document.querySelector(".identity-constellation").dataset.constellationState === "open"`),
  "Reduced-motion identity constellation did not remain functional",
);

await setViewport(1024);
await navigate("/");
await evaluate(`document.querySelector(".portrait-control").click()`);
await settle(850);
await evaluate(`document.querySelector("#portrait-identity-sigils a[href='/journey']").focus()`);
await send("Input.dispatchKeyEvent", {
  type: "rawKeyDown",
  key: " ",
  code: "Space",
  windowsVirtualKeyCode: 32,
  nativeVirtualKeyCode: 32,
  text: " ",
  unmodifiedText: " ",
});
await send("Input.dispatchKeyEvent", {
  type: "keyUp",
  key: " ",
  code: "Space",
  windowsVirtualKeyCode: 32,
  nativeVirtualKeyCode: 32,
});
await waitFor(`location.pathname === "/journey"`, "Space activation on an identity sigil");

await setViewport(1440);
await navigate("/skills");
if (debugInteractions) {
  console.log("skills navigation", await evaluate(`(() => [...document.querySelectorAll("#primary-navigation a")].map((link) => {
    const rectangle = link.getBoundingClientRect();
    const center = document.elementFromPoint(rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2);
    const style = getComputedStyle(link);
    return {
      label: link.textContent.trim(),
      color: style.color,
      opacity: style.opacity,
      visibility: style.visibility,
      centerElement: center?.tagName,
      centerText: center?.textContent?.trim(),
    };
  }))()`));
}
const skillsAudit = await evaluate(`(() => ({
  count: document.querySelectorAll("[data-skill-node]").length,
  names: [...document.querySelectorAll("[data-skill-node]")].map((node) => node.getAttribute("data-skill-node")),
  categoryLabels: [...document.querySelectorAll("svg text")].map((node) => node.textContent.trim()).filter((text) => ["Languages", "Software Engineering", "AI + Data", "Frontend + Mobile", "Backend + Databases"].includes(text)),
  authority: document.querySelector("[data-animation-authority]")?.getAttribute("data-animation-authority"),
  localIconReferences: [...document.querySelectorAll("[data-skill-node] image, [data-skill-node] use")].map((node) => node.getAttribute("href")),
}))()`);
const requiredSkills = [
  "Python", "Java", "C", "C++", "TypeScript", "JavaScript", "Kotlin", "Bash",
  "pytest", "Git", "GitHub", "Linux/Unix", "Docker", "REST APIs",
  "OpenAI API", "NetworkX", "NumPy", "Pandas", "Scikit-learn",
  "Django", "SQLite", "Firebase Firestore", "Firebase Authentication", "RoomDB",
  "React", "HTML", "CSS", "Bootstrap", "Kotlin/Android",
];
assert(skillsAudit.count === 29, `Expected 29 skills, found ${skillsAudit.count}`);
assert(requiredSkills.every((skill) => skillsAudit.names.includes(skill)), "The desktop constellation is missing a CV skill");
assert(skillsAudit.categoryLabels.length === 5, `Expected five constellation labels, found ${skillsAudit.categoryLabels.length}`);
assert(skillsAudit.authority === "skills-raf", "Skills camera and motion authority marker is missing");
assert(skillsAudit.localIconReferences.every((href) => href && !href.startsWith("http")), "A Skills icon is not local");
assert(!/R|MATLAB|Figma|Pygame|sys\.settrace/.test(skillsAudit.names.join("|")), "An obsolete skill remains visible");

const pythonStart = await evaluate(`document.querySelector("[data-skill-id='python']").dataset.position`);
await evaluate(`document.querySelector("[data-skill-id='python']").focus()`);
await settle(500);
const pythonAfterFocus = await evaluate(`document.querySelector("[data-skill-id='python']").dataset.position`);
assert(pythonStart !== pythonAfterFocus, "Keyboard focus stopped constellation motion");
await evaluate(`document.querySelector("[data-skill-id='python']").dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }))`);
await settle(900);
const selectedSkill = await evaluate(`(() => ({
  pressed: document.querySelector("[data-skill-id='python']").getAttribute("aria-pressed"),
  cameraWidth: document.querySelector("svg[aria-label='Interactive technical constellation map']").viewBox.baseVal.width,
  context: document.querySelector("[data-selected-skill='python'] h2")?.textContent,
  relatedLines: document.querySelectorAll("[data-relationship][class]").length,
}))()`);
assert(selectedSkill.pressed === "true", "Pointer selection did not select Python");
assert(selectedSkill.cameraWidth < 700, `Skills camera did not zoom; width=${selectedSkill.cameraWidth}`);
assert(selectedSkill.context === "Python", "Selected Skills context did not open");
assert(selectedSkill.relatedLines > 0, "Selected Skills relationships did not brighten");
await evaluate(`document.querySelector("[data-canvas]").dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }))`);
await settle(900);
assert(await evaluate(`document.querySelectorAll("[data-skill-node][aria-pressed='true']").length === 0`), "Empty-space activation did not return Skills to overview");

await evaluate(`document.querySelector("[data-skill-id='typescript']").focus()`);
await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await settle(650);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await settle(1400);
assert(
  await evaluate(`document.activeElement === document.querySelector("[data-skill-id='typescript']")`),
  "Keyboard zoom-out did not restore focus to the initiating skill",
);

await setViewport(375);
await navigate("/skills");
const mobileCategories = await evaluate(`({
  categories: document.querySelectorAll("[data-category-control]").length,
  nodes: document.querySelectorAll("[data-skill-node]").length,
})`);
assert(mobileCategories.categories === 5, `Mobile Skills expected five categories, found ${mobileCategories.categories}`);
assert(mobileCategories.nodes === 0, "Mobile Skills exposed all nodes before category selection");
await evaluate(`document.querySelector("[data-category-control='languages']").dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }))`);
await settle(350);
assert(await evaluate(`document.querySelectorAll("[data-skill-node]").length === 8`), "Mobile Languages category did not expose eight skills");
assert(await evaluate(`[...document.querySelectorAll("[data-skill-node]")].every((node) => node.tabIndex === 0)`), "A visible mobile skill is not keyboard accessible");
await evaluate(`document.querySelector("[data-skill-id='python']").dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }))`);
await settle(500);
assert(await evaluate(`document.querySelector("[data-selected-skill='python']") !== null`), "Mobile skill selection did not show the context strip");
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.toLowerCase().includes("all skills")).click()`);
await settle(350);
assert(await evaluate(`document.querySelectorAll("[data-category-control]").length === 5`), "Mobile All Skills did not return to category overview");

await setViewport(1440, true);
await navigate("/skills");
const reducedStart = await evaluate(`document.querySelector("[data-skill-id='python']").dataset.position`);
await settle(450);
const reducedEnd = await evaluate(`document.querySelector("[data-skill-id='python']").dataset.position`);
assert(reducedStart === reducedEnd, "Reduced motion did not stop constellation drift");

await setViewport(1440);
await navigate("/journey");
const journeyOverview = await evaluate(`(() => ({
  chapters: document.querySelectorAll("[data-journey-chapter]").length,
  milestones: document.querySelectorAll("[data-journey-milestone]").length,
  allCollapsed: [...document.querySelectorAll("[data-journey-chapter]")].every((node) => node.getAttribute("aria-expanded") === "false"),
  state: document.querySelector("[data-journey-state]")?.getAttribute("data-journey-state"),
  authority: document.querySelector("[data-animation-authority]")?.getAttribute("data-animation-authority"),
  viewWidth: document.querySelector("svg[aria-label='Interactive Journey chapter map']").viewBox.baseVal.width,
  density: document.querySelector("[data-journey-state]")?.getAttribute("data-camera-density"),
}))()`);
assert(journeyOverview.chapters === 7, `Expected 7 major Journey chapters, found ${journeyOverview.chapters}`);
assert(journeyOverview.milestones === 0, "Journey overview exposed collapsed satellites");
assert(journeyOverview.allCollapsed, "A Journey overview chapter reported itself expanded");
assert(journeyOverview.state === "overview", `Expected Journey overview state, found ${journeyOverview.state}`);
assert(journeyOverview.authority === "journey-camera-raf", "Journey camera authority marker is missing");
assert(journeyOverview.viewWidth === 1160, `Journey did not start fitted; width=${journeyOverview.viewWidth}`);
assert(journeyOverview.density === "overview", `Journey did not start at overview density; found ${journeyOverview.density}`);

await evaluate(`document.querySelector("[data-journey-chapter='notre-dame']").dispatchEvent(new MouseEvent("click", { bubbles: true }))`);
await settle(650);
const selectedJourney = await evaluate(`(() => {
  const selected = document.querySelector("[data-journey-chapter='notre-dame']");
  const unrelated = document.querySelector("[data-journey-chapter='strive']");
  const milestones = [...document.querySelectorAll("[data-journey-milestone]")];
  return {
    expanded: selected?.getAttribute("aria-expanded"),
    unrelatedOpacity: Number.parseFloat(getComputedStyle(unrelated).opacity),
    milestoneCount: milestones.length,
    allAccessible: milestones.every((node) => node.tabIndex === 0 && node.getAttribute("role") === "button" && node.getAttribute("aria-label")?.length > 30),
    clusters: [...document.querySelectorAll("svg text")].map((node) => node.textContent.trim()).filter((text) => ["ACADEMICS", "TEACHING", "PROFESSIONAL / INDUSTRY"].includes(text)),
    annotationTitle: document.querySelector("[data-selected-chapter='notre-dame'] h3")?.textContent,
    viewWidth: document.querySelector("svg[aria-label='Interactive Journey chapter map']").viewBox.baseVal.width,
    annotationWidth: document.querySelector("[data-map-annotation]")?.getBoundingClientRect().width,
    annotationOnLeft: document.querySelector("[data-map-annotation]")?.className.includes("annotationLeft"),
    primaryPriority: document.querySelector("[data-journey-milestone='nd-cs-acms']")?.getAttribute("data-label-priority"),
    secondaryPriority: document.querySelector("[data-journey-milestone='nd-jjl']")?.getAttribute("data-label-priority"),
    hasChapterBack: [...document.querySelectorAll("button")].some((button) => button.textContent.trim() === "← JOURNEY"),
  };
})()`);
await evaluate(`document.querySelector("svg[aria-label='Interactive Journey chapter map']").closest("section").scrollIntoView({ block: "start" })`);
await settle(120);
await capture("journey-selected-1440");
assert(selectedJourney.expanded === "true", "Notre Dame chapter did not report itself expanded");
assert(selectedJourney.unrelatedOpacity < 0.5, "Journey chapter selection did not dim an unrelated chapter");
assert(selectedJourney.milestoneCount === 10, `Notre Dame expected 10 satellites, found ${selectedJourney.milestoneCount}`);
assert(selectedJourney.allAccessible, "An opened Journey milestone is not fully keyboard and semantically accessible");
assert(selectedJourney.clusters.length === 3, `Notre Dame expected three visual clusters, found ${selectedJourney.clusters.length}`);
assert(selectedJourney.annotationTitle === "University of Notre Dame", "Notre Dame chapter annotation did not open");
assert(selectedJourney.viewWidth === journeyOverview.viewWidth, "Chapter selection unexpectedly moved the Journey camera");
assert(selectedJourney.annotationWidth <= 380, `Journey annotation is not compact; width=${selectedJourney.annotationWidth}`);
assert(selectedJourney.annotationOnLeft, "Journey annotation did not move opposite the selected Notre Dame point");
assert(selectedJourney.primaryPriority === "primary" && selectedJourney.secondaryPriority === "secondary", "Journey label priority metadata is missing or invalid");
assert(selectedJourney.hasChapterBack, "Journey chapter did not expose the Journey return control");

await evaluate(`(() => {
  const viewport = document.querySelector("svg[aria-label='Interactive Journey chapter map']").parentElement;
  const rectangle = viewport.getBoundingClientRect();
  viewport.dispatchEvent(new WheelEvent("wheel", {
    bubbles: true,
    cancelable: true,
    deltaY: -300,
    clientX: rectangle.left + rectangle.width * 0.75,
    clientY: rectangle.top + rectangle.height * 0.42,
  }));
})()`);
await settle(80);
const firstCameraZoom = await evaluate(`(() => {
  const root = document.querySelector("[data-journey-state]");
  const svg = document.querySelector("svg[aria-label='Interactive Journey chapter map']");
  return { width: svg.viewBox.baseVal.width, x: svg.viewBox.baseVal.x, density: root.dataset.cameraDensity };
})()`);
assert(firstCameraZoom.width < journeyOverview.viewWidth && firstCameraZoom.x > 0, "Pointer-centered wheel zoom did not update the Journey camera around the pointer");
assert(firstCameraZoom.density === "overview", "Journey density crossed the upper 1.3x threshold too early");

await evaluate(`(() => {
  const viewport = document.querySelector("svg[aria-label='Interactive Journey chapter map']").parentElement;
  const rectangle = viewport.getBoundingClientRect();
  viewport.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -50, clientX: rectangle.left + rectangle.width * 0.75, clientY: rectangle.top + rectangle.height * 0.42 }));
})()`);
await settle(240);
assert(await evaluate(`document.querySelector("[data-journey-state]").dataset.cameraDensity === "chapter"`), "Journey density did not enter chapter detail above the hysteresis band");
const mediumLabelOpacity = await evaluate(`(() => ({
  primary: Number.parseFloat(getComputedStyle(document.querySelector("[data-journey-milestone='nd-cs-acms'] text")).opacity),
  secondary: Number.parseFloat(getComputedStyle(document.querySelector("[data-journey-milestone='nd-jjl'] text")).opacity),
  path: Number.parseFloat(getComputedStyle(document.querySelector("[data-journey-milestone='nd-cs-acms']").parentElement.querySelector("path")).opacity),
}))()`);
assert(mediumLabelOpacity.primary > 0.9 && mediumLabelOpacity.secondary < 0.2, `Static Journey label priority did not reduce chapter-density clutter (primary=${mediumLabelOpacity.primary}, secondary=${mediumLabelOpacity.secondary})`);
assert(mediumLabelOpacity.path <= 0.25, `Chapter-density Journey paths are too prominent (opacity=${mediumLabelOpacity.path})`);
await evaluate(`(() => {
  const viewport = document.querySelector("svg[aria-label='Interactive Journey chapter map']").parentElement;
  const rectangle = viewport.getBoundingClientRect();
  viewport.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 50, clientX: rectangle.left + rectangle.width * 0.75, clientY: rectangle.top + rectangle.height * 0.42 }));
})()`);
await settle(80);
assert(await evaluate(`document.querySelector("[data-journey-state]").dataset.cameraDensity === "chapter"`), "Journey density flickered while returning through the 1.3x hysteresis band");

await evaluate(`document.querySelector("[data-journey-milestone='nd-jjl']").dispatchEvent(new MouseEvent("click", { bubbles: true }))`);
await settle(240);
const jjlMilestone = await evaluate(`(() => ({
  state: document.querySelector("[data-journey-state]")?.getAttribute("data-journey-state"),
  pressed: document.querySelector("[data-journey-milestone='nd-jjl']")?.getAttribute("aria-pressed"),
  parentVisible: Number.parseFloat(getComputedStyle(document.querySelector("[data-journey-chapter='notre-dame']")).opacity),
  siblings: document.querySelectorAll("[data-journey-milestone]").length,
  detail: document.querySelector("[data-selected-milestone='nd-jjl']")?.textContent,
  hasChapterBack: [...document.querySelectorAll("button")].some((button) => button.textContent.trim() === "← CHAPTER"),
}))()`);
assert(jjlMilestone.state === "milestone", "Journey did not enter milestone state");
assert(jjlMilestone.pressed === "true", "JJL satellite did not persist its selected state");
assert(jjlMilestone.parentVisible > 0.8, "Milestone selection hid its parent chapter");
assert(jjlMilestone.siblings === 10, "Milestone selection removed sibling context");
assert(jjlMilestone.detail?.includes("Sophomore-summer industry experience"), "JJL chronology-safe detail is missing");
assert(!/Notre Dame sponsored|Notre Dame program|worked for Notre Dame/i.test(jjlMilestone.detail ?? ""), "JJL detail implies a false Notre Dame affiliation");
assert(jjlMilestone.hasChapterBack, "Milestone state did not expose Back to Chapter");
assert(
  await evaluate(`Number.parseFloat(getComputedStyle(document.querySelector("[data-journey-milestone='nd-jjl'] text")).opacity) > 0.9`),
  "Selected Journey milestone did not override its static secondary label priority",
);
const selectedPathOpacity = await evaluate(`(() => {
  const paths = [...document.querySelector("[data-journey-milestone='nd-jjl']").parentElement.querySelectorAll("path")];
  return paths.map((path) => Number.parseFloat(getComputedStyle(path).opacity));
})()`);
assert(Math.max(...selectedPathOpacity) > 0.8 && Math.min(...selectedPathOpacity) < 0.15, "Selected Journey path emphasis did not suppress unrelated paths");

await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Hide details").click()`);
await settle(40);
assert(await evaluate(`document.querySelector("[data-selected-milestone]") === null && document.querySelector("[data-journey-state]").dataset.journeyState === "milestone"`), "Hiding the Journey annotation changed the selected milestone");
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Show details").click()`);
await settle(40);
assert(await evaluate(`document.querySelector("[data-selected-milestone='nd-jjl']") !== null`), "Journey annotation could not be restored");

await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "← CHAPTER").click()`);
await settle(80);
assert(await evaluate(`document.querySelector("[data-journey-state]").getAttribute("data-journey-state") === "chapter"`), "Back to Chapter did not step outward");
assert(await evaluate(`document.querySelectorAll("[data-journey-milestone]").length === 10`), "Back to Chapter hid the open chapter milestones");

const cameraBeforeJourneyBack = await evaluate(`document.querySelector("svg[aria-label='Interactive Journey chapter map']").getAttribute("viewBox")`);
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "← JOURNEY").click()`);
await settle(120);
assert(await evaluate(`document.querySelectorAll("[data-journey-milestone]").length === 0`), "Back to Journey did not collapse satellites");
assert(await evaluate(`document.querySelector("svg[aria-label='Interactive Journey chapter map']").getAttribute("viewBox") === ${JSON.stringify(cameraBeforeJourneyBack)}`), "Back to Journey unexpectedly moved the independent camera");

await evaluate(`document.querySelector("[data-journey-chapter='make-a-chess-move']").focus()`);
await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await settle(80);
const googleCertificateLabel = await evaluate(`document.querySelector("[data-journey-milestone='macm-google-it']")?.getAttribute("aria-label")`);
assert(googleCertificateLabel?.includes("Completed as part of the Make A Chess Move internship"), "Google certificate is not directly connected to the MACM internship");
assert(!/worked for Google|Google affiliated|issued by Make A Chess Move/i.test(googleCertificateLabel ?? ""), "Google certificate wording creates a false affiliation");

await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await settle(80);
assert(await evaluate(`document.querySelector("[data-journey-state]").getAttribute("data-journey-state") === "overview"`), "Escape did not move chapter to overview");
assert(await evaluate(`document.activeElement === document.querySelector("[data-journey-chapter='make-a-chess-move']")`), "Chapter Escape did not restore focus to the exited chapter");

await evaluate(`document.querySelector("[data-journey-chapter='heta']").dispatchEvent(new MouseEvent("click", { bubbles: true }))`);
await settle(80);
const worldBankLabel = await evaluate(`document.querySelector("[data-journey-milestone='heta-world-bank']")?.getAttribute("aria-label")`);
assert(worldBankLabel?.includes("presentation delivered by HETA’s CFO"), "World Bank authorship distinction is missing");
assert(!/Freeman delivered|worked for the World Bank|represented the World Bank/i.test(worldBankLabel ?? ""), "World Bank wording implies a false role");

await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "← JOURNEY").click()`);
await settle(80);
await evaluate(`document.querySelector("[data-journey-chapter='notre-dame']").focus()`);
await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await settle(80);
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Focus chapter").click()`);
await settle(520);
await capture("journey-focused-1440");
assert(
  await evaluate(`document.querySelector("svg[aria-label='Interactive Journey chapter map']").viewBox.baseVal.width < 1000`),
  "Explicit Focus chapter did not move the independent camera toward Notre Dame",
);
assert(await evaluate(`document.querySelector("[data-journey-state]").dataset.journeyState === "chapter"`), "Focus chapter changed Journey selection state");

for (let index = 0; index < 3; index += 1) {
  await evaluate(`document.querySelector("button[aria-label='Zoom in']").click()`);
  await settle(45);
}
assert(await evaluate(`document.querySelector("[data-journey-state]").dataset.cameraDensity === "close"`), "Journey did not enter close semantic density above the 2.1x hysteresis band");

const cameraBeforePan = await evaluate(`(() => {
  const viewport = document.querySelector("svg[aria-label='Interactive Journey chapter map']").parentElement;
  const rectangle = viewport.getBoundingClientRect();
  const svg = viewport.querySelector("svg");
  return { left: rectangle.left, top: rectangle.top, width: rectangle.width, height: rectangle.height, x: svg.viewBox.baseVal.x, y: svg.viewBox.baseVal.y };
})()`);
const panStartX = cameraBeforePan.left + cameraBeforePan.width * 0.48;
const panStartY = cameraBeforePan.top + cameraBeforePan.height * 0.22;
await send("Input.dispatchMouseEvent", { type: "mousePressed", x: panStartX, y: panStartY, button: "left", buttons: 1, clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: panStartX - 70, y: panStartY - 35, button: "left", buttons: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: panStartX - 70, y: panStartY - 35, button: "left", buttons: 0, clickCount: 1 });
await settle(80);
assert(
  await evaluate(`(() => {
    const view = document.querySelector("svg[aria-label='Interactive Journey chapter map']").viewBox.baseVal;
    return Math.abs(view.x - ${cameraBeforePan.x}) > 2 || Math.abs(view.y - ${cameraBeforePan.y}) > 2;
  })()`),
  "Dragging empty Journey space did not pan the camera",
);
assert(await evaluate(`document.querySelector("[data-journey-state]").dataset.journeyState === "chapter"`), "Camera pan changed Journey selection state");

await evaluate(`(() => {
  const viewport = document.querySelector("svg[aria-label='Interactive Journey chapter map']").parentElement;
  const rectangle = viewport.getBoundingClientRect();
  viewport.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 60, clientX: rectangle.left + rectangle.width / 2, clientY: rectangle.top + rectangle.height / 2 }));
})()`);
await settle(80);
assert(await evaluate(`document.querySelector("[data-journey-state]").dataset.cameraDensity === "close"`), "Journey density flickered while returning through the 2.1x hysteresis band");

await evaluate(`document.querySelector("button[aria-label='Fit the full Journey map']").click()`);
await settle(520);
const fittedJourneyCamera = await evaluate(`(() => ({
  width: document.querySelector("svg[aria-label='Interactive Journey chapter map']").viewBox.baseVal.width,
  state: document.querySelector("[data-journey-state]").dataset.journeyState,
  density: document.querySelector("[data-journey-state]").dataset.cameraDensity,
}))()`);
assert(fittedJourneyCamera.width > 1150, "Journey Fit control did not restore the full map camera");
assert(fittedJourneyCamera.state === "chapter", "Journey Fit control cleared the open chapter");
assert(fittedJourneyCamera.density === "overview", "Journey Fit control did not restore overview semantic density");

await evaluate(`document.querySelector("[data-journey-milestone='nd-visa']").focus()`);
await send("Input.dispatchKeyEvent", { type: "rawKeyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
await settle(80);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await settle(80);
assert(await evaluate(`document.querySelector("[data-journey-state]").getAttribute("data-journey-state") === "chapter"`), "Milestone Escape did not return to chapter");
assert(await evaluate(`document.activeElement === document.querySelector("[data-journey-chapter='notre-dame']")`), "Milestone Escape did not focus its parent chapter");
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await settle(80);
assert(await evaluate(`document.querySelector("[data-journey-state]").getAttribute("data-journey-state") === "overview"`), "Second Escape did not return to Journey overview");

await setViewport(375);
await navigate("/journey");
const mobileJourney = await evaluate(`(() => ({
  mapDisplay: getComputedStyle(document.querySelector("svg[aria-label='Interactive Journey chapter map']").closest("section")).display,
  chapterCards: document.querySelectorAll("[data-mobile-chapter]").length,
  milestoneCards: document.querySelectorAll("[data-mobile-milestone]").length,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}))()`);
assert(mobileJourney.mapDisplay === "none", "Mobile Journey still requires the freeform map");
assert(mobileJourney.chapterCards === 7, `Mobile Journey expected 7 chapter cards, found ${mobileJourney.chapterCards}`);
assert(mobileJourney.milestoneCards === 0, "Mobile Journey exposed milestones before chapter selection");
assert(mobileJourney.overflow <= 0, `Mobile Journey overflowed horizontally by ${mobileJourney.overflow}px`);
await evaluate(`document.querySelector("[data-mobile-chapter='strive']").scrollIntoView({ block: "center" })`);
await settle(120);
await tap("[data-mobile-chapter='strive']");
await waitFor(`document.querySelectorAll("[data-mobile-milestone]").length === 2`, "mobile chapter touch activation", 1600);
assert(await evaluate(`document.querySelector("[data-journey-state]").getAttribute("data-journey-state") === "chapter"`), "Touch did not open a mobile Journey chapter");
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "← JOURNEY").click()`);
await settle(80);
await evaluate(`document.querySelector("[data-mobile-chapter='notre-dame']").click()`);
await waitFor(`document.querySelectorAll("[data-mobile-milestone]").length === 10`, "mobile Notre Dame milestone reveal", 1600);
const mobileChapter = await evaluate(`(() => ({
  chapters: document.querySelectorAll("[data-mobile-chapter]").length,
  milestones: document.querySelectorAll("[data-mobile-milestone]").length,
  allAccessible: [...document.querySelectorAll("[data-mobile-milestone]")].every((button) => button.tabIndex === 0 && button.getAttribute("aria-label")?.length > 30),
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}))()`);
assert(mobileChapter.chapters === 0, "Mobile chapter overview remained interactive after opening a chapter");
assert(mobileChapter.milestones === 10, `Mobile Notre Dame expected 10 milestones, found ${mobileChapter.milestones}`);
assert(mobileChapter.allAccessible, "An open mobile milestone lacks accessible control text and description");
assert(mobileChapter.overflow <= 0, `Open mobile chapter overflowed horizontally by ${mobileChapter.overflow}px`);
await evaluate(`document.querySelector("[data-mobile-milestone='nd-cs-acms']").scrollIntoView({ block: "center" })`);
await settle(120);
await tap("[data-mobile-milestone='nd-cs-acms']");
await waitFor(`document.querySelector("[data-mobile-milestone='nd-cs-acms']").getAttribute("aria-pressed") === "true"`, "mobile milestone touch selection", 1600);
assert(await evaluate(`document.querySelector("[data-journey-state]").getAttribute("data-journey-state") === "milestone"`), "Touch did not select a mobile Journey milestone");
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.includes("CHAPTER"))?.click()`);
await settle(80);
await evaluate(`document.querySelector("[data-mobile-milestone='nd-jjl']").scrollIntoView({ block: "center" })`);
await settle(120);
await evaluate(`document.querySelector("[data-mobile-milestone='nd-jjl']").click()`);
await waitFor(`document.querySelector("[data-mobile-milestone='nd-jjl']").getAttribute("aria-pressed") === "true"`, "mobile JJL milestone selection", 1600);
assert(await evaluate(`document.querySelector("[data-mobile-milestone='nd-jjl']").nextElementSibling?.textContent.includes("Sophomore-summer industry experience")`), "Mobile JJL detail did not open");
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.includes("CHAPTER"))?.click()`);
await settle(80);
assert(await evaluate(`document.querySelector("[data-journey-state]").getAttribute("data-journey-state") === "chapter"`), "Mobile Back to Chapter did not step outward");
assert(await evaluate(`document.querySelectorAll("[data-mobile-milestone]").length === 10`), "Mobile Back to Chapter collapsed the chapter");
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "← JOURNEY").click()`);
await settle(80);
assert(await evaluate(`document.querySelectorAll("[data-mobile-chapter]").length === 7`), "Mobile Back to Journey did not restore chapter overview");

await setViewport(768);
await navigate("/journey");
const tabletJourney = await evaluate(`(() => ({
  chapterCards: document.querySelectorAll("[data-mobile-chapter]").length,
  mapDisplay: getComputedStyle(document.querySelector("svg[aria-label='Interactive Journey chapter map']").closest("section")).display,
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}))()`);
assert(tabletJourney.chapterCards === 7, `Tablet Journey expected 7 chapter cards, found ${tabletJourney.chapterCards}`);
assert(tabletJourney.mapDisplay === "none", "Tablet Journey did not use the guided hierarchy");
assert(tabletJourney.overflow <= 0, `Tablet Journey overflowed horizontally by ${tabletJourney.overflow}px`);
await evaluate(`document.querySelector("[data-mobile-chapter='research']").click()`);
await settle(80);
assert(await evaluate(`document.querySelectorAll("[data-mobile-milestone]").length === 2`), "Tablet Research chapter did not reveal two milestones");

await setViewport(1440, true);
await navigate("/journey");
await evaluate(`document.querySelector("[data-journey-chapter='notre-dame']").dispatchEvent(new MouseEvent("click", { bubbles: true }))`);
await settle(50);
assert(
  await evaluate(`document.querySelector("svg[aria-label='Interactive Journey chapter map']").viewBox.baseVal.width === 1160`),
  "Reduced-motion Journey selection unexpectedly moved the independent camera",
);
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Focus chapter").click()`);
assert(
  await evaluate(`document.querySelector("svg[aria-label='Interactive Journey chapter map']").viewBox.baseVal.width < 1000`),
  "Reduced-motion Journey Focus chapter did not snap immediately",
);
await evaluate(`(() => {
  const viewport = document.querySelector("svg[aria-label='Interactive Journey chapter map']").parentElement;
  const rectangle = viewport.getBoundingClientRect();
  viewport.dispatchEvent(new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: -120, clientX: rectangle.left + rectangle.width / 2, clientY: rectangle.top + rectangle.height / 2 }));
})()`);
await settle(50);
assert(
  await evaluate(`document.querySelector("svg[aria-label='Interactive Journey chapter map']").viewBox.baseVal.width < 900`),
  "Reduced-motion preference disabled dependable manual Journey zoom",
);
assert(
  await evaluate(`getComputedStyle(document.querySelector("[data-journey-milestone] > g")).animationName === "none"`),
  "Reduced-motion Journey satellite reveal still animates",
);

await setViewport(1024);
await navigate("/focus");
await evaluate(`document.querySelector(".focus-card a[href^='/projects']").click()`);
await waitFor(
  `location.pathname === "/projects" && location.hash === "#project-controlled-dialogue-simulator"`,
  "cross-route focus-card project link",
);
await waitFor(
  `document.activeElement?.id === "project-controlled-dialogue-simulator"`,
  "cross-route project target focus",
  1600,
);

await navigate("/projects");
const projectAudit = await evaluate(`(() => {
  const externalLinks = [...document.querySelectorAll(".project-card a[target='_blank']")];
  return {
    cards: document.querySelectorAll(".project-card").length,
    brokenLinks: externalLinks.filter((link) => !link.href || link.href.includes("TODO") || link.href.includes("#")).map((link) => link.href),
    unsafeLinks: externalLinks.filter((link) => !link.rel.includes("noopener") || !link.rel.includes("noreferrer")).map((link) => link.href),
    videos: document.querySelectorAll("video").length,
  };
})()`);
assert(projectAudit.cards === 7, `Expected 7 projects, found ${projectAudit.cards}`);
assert(projectAudit.brokenLinks.length === 0, `Project placeholders found: ${projectAudit.brokenLinks.join(", ")}`);
assert(projectAudit.unsafeLinks.length === 0, `Unsafe project links found: ${projectAudit.unsafeLinks.join(", ")}`);
assert(projectAudit.videos === 0, "Collapsed project cards mounted videos before expansion");
await evaluate(`document.querySelector(".project-filters button:nth-child(2)").click()`);
await settle(60);
assert(await evaluate(`document.querySelectorAll(".project-card").length === 4`), "Featured filter did not show 4 projects");
await evaluate(`document.querySelector(".project-filters button:nth-child(3)").click()`);
await settle(60);
assert(await evaluate(`document.querySelectorAll(".project-card").length === 3`), "Archive filter did not show 3 projects");
await evaluate(`document.querySelector(".project-filters button:first-child").click()`);
await settle(60);
await evaluate(`document.querySelector("#project-algorithm-visualizer .text-button").click()`);
await settle(80);
assert(await evaluate(`document.querySelectorAll("#project-algorithm-visualizer video").length === 1`), "Expanded legacy project did not mount its video");

await navigate("/contact");
const contactAudit = await evaluate(`(() => ({
  links: [...document.querySelectorAll(".contact__links a")].map((link) => ({ href: link.href, target: link.target, rel: link.rel })),
  emailLinks: document.querySelectorAll("a[href^='mailto:']").length,
  resumeLinks: [...document.querySelectorAll("a")].filter((link) => /résumé|resume|cv/i.test(link.textContent)).length,
  phoneText: document.body.textContent.match(/\\+?\\d[\\d() .-]{8,}\\d/g) ?? [],
}))()`);
assert(contactAudit.links.length === 2, `Expected GitHub and LinkedIn links, found ${contactAudit.links.length}`);
assert(contactAudit.emailLinks === 1, `Expected email to appear once, found ${contactAudit.emailLinks}`);
assert(contactAudit.resumeLinks === 0, "A résumé or CV link was rendered without an asset");
assert(contactAudit.phoneText.length === 0, "A phone number is visible on the Contact page");
assert(
  contactAudit.links.filter((link) => link.target === "_blank").every((link) => link.rel.includes("noopener") && link.rel.includes("noreferrer")),
  "A new-tab contact link is missing safe rel attributes",
);

await navigate("/projects.html");
await waitFor(
  `location.pathname.replace(/\\/$/, "") === "/projects"`,
  "legacy projects.html redirect",
);
await navigate("/#focus");
await waitFor(`location.pathname === "/focus"`, "legacy Focus hash redirect");
await navigate("/404.html");
await waitFor(`location.pathname === "/"`, "404 handoff recovery");

socket.close();
await fetch(`${chromeEndpoint}/json/close/${target.id}`);

const report = {
  baseUrl,
  routeChecks: routeResults.length,
  viewports,
  routes,
  legacyRedirects: ["/projects.html", "/#focus"],
  consoleErrors: [...new Set(consoleErrors)],
  failures,
};

console.log(JSON.stringify(report, null, 2));
if (consoleErrors.length > 0 || failures.length > 0) {
  process.exitCode = 1;
}
