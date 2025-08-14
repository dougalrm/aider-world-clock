# WorldClock 🌍⏰

A modern, lightweight Flask web app for viewing multiple time zones at a glance. Add or remove city clocks, explore an interactive world map to pick cities, and switch between light/dark/system themes. Preferences are stored locally in your browser. ✨

![Python](https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)
![License](https://img.shields.io/badge/License-Unspecified-lightgrey)

## Table of Contents
- Features
- Tech Stack
- Quick Start
- Usage
- Project Structure
- How It Works
- Accessibility
- Troubleshooting
- Contributing
- License

## Features

- ⏱️ Live-updating time and date (every second)
- 🗺️ Clickable world map with key cities
- 💾 Persistent client-side storage via localStorage
- 🌓 Light/Dark/System theme toggle with accessible labels
- 🔤 Locale-aware formatting (Intl.DateTimeFormat)
- ♿ Keyboard and screen-reader friendly components

## Tech Stack

- 🐍 Backend: Flask (app factory + blueprint)
- 🎨 Frontend: Vanilla JS modules and modern CSS
- 🌐 Time/Locale: Intl.DateTimeFormat (built into browsers)
- 🗺️ Map: SVG with d3-geo and topojson-client (fetched via CDN)
- ⚡ No build step required — ES modules loaded directly

## Quick Start

Requirements: Python 3.9+ recommended.

- python3 -m venv .venv
- source .venv/bin/activate
- pip install -r requirements.txt
- flask --app app --debug run

Then open http://127.0.0.1:5000/

Alternatively, you can run: python app.py

## Usage

- ➕ Add a clock: start typing an IANA time zone (e.g., Europe/Paris) and use the datalist suggestions, then press Add.
- 🧭 Map interaction: click a city to add/remove it from your clocks.
- 🌓 Theme: use the top-right toggle to switch between System/Light/Dark. The page updates the theme-color meta for better PWA/chrome coloring.

## Project Structure

- app.py — Entrypoint that creates the Flask app via create_app()
- worldclock/__init__.py — App factory and Flask configuration (templates/static dirs, blueprint registration)
- worldclock/web.py — Blueprint with the home route
- templates/index.html — Main HTML template (rendered by the home route)
- static/css/style.css — Styles (themes, layout, cards, map)
- static/js/main.js — Frontend bootstrap (initializes theme, clocks, and map)
- static/js/clocks.js — Clocks list/state management, rendering, ticking, localStorage
- static/js/map.js — World map rendering and city selection; syncs with clocks
- static/js/theme.js — Theme detection, persistence, accessible toggle
- requirements.txt — Python dependencies

## How It Works

- The app serves a single page which loads ES modules from /static/js.
- d3-geo and topojson-client are imported directly from a CDN at runtime; no build step is required.
- Modules communicate via a custom DOM event: "clocks:changed" so the map and clocks stay in sync.
- User preferences (selected clocks, theme) live entirely in localStorage.

## Accessibility

- Buttons and controls have clear labels and titles.
- Live regions announce clock updates politely (aria-live="polite").
- High-contrast themes and reduced-motion friendly transitions are respected.

## Troubleshooting

- 🧪 Flask cannot find the app:
  - Run with: flask --app app run
- 🗂️ Static assets don’t load:
  - Access via the Flask server (not file://) and ensure your browser supports ES modules.
- 🌏 Land layer doesn’t render:
  - The TopoJSON is fetched from a CDN; check network access/console. The map still works without land.

## Contributing

PRs welcome! Please follow existing patterns:
- Keep the frontend framework-free and modular.
- Use the app factory and blueprints on the backend.
- Prefer small, readable functions and accessible UI controls.
- Conventional Commit messages (e.g., feat:, fix:, docs:) appreciated. 🙏

## License

No license has been declared for this project. If you plan to use or contribute, consider opening an issue to discuss licensing. 📄
