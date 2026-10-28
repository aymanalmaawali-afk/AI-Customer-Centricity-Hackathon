// Result (fixed / support case) and the before-and-after treatment report.
import type { CSSProperties } from 'react';
import type { VM } from '../viewModel';
import { Actions, BackLink, card, DIVIDER, Eyebrow, Heading, Logo, ltr, mono, MUTED, NAVY, Page, PrimaryButton, Scroll, SecondaryButton, softPanel, Tag } from '../ui';

export function Outcome({ vm }: { vm: VM }) {
  const t = vm.t, o = vm.out;
  return (
    <Page tabs>
      <Scroll>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: o.iconBg, color: '#fff', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{o.icon}</div>
        <Heading vm={vm}>{o.title}</Heading>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#374151', textWrap: 'pretty' } as CSSProperties}>{o.body}</p>
        <div style={card}>
          <div style={{ padding: '12px 16px', borderBottom: DIVIDER, fontSize: 13, fontWeight: 700, color: NAVY }}>{o.tableTitle}</div>
          {o.rows.map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 16px', borderBottom: DIVIDER }}>
              <span style={{ fontSize: 14, color: '#374151' }}>{r.label}</span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ font: mono(700, 14), color: r.color, ...ltr }}>{r.value}</span>
                <Tag bg="#E3ECFD" fg="#1D4FBF" pad="2px 6px">{t.tagMeasured}</Tag>
              </span>
            </div>
          ))}
        </div>
        {o.showCase && (
          <div style={{ ...softPanel, display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
            <Logo vm={vm} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>{o.caseLabel}</span>
              <span style={{ font: mono(700, 11), color: '#1F8A57' }}>{t.open}</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: '#374151' }}>{o.caseText}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: '.04em' }}>{t.attached}</div>
          </div>
        )}
      </Scroll>
      <Actions>
        <PrimaryButton vm={vm} onClick={o.primary}>{o.primaryLabel}</PrimaryButton>
        <SecondaryButton onClick={o.secondary}>{o.secondaryLabel}</SecondaryButton>
      </Actions>
    </Page>
  );
}

const grid = { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 64px 64px 62px', gap: 8 } as const;
const num = (weight: number, color: string): CSSProperties => ({ font: mono(weight, 12), color, textAlign: 'right', ...ltr });
const bar = (width: string, background: string) => (
  <div style={{ height: 5, borderRadius: 3, background: '#EEF2F8' }}><div style={{ height: 5, borderRadius: 3, background, width }} /></div>
);

export function Report({ vm }: { vm: VM }) {
  const t = vm.t, r = vm.report;
  return (
    <Page tabs>
      <BackLink onClick={vm.nav.outcome}>{t.backResult}</BackLink>
      <Scroll padding="0 20px 16px">
        <Logo vm={vm} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <Eyebrow color={vm.brand.primary} nowrap>{t.treat}</Eyebrow>
          <span style={{ fontSize: 12, color: MUTED, whiteSpace: 'nowrap' }}>{t.date}</span>
        </div>
        <Heading vm={vm} bar={false}>{r.title}</Heading>
        <div style={{ ...softPanel, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: MUTED }}>{t.overall}</span>
            <span style={{ fontSize: 13, lineHeight: 1.5, color: '#374151' }}>{r.overallNote}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flex: 'none' }}>
            <span style={{ font: mono(700, 28), color: '#1F8A57', whiteSpace: 'nowrap', ...ltr }}>{r.overall}</span>
            <Tag bg={r.overallTagBg} fg={r.overallTagFg} radius={5} pad="3px 6px">{r.overallTag}</Tag>
          </div>
        </div>
        <div style={card}>
          <div style={{ ...grid, padding: '10px 14px', borderBottom: DIVIDER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '.04em' }}>
            <span>{t.metric}</span><span style={{ textAlign: 'right' }}>{t.before}</span><span style={{ textAlign: 'right' }}>{t.after}</span><span style={{ textAlign: 'right' }}>{t.change}</span>
          </div>
          {r.rows.map((row, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '11px 14px', borderBottom: DIVIDER }}>
              <div style={{ ...grid, alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, lineHeight: 1.3 }}>{row.metric}</span>
                <span style={num(500, MUTED)}>{row.before}</span>
                <span style={num(700, NAVY)}>{row.after}</span>
                <span style={num(700, row.changeColor)}>{row.change}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {bar(row.bw, '#B6BFCC')}
                {bar(row.aw, row.barColor)}
              </div>
              <Tag bg={row.tagBg} fg={row.tagFg} radius={5} pad="2px 6px" style={{ alignSelf: 'flex-start' }}>{row.tag}</Tag>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.issues}</div>
          {r.issues.map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5, color: '#374151' }}>
              <span style={{ flex: 'none', width: 8, height: 8, marginTop: 6, borderRadius: '50%', background: '#D93B42' }} />
              <span>{x}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.actionsTaken}</div>
          {r.actions.map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5, color: '#374151' }}>
              <span style={{ flex: 'none', color: '#1F8A57', fontWeight: 800 }}>✓</span>
              <span>{x}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: MUTED }}>{r.footnote}</div>
        {r.toast && <div style={{ padding: '10px 14px', borderRadius: 12, background: '#EAF7F0', color: '#1F8A57', fontSize: 14, fontWeight: 700 }}>{r.toast}</div>}
      </Scroll>
      <Actions>
        <PrimaryButton vm={vm} onClick={r.share}>{t.share}</PrimaryButton>
        <SecondaryButton onClick={vm.nav.welcome}>{t.done}</SecondaryButton>
      </Actions>
    </Page>
  );
}
