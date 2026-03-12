# AGENTS.md

## Cursor Cloud specific instructions

This is a **zero-dependency static HTML/CSS/JS web application** (LionCell Battery Pack Configurator). There is no package manager, no build step, no linter, and no automated test framework.

### Running the app

Serve the project root with any static file server:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000` in a browser. The app loads `index.html` which references `css/styles.css` and three JS files under `js/`.

### Key caveats

- **No build / lint / test tooling**: The project has no `package.json`, no linter config, and no test runner. Code quality checks must be done via manual review or by temporarily adding a tool.
- **Google Fonts CDN**: The app loads Outfit and JetBrains Mono from `fonts.googleapis.com`. It works without network access (falls back to system fonts), but font rendering will differ.
- **Docker (optional)**: A `Dockerfile` + `docker-compose.yml` exist for production deployment via Nginx on port 3085. These are not needed for local development.
