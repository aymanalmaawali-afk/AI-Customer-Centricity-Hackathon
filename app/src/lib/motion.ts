// Device-motion fallback for browsers without WebXR (iPhone Safari): the phone's gyroscope drives
// the AR floor overlay and the look-around 3D view.
//
// iOS 13+ only grants motion access from inside a user gesture, so requestMotion() must be called
// synchronously from a tap handler (before any await).

export type MotionStatus = 'unknown' | 'prompt' | 'granted' | 'denied' | 'unsupported';

export interface Orientation {
  /** Degrees. alpha = compass-ish heading, beta = front/back tilt (90 = upright), gamma = left/right tilt. */
  alpha: number;
  beta: number;
  gamma: number;
  /** Screen rotation in degrees (0 portrait, 90 / -90 landscape). */
  screen: number;
}

type PermissionFn = () => Promise<'granted' | 'denied'>;
const permissionFn = (): PermissionFn | undefined => {
  const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: PermissionFn } }).DeviceOrientationEvent;
  return typeof D?.requestPermission === 'function' ? D.requestPermission.bind(D) : undefined;
};

/** Status before asking: 'prompt' on iOS (needs a tap), 'granted' where events flow freely, else 'unsupported'. */
export function initialMotionStatus(): MotionStatus {
  if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return 'unsupported';
  return permissionFn() ? 'prompt' : 'granted';
}

/** Call synchronously from a tap. Resolves with the resulting status. */
export function requestMotion(): Promise<MotionStatus> {
  const fn = permissionFn();
  if (!fn) return Promise.resolve(initialMotionStatus());
  try {
    return fn().then(r => (r === 'granted' ? 'granted' : 'denied'), () => 'denied');
  } catch {
    return Promise.resolve('denied');
  }
}

function screenAngle(): number {
  const so = window.screen?.orientation?.angle;
  if (typeof so === 'number') return so;
  const legacy = (window as unknown as { orientation?: number }).orientation;
  return typeof legacy === 'number' ? legacy : 0;
}

/**
 * Keeps the latest orientation reading. `live` turns true only once a reading with real values
 * arrives — desktop browsers fire a single all-null event, which is ignored.
 */
export class OrientationTracker {
  latest: Orientation | null = null;
  live = false;
  private onLive: (() => void) | null;

  constructor(onLive?: () => void) {
    this.onLive = onLive ?? null;
    window.addEventListener('deviceorientation', this.handle);
  }

  private handle = (e: DeviceOrientationEvent) => {
    if (e.alpha == null && e.beta == null && e.gamma == null) return;
    this.latest = { alpha: e.alpha ?? 0, beta: e.beta ?? 0, gamma: e.gamma ?? 0, screen: screenAngle() };
    if (!this.live) { this.live = true; this.onLive?.(); this.onLive = null; }
  };

  dispose() {
    window.removeEventListener('deviceorientation', this.handle);
  }
}

/** Smallest signed difference a − b in degrees, in (−180, 180]. */
export function angleDelta(a: number, b: number): number {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Quaternion [x, y, z, w] for a camera looking out of the phone's screen, from W3C device orientation
 * (the maths of three.js's former DeviceOrientationControls). `yawOffset` (degrees) re-aims the heading.
 */
export function orientationQuaternion(o: Orientation, yawOffset = 0): [number, number, number, number] {
  const r = Math.PI / 180;
  const alpha = (o.alpha + yawOffset) * r, beta = o.beta * r, gamma = o.gamma * r, orient = o.screen * r;
  // Euler(beta, alpha, -gamma, 'YXZ') → quaternion
  const c1 = Math.cos(beta / 2), c2 = Math.cos(alpha / 2), c3 = Math.cos(-gamma / 2);
  const s1 = Math.sin(beta / 2), s2 = Math.sin(alpha / 2), s3 = Math.sin(-gamma / 2);
  let x = s1 * c2 * c3 + c1 * s2 * s3;
  let y = c1 * s2 * c3 - s1 * c2 * s3;
  let z = c1 * c2 * s3 - s1 * s2 * c3;
  let w = c1 * c2 * c3 + s1 * s2 * s3;
  // × (-90° about X): camera looks out of the back of the device, not up from its face
  const h = Math.SQRT1_2;
  [x, y, z, w] = mul(x, y, z, w, -h, 0, 0, h);
  // × (−screen orientation about Z)
  const so = Math.sin(-orient / 2), co = Math.cos(-orient / 2);
  return mul(x, y, z, w, 0, 0, so, co);
}

function mul(ax: number, ay: number, az: number, aw: number, bx: number, by: number, bz: number, bw: number): [number, number, number, number] {
  return [
    ax * bw + aw * bx + ay * bz - az * by,
    ay * bw + aw * by + az * bx - ax * bz,
    az * bw + aw * bz + ax * by - ay * bx,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}
