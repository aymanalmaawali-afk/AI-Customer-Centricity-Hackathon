// Optional AI rewriter for Ava's replies. Off by default: Ava ships fully scripted.
//
// To turn it on, build with VITE_AVA_ENDPOINT pointing at your own backend, e.g.
//   VITE_AVA_ENDPOINT=https://api.example.com/ava npm run build
// The app POSTs { system, context, screen, customer, draft, lang } and expects { text }.
// Keep your Claude API key on that server — never ship it in this static site.
import type { Lang } from '../data';

export interface RewriteInput { lang: Lang; summary: string; screen: string; customer: string; draft: string }

const SYSTEM = 'You are Ava, a warm, concise broadband support assistant in a mobile web app with camera scanning, AR and 3D Wi‑Fi views. Reply in at most 2 short sentences, plain text, no markdown, no emoji. Never claim the camera can measure Wi‑Fi signal. Keep the facts in the draft reply exactly; you may rephrase it to fit what the customer said. ';

type ClaudeComplete = (req: { max_tokens: number; system: string; messages: { role: string; content: string }[] }) => Promise<string>;

/** Returns a rephrased reply, or null to keep the scripted draft. Never throws. */
export async function rewriteReply(i: RewriteInput): Promise<string | null> {
  const system = SYSTEM + (i.lang === 'ar' ? 'Always reply in Modern Standard Arabic.' : 'Always reply in English.');
  const content = 'Context: ' + i.summary + '\nCurrent screen: ' + i.screen + '\nCustomer: "' + i.customer + '"\nDraft reply: ' + i.draft;
  try {
    const endpoint = import.meta.env.VITE_AVA_ENDPOINT as string | undefined;
    if (endpoint) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, context: i.summary, screen: i.screen, customer: i.customer, draft: i.draft, lang: i.lang }),
      });
      if (!res.ok) return null;
      const out = (await res.json()) as { text?: string };
      return out.text?.trim() || null;
    }
    // Host-provided completion hook (present when previewed inside Claude Design).
    const complete = (window as unknown as { claude?: { complete?: ClaudeComplete } }).claude?.complete;
    if (complete) {
      const out = await complete({ max_tokens: 220, system, messages: [{ role: 'user', content }] });
      return out?.trim() || null;
    }
  } catch {
    // fall through to the scripted reply
  }
  return null;
}
