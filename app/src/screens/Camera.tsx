// Camera screens. They render transparently over the live camera <video> (or the demo room)
// that the phone shell draws underneath.
import type { CSSProperties, Ref } from 'react';
import type { VM } from '../viewModel';
import { FloatButton, glass, ltr, ModeSwitch, mono, MUTED, NAVY, OUTLINE, PrimaryButton, Sheet, shadowFor, Tag } from '../ui';

export function Scan({ vm }: { vm: VM }) {
  const t = vm.t, s = vm.scan;
  return (
    <div style={{ position: 'absolute', inset: 0, color: NAVY }}>
      <div
        style={{
          position: 'absolute', left: 0, right: 0, height: 3, background: `linear-gradient(90deg,transparent,${vm.brand.accent},transparent)`,
          boxShadow: `0 0 18px ${vm.brand.accent}`, animation: 'sweep 2.2s ease-in-out infinite alternate', opacity: vm.scanDone ? 0 : 0.9,
        }}
      />
      <ModeSwitch vm={vm} top={118} />
      <div style={{ position: 'absolute', left: '50%', top: '40%', width: 56, height: 56, margin: '-28px 0 0 -28px', border: '2px solid rgba(11,37,69,.45)', borderRadius: '50%' }} />
      {s.objects.map((o, i) => (
        <div key={i} style={{ position: 'absolute', left: o.left, top: o.top, width: o.width, height: o.height, border: `2px solid ${o.color}`, borderRadius: 10, boxShadow: '0 0 0 1px rgba(0,0,0,.25)' }}>
          <div style={{ position: 'absolute', left: -2, bottom: '100%', marginBottom: 4, whiteSpace: 'nowrap', display: 'flex', gap: 8, alignItems: 'center', padding: '4px 8px', borderRadius: 7, ...glass, fontSize: 12, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: o.color }} />
            {o.label}
            <span style={{ font: mono(700, 11), color: MUTED }}>{t.ai}</span>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', top: 52, left: 16, right: 16, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <FloatButton onClick={vm.nav.permission}>×</FloatButton>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 14px', borderRadius: 12, ...glass }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
            <span>{s.room}</span>
            <span style={{ font: mono(700, 12), color: MUTED }}>{s.roomNum}/4</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: '#E3EAF4' }}>
            <div style={{ height: 4, borderRadius: 2, background: vm.brand.accent, width: s.pct }} />
          </div>
        </div>
        <div style={{ flex: 'none', position: 'relative', width: 80, height: 64, borderRadius: 10, ...glass, padding: 6, boxSizing: 'border-box' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {s.mini.map((r, i) => (
              <div key={i} style={{ position: 'absolute', left: r.left, top: r.top, width: r.w, height: r.h, boxSizing: 'border-box', border: `1.5px solid ${r.border}`, background: r.bg }} />
            ))}
          </div>
        </div>
      </div>
      <Sheet>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: '#374151' }}>{s.hint}</span>
          {s.showSample && (
            <span style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={{ font: mono(700, 14), color: s.sampleColor, ...ltr }}>{s.sample}</span>
              <Tag bg="#E3ECFD" fg="#1D4FBF" pad="2px 6px">{t.measPhone}</Tag>
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 30 }}>
          {s.objects.map((o, i) => (
            <span key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px', borderRadius: 8, background: '#EEF2F8', fontSize: 13 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: o.color }} />
              <span>{o.label}</span> · <span>{o.impact}</span>
            </span>
          ))}
        </div>
        <PrimaryButton vm={vm} onClick={s.onNext} bg={s.nextBg}>{s.nextLabel}</PrimaryButton>
      </Sheet>
    </div>
  );
}

const pillToggle = { flex: 1, height: 40, border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 700, cursor: 'pointer' } as const;

// Floor pose. Defaults reproduce the design's fixed 50° tilt; App.startArLoop() overwrites the
// variables from the gyroscope when motion tracking is live (WebXR fallback for iPhone).
const arPose = { '--ar-tilt': '50deg', '--ar-yaw': '0deg', '--ar-roll': '0deg' } as CSSProperties;

export function AR({ vm, arRef }: { vm: VM; arRef: Ref<HTMLDivElement> }) {
  const t = vm.t, a = vm.ar, mo = vm.arMotion;
  return (
    <div style={{ position: 'absolute', inset: 0, color: NAVY }}>
      <div ref={arRef} style={{ position: 'absolute', left: 0, right: 0, top: 130, height: 300, perspective: 620, ...arPose }}>
        <div
          style={{
            position: 'absolute', left: '50%', bottom: 0, width: 320, height: 256, marginLeft: -160, borderRadius: 12, overflow: 'visible', transformOrigin: '50% 100%',
            transform: 'rotateZ(var(--ar-roll)) rotateX(var(--ar-tilt)) translateY(-128px) rotateZ(var(--ar-yaw)) translateY(128px)',
          }}
        >
          <div style={{ position: 'absolute', inset: 0, borderRadius: 12, opacity: 0.78, backgroundSize: '100% 100%', backgroundImage: a.mapBg }} />
          {a.pins.map((p, i) => (
            <div key={i} style={{ position: 'absolute', left: p.left, top: p.top, width: 0, height: 0 }}>
              <div style={{ position: 'absolute', left: -40, bottom: 0, width: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'rotateZ(calc(-1 * var(--ar-yaw))) rotateX(calc(-1 * var(--ar-tilt)))', transformOrigin: '50% 100%' }}>
                <span style={{ font: mono(700, 13), padding: '4px 7px', borderRadius: 7, ...glass, border: `1.5px ${p.borderStyle} ${p.color}`, color: NAVY, whiteSpace: 'nowrap', ...ltr }}>{p.value}</span>
                <span style={{ width: 2, height: 22, background: p.color }} />
              </div>
            </div>
          ))}
          <div style={{ position: 'absolute', left: a.routerLeft, top: a.routerTop, width: 0, height: 0 }}>
            <div style={{ position: 'absolute', left: -14, top: -14, width: 28, height: 28, borderRadius: '50%', background: '#00B3A6', border: '3px solid #fff', boxSizing: 'border-box' }} />
          </div>
          {a.showTarget && (
            <div style={{ position: 'absolute', left: '55%', top: '45%', width: 0, height: 0 }}>
              <div style={{ position: 'absolute', left: -26, top: -26, width: 52, height: 52, borderRadius: '50%', border: '4px dashed #6FA0FF', boxSizing: 'border-box' }} />
            </div>
          )}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 52, left: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <FloatButton onClick={vm.nav.measure}>{t.arrow}</FloatButton>
          <div style={{ flex: 1, display: 'flex', padding: 4, borderRadius: 12, ...glass }}>
            <button onClick={a.setCurrent} style={{ ...pillToggle, background: a.curBg, color: a.curFg }}>{t.current}</button>
            <button onClick={a.setRec} style={{ ...pillToggle, background: a.recBg, color: a.recFg }}>{t.recommended}</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Tag bg="#FFF1D6" fg="#8A5A00" pad="5px 8px" style={{ whiteSpace: 'nowrap' }}>{t.estFrom4}</Tag>
          {mo.mode === 'off' ? (
            <span style={{ font: mono(700, 11), whiteSpace: 'nowrap', padding: '5px 8px', borderRadius: 6, ...glass, color: '#374151' }}>{vm.xrArText}</span>
          ) : (
            // Gyroscope fallback for browsers without WebXR AR. The tap is also the gesture iOS needs for the permission prompt.
            <button
              onClick={mo.mode === 'live' ? mo.recentre : mo.enable}
              style={{ font: mono(700, 11), whiteSpace: 'nowrap', padding: '5px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', ...glass, color: mo.mode === 'live' ? '#1D4FBF' : vm.brand.primary }}
            >
              {mo.mode === 'live' ? mo.liveLabel : mo.promptLabel}
            </button>
          )}
        </div>
      </div>
      <Sheet>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>{a.headline}</span>
          <span style={{ fontSize: 14, lineHeight: 1.5, color: '#374151', textWrap: 'pretty' } as React.CSSProperties}>{a.sub}</span>
        </div>
        <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: a.stats.s, background: '#3FBE7A' }} />
          <div style={{ width: a.stats.m, background: '#F0C448' }} />
          <div style={{ width: a.stats.w, background: '#E25054' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151' }}>
          <span>{t.strong} <bdi>{a.stats.s}</bdi></span>
          <span>{t.moderate} <bdi>{a.stats.m}</bdi></span>
          <span>{t.weak} <bdi>{a.stats.w}</bdi></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={vm.nav.model} style={{ flex: 1, height: 52, border: OUTLINE, borderRadius: 12, background: 'transparent', color: NAVY, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t.model3d}</button>
          <button onClick={a.primary} style={{ flex: 1.4, height: 52, border: 'none', borderRadius: 999, background: vm.brand.primary, boxShadow: shadowFor(vm.brand.primary), color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{a.primaryLabel}</button>
        </div>
      </Sheet>
    </div>
  );
}

const portSlot = (left: number, width: number, bg: string) => (
  <div style={{ position: 'absolute', left, top: 13, width, height: 18, borderRadius: 3, background: bg }} />
);

export function Guide({ vm }: { vm: VM }) {
  const t = vm.t, g = vm.guide;
  return (
    <div style={{ position: 'absolute', inset: 0, color: NAVY }}>
      {/* Simulated Hub Pro 6 as the camera would see it, with the AR highlight on the current part. */}
      <div style={{ position: 'absolute', left: 45, top: 150, width: 300, height: 240 }}>
        <div style={{ position: 'absolute', left: 40, top: 50, width: 220, height: 86, borderRadius: 12, background: 'linear-gradient(180deg,#2A3344,#1A202C)', boxShadow: '0 16px 30px rgba(0,0,0,.45)' }}>
          <div style={{ position: 'absolute', left: 16, top: 12, font: mono(700, 11), color: MUTED, letterSpacing: '.1em' }}>HUB PRO 6</div>
        </div>
        {g.lights.map((li, i) => (
          <div key={i} style={{ position: 'absolute', left: li.left, top: 104, width: 12, height: 12, borderRadius: '50%', background: li.color, boxShadow: `0 0 10px ${li.color}` }} />
        ))}
        <div style={{ position: 'absolute', left: 60, top: 166, width: 180, height: 44, borderRadius: 8, background: '#141922', boxShadow: '0 10px 20px rgba(0,0,0,.4)' }}>
          {portSlot(18, 26, '#E8590C')}
          {portSlot(56, 22, '#3A4252')}
          {portSlot(86, 22, '#3A4252')}
          {portSlot(116, 22, '#3A4252')}
          <div style={{ position: 'absolute', left: 150, top: 14, width: 16, height: 16, borderRadius: '50%', background: '#3A4252', border: '2px solid #59627A', boxSizing: 'border-box' }} />
        </div>
        <div style={{ position: 'absolute', left: g.hl.left, top: g.hl.top, width: g.hl.w, height: g.hl.h, border: `3px solid ${vm.brand.accent}`, borderRadius: 12, boxShadow: '0 0 0 4px rgba(242,140,40,.25)', transition: 'all .35s ease' }}>
          <div style={{ position: 'absolute', left: '50%', top: '100%', marginTop: 8, transform: 'translateX(-50%)', whiteSpace: 'nowrap', padding: '5px 10px', borderRadius: 8, background: vm.brand.accent, color: NAVY, fontSize: 13, fontWeight: 800 }}>{g.hl.label}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 52, left: 16, right: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <FloatButton onClick={vm.nav.diagnosis}>{t.arrow}</FloatButton>
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {g.dots.map((d, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: d.bg }} />)}
        </div>
      </div>
      <ModeSwitch vm={vm} top={106} />
      {g.recog && (
        <div style={{ position: 'absolute', top: 162, left: 16, display: 'flex', gap: 8, alignItems: 'center', padding: '7px 10px', borderRadius: 10, ...glass, fontSize: 13, fontWeight: 600 }}>
          {t.recognised}
          <Tag bg="#E6E9F0" fg={NAVY} pad="2px 6px">{t.ai}</Tag>
        </div>
      )}
      <Sheet>
        <span style={{ font: mono(700, 12), color: vm.brand.accent, letterSpacing: '.06em' }}>{g.counter}</span>
        <span style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.2 }}>{g.title}</span>
        <span style={{ fontSize: 14, lineHeight: 1.5, color: '#374151', textWrap: 'pretty' } as React.CSSProperties}>{g.body}</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {g.options.map((op, i) => (
            <button key={i} onClick={op.onClick} style={{ height: 48, borderRadius: 12, border: op.border, background: op.bg, color: op.fg, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{op.label}</button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
