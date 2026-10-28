// Shared building blocks and design tokens from the v7 design system pass:
// type 11–28px · radii 20 card / 16 tile / 12 control / 999 pill · buttons 52 primary / 48 secondary · tap targets ≥ 44px.
import type { CSSProperties, ReactNode } from 'react';
import type { VM } from './viewModel';

export const MONO = "'JetBrains Mono','IBM Plex Sans Arabic',monospace";
export const mono = (weight: number, size: number) => `${weight} ${size}px ${MONO}`;

export const NAVY = '#0B2545';
export const BODY = '#374151';
export const MUTED = '#6B7280';
export const LINE = '#E3EAF4';
export const DIVIDER = '1px solid #EEF2F8';
export const OUTLINE = '1.5px solid #C9D3E3';

export const card: CSSProperties = {
  display: 'flex', flexDirection: 'column', borderRadius: 20, background: '#fff', border: '1px solid #E3EAF4', boxShadow: '0 4px 18px rgba(16,42,84,.07)',
};
export const glass: CSSProperties = { background: 'rgba(255,255,255,.95)', boxShadow: '0 6px 20px rgba(16,42,84,.14)' };
export const softPanel: CSSProperties = { borderRadius: 20, background: '#EEF4FF', border: '1px solid #D3E0F5', color: NAVY };
export const ltr: CSSProperties = { direction: 'ltr', unicodeBidi: 'isolate' };

/** Full-height light page (status bar on top; optionally leaves room for the 78px tab bar). */
export function Page({ tabs, children }: { tabs?: boolean; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: tabs ? 78 : 0, paddingTop: 47, display: 'flex', flexDirection: 'column', background: '#F4F7FB' }}>
      {children}
    </div>
  );
}

export function Scroll({ padding = '16px 20px', gap = 16, children }: { padding?: string; gap?: number; children: ReactNode }) {
  return <div style={{ flex: 1, overflow: 'auto', padding, display: 'flex', flexDirection: 'column', gap, WebkitOverflowScrolling: 'touch' }}>{children}</div>;
}

export function Actions({ bottom = 16, children }: { bottom?: number; children: ReactNode }) {
  return <div style={{ padding: `12px 20px ${bottom}px`, display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>;
}

export function BackLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <div style={{ padding: '8px 12px' }}>
      <button onClick={onClick} style={{ height: 44, padding: '0 10px', border: 'none', background: 'none', whiteSpace: 'nowrap', fontSize: 14, fontWeight: 600, color: NAVY, cursor: 'pointer' }}>
        {children}
      </button>
    </div>
  );
}

/** Page heading with the brand bar on the leading edge (flips in RTL). */
export function Heading({ vm, bar = true, children }: { vm: VM; bar?: boolean; children: ReactNode }) {
  return (
    <h2
      style={{
        margin: 0, fontSize: 24, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-.02em', color: NAVY, textWrap: 'pretty',
        ...(bar ? { paddingInlineStart: 14, borderInlineStart: `6px solid ${vm.brand.primary}` } : null),
      } as CSSProperties}
    >
      {children}
    </h2>
  );
}

export function Eyebrow({ color, children, nowrap }: { color: string; children: ReactNode; nowrap?: boolean }) {
  return <span style={{ font: mono(700, 12), letterSpacing: '.06em', color, whiteSpace: nowrap ? 'nowrap' : undefined }}>{children}</span>;
}

export function Tag({ bg, fg, radius = 999, pad = '3px 7px', style, children }: { bg: string; fg: string; radius?: number; pad?: string; style?: CSSProperties; children: ReactNode }) {
  return <span style={{ font: mono(700, 11), padding: pad, borderRadius: radius, background: bg, color: fg, ...style }}>{children}</span>;
}

export const shadowFor = (c: string) => `0 10px 26px color-mix(in srgb,${c} 35%,transparent)`;

export function PrimaryButton({ vm, onClick, bg, flex, height = 52, fontSize = 16, shadow = true, children }: {
  vm: VM; onClick: () => void; bg?: string; flex?: number; height?: number; fontSize?: number; shadow?: boolean; children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex, width: flex ? undefined : '100%', height, border: 'none', borderRadius: 999, background: bg ?? vm.brand.primary,
        boxShadow: shadow && !bg ? shadowFor(vm.brand.primary) : undefined, color: '#fff', fontSize, fontWeight: 700, cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ onClick, fontSize = 14, children }: { onClick: () => void; fontSize?: number; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{ width: '100%', height: 48, border: OUTLINE, borderRadius: 999, background: '#FFFFFF', color: NAVY, fontSize, fontWeight: 600, cursor: 'pointer' }}>
      {children}
    </button>
  );
}

/** Circular progress ring (SVG drawn at 120 units, scaled to `size`). */
export function Ring({ size, stroke, color, dash, children }: { size: number; stroke: number; color: string; dash: string; children: ReactNode }) {
  return (
    <div style={{ position: 'relative', flex: 'none', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r="52" fill="none" stroke="#E3EAF4" strokeWidth={stroke} />
        <circle cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={dash} style={{ transition: 'stroke-dasharray .5s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center' }}>{children}</div>
    </div>
  );
}

/** Omantel / عمانتل wordmark that follows the selected language. */
export function Logo({ vm }: { vm: VM }) {
  return vm.isArLogo
    ? <img src="assets/logo-ar.png" alt="عمانتل" style={{ height: 34, width: 'auto', display: 'block', alignSelf: 'flex-start' }} />
    : <img src="assets/logo-en.png" alt="Omantel" style={{ height: 30, width: 'auto', display: 'block', alignSelf: 'flex-start' }} />;
}

export function Icon({ d, size = 20, stroke = 'currentColor', width = 2 }: { d: string; size?: number; stroke?: string; width?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

/** Room / Device switch shown on the camera screens. */
export function ModeSwitch({ vm, top }: { vm: VM; top: number }) {
  const b = (onClick: () => void, bg: string, fg: string, label: string) => (
    <button onClick={onClick} style={{ height: 44, padding: '0 18px', border: 'none', borderRadius: 999, background: bg, color: fg, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', cursor: 'pointer' }}>{label}</button>
  );
  return (
    <div style={{ position: 'absolute', top, left: '50%', transform: 'translateX(-50%)', display: 'flex', padding: 4, borderRadius: 12, ...glass, zIndex: 5 }}>
      {b(vm.startRoomCam, vm.modeRoomBg, vm.modeRoomFg, vm.t.room)}
      {b(vm.startDeviceCam, vm.modeDeviceBg, vm.modeDeviceFg, vm.t.device)}
    </div>
  );
}

/** Square 44px icon button floating over the camera / 3D views. */
export function FloatButton({ onClick, plain, children }: { onClick: () => void; plain?: boolean; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{ flex: 'none', width: 44, height: 44, borderRadius: 20, border: 'none', ...(plain ? { background: '#EEF2F8' } : glass), color: NAVY, fontSize: 20, cursor: 'pointer' }}>
      {children}
    </button>
  );
}

/** Rounded bottom sheet used on the camera screens. */
export function Sheet({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '16px 20px 32px', borderRadius: '24px 24px 0 0', ...glass, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {children}
    </div>
  );
}
