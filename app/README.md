# Home Wi‑Fi Check (v7)

Implementation of `project/Home WiFi Check v7.dc.html` from the Claude Design handoff: a static
mobile web app (Vite + React + TypeScript, Three.js bundled) that reproduces the prototype exactly:
phone frame, step navigator, all 14 screens, English/Arabic (RTL), Ava assistant, AR/3D views.

## Run

```bash
cd app
npm install
npm run dev        # http://localhost:5173 (also on your LAN via --host)
npm run build      # static site in app/dist — host it anywhere over HTTPS
```

The camera only works over **HTTPS** (or localhost), so test on an iPhone through a deployed link.
`.github/workflows/pages.yml` publishes to GitHub Pages on every push to `main`
(enable it once in Settings → Pages → Source: GitHub Actions).

## Link options (replace the design tool's Tweaks panel)

| Parameter | Values | Default |
|---|---|---|
| `scenario` | `wifi` (room coverage), `device`, `router`, `network` | `wifi` |
| `demo` | `1` = never ask for the camera, always use the demo room | off |
| `primary`, `accent` | brand colours, URL-encoded hex (`%231554A8`) | `#1554A8`, `#F28C28` |

e.g. `…/?scenario=network`. On desktop the scenario can also be switched from the left column.

## Code map

- `src/data.ts` — floor plan, scan objects, scenarios, all EN/AR strings (copied verbatim from the design)
- `src/viewModel.ts` — port of the design's `renderVals()`: every label, colour and rule per screen
- `src/App.tsx` — controller: navigation, timers, camera, 3D, speech, chat
- `src/screens/*` — screen layouts; `src/ui.tsx` — shared tokens and components
- `src/lib/` — signal model & heatmaps, Three.js view, Ava's scripted replies, optional AI hook

## iPhone / no-WebXR fallback

iOS Safari has no WebXR, so AR and VR fall back to the phone's gyroscope (`src/lib/motion.ts`):

- **AR coverage:** the floor heatmap tilts, turns and rolls with the phone so it stays anchored to the
  floor. iOS asks for motion access on the *Allow camera* tap (or tap **ENABLE MOTION TRACKING** on the
  AR screen); tap **MOTION-TRACKED · TAP TO RECENTRE** to re-anchor.
- **Enter VR:** opens a full-screen look-around view at standing height inside a room. Move the phone to
  look around, tap a room to stand in it. **Split view** gives a Cardboard-style stereo view for landscape.
- Without a gyroscope (desktop) or with motion access denied, both fall back to drag; devices with real
  WebXR VR still get an immersive session.

## Ava and AI

Ava is scripted (keyword intents in English and Arabic). To have Claude rephrase her replies, build with
`VITE_AVA_ENDPOINT=https://your-backend/ava`; see `src/lib/avaAI.ts` for the request shape.
Keep the API key on that backend, never in this static site.

All account details, network figures and detections are simulated, as in the prototype.
