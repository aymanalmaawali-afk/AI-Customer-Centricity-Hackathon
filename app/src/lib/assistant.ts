// Ava — the in-app assistant. Replies are scripted (keyword intent detection, EN + AR) and every
// answer can carry chips that either send a follow-up message (say/intent) or jump to a screen (go).
// An optional AI rewriter (see ./avaAI.ts) may rephrase the scripted reply; the facts stay scripted.
import { ROOMS, type Lang, type ScenarioKey } from '../data';

export interface Chip {
  say?: string;
  intent?: string;
  label?: string;
  go?: string;
  room?: number;
}
export interface Reply {
  text: string;
  chips: Chip[];
}
export interface Sample {
  id: string;
  name: string;
  cur: number;
  rec: number;
  ext: number;
}
/** Live context the assistant can quote: the current screen, room samples and guided-check step. */
export interface ChatCtx {
  screen: string;
  samples: Sample[];
  guideTitle: string;
  guideBody: string;
  summary: string;
}
export interface AssistantCtx {
  lang: Lang;
  scenario: ScenarioKey;
  ctx: ChatCtx;
}

/** Ava's opening message, with a "Help with this step" chip on camera / 3D screens. */
export function greeting(lang: Lang, screen: string, account: boolean): Reply {
  const X = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const ctxChip: Chip[] = ['scan', 'ar', 'guide', 'model'].includes(screen)
    ? [{ say: X('Help with this step', 'ساعدني في هذه الخطوة'), intent: 'help' }]
    : [];
  return {
    text: X(
      'Hi' + (account ? ' Rashid' : '') + ', I’m Ava. Tell me what’s wrong — type, or tap the mic and say it.',
      'مرحبًا، أنا آفا. أخبرني ما المشكلة — اكتب أو اضغط الميكروفون وتحدّث.',
    ),
    chips: [
      ...ctxChip,
      { say: X('Wi‑Fi is slow in some rooms', 'Wi‑Fi بطيء في بعض الغرف'), intent: 'coverage' },
      { say: X('No internet at all', 'لا يوجد إنترنت إطلاقًا'), intent: 'outage' },
      { say: X('One device is slow', 'جهاز واحد بطيء'), intent: 'device' },
      { say: X('Router lights look wrong', 'أضواء الراوتر غير طبيعية'), intent: 'router' },
    ],
  };
}

/** Maps free text (EN or AR) to an intent key. Order matters: first match wins. */
export function detect(x: string): string {
  const ri = ROOMS.findIndex(r => x.includes(r.id) || x.includes(r.n.en.toLowerCase()) || x.includes(r.n.ar));
  if (/help with this step|ساعدني في هذه الخطوة/.test(x)) return 'help';
  if (ri >= 0) return 'room:' + ri;
  if (/agent|human|person|call|complain|someone|موظف|شخص|اتصال|شكوى|إنسان/.test(x)) return 'agent';
  if (/report|before|after|improv|تقرير|قبل|بعد|تحسن/.test(x)) return 'report';
  if (/no internet|not working|down|outage|offline|nothing works|dropp|لا يوجد إنترنت|لا يعمل|انقطاع|مقطوع|ينقطع|متوقف/.test(x))
    return 'outage';
  if (/light|amber|orange|red|blink|flash|router|cable|restart|ضوء|أضواء|راوتر|كابل|برتقالي|أحمر|يومض|إعادة تشغيل/.test(x)) return 'router';
  if (/only that device|ذلك الجهاز فقط/.test(x)) return 'onlyDevice';
  if (/laptop|pc|computer|console|xbox|playstation|one device|just one|only my|حاسوب|لابتوب|كمبيوتر|جهاز واحد|بلايستيشن|تلفاز/.test(x))
    return 'device';
  if (/everything|slow|room|dead|weak|signal|coverage|buffer|lag|بطيء|بطء|ضعيف|غرفة|الغرف|تغطية|إشارة|ميت|تقطيع/.test(x)) return 'coverage';
  return 'other';
}

/** Scripted reply for a message, or for a chip that already names its intent. */
export function reply(t: string, given: string | undefined, a: AssistantCtx): Reply {
  const lang = a.lang,
    sk = a.scenario,
    C = a.ctx;
  const X = (en: string, ar: string) => (lang === 'ar' ? ar : en),
    low = (s: string) => (lang === 'ar' ? s : s.toLowerCase());
  const it = given || detect(t.toLowerCase());
  const contact: Chip = { label: X('Contact support', 'تواصل مع الدعم'), go: 'agent' };
  if (it === 'help') {
    const m: Record<string, string> = {
      guide:
        (C.guideTitle || '') +
        '. ' +
        (C.guideBody || '') +
        X(' I’ve outlined it in orange on your camera view.', ' حدّدته باللون البرتقالي على عرض الكاميرا.'),
      scan: X(
        'Walk slowly and sweep each wall, then the floor. I mark obstacles like metal, mirrors and thick walls as I spot them.',
        'امشِ ببطء وامسح كل جدار ثم الأرضية. سأحدد العوائق مثل المعادن والمرايا والجدران السميكة عند اكتشافها.',
      ),
      ar: X(
        'Green is strong, yellow moderate, red weak. The colours are estimated from 4 points we actually measured; the dashed ring is where I’d move the router.',
        'الأخضر قوي والأصفر متوسط والأحمر ضعيف. الألوان تقديرية من 4 نقاط قسناها فعليًا، والدائرة المتقطعة هي الموقع المقترح للراوتر.',
      ),
      model: X(
        'Drag to look around. Switch between Current, Move router and Add extender to compare estimated coverage.',
        'اسحب للتجوّل. بدّل بين الحالي ونقل الراوتر وإضافة مقوٍّ لمقارنة التغطية التقديرية.',
      ),
    };
    return { text: m[C.screen] || X('Tell me what you see and I’ll guide you.', 'أخبرني بما تراه وسأرشدك.'), chips: [] };
  }
  if (it.startsWith('room:')) {
    const i = +it.split(':')[1];
    const s = C.samples[i];
    const weak = s.cur < -70;
    return {
      text: X(
        'The ' +
          low(s.name) +
          ' measured ' +
          s.cur +
          ' dBm during your scan' +
          (weak ? ' — that’s a weak spot.' : '.') +
          ' Want to scan it again with your camera so I can check for obstacles?',
        'سجّلت ' +
          s.name +
          ' إشارة ' +
          s.cur +
          ' dBm أثناء المسح' +
          (weak ? ' — وهي نقطة ضعيفة.' : '.') +
          ' هل تريد مسحها مجددًا بالكاميرا لأتحقق من العوائق؟',
      ),
      chips: [
        { label: X('Scan the ' + low(s.name), 'امسح ' + s.name), go: 'scanRoom', room: i },
        { label: X('See coverage in AR', 'شاهد التغطية بالواقع المعزز'), go: 'ar' },
      ],
    };
  }
  if (it === 'agent')
    return {
      text: X(
        'I can connect you to an agent now. Your scan, measurements and the checks you’ve done go with it, so you won’t have to repeat anything.',
        'يمكنني تحويلك إلى موظف الآن. سيُرسَل معك المسح والقياسات والفحوصات التي أجريتها، فلن تحتاج لتكرار أي شيء.',
      ),
      chips: [contact],
    };
  if (it === 'report')
    return {
      text: X(
        'Your treatment report compares speed, signal and coverage before and after the fix.',
        'يقارن تقرير المعالجة السرعة والإشارة والتغطية قبل الإصلاح وبعده.',
      ),
      chips: [{ label: X('Open report', 'افتح التقرير'), go: 'report' }],
    };
  if (it === 'outage')
    return sk === 'network'
      ? {
          text: X(
            'I checked our network: there’s a fault at street cabinet 14B affecting 46 homes, including yours. Engineers expect it fixed by 18:00.',
            'فحصت شبكتنا: يوجد عطل في كابينة الشارع 14B يؤثر على 46 منزلًا من بينها منزلك. يتوقع المهندسون إصلاحه بحلول 18:00.',
          ),
          chips: [{ label: X('See network impact', 'عرض تأثير الشبكة'), go: 'impact' }, contact],
        }
      : {
          text: X(
            'No faults near you on our side. Let’s check your router — point your camera at it and I’ll highlight each light and cable.',
            'لا توجد أعطال قريبة منك من جهتنا. لنفحص الراوتر — وجّه الكاميرا نحوه وسأحدد كل ضوء وكابل.',
          ),
          chips: [{ label: X('Scan the router', 'امسح الراوتر'), go: 'scanDevice' }],
        };
  if (it === 'router')
    return {
      text: X(
        'Let’s look at it together. Point your camera at the router and I’ll highlight the power light, the internet light and the WAN cable one at a time.',
        'لننظر إليه معًا. وجّه الكاميرا نحو الراوتر وسأحدد ضوء الطاقة وضوء الإنترنت وكابل WAN واحدًا تلو الآخر.',
      ),
      chips: [{ label: X('Scan the router', 'امسح الراوتر'), go: 'scanDevice' }],
    };
  if (it === 'device')
    return {
      text: X(
        'Is it only that device, or are other devices slow in the same room too?',
        'هل المشكلة في ذلك الجهاز فقط، أم أن أجهزة أخرى بطيئة في الغرفة نفسها؟',
      ),
      chips: [
        { say: X('Only that device', 'ذلك الجهاز فقط'), intent: 'onlyDevice' },
        { say: X('Everything in that room', 'كل الأجهزة في تلك الغرفة'), intent: 'coverage' },
      ],
    };
  if (it === 'onlyDevice')
    return {
      text:
        sk === 'device'
          ? X(
              'Found it — the router shows your laptop on the slow 2.4 GHz band at 54 Mbps. Rejoining the 5 GHz network should fix it.',
              'وجدتها — يُظهر الراوتر أن حاسوبك على نطاق 2.4 GHz البطيء بسرعة 54 Mbps. إعادة الاتصال بشبكة 5 GHz ستحل المشكلة.',
            )
          : X(
              'The router shows it connected normally. Let’s check the connection details.',
              'يُظهر الراوتر أنه متصل بشكل طبيعي. لنتحقق من تفاصيل الاتصال.',
            ),
      chips: [{ label: X('See diagnosis', 'عرض التشخيص'), go: 'diagnosis' }],
    };
  if (it === 'coverage')
    return {
      text: X('Sounds like a coverage problem. Which room is worst?', 'يبدو أنها مشكلة تغطية. أي غرفة هي الأسوأ؟'),
      chips: ROOMS.map((r, i) => ({ say: r.n[lang], intent: 'room:' + i })),
    };
  return {
    text: X('Got it. Is the internet slow, dropping out, or not working at all?', 'فهمت. هل الإنترنت بطيء أم ينقطع أم لا يعمل إطلاقًا؟'),
    chips: [
      { say: X('Slow in some rooms', 'بطيء في بعض الغرف'), intent: 'coverage' },
      { say: X('Keeps dropping', 'ينقطع باستمرار'), intent: 'outage' },
      { say: X('Not working at all', 'لا يعمل إطلاقًا'), intent: 'outage' },
    ],
  };
}
