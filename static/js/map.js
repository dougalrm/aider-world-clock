/**
 * SVG world map rendering and interaction. Integrates with clocks store.
 */
import { geoEquirectangular, geoPath } from "https://cdn.jsdelivr.net/npm/d3-geo@3/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";
import { accents, accentForIndex, isInClocks, toggleClock } from "./clocks.js";

const MAP_W = 1200;
const MAP_H = 600;

// Minimal set of cities to avoid label overlap
const keyCities = [
  { name: "London", tz: "Europe/London", lat: 51.5074, lon: -0.1278 },
  { name: "New York", tz: "America/New_York", lat: 40.7128, lon: -74.006 },
  { name: "Beijing", tz: "Asia/Shanghai", lat: 39.9042, lon: 116.4074 },
  { name: "Tokyo", tz: "Asia/Tokyo", lat: 35.6895, lon: 139.6917 },
  { name: "Sydney", tz: "Australia/Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "Paris", tz: "Europe/Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Dubai", tz: "Asia/Dubai", lat: 25.2048, lon: 55.2708 },
  { name: "São Paulo", tz: "America/Sao_Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Johannesburg", tz: "Africa/Johannesburg", lat: -26.2041, lon: 28.0473 },
];

function project(lon, lat) {
  const x = ((lon + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return [x, y];
}

async function ensureLand() {
  const layer = document.getElementById("land-layer");
  if (!layer || layer.childElementCount) return;
  try {
    const resp = await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json");
    const topo = await resp.json();
    const land = feature(topo, topo.objects.land);
    const proj = geoEquirectangular().translate([MAP_W / 2, MAP_H / 2]).scale(MAP_W / (2 * Math.PI));
    const pathGen = geoPath(proj);
    const ns = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", pathGen(land) || "");
    layer.appendChild(path);
  } catch {
    // graceful degradation: show only graticules and cities
  }
}

function drawGraticules() {
  const grat = document.getElementById("graticule");
  if (!grat || grat.childElementCount !== 0) return;
  const ns = "http://www.w3.org/2000/svg";
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * MAP_W;
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", String(x));
    line.setAttribute("y1", "0");
    line.setAttribute("x2", String(x));
    line.setAttribute("y2", String(MAP_H));
    if (lon % 90 === 0) line.classList.add("major");
    grat.appendChild(line);
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * MAP_H;
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", String(y));
    line.setAttribute("x2", String(MAP_W));
    line.setAttribute("y2", String(y));
    if (lat === 0) line.classList.add("major");
    grat.appendChild(line);
  }
}

function drawCities() {
  const citiesLayer = document.getElementById("cities-layer");
  if (!citiesLayer || citiesLayer.childElementCount) return;
  const ns = "http://www.w3.org/2000/svg";
  keyCities.forEach((c, i) => {
    const [x, y] = project(c.lon, c.lat);
    const yOffset = ((i % 3) - 1) * 6;
    const g = document.createElementNS(ns, "g");
    g.classList.add("city", accentForIndex(i));
    g.setAttribute("data-tz", c.tz);
    g.setAttribute("data-name", c.name);

    const halo = document.createElementNS(ns, "circle");
    halo.setAttribute("class", "halo");
    halo.setAttribute("cx", String(x));
    halo.setAttribute("cy", String(y));
    halo.setAttribute("r", "7");

    const dot = document.createElementNS(ns, "circle");
    dot.setAttribute("class", "dot");
    dot.setAttribute("cx", String(x));
    dot.setAttribute("cy", String(y));
    dot.setAttribute("r", "3.5");

    const label = document.createElementNS(ns, "text");
    label.setAttribute("class", "label");
    label.setAttribute("x", String(x + (x > MAP_W / 2 ? -8 : 8)));
    label.setAttribute("y", String(y - 8 + yOffset));
    label.setAttribute("text-anchor", x > MAP_W / 2 ? "end" : "start");
    label.textContent = c.name;

    const title = document.createElementNS(ns, "title");
    title.textContent = `${c.name}`;

    g.appendChild(halo);
    g.appendChild(dot);
    g.appendChild(label);
    g.appendChild(title);

    citiesLayer.appendChild(g);
  });

  // Click handler to toggle clocks
  document.getElementById("world-map")?.addEventListener("click", (e) => {
    const city = e.target.closest(".city");
    if (!city) return;
    const tz = city.getAttribute("data-tz");
    const name = city.getAttribute("data-name") || tz;
    if (!tz) return;
    toggleClock(tz, name);
  });
}

function renderMapSelections() {
  const layer = document.getElementById("cities-layer");
  if (!layer) return;
  const selected = new Set((window.__clocksCache || []).map((c) => c.tz));
  layer.querySelectorAll(".city").forEach((node) => {
    const tz = node.getAttribute("data-tz");
    if (tz && selected.has(tz)) node.classList.add("selected");
    else node.classList.remove("selected");
  });
}

function timeFormatter(timeZone) {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  });
}
function tzNameFormatter(timeZone) {
  return new Intl.DateTimeFormat([], {
    timeZone,
    timeZoneName: "short",
  });
}
function getTimeZoneName(ms, timeZone) {
  try {
    const parts = tzNameFormatter(timeZone).formatToParts(ms);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value ?? "";
  } catch {
    return "";
  }
}
function updateTooltips() {
  const now = Date.now();
  const layer = document.getElementById("cities-layer");
  if (!layer) return;
  layer.querySelectorAll(".city").forEach((node) => {
    const tz = node.getAttribute("data-tz");
    const name = node.getAttribute("data-name") || "";
    const title = node.querySelector("title");
    if (!tz || !title) return;
    try {
      const t = timeFormatter(tz).format(now);
      const tzName = getTimeZoneName(now, tz);
      title.textContent = `${name} — ${t} (${tzName})`;
    } catch {
      title.textContent = `${name}`;
    }
  });
}

export function initMap() {
  // cache current clocks for selection rendering
  window.__clocksCache = [];
  document.addEventListener("clocks:changed", (e) => {
    window.__clocksCache = Array.isArray(e.detail) ? e.detail : [];
    renderMapSelections();
  });

  ensureLand();
  drawGraticules();
  drawCities();
  renderMapSelections();

  updateTooltips();
  setInterval(updateTooltips, 1000);
}
