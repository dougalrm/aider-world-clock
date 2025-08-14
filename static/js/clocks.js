/**
 * Clocks list management: rendering, add/remove, persistence, ticking.
 * Exposes events and helpers for other modules.
 */

export const accents = ["accent-aqua", "accent-pink", "accent-lime"];

const STORAGE_KEY = "worldclock.clocks.v1";

const allCities = [
  { name: "London", tz: "Europe/London" },
  { name: "New York", tz: "America/New_York" },
  { name: "Beijing", tz: "Asia/Shanghai" },
  { name: "Paris", tz: "Europe/Paris" },
  { name: "Tokyo", tz: "Asia/Tokyo" },
  { name: "Sydney", tz: "Australia/Sydney" },
  { name: "Los Angeles", tz: "America/Los_Angeles" },
  { name: "Chicago", tz: "America/Chicago" },
  { name: "Toronto", tz: "America/Toronto" },
  { name: "Mexico City", tz: "America/Mexico_City" },
  { name: "São Paulo", tz: "America/Sao_Paulo" },
  { name: "Buenos Aires", tz: "America/Buenos_Aires" },
  { name: "Santiago", tz: "America/Santiago" },
  { name: "Bogota", tz: "America/Bogota" },
  { name: "Lima", tz: "America/Lima" },
  { name: "Denver", tz: "America/Denver" },
  { name: "Phoenix", tz: "America/Phoenix" },
  { name: "Vancouver", tz: "America/Vancouver" },
  { name: "Anchorage", tz: "America/Anchorage" },
  { name: "Honolulu", tz: "Pacific/Honolulu" },
  { name: "Berlin", tz: "Europe/Berlin" },
  { name: "Madrid", tz: "Europe/Madrid" },
  { name: "Rome", tz: "Europe/Rome" },
  { name: "Amsterdam", tz: "Europe/Amsterdam" },
  { name: "Zurich", tz: "Europe/Zurich" },
  { name: "Stockholm", tz: "Europe/Stockholm" },
  { name: "Oslo", tz: "Europe/Oslo" },
  { name: "Copenhagen", tz: "Europe/Copenhagen" },
  { name: "Dublin", tz: "Europe/Dublin" },
  { name: "Lisbon", tz: "Europe/Lisbon" },
  { name: "Moscow", tz: "Europe/Moscow" },
  { name: "Istanbul", tz: "Europe/Istanbul" },
  { name: "Athens", tz: "Europe/Athens" },
  { name: "Helsinki", tz: "Europe/Helsinki" },
  { name: "Vienna", tz: "Europe/Vienna" },
  { name: "Prague", tz: "Europe/Prague" },
  { name: "Warsaw", tz: "Europe/Warsaw" },
  { name: "Budapest", tz: "Europe/Budapest" },
  { name: "Brussels", tz: "Europe/Brussels" },
  { name: "Mumbai", tz: "Asia/Kolkata" },
  { name: "Delhi", tz: "Asia/Kolkata" },
  { name: "Karachi", tz: "Asia/Karachi" },
  { name: "Dubai", tz: "Asia/Dubai" },
  { name: "Riyadh", tz: "Asia/Riyadh" },
  { name: "Doha", tz: "Asia/Qatar" },
  { name: "Tel Aviv", tz: "Asia/Jerusalem" },
  { name: "Cairo", tz: "Africa/Cairo" },
  { name: "Nairobi", tz: "Africa/Nairobi" },
  { name: "Lagos", tz: "Africa/Lagos" },
  { name: "Casablanca", tz: "Africa/Casablanca" },
  { name: "Johannesburg", tz: "Africa/Johannesburg" },
  { name: "Singapore", tz: "Asia/Singapore" },
  { name: "Hong Kong", tz: "Asia/Hong_Kong" },
  { name: "Taipei", tz: "Asia/Taipei" },
  { name: "Bangkok", tz: "Asia/Bangkok" },
  { name: "Kuala Lumpur", tz: "Asia/Kuala_Lumpur" },
  { name: "Jakarta", tz: "Asia/Jakarta" },
  { name: "Manila", tz: "Asia/Manila" },
  { name: "Seoul", tz: "Asia/Seoul" },
  { name: "Auckland", tz: "Pacific/Auckland" },
  { name: "Melbourne", tz: "Australia/Melbourne" },
  { name: "Perth", tz: "Australia/Perth" },
];

let clocks = loadClocks();
let listEl;
let timerId;

function loadClocks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [
    { tz: "Europe/London", label: "UK (London)", accent: accents[0] },
    { tz: "America/New_York", label: "New York City", accent: accents[1] },
    { tz: "Asia/Shanghai", label: "Beijing", accent: accents[2] },
  ];
}
function saveClocks(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function getClocks() {
  return clocks.slice();
}
export function isInClocks(tz) {
  return clocks.some((c) => c.tz === tz);
}
export function accentForIndex(i) {
  return accents[i % accents.length];
}
export function toggleClock(tz, label) {
  if (isInClocks(tz)) {
    clocks = clocks.filter((c) => c.tz !== tz);
  } else {
    const accent = accents[clocks.length % accents.length];
    clocks.push({ tz, label: label || niceLabelFromTZ(tz), accent });
  }
  saveClocks(clocks);
  render();
  dispatchClocksChanged();
}

function dispatchClocksChanged() {
  document.dispatchEvent(new CustomEvent("clocks:changed", { detail: getClocks() }));
}

function niceLabelFromTZ(tz) {
  const parts = tz.split("/");
  const city = parts[parts.length - 1]?.replace(/_/g, " ") || tz;
  return city;
}

function createCard({ tz, label, accent }) {
  const li = document.createElement("li");
  li.className = `card ${accent} clock-card`;
  li.tabIndex = 0;
  li.dataset.tz = tz;

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.type = "button";
  remove.title = "Remove clock";
  remove.setAttribute("aria-label", "Remove clock");
  remove.textContent = "×";

  const h2 = document.createElement("h2");
  const labelSpan = document.createElement("span");
  labelSpan.className = "label";
  labelSpan.textContent = label || niceLabelFromTZ(tz);
  const tzSpan = document.createElement("span");
  tzSpan.className = "tz";
  tzSpan.textContent = "—";
  h2.appendChild(labelSpan);
  h2.append(" ");
  h2.appendChild(tzSpan);

  const time = document.createElement("div");
  time.className = "time";
  time.setAttribute("aria-live", "polite");
  time.setAttribute("aria-atomic", "true");
  time.textContent = "--:--:--";

  const date = document.createElement("div");
  date.className = "date";
  date.textContent = "—";

  li.appendChild(remove);
  li.appendChild(h2);
  li.appendChild(time);
  li.appendChild(date);
  return li;
}

// Formatters
function timeFormatter(timeZone) {
  return new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone,
  });
}
function dateFormatter(timeZone) {
  return new Intl.DateTimeFormat([], {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
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

function tick() {
  const now = Date.now();
  const cards = listEl?.querySelectorAll(".clock-card") || [];
  cards.forEach((card) => {
    const tz = card.dataset.tz;
    const timeEl = card.querySelector(".time");
    const dateEl = card.querySelector(".date");
    const tzEl = card.querySelector(".tz");
    try {
      timeEl.textContent = timeFormatter(tz).format(now);
      dateEl.textContent = dateFormatter(tz).format(now);
      tzEl.textContent = getTimeZoneName(now, tz);
    } catch {
      timeEl.textContent = "Invalid timezone";
      dateEl.textContent = "";
      tzEl.textContent = "";
    }
  });
}

function render() {
  if (!listEl) return;
  listEl.innerHTML = "";
  clocks.forEach((c, i) => {
    if (!c.accent) c.accent = accents[i % accents.length];
    const card = createCard(c);
    listEl.appendChild(card);
  });
  tick(); // initial draw
}

function populateTZList() {
  const dl = document.getElementById("tz-list");
  if (!dl) return;
  dl.innerHTML = "";
  const seen = new Set();
  const items = allCities.slice().sort((a, b) => a.name.localeCompare(b.name));
  for (const c of items) {
    if (seen.has(c.tz)) continue;
    seen.add(c.tz);
    const opt = document.createElement("option");
    opt.value = c.tz;
    opt.label = `${c.name} — ${c.tz}`;
    dl.appendChild(opt);
  }
}

export function initClocks() {
  listEl = document.getElementById("clocks");
  populateTZList();
  render();
  clearInterval(timerId);
  timerId = setInterval(tick, 1000);

  // Add/remove handlers
  document.getElementById("add-clock-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("tz-input");
    const tz = input.value.trim();
    if (!tz) return;
    // Validate timezone
    try {
      new Intl.DateTimeFormat([], { timeZone: tz }).format(Date.now());
    } catch {
      input.setCustomValidity("Unknown timezone. Use a valid IANA timezone like Europe/Paris");
      input.reportValidity();
      input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
      return;
    }
    if (isInClocks(tz)) {
      input.setCustomValidity("Clock already added");
      input.reportValidity();
      input.addEventListener("input", () => input.setCustomValidity(""), { once: true });
      return;
    }
    const accent = accents[clocks.length % accents.length];
    clocks.push({ tz, label: niceLabelFromTZ(tz), accent });
    saveClocks(clocks);
    input.value = "";
    render();
    dispatchClocksChanged();
  });

  document.getElementById("clocks")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove-btn");
    if (!btn) return;
    const card = btn.closest(".clock-card");
    const tz = card?.dataset.tz;
    if (!tz) return;
    clocks = clocks.filter((c) => c.tz !== tz);
    saveClocks(clocks);
    card.remove();
    dispatchClocksChanged();
  });

  // Announce initial state
  dispatchClocksChanged();
}
