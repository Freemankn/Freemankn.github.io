  const skillDescriptions = {
    c: "C: Systems programming, memory management, CLI tools, and low-level optimization.",
    css: "CSS: Responsive layouts, Flexbox/Grid, animations, and UI styling.",
    html: "HTML5: Semantic structure, accessibility principles, and modern web standards.",
    java: "Java: Object-oriented programming, backend APIs, and data structure implementation.",
    javascript: "JavaScript: DOM manipulation, interactive UI logic, and client-side behavior.",
    matlab: "MATLAB: Numerical computation, data modeling, and engineering simulations.",
    python: "Python: Data analysis, scripting, machine learning pipelines, and backend logic.",
    r: "R: Statistical modeling, regression analysis, and data visualization.",
    typescript: "TypeScript: Type-safe frontend architecture and scalable web applications.",
    figma: "Figma: UI/UX prototyping and interface system design.",
    openai: "OpenAI API: AI integration, prompt engineering, and intelligent system development."
  };

  const badgeText = document.getElementById("badge-text");
  const badges = document.querySelectorAll(".badge-slot");

  badges.forEach(badge => {
    badge.addEventListener("click", () => {
      const skill = badge.dataset.skill;

      if (skillDescriptions[skill]) {
        badgeText.innerHTML = `<h5>${skillDescriptions[skill]}</h5>`;
      }
    });
  });