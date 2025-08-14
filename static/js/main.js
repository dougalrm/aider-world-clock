import { initTheme } from "./theme.js";
import { initClocks } from "./clocks.js";
import { initMap } from "./map.js";

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initClocks();
  initMap();
});
