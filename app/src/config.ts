// Prototype settings. In the design these were Claude Design "Tweaks"; here they come from the
// URL so any variant can be shared as a link, e.g. ?scenario=router&demo=1&primary=%231554A8
import type { ScenarioKey } from './data';

export interface Config { scenario: ScenarioKey; forceDemo: boolean; primaryColor: string; accentColor: string }

export const SCENARIO_KEYS: ScenarioKey[] = ['wifi', 'device', 'router', 'network'];
const HEX = /^#[0-9a-f]{3,8}$/i;

export function readConfig(): Config {
  const q = new URLSearchParams(window.location.search);
  const sc = q.get('scenario') as ScenarioKey | null;
  const primary = q.get('primary'), accent = q.get('accent');
  return {
    scenario: sc && SCENARIO_KEYS.includes(sc) ? sc : 'wifi',
    forceDemo: q.get('demo') === '1' || q.get('demo') === 'true',
    primaryColor: primary && HEX.test(primary) ? primary : '#1554A8',
    accentColor: accent && HEX.test(accent) ? accent : '#F28C28',
  };
}

/** Writes the scenario back to the URL so a reload or shared link keeps it. */
export function writeScenario(s: ScenarioKey) {
  const u = new URL(window.location.href);
  if (s === 'wifi') u.searchParams.delete('scenario'); else u.searchParams.set('scenario', s);
  window.history.replaceState(null, '', u);
}
