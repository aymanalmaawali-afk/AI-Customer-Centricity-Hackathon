// Entry screens: host app hand-off, language, start, service lookup and camera permission.
import type { VM } from '../viewModel';
import { Actions, BackLink, card, DIVIDER, Heading, Logo, mono, NAVY, OUTLINE, Page, PrimaryButton, Scroll, SecondaryButton, shadowFor, Tag } from '../ui';

/** 01 · The customer's main app (screenshot) with the new Troubleshooting tile that opens this app. */
export function Host({ vm }: { vm: VM }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FAFAFA', overflow: 'hidden' }}>
      <img src="assets/host-services.jpg" alt="" style={{ position: 'absolute', left: 0, top: 40, width: 390, height: 'auto', display: 'block' }} />
      <div style={{ position: 'absolute', left: 12, top: 50, width: 120, height: 46, background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, paddingLeft: 6, boxSizing: 'border-box' }}>
        <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '.02em', color: '#2B2B2B', lineHeight: 1 }}>RASHID</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>
          9333 3360
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </div>
      <button onClick={vm.openApp} aria-label="Troubleshooting" style={{ position: 'absolute', left: 285, top: 491, width: 81, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
        <span style={{ position: 'relative', width: 61, height: 61, borderRadius: 18, background: '#EFEFEF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4.5 9.5a10.5 10.5 0 0 1 15 0" stroke={vm.brand.primary} strokeWidth="2" />
            <path d="M7.5 12.5a6.2 6.2 0 0 1 9 0" stroke={vm.brand.primary} strokeWidth="2" />
            <path d="M14.5 15.5l4.5 4.5" stroke={vm.brand.accent} strokeWidth="2.6" />
            <circle cx="12" cy="15.5" r="2.6" stroke={vm.brand.accent} strokeWidth="2.2" />
          </svg>
          <span style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', padding: '2px 8px', borderRadius: 6, background: '#2E8B57', color: '#fff', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>New</span>
        </span>
        <span style={{ fontSize: 12, color: '#1A1A1A', whiteSpace: 'nowrap' }}>Troubleshooting</span>
      </button>
    </div>
  );
}

const langBtn = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 76, padding: '0 20px', borderRadius: 16, cursor: 'pointer' } as const;
const langLabel = { flex: 1, minWidth: 0, textAlign: 'start', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 } as const;

export function Language({ vm }: { vm: VM }) {
  return (
    <div style={{ position: 'absolute', inset: 0, paddingTop: 47, display: 'flex', flexDirection: 'column', background: '#F4F7FB', color: NAVY }}>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <img src="assets/logo-full.png" alt="Omantel · عمانتل" style={{ height: 64, width: 'auto', display: 'block', alignSelf: 'flex-start' }} />
          <span style={{ font: mono(700, 12), letterSpacing: '.08em', color: vm.brand.accent }}>LANGUAGE · اللغة</span>
          <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-.02em' }}>Choose your language</h2>
          <h2 dir="rtl" style={{ margin: 0, fontSize: 28, lineHeight: 1.3, fontWeight: 700, fontFamily: "'IBM Plex Sans Arabic',sans-serif", textAlign: 'left' }}>اختر لغتك</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={vm.pickEn} style={{ ...langBtn, border: 'none', background: vm.brand.primary, color: '#fff' }}>
            <span style={langLabel}><span style={{ fontSize: 20, fontWeight: 800 }}>English</span><span style={{ fontSize: 13, color: '#DCE6F5' }}>Continue in English</span></span>
            <span style={{ fontSize: 20 }}>→</span>
          </button>
          <button onClick={vm.pickAr} dir="rtl" style={{ ...langBtn, border: OUTLINE, background: 'transparent', color: NAVY, fontFamily: "'IBM Plex Sans Arabic',sans-serif" }}>
            <span style={langLabel}><span style={{ fontSize: 20, fontWeight: 700 }}>العربية</span><span style={{ fontSize: 13, color: '#374151' }}>المتابعة بالعربية</span></span>
            <span style={{ fontSize: 20 }}>←</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const glossyTile = {
  width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(145deg,rgba(255,255,255,.35),rgba(255,255,255,.08))',
  boxShadow: 'inset 0 2px 0 rgba(255,255,255,.45),inset 0 -3px 6px rgba(0,0,0,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center',
} as const;
const scanCard = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, padding: 14, minHeight: 76, border: 'none', borderRadius: 20, color: '#fff', textAlign: 'left', cursor: 'pointer' } as const;
const stepNum = { flex: 'none', width: 28, height: 28, borderRadius: 8, background: NAVY, color: '#fff', font: mono(700, 13), display: 'flex', alignItems: 'center', justifyContent: 'center' } as const;

export function Welcome({ vm }: { vm: VM }) {
  const t = vm.t;
  return (
    <Page tabs>
      <Scroll gap={20}>
        <Logo vm={vm} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: NAVY, whiteSpace: 'nowrap' }}>{t.brand}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {vm.routerLine && <Tag bg="#E3ECFD" fg="#1D4FBF" pad="4px 8px" style={{ whiteSpace: 'nowrap', flex: 'none' }}>{vm.routerLine}</Tag>}
            <button onClick={vm.switchLang} style={{ flex: 'none', height: 32, padding: '0 10px', borderRadius: 8, border: OUTLINE, background: '#fff', color: NAVY, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>{t.switchLang}</button>
          </div>
        </div>
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: NAVY, aspectRatio: '5/4' }}>
          <div style={{ width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.95, backgroundImage: vm.mapCurrentBg }} />
          <Tag bg="#FFF1D6" fg="#8A5A00" pad="4px 8px" style={{ position: 'absolute', left: 12, bottom: 12, whiteSpace: 'nowrap' }}>{t.exampleCov}</Tag>
        </div>
        <Heading vm={vm}>{t.welcomeH}</Heading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[t.w1, t.w2, t.w3].map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={stepNum}>{i + 1}</span>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: '#374151' }}>{w}</span>
            </div>
          ))}
        </div>
      </Scroll>
      <Actions>
        <div style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.whatScan}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          <button onClick={vm.startRoom} style={{ ...scanCard, background: vm.brand.primary, boxShadow: `0 10px 26px color-mix(in srgb,${vm.brand.primary} 30%,transparent)` }}>
            <span style={glossyTile}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /></svg></span>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{t.scanRoom}</span>
            <span style={{ fontSize: 13, color: '#D6F5F2' }}>{t.scanRoomSub}</span>
          </button>
          <button onClick={vm.startDevice} style={{ ...scanCard, background: NAVY, boxShadow: '0 10px 26px rgba(11,37,69,.25)' }}>
            <span style={glossyTile}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h16v5H4zM8 17h.01M12 17h.01M7 14l-2-7M17 14l2-7M9.5 10a4 4 0 0 1 5 0" /></svg></span>
            <span style={{ fontSize: 16, fontWeight: 800 }}>{t.scanDevice}</span>
            <span style={{ fontSize: 13, color: '#C3D2EA' }}>{t.scanDeviceSub}</span>
          </button>
        </div>
      </Actions>
    </Page>
  );
}

export function Identify({ vm }: { vm: VM }) {
  const t = vm.t, id = vm.ident;
  return (
    <Page>
      <BackLink onClick={vm.nav.welcome}>{t.back}</BackLink>
      <Scroll padding="4px 20px 16px">
        <Heading vm={vm}>{t.idH}</Heading>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: '#374151', textWrap: 'pretty' } as React.CSSProperties}>{t.idP}</p>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{t.mobile}</span>
          <div dir="ltr" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 56, padding: '0 14px', borderRadius: 20, background: '#fff', border: `1.5px solid ${id.border}` }}>
            <span style={{ font: mono(600, 16), color: '#6B7280' }}>+968</span>
            <input
              type="tel" inputMode="tel" autoComplete="tel" placeholder="9333 3360" value={vm.phone} onChange={vm.onPhone}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', font: mono(600, 18), color: NAVY }}
            />
          </div>
        </label>
        {id.err && <div style={{ marginTop: -8, fontSize: 14, color: '#B02A30' }}>{id.err}</div>}
        {id.showDemo && (
          <button onClick={id.useDemo} style={{ alignSelf: 'flex-start', height: 44, marginTop: -10, padding: 0, border: 'none', background: 'none', fontSize: 14, fontWeight: 700, color: vm.brand.primary, cursor: 'pointer' }}>{t.useDemoNum}</button>
        )}
        {id.loading && <div style={{ fontSize: 14, color: '#6B7280' }}>{t.lookingUp}</div>}
        {id.found && (
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: DIVIDER }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1F8A57' }}>{t.found}</span>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{t.fromISP}</span>
            </div>
            {id.rows.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '11px 16px', borderBottom: DIVIDER }}>
                <span style={{ fontSize: 14, color: '#6B7280' }}>{r.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, textAlign: 'right', color: r.color, direction: 'ltr', unicodeBidi: 'isolate' }}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 13, lineHeight: 1.5, color: '#6B7280' }}>{t.idPrivacy}</div>
      </Scroll>
      <Actions bottom={32}>
        <PrimaryButton vm={vm} onClick={id.primary} bg={id.primaryBg}>{id.primaryLabel}</PrimaryButton>
        {id.found && <SecondaryButton onClick={id.reset}>{t.notMe}</SecondaryButton>}
      </Actions>
    </Page>
  );
}

export function Permission({ vm }: { vm: VM }) {
  const t = vm.t;
  const row = (text: string, last?: boolean) => (
    <div style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: last ? undefined : DIVIDER, fontSize: 14, color: '#374151' }}>
      <span style={{ color: '#1F9D63', fontWeight: 800 }}>✓</span>{text}
    </div>
  );
  return (
    <Page>
      <BackLink onClick={vm.nav.welcome}>{t.back}</BackLink>
      <Scroll padding="4px 20px 16px" gap={20}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 30, height: 22, border: `3px solid ${vm.brand.accent}`, borderRadius: 6, position: 'relative', boxSizing: 'content-box' }}>
            <div style={{ position: 'absolute', left: 8, top: 4, width: 8, height: 8, borderRadius: '50%', border: `3px solid ${vm.brand.accent}`, boxSizing: 'content-box' }} />
          </div>
        </div>
        <Heading vm={vm}>{t.camH}</Heading>
        <div style={card}>
          {row(t.cam1)}
          {row(t.cam2)}
          {row(t.cam3, true)}
        </div>
        {vm.camErr && <div style={{ fontSize: 14, color: '#B02A30', lineHeight: 1.5 }}>{vm.camErr}</div>}
      </Scroll>
      <Actions bottom={32}>
        <button onClick={vm.requestCam} style={{ height: 52, border: 'none', borderRadius: 999, background: vm.brand.primary, boxShadow: shadowFor(vm.brand.primary), color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>{t.allowCam}</button>
        <SecondaryButton onClick={vm.useDemo} fontSize={16}>{t.useDemoRoom}</SecondaryButton>
      </Actions>
    </Page>
  );
}
