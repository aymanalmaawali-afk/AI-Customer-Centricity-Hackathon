import type { Component } from 'react';
import type { Config } from './config';
import type { Lang, Place, Screen } from './data';
import type { Chip, ChatCtx } from './lib/assistant';
import type { CoverageMaps } from './lib/maps';
import { initialMotionStatus, type MotionStatus } from './lib/motion';

export interface Msg { from: 'ai' | 'me'; text: string; chips?: Chip[] }

export interface State {
  scenario: Config['scenario'];
  avaPos: { x: number; y: number };
  lang: Lang | null;
  chatOpen: boolean;
  msgs: Msg[];
  chatInput: string;
  typing: boolean;
  listening: boolean;
  voice: boolean;
  toast: string;
  phone: string;
  lookup: 'idle' | 'loading' | 'found';
  phoneErr: boolean;
  account: boolean;
  mode: 'room' | 'device';
  screen: Screen;
  cam: 'none' | 'demo' | 'live';
  camErr: string;
  roomIdx: number;
  progress: number;
  mStep: number;
  arPlace: 'current' | 'recommended';
  fromDiag: boolean;
  place: Place;
  step: number;
  recog: boolean;
  restart: number;
  restarted: boolean;
  escalated: boolean;
  xr: { ar: boolean; vr: boolean };
  threeMsg: '' | 'load' | 'webgl' | 'start' | 'vrBlocked' | 'noVR';
  /** Gyroscope access (iOS asks once, from a tap). */
  motion: MotionStatus;
  /** True once real orientation readings arrive — desktops report the API but never move. */
  motionLive: boolean;
  /** Look-around VR fallback (no WebXR): full-screen first-person view, optional split view. */
  look: boolean;
  lookRoom: number;
  stereo: boolean;
  net: { downlink: number; rtt: number; effectiveType: string } | null;
  fitS: number;
  narrow: boolean;
}

const AVA_KEY = 'hwc-ava-dock';

export function loadAvaPos(): { x: number; y: number } {
  try {
    const p = JSON.parse(localStorage.getItem(AVA_KEY) || 'null');
    if (p && typeof p.x === 'number' && typeof p.y === 'number') return p;
  } catch { /* storage unavailable */ }
  return { x: 362, y: 600 };
}

export function saveAvaPos(p: { x: number; y: number }) {
  try { localStorage.setItem(AVA_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}

export function initialState(scenario: Config['scenario']): State {
  return {
    scenario, avaPos: loadAvaPos(), lang: null, chatOpen: false, msgs: [], chatInput: '', typing: false, listening: false, voice: false,
    toast: '', phone: '', lookup: 'idle', phoneErr: false, account: false, mode: 'room', screen: 'host', cam: 'none', camErr: '',
    roomIdx: 0, progress: 0, mStep: 0, arPlace: 'current', fromDiag: false, place: 'current', step: 0, recog: false, restart: 0,
    restarted: false, escalated: false, xr: { ar: false, vr: false }, threeMsg: '', motion: initialMotionStatus(), motionLive: false, look: false, lookRoom: 0, stereo: false, net: null, fitS: 1, narrow: false,
  };
}

/** What the view model needs from the app controller. */
export interface Controller {
  state: State;
  cfg: Config;
  maps: CoverageMaps | null;
  ctx: ChatCtx | null;
  setState: Component<object, State>['setState'];
  go(k: Screen): void;
  setLang(l: Lang): void;
  setPlace(p: Place): void;
  setScenario(s: Config['scenario']): void;
  scanTarget(): Screen;
  /** Named one-shot timer; re-arming a name cancels the previous one. */
  later(name: string, fn: () => void, ms: number): void;
  requestCam(): void;
  startRestart(): void;
  enterVR(): void;
  exitLook(): void;
  setLookRoom(i: number): void;
  toggleStereo(): void;
  /** Asks for gyroscope access; call straight from a tap handler (iOS rule). */
  askMotion(): void;
  recentreAR(): void;
  openChat(): void;
  chipAct(c: Chip): void;
  sendMsg(raw: string, given?: string): void;
  toggleMic(): void;
  avaDown(e: React.PointerEvent<HTMLElement>): void;
  avaMove(e: React.PointerEvent<HTMLElement>): void;
  avaUp(): void;
}
