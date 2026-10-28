// VR fallback for browsers without WebXR (iPhone Safari): a full-screen first-person view of the 3D home,
// steered by the gyroscope (or drag), with an optional Cardboard-style split view.
// Rendered into <body> so it fills the real screen rather than the scaled phone frame.
import type { Ref } from 'react';
import { createPortal } from 'react-dom';
import type { VM } from '../viewModel';
import { glass, ltr, mono, MUTED, NAVY, Tag } from '../ui';

const pill = { height: 44, padding: '0 16px', borderRadius: 999, border: 'none', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' } as const;

export function LookAround({ vm, hostRef }: { vm: VM; hostRef: Ref<HTMLDivElement> }) {
  const l = vm.look, t = vm.t;
  const splitBtn = (
    <button onClick={l.toggleStereo} aria-pressed={l.stereo} style={{ ...pill, ...glass, background: l.stereo ? vm.brand.primary : 'rgba(255,255,255,.95)', color: l.stereo ? '#fff' : NAVY }}>
      {l.splitLabel}
    </button>
  );
  const exitBtn = <button onClick={l.exit} style={{ ...pill, ...glass, color: NAVY }}>× {l.exitLabel}</button>;

  return createPortal(
    <div className="look" dir={vm.dir} lang={vm.lang} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'radial-gradient(100% 70% at 50% 35%,#FFFFFF 0%,#E8EEF7 75%)', color: NAVY, overflow: 'hidden', touchAction: 'none' }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />

      {l.stereo ? (
        <>
          {/* Minimal chrome in split view: controls sit on the centre line, between the lenses. */}
          <div style={{ position: 'absolute', left: '50%', top: 'max(12px, env(safe-area-inset-top))', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
            {exitBtn}
            {splitBtn}
          </div>
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, marginLeft: -1, background: 'rgba(11,37,69,.35)', pointerEvents: 'none' }} />
          <div className="look-portrait-only" style={{ position: 'absolute', left: 16, right: 16, bottom: 'max(24px, env(safe-area-inset-bottom))', justifyContent: 'center', pointerEvents: 'none' }}>
            <div style={{ maxWidth: 320, padding: '10px 14px', borderRadius: 12, ...glass, fontSize: 14, lineHeight: 1.5, textAlign: 'center' }}>{l.landscape}</div>
          </div>
        </>
      ) : (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, padding: 'max(12px, env(safe-area-inset-top)) 16px 0', display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', pointerEvents: 'auto' }}>
              {exitBtn}
              <div style={{ flex: 1, minWidth: 0, fontSize: 18, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.title}</div>
              {splitBtn}
            </div>
            <Tag bg="#FFF1D6" fg="#8A5A00" pad="5px 8px" style={{ alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>{t.estHeat}</Tag>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 16px max(16px, env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ alignSelf: 'flex-start', maxWidth: '100%', padding: '8px 12px', borderRadius: 12, ...glass, fontSize: 13, lineHeight: 1.5, color: '#374151' }}>
              {l.hint}
              {l.motionNote && <div style={{ marginTop: 4, color: MUTED }}>{l.motionNote}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch' }}>
              {l.rooms.map((r, i) => (
                <button
                  key={i}
                  onClick={r.onClick}
                  aria-pressed={r.on}
                  style={{ flex: 'none', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, minHeight: 44, padding: '8px 14px', borderRadius: 16, border: 'none', cursor: 'pointer', ...glass, background: r.on ? vm.brand.primary : 'rgba(255,255,255,.95)', color: r.on ? '#fff' : NAVY }}
                >
                  <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.label}</span>
                  <span style={{ font: mono(700, 12), color: r.on ? '#DCE6F5' : r.color, ...ltr }}>{r.value}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
