// Builds the ESTIMATED coverage heatmaps (one per router placement) as canvases.
// `tex` is the raw heatmap used as the 3D floor texture; `url` is a 2× image with walls and
// room names drawn on, used by the welcome card and the AR floor overlay.
import { INNER, OUTER, ROOMS, type Lang, type Place } from '../data';
import { heat, signal } from './signal';

export interface CoverageStats { s: string; m: string; w: string }
export interface CoverageMap { tex: HTMLCanvasElement; url: string; stats: CoverageStats }
export type CoverageMaps = Partial<Record<Place, CoverageMap>>;

const PLACES: Place[] = ['current', 'recommended', 'extender'];
const W = 250, H = 200, S = 25;

function buildTexture(p: Place): { tex: HTMLCanvasElement; stats: CoverageStats } {
  const tex = document.createElement('canvas');
  tex.width = W; tex.height = H;
  const ctx = tex.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  let s = 0, m = 0, w = 0;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const v = signal(p, (i + 0.5) / S, (j + 0.5) / S);
    const c = heat(v);
    const k = (j * W + i) * 4;
    img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
    if (v >= -60) s++; else if (v >= -70) m++; else w++;
  }
  ctx.putImageData(img, 0, 0);
  const tot = W * H, pc = (n: number) => Math.round(n / tot * 100) + '%';
  return { tex, stats: { s: pc(s), m: pc(m), w: pc(w) } };
}

/**
 * Rebuilds the labelled map images for `lang`, reusing heatmap textures from `old`.
 * `onUrl` fires as each PNG blob URL becomes ready.
 */
export function buildMaps(lang: Lang, old: CoverageMaps | null, onUrl: () => void): CoverageMaps {
  const maps: CoverageMaps = {};
  for (const p of PLACES) {
    const prev = old?.[p];
    if (prev?.url) URL.revokeObjectURL(prev.url);
    const { tex, stats } = prev ? { tex: prev.tex, stats: prev.stats } : buildTexture(p);
    const map = document.createElement('canvas');
    map.width = W * 2; map.height = H * 2;
    const g = map.getContext('2d')!;
    g.drawImage(tex, 0, 0, W * 2, H * 2);
    g.strokeStyle = '#0B2545'; g.lineCap = 'round';
    g.lineWidth = 10;
    for (const [a, b, c, d] of OUTER) { g.beginPath(); g.moveTo(a * 50, b * 50); g.lineTo(c * 50, d * 50); g.stroke(); }
    g.lineWidth = 6;
    for (const [a, b, c, d] of INNER) { g.beginPath(); g.moveTo(a * 50, b * 50); g.lineTo(c * 50, d * 50); g.stroke(); }
    g.fillStyle = 'rgba(11,37,69,.85)';
    if (lang === 'ar') {
      g.font = '700 18px "IBM Plex Sans Arabic", sans-serif';
      g.direction = 'rtl'; g.textAlign = 'right';
      for (const r of ROOMS) g.fillText(r.n.ar, r.x1 * 50 - 16, r.y0 * 50 + 30);
    } else {
      g.font = '700 18px Tajawal, sans-serif';
      g.textAlign = 'left';
      for (const r of ROOMS) g.fillText(r.n.en, r.x0 * 50 + 16, r.y0 * 50 + 30);
    }
    const entry: CoverageMap = { tex, url: '', stats };
    maps[p] = entry;
    map.toBlob(b => { if (b) { entry.url = URL.createObjectURL(b); onUrl(); } }, 'image/png');
  }
  return maps;
}

export function disposeMaps(maps: CoverageMaps | null) {
  if (!maps) return;
  for (const p of PLACES) { const u = maps[p]?.url; if (u) URL.revokeObjectURL(u); }
}
