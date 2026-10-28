// App controller — owns state, timers, camera, 3D view, speech and the assistant.
// A port of `class Component extends DCLogic` in Home WiFi Check v7.dc.html; all display logic lives in viewModel.ts.
import { Component } from 'react';
import { readConfig, writeScenario, type Config } from './config';
import type { Lang, Place, Screen } from './data';
import { greeting, reply, type ChatCtx, type Chip } from './lib/assistant';
import { rewriteReply } from './lib/avaAI';
import { buildMaps, disposeMaps, type CoverageMaps } from './lib/maps';
import { angleDelta, clamp, OrientationTracker, requestMotion, type Orientation } from './lib/motion';
import { createThreeView, type ThreeView } from './lib/threeView';
import { Prototype } from './Prototype';
import { initialState, saveAvaPos, type Controller, type State } from './state';
import { buildViewModel } from './viewModel';

// Minimal Web Speech API surface (not in TypeScript's DOM lib).
interface Recognition {
  lang: string; interimResults: boolean; maxAlternatives: number;
  onresult: ((e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: (() => void) | null; onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
}
type RecognitionCtor = new () => Recognition;

const CAMERA_SCREENS: Screen[] = ['scan', 'ar', 'guide'];
const PHONE_W = 390, PHONE_H = 844;

export class App extends Component<object, State> implements Controller {
  cfg: Config = readConfig();
  state: State = initialState(this.cfg.scenario);
  maps: CoverageMaps | null = null;
  ctx: ChatCtx | null = null;

  private videoEl: HTMLVideoElement | null = null;
  private threeEl: HTMLDivElement | null = null;
  private chatEl: HTMLDivElement | null = null;
  private stream: MediaStream | null = null;
  private three: ThreeView | null = null;
  private initing = false;
  private initTries = 0;
  private ticker = 0;
  private restartTimer = 0;
  private mLast = 0;
  private timers = new Map<string, number>();
  private rec: Recognition | null = null;
  private avaDrag: { sx: number; sy: number; ox: number; oy: number; moved: boolean } | null = null;
  private ro: ResizeObserver | null = null;
  private unmounted = false;
  private tracker: OrientationTracker | null = null;
  private arEl: HTMLDivElement | null = null;
  private lookEl: HTMLDivElement | null = null;
  private arRaf = 0;
  private arBase: Orientation | null = null;

  // ── refs ────────────────────────────────────────────────────────────────
  setThreeEl = (el: HTMLDivElement | null) => {
    this.threeEl = el;
    if (el && this.state.screen === 'model') setTimeout(() => this.initThree(), 0);
  };
  setVideoEl = (el: HTMLVideoElement | null) => {
    this.videoEl = el;
    this.attachStream();
  };
  setChatEl = (el: HTMLDivElement | null) => {
    this.chatEl = el;
    if (el) el.scrollTop = el.scrollHeight;
  };
  setArEl = (el: HTMLDivElement | null) => { this.arEl = el; };
  setLookEl = (el: HTMLDivElement | null) => { this.lookEl = el; };
  private shellRefs = { video: this.setVideoEl, three: this.setThreeEl, chat: this.setChatEl, ar: this.setArEl, look: this.setLookEl };

  private attachStream() {
    const v = this.videoEl;
    if (v && this.stream && v.srcObject !== this.stream) {
      v.srcObject = this.stream;
      v.play().catch(() => {});
    }
  }

  later(name: string, fn: () => void, ms: number) {
    clearTimeout(this.timers.get(name));
    this.timers.set(name, window.setTimeout(fn, ms));
  }

  // ── Ava button: tap opens chat, drag moves it, release docks half-hidden on the nearer edge ──
  avaDown = (e: React.PointerEvent<HTMLElement>) => {
    this.avaDrag = { sx: e.clientX, sy: e.clientY, ox: this.state.avaPos.x, oy: this.state.avaPos.y, moved: false };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
  };
  avaMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = this.avaDrag;
    if (!d) return;
    const fs = this.state.fitS || 1, dx = (e.clientX - d.sx) / fs, dy = (e.clientY - d.sy) / fs;
    if (Math.abs(dx) + Math.abs(dy) > 6) d.moved = true;
    if (d.moved) {
      const w = e.currentTarget.offsetWidth || 124;
      this.setState({ avaPos: { x: Math.max(0, Math.min(PHONE_W - w, d.ox + dx)), y: Math.max(60, Math.min(PHONE_H - 70, d.oy + dy)) } });
    }
  };
  avaUp = () => {
    const d = this.avaDrag;
    this.avaDrag = null;
    if (!d) return;
    if (!d.moved) this.openChat();
    else {
      const p = { x: this.state.avaPos.x + 22 < PHONE_W / 2 ? -16 : 362, y: this.state.avaPos.y };
      this.setState({ avaPos: p });
      saveAvaPos(p);
    }
  };

  // ── lifecycle ───────────────────────────────────────────────────────────
  componentDidMount() {
    this.unmounted = false;
    // One shared ticker drives the room-scan progress and the measurement steps.
    this.mLast = Date.now();
    this.ticker = window.setInterval(() => {
      const st = this.state;
      if (st.screen === 'scan' && st.progress < 100) this.setState(s => ({ progress: Math.min(100, s.progress + 2) }));
      if (st.screen === 'measure' && st.mStep < 8 && Date.now() - this.mLast >= 520) {
        this.mLast = Date.now();
        this.setState(s => ({ mStep: s.mStep + 1 }));
      }
    }, 110);

    window.addEventListener('resize', this.onResize);
    window.visualViewport?.addEventListener('resize', this.onResize);
    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(this.onResize);
      this.ro.observe(document.documentElement);
    }
    this.onResize();
    requestAnimationFrame(this.onResize);

    this.rebuildMaps('en');
    if (this.state.motion === 'granted') this.startTracker();
    const c = (navigator as Navigator & { connection?: { downlink?: number; rtt: number; effectiveType: string } }).connection;
    if (c && c.downlink) this.setState({ net: { downlink: c.downlink, rtt: c.rtt, effectiveType: c.effectiveType } });
    if (navigator.xr) {
      Promise.all([
        navigator.xr.isSessionSupported('immersive-ar').catch(() => false),
        navigator.xr.isSessionSupported('immersive-vr').catch(() => false),
      ]).then(([ar, vr]) => { if (!this.unmounted) this.setState({ xr: { ar, vr } }); });
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    clearInterval(this.ticker);
    clearInterval(this.restartTimer);
    for (const t of this.timers.values()) clearTimeout(t);
    window.removeEventListener('resize', this.onResize);
    window.visualViewport?.removeEventListener('resize', this.onResize);
    this.ro?.disconnect();
    try { this.rec?.abort(); window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    this.stopCam();
    this.stopArLoop();
    this.tracker?.dispose();
    this.disposeThree();
    disposeMaps(this.maps);
  }

  componentDidUpdate(_: object, ps: State) {
    const st = this.state;
    if (ps.screen !== st.screen) this.onEnter(st.screen, ps.screen);
    if (ps.lang !== st.lang) this.rebuildMaps(st.lang || 'en');
    if (st.screen === 'model' && !this.three && !this.initing && this.threeEl) this.initThree();
    if (this.chatEl && (st.msgs.length !== ps.msgs.length || st.typing !== ps.typing)) this.chatEl.scrollTop = this.chatEl.scrollHeight;
    this.attachStream();
  }

  /** Scale the phone to fit the window: the whole device always shows without scrolling. */
  onResize = () => {
    const W = window.innerWidth, H = window.visualViewport?.height || window.innerHeight;
    if (!W || !H) return;
    const narrow = W < 820;
    const s = Math.max(0.4, Math.min(1, (H - 32) / 866, narrow ? (W - 24) / 412 : 1));
    if (Math.abs(s - (this.state.fitS || 1)) > 0.005 || narrow !== this.state.narrow) this.setState({ fitS: s, narrow });
  };

  private rebuildMaps(lang: Lang) {
    this.maps = buildMaps(lang, this.maps, () => { if (!this.unmounted) this.forceUpdate(); });
    this.forceUpdate();
  }

  // ── navigation ──────────────────────────────────────────────────────────
  setLang(l: Lang) {
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    // Navigate only after the language is applied, otherwise go() would default it back to English.
    this.setState({ lang: l, msgs: [] }, () => { if (this.state.screen === 'lang') this.go('welcome'); });
  }

  setScenario(s: Config['scenario']) {
    this.cfg = { ...this.cfg, scenario: s };
    writeScenario(s);
    this.setState({ scenario: s });
  }

  go(k: Screen) {
    const patch: Partial<State> = { screen: k };
    if (CAMERA_SCREENS.includes(k) && this.state.cam === 'none') patch.cam = 'demo';
    if (k === 'guide') {
      Object.assign(patch, { step: 0, recog: false, restart: 0, restarted: false });
      this.later('recog', () => this.setState({ recog: true }), 1400);
    }
    if (k !== 'lang' && !this.state.lang) patch.lang = 'en';
    this.setState(patch as State);
  }

  private onEnter(s: Screen, prev: Screen) {
    clearInterval(this.restartTimer);
    if (prev === 'model') { this.disposeThree(); if (this.state.look) this.setState({ look: false, stereo: false }); }
    if (prev === 'ar') this.stopArLoop();
    if (s === 'ar') this.startArLoop();
    if (s === 'measure') { this.mLast = Date.now(); this.setState({ mStep: 0 }); }
    if (s === 'model') { this.initTries = 0; setTimeout(() => this.initThree(), 30); }
  }

  scanTarget(): Screen {
    return this.state.mode === 'device' ? 'guide' : 'scan';
  }

  // ── camera ──────────────────────────────────────────────────────────────
  async requestCam() {
    this.askMotion(); // same tap: iOS only allows the motion prompt from a gesture
    if (this.cfg.forceDemo || !navigator.mediaDevices?.getUserMedia) {
      this.setState({ cam: 'demo', camErr: this.cfg.forceDemo ? '' : 'unsupported' });
      if (this.cfg.forceDemo) this.go(this.scanTarget());
      else this.later('camFallback', () => this.go(this.scanTarget()), 900);
      return;
    }
    try {
      const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      this.stream = st;
      this.setState({ cam: 'live', camErr: '' }, () => this.go(this.scanTarget()));
    } catch (e) {
      this.setState({ cam: 'demo', camErr: (e as Error).name || 'blocked' });
      this.later('camFallback', () => this.go(this.scanTarget()), 900);
    }
  }

  private stopCam() {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  // ── 3D ──────────────────────────────────────────────────────────────────
  async initThree() {
    if (this.three || this.initing) return;
    if (!this.threeEl || !this.maps) {
      if (this.state.screen === 'model') {
        if (++this.initTries > 40) { this.setState({ threeMsg: 'start' }); return; }
        setTimeout(() => this.initThree(), 100);
      }
      return;
    }
    this.initing = true;
    const host = this.threeEl;
    const res = await createThreeView(host, this.maps, () => this.state.place, this.orientation);
    this.initing = false;
    if (typeof res === 'string') { this.setState({ threeMsg: res }); return; }
    if (this.unmounted || this.state.screen !== 'model' || this.threeEl !== host) { res.dispose(); return; }
    this.three = res;
  }

  private disposeThree() {
    this.three?.dispose();
    this.three = null;
  }

  setPlace(p: Place) {
    this.setState({ place: p });
    this.three?.setPlace(p);
  }

  /** WebXR VR where supported; otherwise the look-around fallback (gyroscope or drag, optional split view). */
  enterVR() {
    if (!this.three) { this.setState({ threeMsg: 'noVR' }); return; }
    if (this.state.xr.vr) { this.three.enterVR().catch(() => this.setState({ threeMsg: 'vrBlocked' })); return; }
    this.askMotion();
    this.setState({ look: true, stereo: false, threeMsg: '' }, () => {
      if (this.three && this.lookEl) this.three.startLook(this.lookEl, this.state.lookRoom);
    });
  }

  exitLook() {
    if (this.three && this.threeEl) this.three.stopLook(this.threeEl);
    this.setState({ look: false, stereo: false });
  }

  setLookRoom(i: number) {
    this.setState({ lookRoom: i });
    this.three?.setLookRoom(i);
  }

  toggleStereo() {
    const on = !this.state.stereo;
    this.setState({ stereo: on });
    this.three?.setStereo(on).catch(() => this.setState({ stereo: false }));
  }

  // ── device motion (WebXR fallback) ──────────────────────────────────────
  /** Live orientation, or null when the gyroscope is unavailable, denied or silent. */
  private orientation = (): Orientation | null => (this.tracker?.live ? this.tracker.latest : null);

  private startTracker() {
    if (this.tracker) return;
    this.tracker = new OrientationTracker(() => { if (!this.unmounted) this.setState({ motionLive: true }); });
  }

  askMotion() {
    const m = this.state.motion;
    if (m === 'granted') { this.startTracker(); return; }
    if (m !== 'prompt') return;
    requestMotion().then(res => {
      if (this.unmounted) return;
      this.setState({ motion: res });
      if (res === 'granted') this.startTracker();
    });
  }

  recentreAR() {
    this.arBase = null;
  }

  /**
   * Anchors the AR floor overlay with the gyroscope: tilting the phone changes the floor's pitch,
   * turning spins the map around its centre, rolling counter-rotates it. Written straight to CSS
   * variables each frame (no React render). Without live motion the design's fixed 50° pose stays.
   */
  private startArLoop() {
    this.stopArLoop();
    this.arBase = null;
    const tick = () => {
      this.arRaf = requestAnimationFrame(tick);
      const el = this.arEl, o = this.orientation();
      if (!el || !o) return;
      if (!this.arBase) this.arBase = { ...o };
      const b = this.arBase;
      const tilt = clamp(50 + (o.beta - b.beta) * 0.9, 15, 80);
      const yaw = angleDelta(o.alpha, b.alpha);
      const roll = clamp(-(o.gamma - b.gamma) * 0.6, -30, 30);
      el.style.setProperty('--ar-tilt', tilt.toFixed(1) + 'deg');
      el.style.setProperty('--ar-yaw', yaw.toFixed(1) + 'deg');
      el.style.setProperty('--ar-roll', roll.toFixed(1) + 'deg');
    };
    this.arRaf = requestAnimationFrame(tick);
  }

  private stopArLoop() {
    cancelAnimationFrame(this.arRaf);
    this.arRaf = 0;
  }

  // ── guided check ────────────────────────────────────────────────────────
  startRestart() {
    this.setState({ restart: 90 });
    clearInterval(this.restartTimer);
    this.restartTimer = window.setInterval(() => this.setState(st => {
      if (st.restart <= 15) { clearInterval(this.restartTimer); return { restart: 0, restarted: true }; }
      return { restart: st.restart - 15, restarted: st.restarted };
    }), 500);
  }

  // ── assistant ───────────────────────────────────────────────────────────
  openChat() {
    const st = this.state;
    if (st.msgs.length) { this.setState({ chatOpen: true }); return; }
    const g = greeting(st.lang || 'en', st.screen, st.account);
    this.setState({ chatOpen: true, msgs: [{ from: 'ai', text: g.text, chips: g.chips }] });
  }

  private camGo(t: Screen) {
    this.setState({ chatOpen: false });
    this.go(this.state.cam === 'none' ? 'permission' : t);
  }

  chipAct(c: Chip) {
    if (c.say) { this.sendMsg(c.say, c.intent); return; }
    const a = c.go;
    this.setState({ chatOpen: false });
    if (a === 'scanRoom') { this.setState({ mode: 'room', roomIdx: c.room ?? this.state.roomIdx, progress: 0 }); this.camGo('scan'); }
    else if (a === 'scanDevice') { this.setState({ mode: 'device' }); this.camGo('guide'); }
    else if (a === 'agent') { this.setState({ escalated: true }); this.go('outcome'); }
    else if (a) this.go(a as Screen);
  }

  async sendMsg(raw: string, given?: string) {
    const t = (raw || '').trim();
    if (!t || this.state.typing) return;
    this.setState(s => ({ msgs: [...s.msgs, { from: 'me', text: t }], chatInput: '', typing: true }));
    const lang = this.state.lang || 'en';
    const ctx = this.ctx!;
    const r = reply(t, given, { lang, scenario: this.state.scenario, ctx });
    const text = (await rewriteReply({ lang, summary: ctx.summary, screen: ctx.screen, customer: t, draft: r.text })) || r.text;
    if (this.unmounted) return;
    this.setState(s => ({ typing: false, msgs: [...s.msgs, { from: 'ai', text, chips: r.chips }] }));
    if (this.state.voice && window.speechSynthesis) {
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === 'ar' ? 'ar-SA' : 'en-GB';
        speechSynthesis.speak(u);
      } catch { /* speech unavailable */ }
    }
  }

  toggleMic() {
    if (this.state.listening) { try { this.rec?.stop(); } catch { /* ignore */ } return; }
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    const ar = this.state.lang === 'ar';
    if (!SR) {
      const text = ar ? 'الإدخال الصوتي غير متاح في هذا المتصفح — يُرجى الكتابة.' : 'Voice input isn’t available in this browser — please type instead.';
      this.setState(s => ({ msgs: [...s.msgs, { from: 'ai', text, chips: [] }] }));
      return;
    }
    try {
      const rec = new SR();
      this.rec = rec;
      rec.lang = ar ? 'ar-SA' : 'en-GB';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = e => { this.sendMsg(e.results[0][0].transcript); };
      rec.onerror = () => this.setState({ listening: false });
      rec.onend = () => this.setState({ listening: false });
      rec.start();
      this.setState({ listening: true });
    } catch {
      this.setState({ listening: false });
    }
  }

  render() {
    const vm = buildViewModel(this);
    return <Prototype vm={vm} refs={this.shellRefs} />;
  }
}
