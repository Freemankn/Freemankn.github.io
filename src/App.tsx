import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer/Footer";
import { Navigation } from "./components/Navigation/Navigation";
import { RouteEffects } from "./components/RouteEffects/RouteEffects";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { FocusPage } from "./pages/FocusPage";
import { HomePage } from "./pages/HomePage";
import { JourneyPage } from "./pages/JourneyPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { SkillsPage } from "./pages/SkillsPage";

function ArchitectureBackground() {
  return (
    <div className="architecture-background" aria-hidden="true">
      <svg viewBox="0 0 1600 1200" preserveAspectRatio="xMidYMid slice">
        <path d="M-80 230h260l95 96h220l90-90h280l115 115h260l90-90h330" />
        <path d="M120 790h245l98-98h210l148 148h280l72-72h375" />
        <path d="M310-40v180l92 92m660-272v236l-87 87m338 134v280l-118 118" />
        <circle cx="180" cy="230" r="8" />
        <circle cx="495" cy="326" r="7" />
        <circle cx="865" cy="236" r="8" />
        <circle cx="1220" cy="351" r="7" />
        <circle cx="365" cy="790" r="8" />
        <circle cx="673" cy="692" r="7" />
        <circle cx="1101" cy="840" r="8" />
        <circle cx="1313" cy="768" r="7" />
      </svg>
    </div>
  );
}

function App() {
  const location = useLocation();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <ArchitectureBackground />
      <Navigation />
      <RouteEffects />

      <main id="main-content">
        <div className="route-view" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
