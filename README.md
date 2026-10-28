# AI Customer Centricity Hackathon — Home Wi‑Fi Check

A browser-based broadband self-service prototype: scan rooms with the phone camera, see Wi‑Fi coverage
in AR and 3D, get an AI diagnosis, follow camera-guided router checks, and receive a before-and-after
treatment report — in English and Arabic.

**Live demo:** https://aymanalmaawali-afk.github.io/ai-customer-centricity-hackathon/
(open on an iPhone in Safari; camera and motion need HTTPS, which Pages provides)

## Repository layout

| Path | What it is |
|---|---|
| `app/` | The implemented web app (Vite + React + TypeScript). See [`app/README.md`](app/README.md). |
| `project/` | The original Claude Design prototypes (`Home WiFi Check v7.dc.html` is the one implemented) and assets. |
| `chats/` | Design conversation transcript — the intent behind each design decision. |
| `HANDOFF.md` | Notes from the design-tool export. |
| `.github/workflows/pages.yml` | Builds `app/` and deploys it to GitHub Pages on every push to `main`. |

## Run locally

```bash
cd app
npm install
npm run dev
```

All account data, network measurements and detections in the prototype are simulated.
