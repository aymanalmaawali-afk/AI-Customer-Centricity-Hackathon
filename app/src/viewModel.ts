// View model for every screen — a direct port of renderVals() in Home WiFi Check v7.dc.html.
// It turns controller state into display-ready strings, colours and handlers, in EN or AR.
// Keep copy, colours and thresholds in sync with the design; screens only lay these values out.
import {
  HL,
  IMPACT,
  IMPACT_T,
  LABELS,
  OBJECTS,
  POS,
  ROOMS,
  SCEN,
  SCREENS,
  T_AR,
  T_EN,
  TAGC,
  TAGT,
  type Lang,
  type Place,
  type ScenarioKey,
  type Screen,
  type TagKind,
} from './data';
import { mbps, sigColor, sigColorLight, signal } from './lib/signal';
import type { Controller } from './state';

type Kind = 'ok' | 'warn' | 'bad';
type Level = 'NONE' | 'LOW' | 'HIGH';
interface Split { label: string; status: string; bg: string; border: string; color: string; note: string }
interface ImpactDef {
  title: string;
  split: Split[];
  level: Level;
  rows: [string, TagKind][];
  eta: string;
  etaNote: string;
  etaConf: string;
  actions: string[];
  esc: string;
  escKind: Kind;
}
interface ReportDef {
  title: string;
  /** [metric, before, after, unit, direction] — 'up' = higher is better, 'down' = lower is better, 'db' = dB delta. */
  rows: [string, number, number, string, 'up' | 'down' | 'db'][];
  /** Index of the row used for the overall improvement figure. */
  key: number;
  issues: string[];
  actions: string[];
  /** True when the "after" values are estimates (network fault not yet repaired). */
  est: boolean;
}
interface GuideOption { label: string; onClick: () => void; bg: string; fg: string; border: string }

export function buildViewModel(app: Controller) {
  const BP = app.cfg.primaryColor,
    ACC = app.cfg.accentColor;
  const brand = { primary: BP, accent: ACC };
  const st = app.state,
    sk = st.scenario,
    S = SCEN[sk] || SCEN.wifi,
    scr = st.screen,
    lang: Lang = app.state.lang || 'en',
    isAr = lang === 'ar';
  const X = (a: string, b: string) => (isAr ? b : a),
    low = (s: string) => (isAr ? s : s.toLowerCase()),
    ARW = isAr ? '←' : '→';
  const t = isAr ? T_AR : T_EN;
  const iso = (s: string) =>
    isAr
      ? s.replace(
          /[-+−]?\d[\d.,:]*(?:\s?(?:dBm|dB|Mbps|ms|GHz|%|m))?(?:\s?[→←]\s?[-+−]?\d[\d.,]*(?:\s?(?:dBm|dB|Mbps|ms|%))?)?/g,
          m => '\u2066' + m + '\u2069',
        )
      : s;
  const TAG = (k: TagKind) => ({ tag: TAGT[lang][k], bg: TAGC[k][0], fg: TAGC[k][1] });
  const is = {} as Record<Screen, boolean>;
  SCREENS.forEach(k => (is[k] = scr === k));
  const camScreen = ['scan', 'ar', 'guide'].includes(scr);
  const nav = {} as Record<Screen, () => void>;
  SCREENS.forEach(k => (nav[k] = () => app.go(k)));
  const idx = SCREENS.indexOf(scr);
  const flow = SCREENS.map((k, i) => ({
    n: String(i + 1).padStart(2, '0'),
    label: LABELS[i],
    onClick: nav[k],
    bg: i === idx ? '#0B2545' : 'transparent',
    fg: i === idx ? '#FFFFFF' : i < idx ? '#1F2937' : '#6B7280',
    numFg: i === idx ? ACC : i < idx ? '#1F8A57' : '#8A94A6',
  }));
  const maps = app.maps || {};
  const url = (k: Place) => maps[k]?.url ?? '';
  const stats = (k: Place) => maps[k]?.stats ?? { s: '0%', m: '0%', w: '0%' };
  const samples = ROOMS.map(r => ({
    ...r,
    name: r.n[lang],
    cur: Math.round(signal('current', r.cx, r.cy)),
    rec: Math.round(signal('recommended', r.cx, r.cy)),
    ext: Math.round(signal('extender', r.cx, r.cy)),
  }));
  const worst = samples.reduce((a, b) => (b.cur < a.cur ? b : a));
  const best = samples.reduce((a, b) => (b.cur > a.cur ? b : a));
  const rs = samples.find(s => s.id === worst.id)!;
  // scan
  const room = samples[st.roomIdx],
    done = st.progress >= 100;
  const scan = {
    room: room.name,
    roomNum: st.roomIdx + 1,
    pct: st.progress + '%',
    objects: OBJECTS[room.id]
      .filter(o => st.progress >= o.at)
      .map(o => ({
        label: o[lang],
        impact: IMPACT_T[lang][o.impact],
        left: o.l + '%',
        top: o.t + '%',
        width: o.w + '%',
        height: o.h + '%',
        color: IMPACT[o.impact],
      })),
    mini: ROOMS.map((r, i) => ({
      left: r.x0 * 10 + '%',
      top: (r.y0 / 8) * 100 + '%',
      w: (r.x1 - r.x0) * 10 + '%',
      h: ((r.y1 - r.y0) / 8) * 100 + '%',
      border: i === st.roomIdx ? ACC : i < st.roomIdx ? '#6FA0FF' : 'rgba(255,255,255,.25)',
      bg: i < st.roomIdx ? 'rgba(111,160,255,.35)' : i === st.roomIdx ? 'rgba(242,140,40,' + st.progress / 250 + ')' : 'transparent',
    })),
    hint: done
      ? st.roomIdx < 3
        ? X(
            'Room captured. Walk to the ' + low(samples[st.roomIdx + 1].name) + '.',
            'تم التقاط الغرفة. انتقل إلى ' + samples[st.roomIdx + 1].name + '.',
          )
        : X('Room captured. All rooms mapped.', 'تم التقاط الغرفة. اكتمل رسم جميع الغرف.')
      : X('Move slowly — sweep the walls, then the floor.', 'تحرّك ببطء — امسح الجدران ثم الأرضية.'),
    showSample: st.progress >= 50,
    sample: room.cur + ' dBm',
    sampleColor: sigColor(room.cur),
    nextLabel: done
      ? st.roomIdx < 3
        ? X('Next room', 'الغرفة التالية')
        : X('Finish scan', 'إنهاء المسح')
      : X('Scanning… ', 'جارٍ المسح… ') + st.progress + '%',
    nextBg: done ? BP : '#9AA4B5',
    onNext: () => {
      if (app.state.progress < 100) return;
      if (app.state.roomIdx < 3) app.setState(s => ({ roomIdx: s.roomIdx + 1, progress: 0 }));
      else app.go('measure');
    },
  };
  // measure
  const bad = (c: boolean) => (c ? '#C0313A' : '#1F2937');
  const LT = X('ISP line test', 'اختبار الخط'),
    RA = X('Router API', 'واجهة الراوتر');
  const rowsDef: [string, string, string, boolean][] = [
    [X('Router status', 'حالة الراوتر'), S.status[lang], RA, sk === 'router'],
    [X('Speed at router (wired)', 'السرعة عند الراوتر (سلكي)'), S.wired + ' / ' + S.plan + ' Mbps', LT, S.wired < S.plan * 0.5],
    [X('Latency', 'زمن الاستجابة'), S.lat + ' ms', LT, S.lat > 40],
    [X('Jitter · packet loss', 'التذبذب · فقد الحزم'), S.jit + ' ms · ' + S.loss + '%', LT, S.loss > 1],
    [X('Wi‑Fi at this phone', 'Wi‑Fi على هذا الهاتف'), samples[0].cur + ' dBm · 5 GHz', X('This phone', 'هذا الهاتف'), false],
    [
      X('Connected devices', 'الأجهزة المتصلة'),
      sk === 'device'
        ? X('Laptop · 2.4 GHz · 54 Mbps', 'حاسوب محمول · 2.4 GHz · 54 Mbps')
        : X('6 devices · all on 5 GHz', '6 أجهزة · كلها على 5 GHz'),
      RA,
      sk === 'device',
    ],
    [
      X('Room samples (4)', 'عينات الغرف (4)'),
      X('best ', 'الأفضل ') + best.cur + X(' · worst ', ' · الأسوأ ') + worst.cur,
      X('This phone, during scan', 'هذا الهاتف أثناء المسح'),
      worst.cur < -70,
    ],
    [X('Network in your area', 'الشبكة في منطقتك'), S.area[lang], X('ISP systems', 'أنظمة المزود'), sk === 'network'],
  ];
  const measureRows = rowsDef.map((r, i) => {
    const ok = st.mStep > i;
    return {
      label: r[0],
      value: ok ? r[1] : X('Measuring…', 'جارٍ القياس…'),
      source: r[2],
      color: ok ? bad(r[3]) : '#8A94A6',
      tag: TAGT[lang].M,
      tagBg: ok ? '#E3ECFD' : '#EEF2F8',
      tagFg: ok ? '#1D4FBF' : '#8A94A6',
    };
  });
  const mDone = st.mStep >= 8;
  const net = st.net;
  const browserNet = net
    ? X(
        'This browser also reports ~' +
          net.downlink +
          ' Mbps / ' +
          net.rtt +
          ' ms (' +
          net.effectiveType +
          ') — a rough estimate, not used for diagnosis.',
        'يُبلغ هذا المتصفح أيضًا عن ~' +
          net.downlink +
          ' Mbps / ' +
          net.rtt +
          ' ms (' +
          net.effectiveType +
          ') — تقدير تقريبي لا يُستخدم في التشخيص.',
      )
    : X(
        'The camera can’t measure Wi‑Fi — these values come from your router, our network and this phone.',
        'الكاميرا لا تقيس Wi‑Fi — هذه القيم من الراوتر وشبكتنا وهذا الهاتف.',
      );
  // AR
  const ap = st.arPlace,
    apS = stats(ap);
  const pins = samples.map(s => {
    const v = ap === 'current' ? s.cur : s.rec;
    return {
      left: s.cx * 10 + '%',
      top: (s.cy / 8) * 100 + '%',
      value: v + ' dBm',
      color: sigColor(v),
      borderStyle: ap === 'current' ? 'solid' : 'dashed',
    };
  });
  const rp = ap === 'current' ? POS.current : POS.recommended;
  const dist = Math.hypot(POS.recommended.x - POS.current.x, POS.recommended.y - POS.current.y).toFixed(1);
  const arV = {
    mapBg: url(ap) ? 'url(' + url(ap) + ')' : 'none',
    pins,
    routerLeft: rp.x * 10 + '%',
    routerTop: (rp.y / 8) * 100 + '%',
    showTarget: ap === 'current',
    stats: apS,
    curBg: ap === 'current' ? BP : 'transparent',
    recBg: ap === 'recommended' ? BP : 'transparent',
    curFg: ap === 'current' ? '#FFFFFF' : '#0B2545',
    recFg: ap === 'recommended' ? '#FFFFFF' : '#0B2545',
    setCurrent: () => app.setState({ arPlace: 'current' }),
    setRec: () => app.setState({ arPlace: 'recommended' }),
    headline:
      ap === 'current'
        ? X('Weak signal in the ' + low(worst.name), 'إشارة ضعيفة في ' + worst.name)
        : X('Move router to the hallway shelf', 'انقل الراوتر إلى رف الممر'),
    sub:
      ap === 'current'
        ? X(
            'Router is in the corner, inside a cabinet. Dashed ring marks a better spot ' + dist + ' m away.',
            'الراوتر في الزاوية داخل خزانة. الدائرة المتقطعة تحدد موقعًا أفضل على بُعد ' + dist + ' م.',
          )
        : X(
            'Expected: ' + worst.name + ' ' + worst.cur + ' → ' + rs.rec + ' dBm. Pins show estimates (dashed).',
            'المتوقع: ' + worst.name + ' من ' + worst.cur + ' إلى ' + rs.rec + ' dBm. العلامات تقديرية (متقطعة).',
          ),
    primaryLabel: st.fromDiag && sk === 'wifi' ? X('I’ve moved it — re-test', 'نقلته — أعد الاختبار') : X('Open diagnosis', 'افتح التشخيص'),
    primary: () => {
      if (app.state.fromDiag && sk === 'wifi') app.go('outcome');
      else app.go('diagnosis');
    },
  };
  const xrArText = st.xr.ar ? X('WEBXR AR READY', 'WebXR AR جاهز') : X('CAMERA OVERLAY MODE', 'وضع التراكب على الكاميرا');
  // WebXR fallback (iPhone Safari): gyroscope-anchored AR overlay
  const motionLive = st.motion === 'granted' && st.motionLive;
  const arMotion = {
    mode: motionLive ? 'live' : st.motion === 'prompt' ? 'prompt' : 'off',
    liveLabel: X('MOTION-TRACKED · TAP TO RECENTRE', 'تتبّع الحركة · اضغط لإعادة التوسيط'),
    promptLabel: X('ENABLE MOTION TRACKING', 'تفعيل تتبّع الحركة'),
    enable: () => app.askMotion(),
    recentre: () => app.recentreAR(),
  };
  // model
  const PL: [Place, string][] = [
    ['current', X('Current', 'الحالي')],
    ['recommended', X('Move router', 'نقل الراوتر')],
    ['extender', X('Add extender', 'إضافة مقوٍّ')],
  ];
  const places = PL.map(([k, l]) => ({
    label: l,
    onClick: () => app.setPlace(k),
    bg: st.place === k ? BP : 'transparent',
    fg: st.place === k ? '#FFFFFF' : '#0B2545',
  }));
  const modelStats = stats(st.place);
  const modelNote =
    st.place === 'current'
      ? X('Router in a corner cabinet. Blue ring = recommended spot.', 'الراوتر في خزانة بالزاوية. الحلقة الزرقاء = الموقع المقترح.')
      : st.place === 'recommended'
        ? X(
            'Estimated after moving the router ' + dist + ' m to the hallway. Free, 5 minutes.',
            'تقدير بعد نقل الراوتر ' + dist + ' م إلى الممر. مجانًا وخلال 5 دقائق.',
          )
        : X(
            'Estimated with an extender in the office doorway. Keeps router where it is.',
            'تقدير مع مقوٍّ عند باب المكتب. يبقى الراوتر في مكانه.',
          );
  const lookRoom = samples[st.lookRoom] ?? samples[0];
  const lookV = {
    on: st.look,
    stereo: st.stereo,
    title: X('Look around · ', 'استكشف · ') + lookRoom.name,
    hint: motionLive
      ? X('Move your phone to look around. Tap a room to stand in it.', 'حرّك هاتفك للنظر حولك. اضغط على غرفة للوقوف فيها.')
      : X('Drag to look around. Tap a room to stand in it.', 'اسحب للنظر حولك. اضغط على غرفة للوقوف فيها.'),
    motionNote:
      st.motion === 'denied'
        ? X('Motion access is off — enable it in Settings › Safari › Motion & Orientation Access, or drag to look.', 'الوصول إلى الحركة متوقف — فعّله من الإعدادات › Safari › الوصول إلى الحركة والاتجاه، أو اسحب للنظر.')
        : '',
    splitLabel: X('Split view', 'عرض مزدوج'),
    exitLabel: X('Exit', 'خروج'),
    landscape: X('Turn your phone sideways and place it in a Cardboard‑style viewer.', 'أدر هاتفك أفقيًا وضعه في نظارة من نوع Cardboard.'),
    rooms: samples.map((r, i) => ({
      label: r.name,
      value: r.cur + ' dBm',
      color: sigColorLight(r.cur),
      on: i === st.lookRoom,
      onClick: () => app.setLookRoom(i),
    })),
    exit: () => app.exitLook(),
    toggleStereo: () => app.toggleStereo(),
  };
  const modelWeakColor = parseInt(modelStats.w) > 15 ? '#FF6B6F' : '#7EE0A8';
  const TM = {
    load: X('3D engine could not load on this connection.', 'تعذّر تحميل محرك الأبعاد الثلاثية على هذا الاتصال.'),
    webgl: X(
      'WebGL is not available — 3D view needs a WebGL-capable browser.',
      'WebGL غير متاح — يتطلب العرض ثلاثي الأبعاد متصفحًا يدعمه.',
    ),
    start: X('3D view could not start on this device.', 'تعذّر تشغيل العرض ثلاثي الأبعاد على هذا الجهاز.'),
    vrBlocked: X('VR session was blocked — staying in 3D mode.', 'تم حظر جلسة الواقع الافتراضي — سنبقى في الوضع ثلاثي الأبعاد.'),
    noVR: X(
      'No VR headset or WebXR VR support detected — you’re in standard 3D mode. Open this link in a headset browser for VR.',
      'لم يتم اكتشاف نظارة واقع افتراضي أو دعم WebXR — أنت في الوضع ثلاثي الأبعاد العادي. افتح الرابط في متصفح النظارة لتجربة الواقع الافتراضي.',
    ),
  };
  // dashboard extras
  const C = 326.73,
    dash = (p: number) => (Math.max(0, Math.min(1, p)) * C).toFixed(1) + ' ' + C;
  const ICON = {
    speed: 'M12 14l4-4 M3.5 16a9 9 0 1 1 17 0',
    clock: 'M12 7v5l3 2 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    loss: 'M3 12h4l2-5 4 10 2-5h6',
    wifi: 'M5 12.5a10 10 0 0 1 14 0 M8.5 16a5 5 0 0 1 7 0 M12 19.5h.01',
    home: 'M3 11l9-8 9 8 M5 9.5V21h5v-6h4v6h5V9.5',
    bars: 'M5 20V10 M12 20V4 M19 20v-7',
    pulse: 'M3 12h4l3-8 4 16 3-8h4',
    doc: 'M6 3h9l4 4v14H6z M9 12h7 M9 16h7 M14 3v5h5',
  };
  const shown = (i: number) => st.mStep > i;
  const pctPlan = S.wired / S.plan;
  const mdash = {
    pct: mDone ? Math.round(pctPlan * 100) + '%' : Math.round((st.mStep / 8) * 100) + '%',
    dash: dash(mDone ? pctPlan : st.mStep / 8),
    ringLabel: mDone ? X('Speed at router vs your plan', 'السرعة عند الراوتر مقارنة بباقتك') : X('Measuring…', 'جارٍ القياس…'),
    speed: shown(1) ? S.wired + ' / ' + S.plan + ' Mbps' : '—',
    tag: TAGT[lang].M,
    tiles: [
      {
        icon: ICON.speed,
        label: X('Download', 'التنزيل'),
        value: shown(1) ? S.wired + ' Mbps' : '—',
        color: shown(1) && S.wired < S.plan * 0.5 ? '#C0313A' : '#0B2545',
      },
      {
        icon: ICON.clock,
        label: X('Latency', 'زمن الاستجابة'),
        value: shown(2) ? S.lat + ' ms' : '—',
        color: shown(2) && S.lat > 40 ? '#C0313A' : '#0B2545',
      },
      {
        icon: ICON.loss,
        label: X('Packet loss', 'فقد الحزم'),
        value: shown(3) ? S.loss + '%' : '—',
        color: shown(3) && S.loss > 1 ? '#C0313A' : '#0B2545',
      },
      { icon: ICON.wifi, label: X('Wi‑Fi here', 'Wi‑Fi هنا'), value: shown(4) ? samples[0].cur + ' dBm' : '—', color: '#0B2545' },
    ],
    barsTitle: X('Signal by room', 'الإشارة حسب الغرفة'),
    bars: samples.map(s => {
      const on = shown(6);
      const p = Math.max(0.08, Math.min(1, (s.cur + 95) / 50));
      return {
        label: s.name,
        value: on ? s.cur + '' : '—',
        h: on ? Math.round(p * 100) + '%' : '8%',
        fill: s.cur < -70 ? '#E25054' : 'linear-gradient(180deg,color-mix(in srgb,' + BP + ' 55%,#FFFFFF),' + BP + ')',
        color: on ? sigColorLight(s.cur) : '#9AA4B5',
      };
    }),
  };
  const ms = modelStats;
  const modelRings = [
    [X('Strong', 'قوية'), ms.s, '#3FBE7A'],
    [X('Moderate', 'متوسطة'), ms.m, '#F0C448'],
    [X('Weak', 'ضعيفة'), ms.w, '#E25054'],
  ].map(([label, pct, color]) => ({ label, pct, color, dash: dash(parseInt(pct) / 100) }));
  const TABK: [Screen, string, string, Screen[]][] = [
    ['welcome', X('Home', 'الرئيسية'), ICON.home, ['welcome', 'identify', 'permission']],
    ['measure', X('Check', 'الفحص'), ICON.bars, ['measure']],
    ['diagnosis', X('Diagnosis', 'التشخيص'), ICON.pulse, ['diagnosis', 'impact']],
    ['report', X('Report', 'التقرير'), ICON.doc, ['outcome', 'report']],
  ];
  const tabs = {
    show: ['welcome', 'measure', 'diagnosis', 'impact', 'outcome', 'report'].includes(scr),
    items: TABK.map(([k, label, icon, grp]) => {
      const on = grp.includes(scr);
      return {
        label,
        icon,
        onClick: nav[k],
        fg: on ? BP : '#6B7280',
        bg: on ? 'color-mix(in srgb,' + BP + ' 14%,#FFFFFF)' : 'transparent',
      };
    }),
  };
  // diagnosis
  const T = (text: string, k: TagKind) => ({ text, ...TAG(k) });
  const Lc = (label: string, status: string, kind: Kind) => {
    const m = { ok: ['#EAF7F0', '#BFE6CF', '#1F8A57'], warn: ['#FFF6E0', '#F2D896', '#9A6B00'], bad: ['#FDECEC', '#F3B5B8', '#C0313A'] }[
      kind
    ];
    return { label, status, bg: m[0], border: m[1], color: m[2] };
  };
  const N = X('Network', 'الشبكة'),
    RT = X('Router', 'الراوتر'),
    RC = X('Room coverage', 'تغطية الغرف'),
    YD = X('Your devices', 'أجهزتك'),
    OK = X('OK', 'سليم'),
    PR = X('Problem', 'مشكلة'),
    W2 = X('Weak in 2 rooms', 'ضعيفة في غرفتين');
  const goAR = () => {
    app.setState({ arPlace: 'recommended', fromDiag: true });
    app.go('ar');
  };
  const escalate = () => {
    app.setState({ escalated: true });
    app.go('outcome');
  };
  const sc = stats('current').w,
    sr = stats('recommended').w,
    se = stats('extender').w;
  const D = {
    wifi: {
      title: X(
        'Your broadband is fine — your Wi‑Fi isn’t reaching every room.',
        'خدمة النطاق العريض سليمة — لكن Wi‑Fi لا يصل إلى كل الغرف.',
      ),
      conf: '88%',
      locator: [Lc(N, OK, 'ok'), Lc(RT, OK, 'ok'), Lc(RC, PR, 'bad'), Lc(YD, OK, 'ok')],
      evidence: [
        T(X(S.wired + ' of ' + S.plan + ' Mbps arriving at the router', 'تصل ' + S.wired + ' من ' + S.plan + ' Mbps إلى الراوتر'), 'M'),
        T(worst.name + ': ' + worst.cur + ' dBm' + X(', ', '، ') + mbps(worst.cur, S.wired) + ' Mbps', 'M'),
        T(X('Router inside a TV cabinet, near a mirror', 'الراوتر داخل خزانة التلفاز بجوار مرآة'), 'AC'),
        T(X('Moving it cuts weak area ' + sc + ' → ' + sr, 'نقله يقلل المناطق الضعيفة من ' + sc + ' إلى ' + sr), 'E'),
      ],
      recs: [
        {
          n: '01',
          title: X('Move the router to the hallway shelf', 'انقل الراوتر إلى رف الممر'),
          body: X(
            dist + ' m from where it is now. We’ll guide you with AR.',
            'على بُعد ' + dist + ' م من موقعه الحالي. سنرشدك بالواقع المعزز.',
          ),
        },
        {
          n: '02',
          title: X('Can’t move it? Add an extender', 'لا يمكنك نقله؟ أضف مقوّي إشارة'),
          body: X(
            'Office doorway. Weak area ' + sc + ' → ' + se + ' (estimated).',
            'عند باب المكتب. المناطق الضعيفة ' + sc + ' ' + ARW + ' ' + se + ' (تقديري).',
          ),
        },
      ],
      primaryLabel: X('Show me where in AR', 'أرني المكان بالواقع المعزز'),
      primary: goAR,
      secondaryLabel: X('Check router hardware too', 'افحص الراوتر أيضًا'),
      secondary: nav.guide,
    },
    device: {
      title: X('Your broadband is fine — your laptop is holding it back.', 'خدمتك سليمة — الحاسوب المحمول هو سبب البطء.'),
      conf: '84%',
      locator: [Lc(N, OK, 'ok'), Lc(RT, OK, 'ok'), Lc(RC, X('Good here', 'جيدة هنا'), 'ok'), Lc(YD, PR, 'bad')],
      evidence: [
        T(X(S.wired + ' of ' + S.plan + ' Mbps arriving at the router', 'تصل ' + S.wired + ' من ' + S.plan + ' Mbps إلى الراوتر'), 'M'),
        T(
          X(
            'This phone gets ' + mbps(samples[0].cur, S.wired) + ' Mbps in the same room',
            'يحصل هذا الهاتف على ' + mbps(samples[0].cur, S.wired) + ' Mbps في الغرفة نفسها',
          ),
          'M',
        ),
        T(X('Laptop links at 54 Mbps on 2.4 GHz', 'يتصل الحاسوب بسرعة 54 Mbps على 2.4 GHz'), 'M'),
        T(X('Older Wi‑Fi 4 adapter is stuck on the slow band', 'محوّل Wi‑Fi 4 القديم عالق على النطاق البطيء'), 'A'),
      ],
      recs: [
        {
          n: '01',
          title: X('Switch the laptop to HubPro‑5G', 'حوّل الحاسوب إلى شبكة HubPro‑5G'),
          body: X('Forget the network, then rejoin the 5G name. About 2 minutes.', 'انسَ الشبكة ثم اتصل باسم 5G مجددًا. نحو دقيقتين.'),
        },
        {
          n: '02',
          title: X('5G not listed? The adapter is too old', 'لا تظهر شبكة 5G؟ المحوّل قديم'),
          body: X('A USB Wi‑Fi 6 adapter or the LAN cable fixes it.', 'محوّل USB بتقنية Wi‑Fi 6 أو كابل LAN يحل المشكلة.'),
        },
      ],
      primaryLabel: X('I’ve switched it — re-test', 'حوّلته — أعد الاختبار'),
      primary: nav.outcome,
      secondaryLabel: X('Check router hardware too', 'افحص الراوتر أيضًا'),
      secondary: nav.guide,
    },
    router: {
      title: X('Your router keeps dropping the connection.', 'الراوتر يفقد الاتصال باستمرار.'),
      conf: '82%',
      locator: [Lc(N, OK, 'ok'), Lc(RT, PR, 'bad'), Lc(RC, W2, 'warn'), Lc(YD, OK, 'ok')],
      evidence: [
        T(X('9 restarts in the last 24 hours', '9 إعادات تشغيل خلال آخر 24 ساعة'), 'M'),
        T(X('Only ' + S.wired + ' of ' + S.plan + ' Mbps at the router', 'فقط ' + S.wired + ' من ' + S.plan + ' Mbps عند الراوتر'), 'M'),
        T(X('Line test to the street cabinet is clean', 'اختبار الخط حتى كابينة الشارع سليم'), 'M'),
        T(X('Pattern matches a loose WAN cable or overheating', 'النمط يطابق كابل WAN غير مثبت أو ارتفاع الحرارة'), 'A'),
      ],
      recs: [
        {
          n: '01',
          title: X('Check cables and restart', 'افحص الكابلات وأعد التشغيل'),
          body: X('Guided with your camera. About 3 minutes.', 'بإرشاد عبر الكاميرا. نحو 3 دقائق.'),
        },
        {
          n: '02',
          title: X('Then take it out of the cabinet', 'ثم أخرجه من الخزانة'),
          body: X(
            'Enclosed routers overheat — and it fixes the weak ' + low(worst.name) + '.',
            'الراوتر المغلق عليه يسخن — ونقله يحسّن ' + worst.name + ' أيضًا.',
          ),
        },
      ],
      primaryLabel: X('Start guided check', 'ابدأ الفحص الموجّه'),
      primary: nav.guide,
      secondaryLabel: X('Contact support', 'تواصل مع الدعم'),
      secondary: escalate,
    },
    network: {
      title: X('The problem is on our network, not in your home.', 'المشكلة في شبكتنا وليست في منزلك.'),
      conf: '91%',
      locator: [Lc(N, PR, 'bad'), Lc(RT, OK, 'ok'), Lc(RC, W2, 'warn'), Lc(YD, OK, 'ok')],
      evidence: [
        T(
          X(
            'Only ' + S.wired + ' of ' + S.plan + ' Mbps, even on a wired test',
            'فقط ' + S.wired + ' من ' + S.plan + ' Mbps حتى في الاختبار السلكي',
          ),
          'M',
        ),
        T(X(S.loss + '% packet loss, ' + S.lat + ' ms latency', 'فقد حزم ' + S.loss + '% وزمن استجابة ' + S.lat + ' ms'), 'M'),
        T(X('Line errors at street cabinet 14B since 06:40', 'أخطاء في الخط عند كابينة الشارع 14B منذ 06:40'), 'M'),
        T(X('A router restart is unlikely to help', 'إعادة تشغيل الراوتر غالبًا لن تفيد'), 'A'),
      ],
      recs: [
        {
          n: '01',
          title: X('Quick 2‑minute router check', 'فحص سريع للراوتر خلال دقيقتين'),
          body: X('Rules out your side so we can skip a technician visit.', 'يستبعد جانبك فنتجنب زيارة الفني.'),
        },
        {
          n: '02',
          title: X('We open a case with your results', 'نفتح بلاغًا مرفقًا بنتائجك'),
          body: X(
            'Line test, router logs and room map are attached automatically.',
            'يُرفق اختبار الخط وسجلات الراوتر وخريطة الغرف تلقائيًا.',
          ),
        },
      ],
      primaryLabel: X('Start guided check', 'ابدأ الفحص الموجّه'),
      primary: nav.guide,
      secondaryLabel: X('Skip — contact support now', 'تخطَّ — تواصل مع الدعم الآن'),
      secondary: escalate,
    },
  };
  const diag0 = D[sk] || D.wifi;
  const diag = {
    ...diag0,
    dash: dash(parseInt(diag0.conf) / 100),
    confLabel: X('AI · ' + diag0.conf + ' CONFIDENCE', 'ذكاء · ثقة ' + diag0.conf),
    primaryLabel: X('See full assessment', 'عرض التقييم الكامل'),
    primary: nav.impact,
  };
  // impact
  const SP = (label: string, status: string, kind: Kind, note: string) => ({ ...Lc(label, status, kind), note });
  const IN = X('Inside your home', 'داخل منزلك'),
    OUT = X('Outside your home', 'خارج منزلك'),
    HEALTHY = X('Healthy', 'سليمة'),
    NORM = X('Line and street network normal', 'الخط وشبكة الشارع طبيعيان');
  const LV: Record<Level, [string, string, string]> = {
    NONE: ['#EAF7F0', '#1F8A57', X('NONE', 'لا يوجد')],
    LOW: ['#FFF6E0', '#8A5A00', X('LOW', 'منخفض')],
    HIGH: ['#FDECEC', '#C0313A', X('HIGH', 'مرتفع')],
  };
  const NN = X('Not needed', 'غير مطلوب');
  const IMP: Record<ScenarioKey, ImpactDef> = {
    wifi: {
      title: X('Indoor coverage issue — nothing is wrong outside your home.', 'مشكلة تغطية داخلية — لا يوجد أي خلل خارج منزلك.'),
      split: [
        SP(IN, PR, 'bad', X('Weak Wi‑Fi in ' + low(worst.name) + ' and kitchen', 'Wi‑Fi ضعيف في ' + worst.name + ' والمطبخ')),
        SP(OUT, HEALTHY, 'ok', NORM),
      ],
      level: 'NONE',
      rows: [
        [X('Walls and a cabinet around the router block the signal', 'الجدران والخزانة حول الراوتر تحجب الإشارة'), 'AC'],
        [X('Wi‑Fi in 2 rooms only — wired speed is normal', 'Wi‑Fi في غرفتين فقط — السرعة السلكية طبيعية'), 'M'],
        [X('Only your home', 'منزلك فقط'), 'A'],
        [X('No effect on neighbours or the street network', 'لا تأثير على الجيران أو شبكة الشارع'), 'A'],
      ],
      eta: X('≈ 5 min', '≈ 5 د'),
      etaNote: X('You can fix this now by moving the router. No visit needed.', 'يمكنك إصلاحها الآن بنقل الراوتر. لا حاجة لزيارة.'),
      etaConf: '92%',
      actions: [
        X('Move the router to the hallway shelf', 'انقل الراوتر إلى رف الممر'),
        X('Re-test with this phone in each room', 'أعد الاختبار بهذا الهاتف في كل غرفة'),
      ],
      esc: NN,
      escKind: 'ok',
    },
    device: {
      title: X('Device issue — your home network and our network are fine.', 'مشكلة في الجهاز — شبكة منزلك وشبكتنا سليمتان.'),
      split: [
        SP(IN, X('Device', 'الجهاز'), 'bad', X('Laptop stuck on slow 2.4 GHz band', 'الحاسوب عالق على نطاق 2.4 GHz البطيء')),
        SP(OUT, HEALTHY, 'ok', NORM),
      ],
      level: 'NONE',
      rows: [
        [X('Older laptop Wi‑Fi adapter joined the 2.4 GHz band', 'محوّل Wi‑Fi القديم في الحاسوب اتصل بنطاق 2.4 GHz'), 'M'],
        [X('That laptop only — other devices are fast', 'ذلك الحاسوب فقط — باقي الأجهزة سريعة'), 'M'],
        [X('Only your home', 'منزلك فقط'), 'A'],
        [X('No effect outside the building', 'لا تأثير خارج المبنى'), 'A'],
      ],
      eta: X('≈ 2 min', '≈ 2 د'),
      etaNote: X('Rejoin the 5 GHz network on the laptop.', 'أعد اتصال الحاسوب بشبكة 5 GHz.'),
      etaConf: '88%',
      actions: [
        X('Forget the network and rejoin HubPro‑5G', 'انسَ الشبكة واتصل بـ HubPro‑5G'),
        X('No 5G option? Use a USB Wi‑Fi 6 adapter or a cable', 'لا يوجد خيار 5G؟ استخدم محوّل USB بتقنية Wi‑Fi 6 أو كابلًا'),
      ],
      esc: NN,
      escKind: 'ok',
    },
    router: {
      title: X('Router fault inside your home — a small knock-on effect outside.', 'عطل في الراوتر داخل منزلك — مع تأثير بسيط خارجه.'),
      split: [
        SP(IN, PR, 'bad', X('Router restarting 9× a day', 'الراوتر يعيد التشغيل 9 مرات يوميًا')),
        SP(OUT, X('Low impact', 'تأثير منخفض'), 'warn', X('Extra load on cabinet 14B', 'حمل إضافي على الكابينة 14B')),
      ],
      level: 'LOW',
      rows: [
        [
          X('Each restart forces a line re-sync with street cabinet 14B', 'كل إعادة تشغيل تفرض إعادة مزامنة الخط مع كابينة الشارع 14B'),
          'M',
        ],
        [X('Your broadband and digital phone line', 'النطاق العريض وخط الهاتف الرقمي لديك'), 'M'],
        [X('No neighbours affected yet', 'لم يتأثر أي من الجيران حتى الآن'), 'A'],
        [
          X(
            'If it continues, your port may be auto-throttled to protect the cabinet',
            'إن استمر ذلك قد يُخفَّض منفذك تلقائيًا لحماية الكابينة',
          ),
          'A',
        ],
      ],
      eta: X('≈ 10 min', '≈ 10 د'),
      etaNote: X(
        'Cable check and restart. Replacement router next day if restarts return.',
        'فحص الكابل وإعادة التشغيل. راوتر بديل في اليوم التالي إن عادت المشكلة.',
      ),
      etaConf: '81%',
      actions: [
        X('Check the WAN cable and restart (guided)', 'افحص كابل WAN وأعد التشغيل (بإرشاد)'),
        X('Take the router out of the cabinet to stop overheating', 'أخرج الراوتر من الخزانة لتجنّب ارتفاع الحرارة'),
      ],
      esc: X('Only if restarts continue — replacement pre-approved', 'فقط إن استمرت إعادة التشغيل — الاستبدال معتمد مسبقًا'),
      escKind: 'warn',
    },
    network: {
      title: X('External network fault — not caused by anything in your home.', 'عطل في الشبكة الخارجية — لا علاقة له بأي شيء في منزلك.'),
      split: [
        SP(IN, X('Minor', 'بسيطة'), 'warn', X('Wi‑Fi weak in 2 rooms (separate issue)', 'Wi‑Fi ضعيف في غرفتين (مشكلة منفصلة)')),
        SP(OUT, X('Fault', 'عطل'), 'bad', X('Line errors at cabinet 14B', 'أخطاء في الخط عند الكابينة 14B')),
      ],
      level: 'HIGH',
      rows: [
        [X('Line card fault at street cabinet 14B since 06:40', 'عطل في بطاقة الخط بكابينة الشارع 14B منذ 06:40'), 'M'],
        [X('Broadband, digital voice and TV streaming', 'النطاق العريض والصوت الرقمي وبث التلفاز'), 'M'],
        [X('46 homes on Elm Road and Park Lane', '46 منزلًا في شارع إلم وبارك لين'), 'M'],
        [X('Speeds down up to 92%; calls may drop', 'انخفاض السرعة حتى 92% وقد تنقطع المكالمات'), 'E'],
      ],
      eta: X('≈ 3 h 20 m', '≈ 3 س 20 د'),
      etaNote: X(
        'Remote line card reset. Expected back to normal by 18:00 today.',
        'إعادة ضبط بطاقة الخط عن بُعد. يُتوقع عودة الخدمة بحلول 18:00 اليوم.',
      ),
      etaConf: '78%',
      actions: [
        X('Nothing to do at home — please don’t restart repeatedly', 'لا شيء مطلوب في المنزل — يُرجى عدم إعادة التشغيل مرارًا'),
        X('We’ll text you when service is restored', 'سنرسل لك رسالة عند عودة الخدمة'),
      ],
      esc: X('Raised to Network Operations · case NL‑48213', 'صُعّد إلى عمليات الشبكة · بلاغ NL‑48213'),
      escKind: 'bad',
    },
  };
  const I = IMP[sk] || IMP.wifi;
  const ESC = { ok: ['#EAF7F0', '#1F8A57'], warn: ['#FFF6E0', '#8A5A00'], bad: ['#FDECEC', '#C0313A'] }[I.escKind];
  const RL = [
    X('CAUSE', 'السبب'),
    X('AFFECTED SERVICES', 'الخدمات المتأثرة'),
    X('AFFECTED CUSTOMERS', 'العملاء المتأثرون'),
    X('POTENTIAL IMPACT', 'التأثير المحتمل'),
  ];
  const impact = {
    ...I,
    rows: I.rows.map(([text, k], i) => ({ text, ...TAG(k), label: RL[i] })),
    level: LV[I.level][2],
    levelBg: LV[I.level][0],
    levelFg: LV[I.level][1],
    etaConfLabel: X('ESTIMATED · ', 'تقديري · ') + I.etaConf,
    actions: I.actions.map((tx, i) => ({ n: '0' + (i + 1), text: tx })),
    escBg: ESC[0],
    escFg: ESC[1],
    primaryLabel: diag0.primaryLabel,
    primary: diag0.primary,
    secondaryLabel: diag0.secondaryLabel,
    secondary: diag0.secondary,
  };
  // guide
  const steps: { title: string; body: string; hl: string; opts: [string, number | 'restart'][] }[] = [
    {
      title: X('Point your camera at the router', 'وجّه الكاميرا نحو الراوتر'),
      body: X(
        'Hold the phone about 1 m away with the front lights facing you.',
        'أمسك الهاتف على بُعد متر تقريبًا مع توجيه الأضواء الأمامية نحوك.',
      ),
      hl: 'device',
      opts: [[X('That’s my router', 'هذا هو الراوتر'), 1]],
    },
    {
      title: X('Check the power light', 'تحقق من ضوء الطاقة'),
      body: X('The left light should be solid white.', 'يجب أن يكون الضوء الأيسر أبيض ثابتًا.'),
      hl: 'power',
      opts: [
        [X('Solid white', 'أبيض ثابت'), 1],
        [X('Off or flashing', 'مطفأ أو يومض'), 1],
      ],
    },
    {
      title: X('Check the WAN cable', 'تحقق من كابل WAN'),
      body: X(
        'The grey cable from the wall socket must click into the orange WAN port.',
        'يجب أن يكون الكابل الرمادي القادم من المقبس مثبتًا في منفذ WAN البرتقالي.',
      ),
      hl: 'wan',
      opts: [
        [X('It’s secure', 'مثبت جيدًا'), 1],
        [X('I pushed it back in', 'أعدت تثبيته'), 1],
      ],
    },
    {
      title: X('What colour is the internet light?', 'ما لون ضوء الإنترنت؟'),
      body: X('Second light from the right.', 'الضوء الثاني من اليمين.'),
      hl: 'internet',
      opts: [
        [X('White', 'أبيض'), 1],
        [X('Amber', 'برتقالي'), 1],
        [X('Off', 'مطفأ'), 1],
      ],
    },
    {
      title: X('Restart the router', 'أعد تشغيل الراوتر'),
      body: X(
        'Press the power button on the back once. We’ll watch the lights for you.',
        'اضغط زر التشغيل في الخلف مرة واحدة. سنراقب الأضواء نيابةً عنك.',
      ),
      hl: 'button',
      opts: [[X('I’ve pressed it', 'ضغطت عليه'), 'restart']],
    },
  ];
  const gs = steps[Math.min(st.step, 4)];
  const restarting = st.restart > 0;
  const internetColor = restarting ? '#3A4252' : st.restarted ? S.after : S.internet;
  const lc = restarting ? '#3A4252' : '#F4F6FA';
  const lights = [
    { left: '70px', color: restarting ? '#59627A' : '#F4F6FA' },
    { left: '100px', color: lc },
    { left: '130px', color: internetColor },
    { left: '160px', color: lc },
  ];
  let options: GuideOption[],
    gTitle = gs.title,
    gBody = gs.body;
  if (st.step === 4 && restarting) {
    gTitle = X('Restarting…', 'جارٍ إعادة التشغيل…');
    gBody = X(
      'Lights will go off, then come back. About ' + st.restart + ' s left.',
      'ستنطفئ الأضواء ثم تعود. تبقّى نحو ' + st.restart + ' ثانية.',
    );
    options = [];
  } else if (st.step === 4 && st.restarted) {
    gTitle =
      sk === 'network'
        ? X('Router is back — internet light still amber', 'عاد الراوتر — ضوء الإنترنت لا يزال برتقاليًا')
        : X('Router is back online', 'عاد الراوتر للاتصال');
    gBody =
      sk === 'network'
        ? X(
            'Your equipment is working. The fault is upstream, as the line test showed.',
            'أجهزتك تعمل. العطل خارج المنزل كما أظهر اختبار الخط.',
          )
        : X('Internet light is solid white. Let’s re-test your connection.', 'ضوء الإنترنت أبيض ثابت. لنُعِد اختبار اتصالك.');
    options = [{ label: X('Run re-test', 'إعادة الاختبار'), onClick: nav.outcome, bg: BP, fg: '#FFFFFF', border: 'none' }];
  } else
    options = gs.opts.map(([l, a], i) => ({
      label: l,
      onClick: () => {
        if (a === 'restart') app.startRestart();
        else app.setState(s => ({ step: s.step + 1 }));
      },
      bg: i === 0 ? BP : '#FFFFFF',
      fg: i === 0 ? '#FFFFFF' : '#0B2545',
      border: i === 0 ? 'none' : '1.5px solid #C9D3E3',
    }));
  const hl = HL[gs.hl];
  const guide = {
    counter: X('CHECK ' + (Math.min(st.step, 4) + 1) + ' OF 5', 'الفحص ' + (Math.min(st.step, 4) + 1) + ' من 5'),
    title: gTitle,
    body: gBody,
    options,
    hl: { left: hl.left, top: hl.top, w: hl.w, h: hl.h, label: hl[lang] },
    lights,
    recog: st.recog,
    dots: steps.map((_, i) => ({
      bg: i < st.step || (i === 4 && st.restarted) ? ACC : i === st.step ? 'rgba(242,140,40,.55)' : 'rgba(255,255,255,.2)',
    })),
  };
  // outcome
  const showCase = sk === 'network' || st.escalated;
  const G = '#1F8A57',
    Rd = '#C0313A';
  const SR = X('Speed at router', 'السرعة عند الراوتر');
  const after =
    sk === 'device'
      ? [
          { label: X('Laptop link', 'اتصال الحاسوب'), value: '866 Mbps · 5 GHz', color: G },
          { label: X('Laptop speed test', 'اختبار سرعة الحاسوب'), value: '402 Mbps', color: G },
          { label: X('This phone, same room', 'هذا الهاتف، نفس الغرفة'), value: mbps(samples[0].cur, S.wired) + ' Mbps', color: G },
          { label: SR, value: S.wired + ' Mbps', color: G },
        ]
      : sk === 'wifi'
        ? samples.map(s => ({ label: s.name, value: s.rec + ' dBm · ' + mbps(s.rec, S.wired) + ' Mbps', color: sigColorLight(s.rec) }))
        : [
            { label: SR, value: (sk === 'router' ? 471 : S.wired) + ' Mbps', color: sk === 'router' ? G : Rd },
            { label: X('Latency', 'زمن الاستجابة'), value: (sk === 'router' ? 13 : S.lat) + ' ms', color: sk === 'router' ? G : Rd },
            { label: X('Packet loss', 'فقد الحزم'), value: (sk === 'router' ? 0 : S.loss) + '%', color: sk === 'router' ? G : Rd },
            { label: X('Router restarts (since)', 'إعادات التشغيل (منذ الإصلاح)'), value: '0', color: G },
          ];
  const O = {
    wifi: {
      icon: '✓',
      iconBg: G,
      title: X('Fixed — strong Wi‑Fi in every room.', 'تم الإصلاح — Wi‑Fi قوي في كل الغرف.'),
      body: X(
        'You moved the router to the hallway shelf. Here’s what this phone measured in each room afterwards.',
        'نقلت الراوتر إلى رف الممر. هذا ما قاسه هذا الهاتف في كل غرفة بعد ذلك.',
      ),
      tableTitle: X('Re-test after moving', 'إعادة الاختبار بعد النقل'),
    },
    device: {
      icon: '✓',
      iconBg: G,
      title: X('Fixed — your laptop is on 5 GHz now.', 'تم الإصلاح — الحاسوب الآن على 5 GHz.'),
      body: X(
        'Your broadband and router were fine. The laptop had joined the slower 2.4 GHz band.',
        'كانت الخدمة والراوتر سليمين. الحاسوب كان متصلًا بنطاق 2.4 GHz الأبطأ.',
      ),
      tableTitle: X('Re-test on your laptop', 'إعادة الاختبار على الحاسوب'),
    },
    router: {
      icon: '✓',
      iconBg: G,
      title: X('Back to full speed.', 'عادت السرعة الكاملة.'),
      body: X(
        'Re-seating the cable and restarting fixed it. If it restarts on its own again within 7 days, we’ll send a replacement — no need to call.',
        'إعادة تثبيت الكابل وإعادة التشغيل حلّا المشكلة. إن أعاد التشغيل تلقائيًا خلال 7 أيام فسنرسل بديلًا — دون الحاجة للاتصال.',
      ),
      tableTitle: X('Re-test after restart', 'إعادة الاختبار بعد إعادة التشغيل'),
    },
    network: {
      icon: '!',
      iconBg: BP,
      title: X('We’ve opened a case — no technician visit needed.', 'فتحنا بلاغًا — لا حاجة لزيارة فني.'),
      body: X(
        'Your router and Wi‑Fi are fine. The fault is at street cabinet 14B, and our engineers can fix it remotely.',
        'الراوتر وWi‑Fi سليمان. العطل في كابينة الشارع 14B ويمكن لمهندسينا إصلاحه عن بُعد.',
      ),
      tableTitle: X('Re-test after your checks', 'إعادة الاختبار بعد فحوصاتك'),
    },
  }[sk];
  const out = {
    ...O,
    rows: after,
    showCase,
    caseLabel: X('Support case ', 'بلاغ دعم ') + 'NL‑48213',
    caseText:
      sk === 'network'
        ? X(
            'Line fault at cabinet 14B. Remote fix expected by 18:00 today — we’ll text you when it’s done.',
            'عطل في الخط عند الكابينة 14B. الإصلاح عن بُعد متوقع بحلول 18:00 اليوم — سنرسل لك رسالة عند الانتهاء.',
          )
        : X(
            'An agent has your full diagnostic report and will call you within 2 hours. You won’t need to repeat any checks.',
            'لدى أحد الموظفين تقرير التشخيص الكامل وسيتصل بك خلال ساعتين. لن تحتاج لتكرار أي فحص.',
          ),
    primaryLabel: X('View treatment report', 'عرض تقرير المعالجة'),
    primary: nav.report,
    secondaryLabel: showCase
      ? X('Talk to an agent now', 'تحدّث مع موظف الآن')
      : X('Still having problems? Contact support', 'ما زالت المشكلة قائمة؟ تواصل مع الدعم'),
    secondary: () => app.setState({ escalated: true }),
  };
  if (st.escalated && sk !== 'network') {
    out.icon = '!';
    out.iconBg = BP;
    out.title = X('Support case opened with your results.', 'تم فتح بلاغ دعم مرفق بنتائجك.');
  }
  // report
  const avg = (k: 'cur' | 'rec') => Math.round(samples.reduce((a, s) => a + mbps(s[k], S.wired), 0) / samples.length);
  const LAT = X('Latency', 'زمن الاستجابة'),
    PL2 = X('Packet loss', 'فقد الحزم'),
    WRS = X('Weakest room signal', 'إشارة أضعف غرفة');
  const RP = (<Record<ScenarioKey, ReportDef>>{
    wifi: {
      title: X('Wi‑Fi now reaches every room.', 'أصبح Wi‑Fi يصل إلى كل الغرف.'),
      rows: [
        [WRS, worst.cur, rs.rec, ' dBm', 'db'],
        [X('Strong coverage', 'التغطية القوية'), parseInt(stats('current').s), parseInt(stats('recommended').s), '%', 'up'],
        [X('Avg speed across rooms', 'متوسط السرعة في الغرف'), avg('cur'), avg('rec'), ' Mbps', 'up'],
        [X('Speed in ' + low(worst.name), 'السرعة في ' + worst.name), mbps(worst.cur, S.wired), mbps(rs.rec, S.wired), ' Mbps', 'up'],
        [X('Wi‑Fi latency', 'زمن استجابة Wi‑Fi'), 38, 12, ' ms', 'down'],
      ],
      key: 2,
      issues: [
        X('Router in a corner TV cabinet, beside a mirror', 'الراوتر في خزانة تلفاز بالزاوية بجوار مرآة'),
        X('Weak signal in ' + low(worst.name) + ' and kitchen', 'إشارة ضعيفة في ' + worst.name + ' والمطبخ'),
      ],
      actions: [
        X('Scanned 4 rooms with the camera', 'مسح 4 غرف بالكاميرا'),
        X('Moved router to the hallway shelf', 'نقل الراوتر إلى رف الممر'),
        X('Re-tested in every room', 'إعادة الاختبار في كل غرفة'),
      ],
      est: false,
    },
    device: {
      title: X('Your laptop is up to full speed.', 'الحاسوب يعمل الآن بالسرعة الكاملة.'),
      rows: [
        [X('Laptop Wi‑Fi link', 'اتصال Wi‑Fi للحاسوب'), 54, 866, ' Mbps', 'up'],
        [X('Laptop speed test', 'اختبار سرعة الحاسوب'), 41, 402, ' Mbps', 'up'],
        [X('Laptop latency', 'زمن استجابة الحاسوب'), 31, 12, ' ms', 'down'],
        [X('Signal in that room', 'الإشارة في تلك الغرفة'), samples[0].cur, samples[0].cur, ' dBm', 'db'],
      ],
      key: 1,
      issues: [
        X('Laptop joined the slow 2.4 GHz band', 'الحاسوب اتصل بنطاق 2.4 GHz البطيء'),
        X('Older Wi‑Fi 4 adapter', 'محوّل Wi‑Fi 4 قديم'),
      ],
      actions: [
        X('Checked connected devices through the router', 'فحص الأجهزة المتصلة عبر الراوتر'),
        X('Laptop rejoined HubPro‑5G', 'إعادة اتصال الحاسوب بـ HubPro‑5G'),
        X('Re-tested on the laptop', 'إعادة الاختبار على الحاسوب'),
      ],
      est: false,
    },
    router: {
      title: X('Router stable and back to full speed.', 'الراوتر مستقر وعاد للسرعة الكاملة.'),
      rows: [
        [SR, 62, 471, ' Mbps', 'up'],
        [LAT, 48, 13, ' ms', 'down'],
        [PL2, 2.1, 0, '%', 'down'],
        [X('Restarts per day', 'إعادات التشغيل يوميًا'), 9, 0, '', 'down'],
        [WRS, worst.cur, worst.cur, ' dBm', 'db'],
      ],
      key: 0,
      issues: [X('Router restarting 9 times a day', 'الراوتر يعيد التشغيل 9 مرات يوميًا'), X('Loose WAN cable', 'كابل WAN غير مثبت')],
      actions: [
        X('Camera-guided cable check', 'فحص الكابل بإرشاد الكاميرا'),
        X('WAN cable reseated', 'إعادة تثبيت كابل WAN'),
        X('Router restarted and re-tested', 'إعادة تشغيل الراوتر وإعادة الاختبار'),
      ],
      est: false,
    },
    network: {
      title: X('Expected recovery once the street fault is fixed.', 'التحسن المتوقع بعد إصلاح عطل الشارع.'),
      rows: [
        [SR, 38, 487, ' Mbps', 'up'],
        [LAT, 96, 14, ' ms', 'down'],
        [PL2, 6.4, 0, '%', 'down'],
        [WRS, worst.cur, worst.cur, ' dBm', 'db'],
      ],
      key: 0,
      issues: [
        X('Line card fault at street cabinet 14B', 'عطل في بطاقة الخط بكابينة الشارع 14B'),
        X('Weak Wi‑Fi in 2 rooms (separate, minor)', 'Wi‑Fi ضعيف في غرفتين (مشكلة بسيطة منفصلة)'),
      ],
      actions: [
        X('Router check ruled out your equipment', 'فحص الراوتر استبعد أجهزتك'),
        X('Case NL‑48213 raised to Network Operations', 'تصعيد البلاغ NL‑48213 إلى عمليات الشبكة'),
        X('Remote line card reset scheduled', 'جدولة إعادة ضبط بطاقة الخط عن بُعد'),
      ],
      est: true,
    },
  })[sk];
  const fmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString('en-GB') : String(n));
  const rows = RP.rows.map(([metric, b, a, u, dir]) => {
    let change: string, better: boolean;
    if (dir === 'db') {
      const d = a - b;
      change = (d > 0 ? '+' : '') + d + ' dB';
      better = d > 0;
    } else if (dir === 'up') {
      const p = b ? Math.round(((a - b) / b) * 100) : 0;
      change = (p > 0 ? '+' : '') + fmt(p) + '%';
      better = p > 0;
    } else {
      const p = b ? Math.round(((b - a) / b) * 100) : 0;
      change = (p > 0 ? '−' : '') + p + '%';
      better = p > 0;
    }
    if (change === '0 dB' || change === '0%' || change === '+0%') change = '—';
    const norm = (v: number) => (dir === 'db' ? Math.max(4, v + 100) : v);
    const mx = Math.max(norm(b), norm(a)) || 1;
    const k: TagKind = RP.est && dir !== 'db' ? 'E' : 'M';
    return {
      metric,
      before: fmt(b) + u,
      after: fmt(a) + u,
      change,
      changeColor: change === '—' ? '#6B7280' : better ? G : Rd,
      bw: Math.round((norm(b) / mx) * 100) + '%',
      aw: Math.round((norm(a) / mx) * 100) + '%',
      barColor: better ? '#3FBE7A' : '#B6BFCC',
      ...TAG(k),
    };
  });
  const kr = RP.rows[RP.key];
  const ov = Math.round(((kr[2] - kr[1]) / kr[1]) * 100);
  const report = {
    chartTitle: X('Before vs after', 'قبل وبعد'),
    title: RP.title,
    rows: rows.map(r => ({ ...r, tagBg: r.bg, tagFg: r.fg })),
    issues: RP.issues,
    actions: RP.actions,
    overall: '+' + fmt(ov) + '%',
    overallNote: kr[0] + ': ' + fmt(kr[1]) + kr[3] + ' ' + ARW + ' ' + fmt(kr[2]) + kr[3],
    overallTag: RP.est ? X('ESTIMATED · AFTER FIX', 'تقديري · بعد الإصلاح') : TAGT[lang].M,
    overallTagBg: RP.est ? '#FFF1D6' : '#E3ECFD',
    overallTagFg: RP.est ? '#8A5A00' : '#1D4FBF',
    footnote: RP.est
      ? X(
          '“After” values are estimates until the street fault is repaired. We’ll re-measure automatically and update this report.',
          'قيم «بعد» تقديرية حتى إصلاح عطل الشارع. سنعيد القياس تلقائيًا ونحدّث هذا التقرير.',
        )
      : X(
          'Before = measured at the start of this check. After = measured after the fix. We’ll re-check automatically in 7 days.',
          'قبل = مُقاس في بداية هذا الفحص. بعد = مُقاس بعد الإصلاح. سنعيد الفحص تلقائيًا خلال 7 أيام.',
        ),
    toast: st.toast,
    share: async () => {
      const txt =
        RP.title +
        ' ' +
        X('Overall improvement', 'التحسن الإجمالي') +
        ' +' +
        ov +
        '%. ' +
        rows.map(r => r.metric + ': ' + r.before + ' ' + ARW + ' ' + r.after).join('; ');
      try {
        if (navigator.share) {
          await navigator.share({ title: X('Broadband treatment report', 'تقرير معالجة النطاق العريض'), text: txt });
          return;
        }
        await navigator.clipboard.writeText(txt);
        app.setState({ toast: X('Report summary copied', 'تم نسخ ملخص التقرير') });
      } catch (e) {
        app.setState({ toast: X('Report saved to your account', 'تم حفظ التقرير في حسابك') });
      }
    },
  };
  // identify
  const digits = st.phone.replace(/[^0-9]/g, '');
  const found = st.lookup === 'found';
  const ident = {
    border: st.phoneErr ? '#D93B42' : found ? G : '#C9D3E3',
    err: st.phoneErr
      ? X('Enter the 11-digit mobile number on your broadband account.', 'أدخل رقم الجوال المسجّل في حسابك (11 رقمًا).')
      : '',
    showDemo: !found && !st.phone,
    loading: st.lookup === 'loading',
    found,
    useDemo: () => app.setState({ phone: '9333 3360', phoneErr: false }),
    rows: [
      [X('Account holder', 'صاحب الحساب'), 'Rashid'],
      [X('Service address', 'عنوان الخدمة'), '14 Elm Road, •• 4AB'],
      [X('Plan', 'الباقة'), X('Fibre ', 'ألياف ') + S.plan + ' · FTTP'],
      [X('Router', 'الراوتر'), 'Hub Pro 6 · ' + (sk === 'router' ? X('unstable', 'غير مستقر') : X('online', 'متصل')), sk === 'router'],
      [X('Street cabinet', 'كابينة الشارع'), '14B'],
      [
        X('Faults in your area', 'أعطال في منطقتك'),
        sk === 'network' ? X('1 open fault', 'عطل واحد مفتوح') : X('None', 'لا يوجد'),
        sk === 'network',
      ],
    ].map(r => ({ label: r[0], value: r[1], color: r[2] ? Rd : '#1F2937' })),
    primaryLabel: found
      ? X('Continue', 'متابعة')
      : st.lookup === 'loading'
        ? X('Searching…', 'جارٍ البحث…')
        : X('Find my service', 'ابحث عن خدمتي'),
    primaryBg: found || digits.length >= 8 ? BP : '#9AA4B5',
    primary: () => {
      if (found) {
        app.setState({ account: true });
        app.go(app.state.cam === 'none' ? 'permission' : app.scanTarget());
        return;
      }
      if (app.state.lookup === 'loading') return;
      const d = app.state.phone.replace(/[^0-9]/g, '');
      if (d.length < 8 || d.length > 12) {
        app.setState({ phoneErr: true });
        return;
      }
      app.setState({ lookup: 'loading' });
      app.later('lookup', () => app.setState({ lookup: 'found' }), 900);
    },
    reset: () => app.setState({ phone: '', lookup: 'idle', account: false }),
  };
  // assistant
  app.ctx = {
    screen: scr,
    samples,
    guideTitle: gTitle,
    guideBody: gBody,
    summary:
      'Scenario: ' +
      S.label +
      '. Wired speed at router ' +
      S.wired +
      '/' +
      S.plan +
      ' Mbps, latency ' +
      S.lat +
      ' ms, loss ' +
      S.loss +
      '%. Room signal (measured): ' +
      samples.map(s => s.id + ' ' + s.cur + ' dBm').join(', ') +
      '. ' +
      S.area.en +
      '.',
  };
  const chat = {
    x: st.avaPos.x + 'px',
    y: st.avaPos.y + 'px',
    down: app.avaDown,
    move: app.avaMove,
    up: app.avaUp,
    fab: !st.chatOpen && !st.look && scr !== 'lang' && scr !== 'host',
    isOpen: st.chatOpen,
    typing: st.typing,
    input: st.chatInput,
    placeholder: st.listening ? X('Listening…', 'أستمع…') : X('Describe the problem…', 'صف المشكلة…'),
    micBg: st.listening ? '#D93B42' : '#0B2545',
    voiceLabel: st.voice ? X('Voice replies on', 'الرد الصوتي مفعّل') : X('Voice replies off', 'الرد الصوتي متوقف'),
    voiceBg: st.voice ? '#E3F6F4' : 'transparent',
    voiceBorder: st.voice ? BP : '#C9D3E3',
    open: () => app.openChat(),
    close: () => {
      app.setState({ chatOpen: false });
      try {
        window.speechSynthesis && speechSynthesis.cancel();
      } catch (e) {}
    },
    toggleVoice: () => app.setState(s => ({ voice: !s.voice })),
    mic: () => app.toggleMic(),
    onInput: (e: React.ChangeEvent<HTMLInputElement>) => app.setState({ chatInput: e.target.value }),
    onKey: (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') app.sendMsg(app.state.chatInput);
    },
    send: () => app.sendMsg(app.state.chatInput),
    msgs: st.msgs.map(m => ({
      text: m.text,
      align: m.from === 'me' ? 'flex-end' : 'flex-start',
      bg: m.from === 'me' ? '#0B2545' : '#EEF2F8',
      fg: m.from === 'me' ? '#FFFFFF' : '#1F2937',
      chips: (m.chips || []).map(c => ({
        label: c.label || c.say,
        onClick: () => app.chipAct(c),
        bg: c.go ? BP : '#E3F6F4',
        fg: c.go ? '#FFFFFF' : '#006670',
        border: c.go ? BP : '#A8E2DC',
      })),
    })),
  };
  const camErr = st.camErr
    ? X(
        'Camera unavailable (' + st.camErr + ') — continuing with the demo room.',
        'الكاميرا غير متاحة (' + st.camErr + ') — نتابع بالغرفة التجريبية.',
      )
    : '';
  if (isAr) {
    diag.evidence = diag.evidence.map(e => ({ ...e, text: iso(e.text) }));
    diag.recs = diag.recs.map(r => ({ ...r, body: iso(r.body) }));
    impact.rows = impact.rows.map(r => ({ ...r, text: iso(r.text) }));
    impact.split = impact.split.map(s => ({ ...s, note: iso(s.note) }));
    impact.etaNote = iso(impact.etaNote);
    arV.sub = iso(arV.sub);
    out.body = iso(out.body);
    out.caseText = iso(out.caseText);
    report.overallNote = iso(report.overallNote);
    chat.msgs = chat.msgs.map(m => ({ ...m, text: iso(m.text) }));
    guide.body = iso(guide.body);
  }
  return {
    fit: {
      aside: st.narrow ? 'none' : 'flex',
      s: st.fitS || 1,
      mb: -866 * (1 - (st.fitS || 1)) + 'px',
      mx: -206 * (1 - (st.fitS || 1)) + 'px',
    },
    openApp: () => app.go('lang'),
    brand,
    t,
    dir: isAr ? 'rtl' : 'ltr',
    lang,
    is,
    nav,
    flow,
    scenarioLabel: S.label,
    scenario: sk,
    setScenario: (k: ScenarioKey) => app.setScenario(k),
    pickEn: () => app.setLang('en'),
    pickAr: () => app.setLang('ar'),
    switchLang: () => app.setLang(isAr ? 'en' : 'ar'),
    statusColor: scr === 'host' ? '#1A1A1A' : '#FFFFFF',
    homeBar: '#0B2545',
    headerBg: scr === 'host' ? '#FFFFFF' : BP,
    headerLine: scr === 'host' ? 'transparent' : ACC,
    camDisplay: camScreen && st.cam === 'live' ? 'block' : 'none',
    demoDisplay: camScreen && st.cam !== 'live' ? 'block' : 'none',

    mapCurrentBg: url('current') ? 'url(' + url('current') + ')' : 'none',
    routerLine: st.account ? X('HUB PRO 6 · ' + S.plan + ' MBPS PLAN', 'HUB PRO 6 · باقة ' + S.plan + ' ميغابت') : '',
    requestCam: () => app.requestCam(),
    useDemo: () => {
      app.setState({ cam: 'demo' });
      app.go(app.scanTarget());
    },
    camErr,
    scanDone: done,
    scan,
    measureRows,
    browserNet,
    measureTitle: mDone ? X('Connection measured', 'تم قياس الاتصال') : X('Measuring your connection…', 'جارٍ قياس اتصالك…'),
    measureBtnBg: mDone ? BP : '#9AA4B5',
    measureNext: () => {
      if (app.state.mStep >= 8) app.go('ar');
    },
    ar: arV,
    xrArText,
    arMotion,
    look: lookV,
    places,
    modelStats,
    modelRings,
    mdash,
    tabs,
    modelNote,
    modelWeakColor,
    threeMsg: st.threeMsg ? TM[st.threeMsg] : '',
    enterVR: () => app.enterVR(),
    diag,
    impact,
    guide,
    out,
    chat,
    report,
    ident,
    phone: st.phone,
    onPhone: (e: React.ChangeEvent<HTMLInputElement>) =>
      app.setState({ phone: e.target.value.replace(/[^0-9 +]/g, '').slice(0, 16), phoneErr: false, lookup: 'idle' }),
    startRoom: () => {
      app.setState({ mode: 'room' });
      app.go(!app.state.account ? 'identify' : app.state.cam === 'none' ? 'permission' : 'scan');
    },
    startDevice: () => {
      app.setState({ mode: 'device' });
      app.go(!app.state.account ? 'identify' : app.state.cam === 'none' ? 'permission' : 'guide');
    },
    startRoomCam: () => {
      app.setState({ mode: 'room' });
      app.go('scan');
    },
    startDeviceCam: () => {
      app.setState({ mode: 'device' });
      app.go('guide');
    },
    modeRoomBg: scr === 'scan' ? BP : 'transparent',
    modeDeviceBg: scr === 'guide' ? BP : 'transparent',
    modeRoomFg: scr === 'scan' ? '#FFFFFF' : '#0B2545',
    modeDeviceFg: scr === 'guide' ? '#FFFFFF' : '#0B2545',
    isArLogo: isAr,
    isEnLogo: !isAr,
  };
}

export type VM = ReturnType<typeof buildViewModel>;
