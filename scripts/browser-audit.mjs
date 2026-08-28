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
      await evaluate(`document.querySelector(".technology-orbit").scrollIntoView()`);
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
const orbitCount = await evaluate(`document.querySelectorAll(".technology-orbit__button").length`);
assert(orbitCount === 7, `Expected 7 orbit technologies, found ${orbitCount}`);
await evaluate(`document.querySelector(".technology-orbit__button").focus()`);
await settle(50);
assert(await evaluate(`document.querySelector(".technology-orbit").classList.contains("is-paused")`), "Orbit did not pause on keyboard focus");
assert(await evaluate(`getComputedStyle(document.querySelector(".technology-orbit__ring")).animationPlayState === "paused"`), "Orbit ring animation did not pause");
await evaluate(`document.querySelector("button[aria-label='Show details for TypeScript']").click()`);
await settle(80);
assert(await evaluate(`document.querySelector(".technology-orbit__details h3").textContent === "TypeScript"`), "Orbit selection did not update details");

await setViewport(375);
await navigate("/skills");
const compactOrbit = await evaluate(`({
  ringPosition: getComputedStyle(document.querySelector(".technology-orbit__ring")).position,
  ringAnimation: getComputedStyle(document.querySelector(".technology-orbit__ring")).animationName,
  buttonCount: document.querySelectorAll(".technology-orbit__button").length,
})`);
assert(compactOrbit.ringPosition === "static", `Small-screen orbit position is ${compactOrbit.ringPosition}`);
assert(compactOrbit.ringAnimation === "none", `Small-screen orbit animation is ${compactOrbit.ringAnimation}`);
assert(compactOrbit.buttonCount === 7, "Small-screen skills list lost technologies");
await evaluate(`document.documentElement.style.scrollBehavior = "auto"; document.querySelector("button[aria-label='Show details for MATLAB']").scrollIntoView({ block: "center" })`);
await settle(80);
await tap("button[aria-label='Show details for MATLAB']");
await settle(80);
assert(await evaluate(`document.querySelector(".technology-orbit__details h3").textContent === "MATLAB"`), "Touch-sized orbit selection failed");

await setViewport(1440, true);
await navigate("/skills");
assert(await evaluate(`getComputedStyle(document.querySelector(".technology-orbit__ring")).animationName === "none"`), "Reduced motion did not stop the technology orbit");

await setViewport(1440);
await navigate("/journey");
const journeyNodeCount = await evaluate(`document.querySelectorAll('[role="button"][aria-label^="Milestone"]').length`);
assert(journeyNodeCount === 8, `Expected 8 journey map nodes, found ${journeyNodeCount}`);
await evaluate(`document.querySelector('[role="button"][aria-label*="University of Notre Dame"]').dispatchEvent(new MouseEvent("click", { bubbles: true }))`);
await settle(650);
const selectedJourney = await evaluate(`(() => {
  const selected = document.querySelector('[role="button"][aria-pressed="true"]');
  const unrelated = document.querySelector('[role="button"][aria-label*="Strive Prep Rise"]');
  const details = document.querySelector('nav[aria-label="Connected journey milestones"]')?.closest("section");
  return {
    selectedLabel: selected?.getAttribute("aria-label"),
    unrelatedOpacity: Number.parseFloat(getComputedStyle(unrelated).opacity),
    detailsTitle: details?.querySelector("h2")?.textContent,
    viewWidth: document.querySelector("svg[aria-labelledby]").viewBox.baseVal.width,
    returnToMap: [...document.querySelectorAll("button")].some((button) => button.textContent.trim() === "Return to Map"),
  };
})()`);
await capture("journey-selected-1440");
assert(selectedJourney.selectedLabel?.includes("University of Notre Dame"), "Journey node selection did not persist");
assert(selectedJourney.unrelatedOpacity < 0.5, "Journey selection did not dim an unrelated node");
assert(selectedJourney.detailsTitle === "University of Notre Dame", "Journey details did not open for the selected node");
assert(selectedJourney.viewWidth < 600, `Journey map did not zoom toward the selected node; width=${selectedJourney.viewWidth}`);
assert(selectedJourney.returnToMap, "Journey selection did not expose a Return to Map control");
await evaluate(`document.querySelector('nav[aria-label="Connected journey milestones"] button:not(:disabled):last-child').click()`);
await settle(650);
assert(
  await evaluate(`document.querySelector('nav[aria-label="Connected journey milestones"]').closest("section").querySelector("h2").textContent === "Northeast Early College Alumni"`),
  "Journey connected-next navigation did not update the selected milestone",
);
await evaluate(`[...document.querySelectorAll("button")].find((button) => button.textContent.trim() === "Return to Map").click()`);
await settle(650);
assert(
  await evaluate(`document.querySelector("svg[aria-labelledby]").viewBox.baseVal.width > 1000`),
  "Return to Map did not restore the constellation overview",
);
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
await settle(80);
assert(
  await evaluate(`document.querySelectorAll('[role="button"][aria-pressed="true"]').length === 0`),
  "Escape did not clear the Journey selection",
);

await setViewport(375);
await navigate("/journey");
const mobileJourney = await evaluate(`(() => ({
  mapDisplay: getComputedStyle(document.querySelector("svg[aria-labelledby]").closest("section")).display,
  guidedCards: document.querySelectorAll('button[aria-controls$="-details"]').length,
}))()`);
assert(mobileJourney.mapDisplay === "none", "Mobile Journey still requires the freeform map");
assert(mobileJourney.guidedCards === 8, `Mobile Journey expected 8 guided cards, found ${mobileJourney.guidedCards}`);
await evaluate(`document.documentElement.style.scrollBehavior = "auto"; document.querySelector('button[aria-controls$="-details"]').scrollIntoView({ block: "center", inline: "center" })`);
await settle(180);
if (debugInteractions) {
  console.log("mobile Journey touch target", await evaluate(`(() => {
    const button = document.querySelector('button[aria-controls$="-details"]');
    const rectangle = button.getBoundingClientRect();
    const target = document.elementFromPoint(rectangle.left + rectangle.width / 2, rectangle.top + rectangle.height / 2);
    return {
      text: button.textContent.trim().slice(0, 80),
      pressed: button.getAttribute("aria-pressed"),
      rectangle: { x: rectangle.x, y: rectangle.y, width: rectangle.width, height: rectangle.height },
      target: target?.tagName,
      targetText: target?.textContent?.trim().slice(0, 60),
      pointerEvents: getComputedStyle(button).pointerEvents,
    };
  })()`));
}
await tap('button[aria-controls$="-details"]');
await waitFor(
  `document.querySelector('button[aria-controls$="-details"]').getAttribute("aria-pressed") === "true"`,
  "mobile Journey touch selection",
  1600,
);
assert(
  await evaluate(`document.querySelector('button[aria-controls$="-details"]').getAttribute("aria-pressed") === "true"`),
  "Touch did not select a mobile Journey milestone",
);

await setViewport(1440, true);
await navigate("/journey");
await evaluate(`document.querySelector('[role="button"][aria-label*="University of Notre Dame"]').dispatchEvent(new MouseEvent("click", { bubbles: true }))`);
await settle(50);
assert(
  await evaluate(`document.querySelector("svg[aria-labelledby]").viewBox.baseVal.width === 470`),
  "Reduced-motion Journey selection did not switch immediately to the focused view",
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
  resumeLinks: [...document.querySelectorAll("a")].filter((link) => /résumé|resume|cv/i.test(link.textContent)).length,
  phoneText: document.body.textContent.match(/\\+?\\d[\\d() .-]{8,}\\d/g) ?? [],
}))()`);
assert(contactAudit.links.length === 3, `Expected 3 contact links, found ${contactAudit.links.length}`);
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
