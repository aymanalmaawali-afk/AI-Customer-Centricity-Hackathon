// The prototype stage: step navigator on the left and the 390 × 844 phone, scaled to fit the window.
import type { Ref } from 'react';
import { SCEN, type ScenarioKey } from './data';
import { SCENARIO_KEYS } from './config';
import { Icon, mono, MUTED, NAVY } from './ui';
import type { VM } from './viewModel';
import { Host, Identify, Language, Permission, Welcome } from './screens/Entry';
import { AR, Guide, Scan } from './screens/Camera';
import { Diagnosis, Impact, Measure, Model } from './screens/Analysis';
import { Outcome, Report } from './screens/Results';
import { LookAround } from './screens/LookAround';

export interface ShellRefs {
  video: Ref<HTMLVideoElement>;
  three: Ref<HTMLDivElement>;
  chat: Ref<HTMLDivElement>;
  ar: Ref<HTMLDivElement>;
  look: Ref<HTMLDivElement>;
}

const legendTag = (bg: string, fg: string, label: string, text: string) => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#374151' }}>
    <span style={{ font: mono(700, 11), padding: '3px 7px', borderRadius: 999, background: bg, color: fg }}>{label}</span>
    {text}
  </div>
);

function Aside({ vm }: { vm: VM }) {
  return (
    <aside style={{ display: vm.fit.aside, maxWidth: 340, flex: '1 1 280px', minWidth: 0, maxHeight: '100%', overflowY: 'auto', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ font: mono(700, 12), letterSpacing: '.08em', color: vm.brand.primary, textTransform: 'uppercase' }}>Prototype · Mobile web · WebXR</div>
        <h1 style={{ margin: 0, fontSize: 34, lineHeight: 1.05, fontWeight: 800, letterSpacing: '-.02em', color: NAVY }}>Home Wi‑Fi Check</h1>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: '#374151', textWrap: 'pretty' } as React.CSSProperties}>
          Scan rooms with the phone camera, see coverage in AR and 3D, get an AI diagnosis and a guided fix — in the browser, no app.
        </p>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {vm.flow.map(f => (
          <button key={f.n} onClick={f.onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', height: 34, padding: '0 14px', border: 'none', borderRadius: 10, whiteSpace: 'nowrap', background: f.bg, color: f.fg, fontSize: 14, fontWeight: 600, textAlign: 'left', cursor: 'pointer' }}>
            <span style={{ font: mono(700, 12), color: f.numFg }}>{f.n}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: '1px solid #D3DAE3' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Every number is labelled</div>
        {legendTag('#E3ECFD', '#1D4FBF', 'MEASURED', 'router, line test, this phone')}
        {legendTag('#FFF1D6', '#8A5A00', 'ESTIMATED', 'heatmaps, before/after')}
        {legendTag('#E6E9F0', NAVY, 'AI', 'detections & inferences')}
      </div>
      {/* Replaces the design tool's Tweaks panel; also settable with ?scenario= in the link. */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
        Scenario:
        <select
          value={vm.scenario}
          onChange={e => vm.setScenario(e.target.value as ScenarioKey)}
          style={{ flex: 1, minWidth: 0, height: 32, padding: '0 8px', borderRadius: 8, border: '1.5px solid #C9D3E3', background: '#fff', color: NAVY, font: 'inherit', fontWeight: 700 }}
        >
          {SCENARIO_KEYS.map(k => <option key={k} value={k}>{SCEN[k].label}</option>)}
        </select>
      </label>
    </aside>
  );
}

function TabBar({ vm }: { vm: VM }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 78, zIndex: 58, display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', padding: '8px 10px 20px', boxSizing: 'border-box', background: '#FFFFFF', borderRadius: '22px 22px 0 0', boxShadow: '0 -6px 24px rgba(16,42,84,.08)' }}>
      {vm.tabs.items.map((tb, i) => (
        <button key={i} onClick={tb.onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, border: 'none', background: 'transparent', color: tb.fg, fontSize: 11, fontWeight: 700, cursor: 'pointer', minHeight: 44 }}>
          <span style={{ width: 40, height: 28, borderRadius: 999, background: tb.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon d={tb.icon} /></span>
          <span style={{ whiteSpace: 'nowrap' }}>{tb.label}</span>
        </button>
      ))}
    </div>
  );
}

function AvaFab({ vm }: { vm: VM }) {
  const c = vm.chat;
  return (
    <button
      className="ava-fab"
      title="Ask Ava"
      aria-label="Ask Ava"
      onPointerDown={c.down}
      onPointerMove={c.move}
      onPointerUp={c.up}
      onPointerCancel={c.up}
      style={{ position: 'absolute', left: c.x, top: c.y, touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none', zIndex: 65, width: 44, height: 44, padding: 0, border: '2px solid #FFFFFF', borderRadius: 20, background: vm.brand.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: mono(700, 12), boxShadow: '0 6px 16px rgba(11,37,69,.3)', cursor: 'pointer', transition: 'left .2s ease' }}
    >
      {vm.t.ai}
    </button>
  );
}

function Chat({ vm, chatRef }: { vm: VM; chatRef: Ref<HTMLDivElement> }) {
  const t = vm.t, c = vm.chat;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(11,37,69,.45)' }}>
      <div style={{ height: '80%', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '24px 24px 0 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 12px 14px 18px', borderBottom: '1px solid #EEF2F8' }}>
          <span style={{ flex: 'none', width: 40, height: 40, borderRadius: 20, background: vm.brand.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: mono(700, 12) }}>{t.ai}</span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>{t.ava}</span>
            <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.avaSub}</span>
          </div>
          <button onClick={c.toggleVoice} style={{ flex: 'none', height: 36, padding: '0 10px', borderRadius: 10, border: `1.5px solid ${c.voiceBorder}`, background: c.voiceBg, color: NAVY, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>{c.voiceLabel}</button>
          <button onClick={c.close} aria-label="Close" style={{ flex: 'none', width: 44, height: 44, border: 'none', background: 'none', fontSize: 24, color: NAVY, cursor: 'pointer' }}>×</button>
        </div>
        <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12, WebkitOverflowScrolling: 'touch' }}>
          {c.msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: m.align }}>
              <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: 16, background: m.bg, color: m.fg, fontSize: 14, lineHeight: 1.5, textWrap: 'pretty' } as React.CSSProperties}>{m.text}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: '92%' }}>
                {m.chips.map((ch, j) => (
                  <button key={j} onClick={ch.onClick} style={{ height: 44, padding: '0 14px', borderRadius: 20, border: `1.5px solid ${ch.border}`, background: ch.bg, color: ch.fg, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>{ch.label}</button>
                ))}
              </div>
            </div>
          ))}
          {c.typing && <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 16, background: '#EEF2F8', color: MUTED, fontSize: 14 }}>{t.thinking}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 12px 30px', borderTop: '1px solid #EEF2F8' }}>
          <button onClick={c.mic} aria-label="Voice input" style={{ flex: 'none', width: 44, height: 44, borderRadius: 20, border: 'none', background: c.micBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <span style={{ width: 10, height: 15, borderRadius: 5, border: '2px solid #fff', boxSizing: 'border-box' }} />
              <span style={{ width: 2, height: 4, background: '#fff' }} />
            </span>
          </button>
          <input
            type="text" placeholder={c.placeholder} value={c.input} onChange={c.onInput} onKeyDown={c.onKey}
            style={{ flex: 1, minWidth: 0, height: 44, padding: '0 16px', borderRadius: 20, border: '1.5px solid #E3EAF4', background: '#F4F7FB', fontFamily: 'inherit', fontSize: 14, color: NAVY, outline: 'none' }}
          />
          <button onClick={c.send} aria-label="Send" style={{ flex: 'none', width: 44, height: 44, borderRadius: 20, border: 'none', background: vm.brand.primary, color: '#fff', fontSize: 20, fontWeight: 800, cursor: 'pointer' }}>↑</button>
        </div>
      </div>
    </div>
  );
}

export function Prototype({ vm, refs }: { vm: VM; refs: ShellRefs }) {
  const is = vm.is;
  return (
    <div className="stage">
      <Aside vm={vm} />
      <div
        style={{
          transform: `scale(${vm.fit.s})`, transformOrigin: '50% 0', marginBottom: vm.fit.mb, marginRight: vm.fit.mx, marginLeft: vm.fit.mx,
          width: 390, height: 844, flex: 'none', borderRadius: 58, background: '#0A0F18', padding: 11, boxSizing: 'content-box', boxShadow: '0 30px 80px rgba(11,37,69,.28)',
        }}
      >
        <div dir={vm.dir} lang={vm.lang} style={{ position: 'relative', width: 390, height: 844, borderRadius: 47, overflow: 'hidden', background: '#F4F7FB', isolation: 'isolate' }}>
          <video ref={refs.video} autoPlay muted playsInline style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: vm.camDisplay, background: '#000' }} />
          <div style={{ position: 'absolute', inset: 0, display: vm.demoDisplay, background: 'radial-gradient(120% 80% at 40% 30%,#F3EFE8 0%,#E2DBD0 55%,#CFC6B8 100%)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: '-40%', right: '-40%', bottom: '-10%', height: '60%', transform: 'perspective(500px) rotateX(62deg)', backgroundImage: 'repeating-linear-gradient(90deg,rgba(60,50,40,.10) 0 1px,transparent 1px 48px),repeating-linear-gradient(0deg,rgba(60,50,40,.10) 0 1px,transparent 1px 48px)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '42%', background: 'linear-gradient(180deg,#FAF8F4,#ECE7DF)' }} />
            <div style={{ position: 'absolute', left: 16, bottom: 236, font: mono(700, 11), color: 'rgba(40,30,20,.5)', letterSpacing: '.06em' }}>{vm.t.demoFeed}</div>
          </div>

          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 47, zIndex: 59, background: vm.headerBg, borderBottom: `3px solid ${vm.headerLine}`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 47, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', fontSize: 16, fontWeight: 700, color: vm.statusColor, pointerEvents: 'none' }}>
            <span>9:41</span>
            <span style={{ fontSize: 13, letterSpacing: '.04em', whiteSpace: 'nowrap' }}>5G ▮▮▮</span>
          </div>

          {is.host && <Host vm={vm} />}
          {is.lang && <Language vm={vm} />}
          {is.welcome && <Welcome vm={vm} />}
          {is.identify && <Identify vm={vm} />}
          {is.permission && <Permission vm={vm} />}
          {is.scan && <Scan vm={vm} />}
          {is.measure && <Measure vm={vm} />}
          {is.ar && <AR vm={vm} arRef={refs.ar} />}
          {is.model && <Model vm={vm} threeRef={refs.three} />}
          {is.model && vm.look.on && <LookAround vm={vm} hostRef={refs.look} />}
          {is.diagnosis && <Diagnosis vm={vm} />}
          {is.impact && <Impact vm={vm} />}
          {is.guide && <Guide vm={vm} />}
          {is.outcome && <Outcome vm={vm} />}
          {is.report && <Report vm={vm} />}

          {vm.tabs.show && <TabBar vm={vm} />}
          {vm.chat.fab && <AvaFab vm={vm} />}
          {vm.chat.isOpen && <Chat vm={vm} chatRef={refs.chat} />}

          <div style={{ position: 'absolute', left: '50%', bottom: 8, width: 134, height: 5, marginLeft: -67, borderRadius: 3, background: vm.homeBar, opacity: 0.85, zIndex: 60, pointerEvents: 'none' }} />
        </div>
      </div>
    </div>
  );
}
