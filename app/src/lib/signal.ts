// Wi‑Fi propagation model used for every number and heatmap in the prototype.
// Log-distance path loss plus a fixed penalty for each inner wall the ray crosses.
import { INNER, type Place } from '../data';

type Seg = [number, number, number, number];

/** True when segment a→b properly crosses wall segment s. */
export function cross(ax: number, ay: number, bx: number, by: number, s: Seg): boolean {
  const [cx, cy, dx, dy] = s;
  const o = (px: number, py: number, qx: number, qy: number, rx: number, ry: number) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
  const d1 = o(cx, cy, dx, dy, ax, ay), d2 = o(cx, cy, dx, dy, bx, by), d3 = o(ax, ay, bx, by, cx, cy), d4 = o(ax, ay, bx, by, dx, dy);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

/** dBm at (x,y) from an access point at (rx,ry). `enc` is the enclosure loss (router inside a cabinet). */
export function sig(rx: number, ry: number, x: number, y: number, base: number, enc: number): number {
  const d = Math.max(Math.hypot(x - rx, y - ry), 0.4);
  let w = 0;
  for (const s of INNER) if (cross(rx, ry, x, y, s)) w++;
  return base - 30 * Math.log10(d) - 9 * w - enc;
}

export function signal(p: Place, x: number, y: number): number {
  const cur = sig(0.5, 0.5, x, y, -30, 8);
  if (p === 'current') return cur;
  if (p === 'recommended') return sig(5.5, 3.6, x, y, -30, 0);
  return Math.max(cur, sig(6.4, 4.8, x, y, -35, 0));
}

type RGB = [number, number, number];
function lerp(a: RGB, b: RGB, t: number): RGB {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t)) as RGB;
}

export function heat(v: number): RGB {
  const G: RGB = [63, 190, 122], Y: RGB = [240, 196, 72], R: RGB = [226, 80, 84];
  if (v >= -58) return G;
  if (v >= -62) return lerp(G, Y, (-58 - v) / 4);
  if (v >= -68) return Y;
  if (v >= -72) return lerp(Y, R, (-68 - v) / 4);
  return R;
}

export const sigColor = (v: number) => (v >= -60 ? '#3FBE7A' : v >= -70 ? '#F0C448' : '#FF6B6F');
export const sigColorLight = (v: number) => (v >= -60 ? '#1F8A57' : v >= -70 ? '#9A6B00' : '#C0313A');

/** Expected throughput at a given signal, capped by what arrives at the router. */
export function mbps(v: number, wired: number): number {
  return Math.max(18, Math.min(Math.round(wired * 0.93), Math.round(650 / (1 + Math.exp(-(v + 64) / 3.5)))));
}
