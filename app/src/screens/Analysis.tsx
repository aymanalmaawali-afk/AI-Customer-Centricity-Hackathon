// Measurement, 3D model, AI diagnosis and network-impact screens.
import type { CSSProperties, Ref } from 'react';
import type { VM } from '../viewModel';
import {
  Actions, BackLink, card, DIVIDER, Eyebrow, FloatButton, glass, Heading, Icon, ltr, mono, MUTED, NAVY, OUTLINE, Page, PrimaryButton, Ring, Scroll,
  SecondaryButton, softPanel, Tag,
} from '../ui';

const pretty = { textWrap: 'pretty' } as CSSProperties;

export function Measure({ vm }: { vm: VM }) {
  const t = vm.t, m = vm.mdash;
  return (
    <Page tabs>
      <Scroll>
        <div style={{ font: mono(700, 12), letterSpacing: '.06em', color: vm.brand.primary }}>{t.stepMeasure}</div>
        <Heading vm={vm}>{vm.measureTitle}</Heading>
        <div style={{ ...card, flexDirection: 'row', gap: 16, alignItems: 'center', padding: 16 }}>
          <Ring size={118} stroke={10} color={vm.brand.primary} dash={m.dash}>
            <span style={{ font: mono(800, 24), color: NAVY, ...ltr }}>{m.pct}</span>
          </Ring>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: MUTED }}>{m.ringLabel}</span>
            <span style={{ font: mono(800, 20), color: NAVY, ...ltr }}>{m.speed}</span>
            <Tag bg="#E3ECFD" fg="#1D4FBF" style={{ alignSelf: 'flex-start' }}>{m.tag}</Tag>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          {m.tiles.map((tl, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 12, borderRadius: 16, background: '#FFFFFF', border: '1px solid #E3EAF4', boxShadow: '0 4px 18px rgba(16,42,84,.07)' }}>
              <span style={{ flex: 'none', width: 38, height: 38, borderRadius: 12, background: `color-mix(in srgb,${vm.brand.primary} 12%,#FFFFFF)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon d={tl.icon} stroke={vm.brand.primary} />
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tl.label}</span>
                <span style={{ font: mono(800, 14), color: tl.color, whiteSpace: 'nowrap', ...ltr, textAlign: 'start' }}>{tl.value}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...card, gap: 12, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{m.barsTitle}</span>
            <Tag bg="#E3ECFD" fg="#1D4FBF">{m.tag}</Tag>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 12, alignItems: 'end' }}>
            {m.bars.map((b, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ font: mono(700, 11), color: b.color, ...ltr }}>{b.value}</span>
                <div style={{ position: 'relative', width: 22, height: 96, borderRadius: 11, background: '#EEF2F8', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: b.h, borderRadius: 11, background: b.fill, transition: 'height .5s ease' }} />
                </div>
                <span style={{ fontSize: 11, color: MUTED, textAlign: 'center', lineHeight: 1.2 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={card}>
          {vm.measureRows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderBottom: DIVIDER }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{r.label}</span>
                <span style={{ fontSize: 12, color: MUTED }}>{r.source}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, textAlign: 'right' }}>
                <span style={{ font: mono(700, 14), color: r.color, ...ltr }}>{r.value}</span>
                <Tag bg={r.tagBg} fg={r.tagFg} pad="2px 6px">{r.tag}</Tag>
              </div>
            </div>
          ))}
        </div>
      </Scroll>
      <div style={{ padding: '12px 20px 16px' }}>
        <PrimaryButton vm={vm} onClick={vm.measureNext} bg={vm.measureBtnBg}>{t.seeAR}</PrimaryButton>
      </div>
    </Page>
  );
}

export function Model({ vm, threeRef }: { vm: VM; threeRef: Ref<HTMLDivElement> }) {
  const t = vm.t;
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(100% 70% at 50% 35%,#FFFFFF 0%,#E8EEF7 75%)', color: NAVY, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '52px 16px 0', display: 'flex', flexDirection: 'column', gap: 8, zIndex: 2 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <FloatButton onClick={vm.nav.ar} plain>{t.arrow}</FloatButton>
          <div style={{ flex: 1, fontSize: 18, fontWeight: 800 }}>{t.home3d}</div>
          <button onClick={vm.enterVR} style={{ flex: 'none', height: 44, padding: '0 14px', whiteSpace: 'nowrap', borderRadius: 12, border: OUTLINE, background: 'transparent', color: NAVY, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{t.enterVR}</button>
        </div>
        <div style={{ display: 'flex', padding: 4, borderRadius: 12, background: '#EEF2F8' }}>
          {vm.places.map((p, i) => (
            <button key={i} onClick={p.onClick} style={{ flex: 1, height: 40, border: 'none', borderRadius: 999, background: p.bg, color: p.fg, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{p.label}</button>
          ))}
        </div>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <div ref={threeRef} style={{ position: 'absolute', inset: 0, cursor: 'grab' }} />
        <div style={{ position: 'absolute', left: 16, top: 10, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
          <Tag bg="#FFF1D6" fg="#8A5A00" pad="5px 8px" style={{ whiteSpace: 'nowrap' }}>{t.estHeat}</Tag>
          <span style={{ fontSize: 12, color: MUTED }}>{t.pillars}</span>
        </div>
        {vm.threeMsg && (
          <div style={{ position: 'absolute', left: 16, right: 16, bottom: 12, padding: '10px 12px', borderRadius: 12, ...glass, border: '1px solid #C9D3E3', fontSize: 13, lineHeight: 1.5, color: '#374151' }}>{vm.threeMsg}</div>
        )}
      </div>
      <div style={{ padding: '16px 20px 32px', background: '#FFFFFF', borderTop: '1px solid #E3EAF4', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.weakDead}</span>
          <span style={{ font: mono(700, 18), color: vm.modelWeakColor, ...ltr }}>{vm.modelStats.w}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
          {vm.modelRings.map((mr, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Ring size={64} stroke={12} color={mr.color} dash={mr.dash}>
                <span style={{ font: mono(800, 14), color: NAVY, ...ltr }}>{mr.pct}</span>
              </Ring>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{mr.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{vm.modelNote}</div>
        <PrimaryButton vm={vm} onClick={vm.nav.diagnosis}>{t.seeDiag}</PrimaryButton>
      </div>
    </div>
  );
}

export function Diagnosis({ vm }: { vm: VM }) {
  const t = vm.t, d = vm.diag;
  return (
    <Page tabs>
      <Scroll>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow color={vm.brand.primary}>{t.aiDiag}</Eyebrow>
          <Tag bg="#E6E9F0" fg={NAVY} pad="4px 8px" style={{ whiteSpace: 'nowrap', flex: 'none' }}>{d.confLabel}</Tag>
        </div>
        <div style={{ ...card, flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16 }}>
          <Ring size={88} stroke={11} color={vm.brand.primary} dash={d.dash}>
            <span style={{ font: mono(800, 18), color: NAVY, ...ltr }}>{d.conf}</span>
            <span style={{ font: mono(700, 9), color: MUTED }}>{t.ai}</span>
          </Ring>
          <h2 style={{ flex: 1, minWidth: 0, margin: 0, fontSize: 24, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-.01em', color: NAVY, ...pretty }}>{d.title}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          {d.locator.map((l, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 10px', borderRadius: 16, background: l.bg, border: `1.5px solid ${l.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{l.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: l.color }}>{l.status}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{t.why}</div>
          {d.evidence.map((e, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #E3EAF4' }}>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: '#374151', ...pretty }}>{e.text}</span>
              <Tag bg={e.bg} fg={e.fg} radius={5} pad="3px 6px" style={{ flex: 'none' }}>{e.tag}</Tag>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.whatDo}</div>
          {d.recs.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 20, background: '#fff', border: '1px solid #E3EAF4' }}>
              <span style={{ flex: 'none', font: mono(700, 13), color: vm.brand.primary }}>{r.n}</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{r.title}</span>
                <span style={{ fontSize: 13, lineHeight: 1.5, color: MUTED, ...pretty }}>{r.body}</span>
              </div>
            </div>
          ))}
        </div>
      </Scroll>
      <Actions>
        <PrimaryButton vm={vm} onClick={d.primary}>{d.primaryLabel}</PrimaryButton>
        <SecondaryButton onClick={d.secondary}>{d.secondaryLabel}</SecondaryButton>
      </Actions>
    </Page>
  );
}

export function Impact({ vm }: { vm: VM }) {
  const t = vm.t, im = vm.impact;
  return (
    <Page tabs>
      <BackLink onClick={vm.nav.diagnosis}>{t.backDiag}</BackLink>
      <Scroll padding="0 20px 16px">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Eyebrow color={vm.brand.primary}>{t.aiAssess}</Eyebrow>
          <Tag bg="#E6E9F0" fg={NAVY} pad="3px 6px" style={{ flex: 'none' }}>{t.ai}</Tag>
        </div>
        <Heading vm={vm} bar={false}>{im.title}</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          {im.split.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 12, background: s.bg, border: `1.5px solid ${s.border}` }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{s.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: s.color }}>{s.status}</span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: '#374151' }}>{s.note}</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: DIVIDER }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{t.impactOut}</span>
            <Tag bg={im.levelBg} fg={im.levelFg} radius={6} pad="4px 8px">{im.level}</Tag>
          </div>
          {im.rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '11px 16px', borderBottom: DIVIDER }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '.02em' }}>{r.label}</span>
                <Tag bg={r.bg} fg={r.fg} radius={5} pad="3px 6px" style={{ flex: 'none' }}>{r.tag}</Tag>
              </div>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: NAVY, ...pretty }}>{r.text}</span>
            </div>
          ))}
        </div>
        <div style={{ ...softPanel, display: 'flex', gap: 16, alignItems: 'center', padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 'none' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>{t.etaLbl}</span>
            <span style={{ font: mono(700, 24), whiteSpace: 'nowrap', ...ltr }}>{im.eta}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: '#374151', ...pretty }}>{im.etaNote}</span>
            <Tag bg="#FFF1D6" fg="#8A5A00" pad="3px 6px" style={{ alignSelf: 'flex-start', whiteSpace: 'nowrap' }}>{im.etaConfLabel}</Tag>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.recActions}</div>
          {im.actions.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, fontSize: 14, lineHeight: 1.5, color: '#374151' }}>
              <span style={{ flex: 'none', font: mono(700, 13), color: vm.brand.primary }}>{a.n}</span>
              <span>{a.text}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 6, padding: '12px 14px', borderRadius: 12, background: im.escBg }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{t.escalation}</span>
            <span style={{ fontSize: 13, fontWeight: 600, textAlign: 'right', color: im.escFg }}>{im.esc}</span>
          </div>
        </div>
      </Scroll>
      <Actions>
        <PrimaryButton vm={vm} onClick={im.primary}>{im.primaryLabel}</PrimaryButton>
        <SecondaryButton onClick={im.secondary}>{im.secondaryLabel}</SecondaryButton>
      </Actions>
    </Page>
  );
}
