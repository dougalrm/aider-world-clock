# WorldClock

A lightweight Flask web app for viewing multiple time zones at a glance. Add or remove city clocks, see the current date/time and time zone abbreviation, explore an interactive world map to pick cities, and switch between light/dark/system themes. Preferences are stored locally in your browser.

## Features

- Add/remove clocks for any IANA time zone (e.g., Europe/London, America/New_York)
- Auto-updating time, date, and time zone names (updates every second)
- Interactive world map with key cities you can toggle on/off
- Persistent client-side storage via localStorage
- Light/Dark/System theme toggle with accessible button and dynamic theme-color

## Tech Stack

- Backend: Flask (app factory pattern)
- Frontend: Vanilla JS modules and CSS
- Time/Locale: Intl.DateTimeFormat (browser built-in)
- Map: SVG with a small TopoJSON land layer fetched at runtime (via CDN)

## Quick Start

Requirements: Python 3.9+ recommended.

1) Create a virtual environment and install dependencies:
- python3 -m venv .venv
- source .venv/bin/activate
- pip install -r requirements.txt

2) Run the app (choose one):
- flask --app app --debug run
- python app.py

3) Open in your browser:
- http://127.0.0.1:5000/

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
- Clocks and map communicate via a custom DOM event: "clocks:changed".
- User preferences (selected clocks, theme) are stored in localStorage.

## Troubleshooting

- Flask cannot find the app:
  - Run with: flask --app app run
- Static assets don’t load:
  - Access via the Flask server (not file://) and ensure your browser supports ES modules.
- Land layer doesn’t render:
  - The TopoJSON is fetched from a CDN; check network access/console. The map still works without land.

## Contributing

PRs welcome. Please follow existing patterns:
- Keep frontend framework-free and modular
- Use the app factory and blueprints on the backend
- Prefer small, readable functions and accessibility-friendly UI controls

## License

This project has not declared a license. If you plan to use or contribute, consider opening an issue to discuss licensing.
