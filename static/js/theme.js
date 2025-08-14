/**
 * Theme handling (system/light/dark) with persistence and accessible toggle.
 */
const THEME_KEY = "worldclock.theme";
const root = document.documentElement;

function getStoredTheme() {
  return localStorage.getItem(THEME_KEY) || "system";
}
function getSystemTheme() {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function updateThemeMeta(theme) {
  const darkColor = "#0d0f1a";
  const lightColor = "#f3f7ff";
  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (theme === "system") {
    if (meta) meta.parentElement.removeChild(meta);
    return;
  }
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", theme === "dark" ? darkColor : lightColor);
}
function updateToggleLabel(label) {
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.textContent = label;
    btn.title = "Theme: " + label;
  }
}
function applyTheme(pref) {
  if (pref === "system") {
    root.removeAttribute("data-theme");
    updateThemeMeta(getSystemTheme());
    updateToggleLabel("System");
  } else {
    root.setAttribute("data-theme", pref);
    updateThemeMeta(pref);
    updateToggleLabel(pref.charAt(0).toUpperCase() + pref.slice(1));
  }
}

export function initTheme() {
  const stored = getStoredTheme();
  applyTheme(stored);

  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = getStoredTheme();
      const next = current === "system" ? "light" : current === "light" ? "dark" : "system";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  if (window.matchMedia) {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener?.("change", () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    });
  }
}
