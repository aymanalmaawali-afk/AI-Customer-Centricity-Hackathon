// Interactive 3D home with the ESTIMATED heatmap on the floor.
//  · orbit mode (default): drag to orbit, wheel to zoom — the 3D / VR screen.
//  · look mode: stand inside a room and look around, steered by the phone's gyroscope where available
//    (drag otherwise), optionally as a Cardboard-style split view. This is the VR fallback for browsers
//    without WebXR, e.g. iPhone Safari.
//  · WebXR immersive-vr where the device supports it.
import type * as THREEType from 'three';
import { OUTER, INNER, POS, ROOMS, type Place } from '../data';
import type { CoverageMaps } from './maps';
import type { Orientation } from './motion';
import { clamp, orientationQuaternion } from './motion';
import { sigColor, signal } from './signal';

export interface ThreeView {
  setPlace(p: Place): void;
  enterVR(): Promise<void>;
  /** Moves the canvas into `host` and switches to the first-person look-around view. */
  startLook(host: HTMLElement, room: number): void;
  setLookRoom(room: number): void;
  setStereo(on: boolean): Promise<void>;
  /** Puts the canvas back into `host` and returns to the orbit view. */
  stopLook(host: HTMLElement): void;
  dispose(): void;
}

export type ThreeError = 'load' | 'webgl';

const EYE = 1.6; // standing eye height; walls are 1.1 high, so the heatmap stays visible across rooms
const ORBIT_FOV = 40, LOOK_FOV = 70;

export async function createThreeView(
  initialHost: HTMLElement, maps: CoverageMaps, getPlace: () => Place, getOrientation: () => Orientation | null,
): Promise<ThreeView | ThreeError> {
  let THREE: typeof THREEType;
  try { THREE = await import('three'); } catch { return 'load'; }

  let host = initialHost;
  const w = host.clientWidth || 370, h = host.clientHeight || 400;
  let r: THREEType.WebGLRenderer;
  try { r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return 'webgl'; }
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  r.setSize(w, h);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.domElement.style.display = 'block';
  r.domElement.style.touchAction = 'none';
  host.appendChild(r.domElement);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(ORBIT_FOV, w / h, 0.05, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x334466, 1.2));
  const dl = new THREE.DirectionalLight(0xffffff, 1.3);
  dl.position.set(4, 10, 6);
  scene.add(dl);

  const texs: Partial<Record<Place, THREEType.CanvasTexture>> = {};
  for (const k of Object.keys(maps) as Place[]) {
    const t = new THREE.CanvasTexture(maps[k]!.tex);
    t.colorSpace = THREE.SRGBColorSpace;
    texs[k] = t;
  }
  const floorMat = new THREE.MeshBasicMaterial({ map: texs[getPlace()] ?? null });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.25, 8.4), new THREE.MeshStandardMaterial({ color: 0x1b4450 }));
  slab.position.y = -0.13;
  scene.add(slab);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xeef2f7, transparent: true, opacity: 0.72 });
  for (const [x1, y1, x2, y2] of [...OUTER, ...INNER]) {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len + 0.1, 1.1, 0.1), wallMat);
    m.position.set((x1 + x2) / 2 - 5, 0.55, (y1 + y2) / 2 - 4);
    m.rotation.y = -Math.atan2(y2 - y1, x2 - x1);
    scene.add(m);
  }

  const mkMarker = (color: number) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.3), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 }));
    b.position.y = 0.1; g.add(b);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6), new THREE.MeshBasicMaterial({ color }));
    pole.position.y = 0.9; g.add(pole);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6 }));
    top.position.y = 1.75; g.add(top);
    scene.add(g);
    return g;
  };
  const router = mkMarker(0x00b3a6);
  const ext = mkMarker(0x6fa0ff);
  ext.position.set(POS.extender.x - 5, 0, POS.extender.y - 4);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.05, 10, 48), new THREE.MeshBasicMaterial({ color: 0x6fa0ff }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(POS.recommended.x - 5, 0.05, POS.recommended.y - 4);
  scene.add(ring);

  // Pillars = measured rooms, coloured by the signal recorded during the scan. Hidden in look mode,
  // where the viewer stands at the measuring spot.
  const pillars = new THREE.Group();
  for (const rm of ROOMS) {
    const c = new THREE.Color(sigColor(signal('current', rm.cx, rm.cy)));
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.9, 20), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.3 }));
    p.position.set(rm.cx - 5, 0.45, rm.cy - 4);
    pillars.add(p);
  }
  scene.add(pillars);

  // ── state ────────────────────────────────────────────────────────────────
  const orb = { theta: -0.55, phi: 0.92, rad: 16 };
  const look = { on: false, room: 0, yaw: 0, pitch: -0.25, gyroYaw: 0, gyroAimed: false };
  const lookTarget = new THREE.Vector3();
  let stereo: { setSize(w: number, h: number): void; render(s: THREEType.Scene, c: THREEType.Camera): void } | null = null;
  let stereoOn = false;

  /** Heading (radians, about +Y) that faces from a room's centre towards the middle of the home. */
  const inwardYaw = (i: number) => {
    const rm = ROOMS[i];
    const dx = 0 - (rm.cx - 5), dz = 0 - (rm.cy - 4);
    return Math.atan2(-dx, -dz);
  };
  const aimLook = (i: number) => {
    const rm = ROOMS[i];
    look.room = i;
    lookTarget.set(rm.cx - 5, EYE, rm.cy - 4);
    look.yaw = inwardYaw(i);
    look.gyroAimed = false; // re-aim the gyro heading on the next reading
  };

  const resize = () => {
    const cw = host.clientWidth, ch = host.clientHeight;
    if (!cw || !ch || r.xr.isPresenting) return;
    r.setSize(cw, ch);
    stereo?.setSize(cw, ch);
    cam.aspect = cw / ch;
    cam.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  const moveTo = (el: HTMLElement) => {
    ro.unobserve(host);
    host = el;
    host.appendChild(r.domElement);
    ro.observe(host);
    resize();
  };

  // ── input ────────────────────────────────────────────────────────────────
  let drag: { x: number; y: number } | null = null;
  const el = r.domElement;
  el.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag = { x: e.clientX, y: e.clientY };
    if (look.on) {
      // Drag-to-look; with a live gyro, horizontal drag nudges the heading instead.
      if (getOrientation()) look.gyroYaw += dx * 0.005;
      else { look.yaw += dx * 0.005; look.pitch = clamp(look.pitch + dy * 0.004, -1.2, 1.2); }
      return;
    }
    orb.theta -= dx * 0.008;
    orb.phi = clamp(orb.phi - dy * 0.006, 0.25, 1.4);
  });
  el.addEventListener('pointerup', () => { drag = null; });
  el.addEventListener('pointercancel', () => { drag = null; });
  el.addEventListener('wheel', e => { e.preventDefault(); if (!look.on) orb.rad = clamp(orb.rad + e.deltaY * 0.01, 8, 26); }, { passive: false });

  // ── render loop ──────────────────────────────────────────────────────────
  const target = new THREE.Vector3();
  const q = new THREE.Quaternion(), yawQ = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  r.setAnimationLoop(t => {
    const p = getPlace();
    const pos = p === 'recommended' ? POS.recommended : POS.current;
    target.set(pos.x - 5, 0, pos.y - 4);
    router.position.lerp(target, 0.08);
    ext.visible = p === 'extender';
    ring.visible = p === 'current';
    const s = 1 + 0.15 * Math.sin((t || 0) / 300);
    ring.scale.set(s, s, s);

    if (!r.xr.isPresenting) {
      if (look.on) {
        cam.position.lerp(lookTarget, 0.12);
        const o = getOrientation();
        if (o) {
          if (!look.gyroAimed) {
            // Offset the gyro heading so the current phone direction faces into the home.
            q.fromArray(orientationQuaternion(o));
            const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
            look.gyroYaw = look.yaw - Math.atan2(-fwd.x, -fwd.z);
            look.gyroAimed = true;
          }
          q.fromArray(orientationQuaternion(o));
          yawQ.setFromAxisAngle(up, look.gyroYaw);
          cam.quaternion.copy(yawQ.multiply(q));
        } else {
          cam.rotation.set(look.pitch, look.yaw, 0, 'YXZ');
        }
      } else {
        cam.position.set(orb.rad * Math.sin(orb.phi) * Math.sin(orb.theta), orb.rad * Math.cos(orb.phi), orb.rad * Math.sin(orb.phi) * Math.cos(orb.theta));
        cam.lookAt(0, 0, 0);
      }
    }
    if (stereoOn && stereo && look.on && !r.xr.isPresenting) stereo.render(scene, cam);
    else r.render(scene, cam);
  });

  return {
    setPlace(p) {
      floorMat.map = texs[p] ?? null;
      floorMat.needsUpdate = true;
    },
    async enterVR() {
      r.xr.enabled = true;
      const session = await navigator.xr!.requestSession('immersive-vr', { optionalFeatures: ['local-floor'] });
      await r.xr.setSession(session);
    },
    startLook(el, room) {
      look.on = true;
      pillars.visible = false;
      cam.fov = LOOK_FOV;
      aimLook(room);
      cam.position.copy(lookTarget);
      moveTo(el);
    },
    setLookRoom(room) {
      aimLook(room);
    },
    async setStereo(on) {
      if (on && !stereo) {
        const { StereoEffect } = await import('three/examples/jsm/effects/StereoEffect.js');
        const fx = new StereoEffect(r);
        fx.setEyeSeparation(0.064);
        stereo = fx;
      }
      stereoOn = on;
      if (!on) r.setScissorTest(false);
      resize();
    },
    stopLook(el) {
      look.on = false;
      stereoOn = false;
      r.setScissorTest(false);
      pillars.visible = true;
      cam.fov = ORBIT_FOV;
      moveTo(el);
    },
    dispose() {
      ro.disconnect();
      r.setAnimationLoop(null);
      r.dispose();
      for (const t of Object.values(texs)) t?.dispose();
      el.parentNode?.removeChild(el);
    },
  };
}
