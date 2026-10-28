// Static data for Home Wi‑Fi Check — copied verbatim from the v7 design (Home WiFi Check v7.dc.html).
// Floor plan units are metres on a 10 × 8 m home; x grows east, y grows south.

export type Lang = 'en' | 'ar';
export type ScenarioKey = 'wifi' | 'device' | 'router' | 'network';
export type Impact = 'High' | 'Medium' | 'Low';
export type TagKind = 'M' | 'E' | 'A' | 'AC';
export type Place = 'current' | 'recommended' | 'extender';
export interface Room {
  id: string;
  n: Record<Lang, string>;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
}
export interface ScanObject {
  en: string;
  ar: string;
  impact: Impact;
  l: number;
  t: number;
  w: number;
  h: number;
  at: number;
}
export interface Scenario {
  label: string;
  wired: number;
  plan: number;
  lat: number;
  jit: number;
  loss: number;
  status: Record<Lang, string>;
  area: Record<Lang, string>;
  internet: string;
  after: string;
}
export interface Highlight {
  left: string;
  top: string;
  w: string;
  h: string;
  en: string;
  ar: string;
}

export const ROOMS: Room[] = [
  { id: 'living', n: { en: 'Living room', ar: 'غرفة المعيشة' }, x0: 0, y0: 0, x1: 6, y1: 4, cx: 3, cy: 2 },
  { id: 'kitchen', n: { en: 'Kitchen', ar: 'المطبخ' }, x0: 6, y0: 0, x1: 10, y1: 4, cx: 8, cy: 2 },
  { id: 'bedroom', n: { en: 'Bedroom', ar: 'غرفة النوم' }, x0: 0, y0: 4, x1: 5, y1: 8, cx: 2.5, cy: 6 },
  { id: 'office', n: { en: 'Office', ar: 'المكتب' }, x0: 5, y0: 4, x1: 10, y1: 8, cx: 7.5, cy: 6 },
];
export const INNER: [number, number, number, number][] = [
  [6, 0, 6, 1.6],
  [6, 2.6, 6, 4],
  [0, 4, 2, 4],
  [3, 4, 6.5, 4],
  [7.5, 4, 10, 4],
  [5, 4, 5, 8],
];
export const OUTER: [number, number, number, number][] = [
  [0, 0, 10, 0],
  [10, 0, 10, 8],
  [10, 8, 0, 8],
  [0, 8, 0, 0],
];
export const POS: Record<Place, { x: number; y: number }> = {
  current: { x: 0.5, y: 0.5 },
  recommended: { x: 5.5, y: 3.6 },
  extender: { x: 6.4, y: 4.8 },
};
export const IMPACT: Record<Impact, string> = { High: '#FF6B6F', Medium: '#F0C448', Low: '#C3D2EA' };
export const IMPACT_T: Record<Lang, Record<Impact, string>> = {
  en: { High: 'High', Medium: 'Medium', Low: 'Low' },
  ar: { High: 'تأثير عالٍ', Medium: 'تأثير متوسط', Low: 'تأثير منخفض' },
};
export const OBJECTS: Record<string, ScanObject[]> = {
  living: [
    { en: 'Router · in TV cabinet', ar: 'الراوتر · داخل خزانة التلفاز', impact: 'High', l: 10, t: 54, w: 30, h: 12, at: 12 },
    { en: 'TV wall', ar: 'جدار التلفاز', impact: 'Medium', l: 46, t: 22, w: 42, h: 22, at: 35 },
    { en: 'Mirror · reflective', ar: 'مرآة · عاكسة', impact: 'Medium', l: 64, t: 56, w: 24, h: 12, at: 58 },
    { en: 'Sofa', ar: 'أريكة', impact: 'Low', l: 16, t: 72, w: 46, h: 6, at: 80 },
  ],
  kitchen: [
    { en: 'Fridge · metal', ar: 'ثلاجة · معدنية', impact: 'High', l: 62, t: 26, w: 28, h: 38, at: 18 },
    { en: 'Microwave · 2.4 GHz', ar: 'ميكروويف · 2.4 GHz', impact: 'Medium', l: 10, t: 44, w: 28, h: 10, at: 44 },
    { en: 'Brick wall', ar: 'جدار طوب', impact: 'High', l: 24, t: 18, w: 30, h: 16, at: 70 },
  ],
  bedroom: [
    { en: 'Wardrobe', ar: 'خزانة ملابس', impact: 'Medium', l: 58, t: 22, w: 32, h: 42, at: 28 },
    { en: 'Plaster wall', ar: 'جدار جبس', impact: 'Low', l: 8, t: 22, w: 40, h: 24, at: 62 },
  ],
  office: [
    { en: 'Metal shelving', ar: 'رفوف معدنية', impact: 'Medium', l: 8, t: 22, w: 26, h: 42, at: 28 },
    { en: 'Desk + PC', ar: 'مكتب + حاسوب', impact: 'Low', l: 42, t: 56, w: 46, h: 12, at: 60 },
  ],
};
export const SCEN: Record<ScenarioKey, Scenario> = {
  wifi: {
    label: 'Room coverage',
    wired: 487,
    plan: 500,
    lat: 14,
    jit: 3,
    loss: 0,
    status: { en: 'Online · fw 6.2.1', ar: 'متصل · إصدار 6.2.1' },
    area: { en: 'No faults in your area', ar: 'لا أعطال في منطقتك' },
    internet: '#F4F6FA',
    after: '#F4F6FA',
  },
  device: {
    label: 'Device issue (laptop)',
    wired: 487,
    plan: 500,
    lat: 14,
    jit: 3,
    loss: 0,
    status: { en: 'Online · 6 devices', ar: 'متصل · 6 أجهزة' },
    area: { en: 'No faults in your area', ar: 'لا أعطال في منطقتك' },
    internet: '#F4F6FA',
    after: '#F4F6FA',
  },
  router: {
    label: 'Router fault',
    wired: 62,
    plan: 500,
    lat: 48,
    jit: 22,
    loss: 2.1,
    status: { en: '9 restarts in 24 h', ar: '9 إعادات تشغيل خلال 24 ساعة' },
    area: { en: 'No faults in your area', ar: 'لا أعطال في منطقتك' },
    internet: '#F2A33A',
    after: '#F4F6FA',
  },
  network: {
    label: 'Broadband network fault',
    wired: 38,
    plan: 500,
    lat: 96,
    jit: 41,
    loss: 6.4,
    status: { en: 'Online · line unstable', ar: 'متصل · الخط غير مستقر' },
    area: { en: 'Line errors · cabinet 14B', ar: 'أخطاء في الخط · الكابينة 14B' },
    internet: '#F2A33A',
    after: '#F2A33A',
  },
};
export const TAGC: Record<TagKind, [string, string]> = {
  M: ['#E3ECFD', '#1D4FBF'],
  E: ['#FFF1D6', '#8A5A00'],
  A: ['#E6E9F0', '#0B2545'],
  AC: ['#E6E9F0', '#0B2545'],
};
export const TAGT: Record<Lang, Record<TagKind, string>> = {
  en: { M: 'MEASURED', E: 'ESTIMATED', A: 'AI', AC: 'AI · CAMERA' },
  ar: { M: 'مُقاس', E: 'تقديري', A: 'ذكاء اصطناعي', AC: 'ذكاء · كاميرا' },
};
export const HL: Record<string, Highlight> = {
  device: { left: '30px', top: '40px', w: '240px', h: '106px', en: 'Your router', ar: 'الراوتر' },
  power: { left: '62px', top: '96px', w: '28px', h: '28px', en: 'Power light', ar: 'ضوء الطاقة' },
  wan: { left: '72px', top: '172px', w: '38px', h: '32px', en: 'WAN port', ar: 'منفذ WAN' },
  internet: { left: '122px', top: '96px', w: '28px', h: '28px', en: 'Internet light', ar: 'ضوء الإنترنت' },
  button: { left: '204px', top: '174px', w: '30px', h: '30px', en: 'Power button', ar: 'زر التشغيل' },
};
export const T_EN = {
  demoFeed: 'DEMO ROOM · CAMERA OFF',
  brand: 'Broadband support',
  exampleCov: 'EXAMPLE · ESTIMATED COVERAGE',
  welcomeH: 'Find out why your Wi‑Fi is slow.',
  w1: 'Scan each room with your camera',
  w2: 'See coverage in AR and a 3D model of your home',
  w3: 'Get a fix — or a support case with your results attached',
  whatScan: 'What do you want to scan?',
  scanRoom: 'Scan a room',
  scanRoomSub: 'Coverage & dead zones',
  scanDevice: 'Scan a device',
  scanDeviceSub: 'Router, cables, lights',
  back: '‹ Back',
  idH: 'Find your broadband service',
  idP: 'Enter the mobile number on your broadband account. We’ll load your plan, router and line status.',
  mobile: 'Mobile number',
  useDemoNum: 'Use demo number',
  lookingUp: 'Looking up your service…',
  found: '✓ Service found',
  fromISP: 'From ISP systems',
  idPrivacy: 'We only use your number to find this service. Nothing is shared.',
  notMe: 'Not me — use another number',
  camH: 'Allow camera access',
  camP: 'We use the camera to map your walls, furniture and router. Video stays on this phone — only the room outline and detected objects are used.',
  cam1: 'Processed on your device',
  cam2: 'No photos or video are saved',
  cam3: 'Turn it off any time in browser settings',
  camNoteB: 'The camera can’t measure Wi‑Fi.',
  camNote: 'Signal strength comes from your router and this phone, then we combine it with the room layout.',
  allowCam: 'Allow camera',
  useDemoRoom: 'Use a demo room instead',
  room: 'Room',
  device: 'Device',
  measPhone: 'MEASURED · PHONE',
  seeAR: 'See coverage in AR',
  current: 'Current',
  recommended: 'Recommended',
  estFrom4: 'ESTIMATED · FROM 4 MEASURED POINTS',
  strong: 'Strong',
  moderate: 'Moderate',
  weak: 'Weak',
  model3d: '3D model',
  home3d: 'Your home in 3D',
  enterVR: 'Enter VR',
  estHeat: 'ESTIMATED HEATMAP',
  pillars: 'Pillars = measured rooms · drag to orbit',
  weakDead: 'Weak or dead areas',
  seeDiag: 'See diagnosis',
  aiDiag: 'AI DIAGNOSIS',
  why: 'Why we think so',
  whatDo: 'What to do',
  backDiag: '‹ Diagnosis',
  aiAssess: 'AI ASSESSMENT',
  impactOut: 'Impact outside your home',
  etaLbl: 'Estimated fix time',
  recActions: 'Recommended actions',
  escalation: 'Escalation',
  recognised: 'Hub Pro 6 recognised · 94%',
  open: 'OPEN',
  attached: 'ATTACHED: line test · router logs · room map · checks you completed',
  backResult: '‹ Result',
  treat: 'TREATMENT REPORT',
  date: '27 Oct 2026 · 09:41',
  overall: 'Overall improvement',
  metric: 'METRIC',
  before: 'BEFORE',
  after: 'AFTER',
  change: 'CHANGE',
  issues: 'Issues identified',
  actionsTaken: 'Actions taken',
  share: 'Share report',
  done: 'Done',
  askAva: 'Ask Ava',
  ava: 'Ava',
  avaSub: 'AI assistant · sees your scan & results',
  thinking: 'Ava is thinking…',
  tagMeasured: 'MEASURED',
  ai: 'AI',
  arrow: '‹',
  switchLang: 'العربية',
  stepMeasure: 'STEP 6 OF 13',
};
export const T_AR: Strings = {
  demoFeed: 'غرفة تجريبية · الكاميرا مغلقة',
  brand: 'دعم النطاق العريض',
  exampleCov: 'مثال · تغطية تقديرية',
  welcomeH: 'اكتشف سبب بطء Wi‑Fi لديك.',
  w1: 'امسح كل غرفة بكاميرا هاتفك',
  w2: 'شاهد التغطية بالواقع المعزز ونموذجًا ثلاثي الأبعاد لمنزلك',
  w3: 'احصل على حل — أو بلاغ دعم مرفق به نتائجك',
  whatScan: 'ماذا تريد أن تمسح؟',
  scanRoom: 'مسح غرفة',
  scanRoomSub: 'التغطية والمناطق الميتة',
  scanDevice: 'مسح جهاز',
  scanDeviceSub: 'الراوتر والكابلات والأضواء',
  back: '› رجوع',
  idH: 'ابحث عن خدمة النطاق العريض',
  idP: 'أدخل رقم الجوال المسجل في حساب النطاق العريض. سنعرض باقتك والراوتر وحالة الخط.',
  mobile: 'رقم الجوال',
  useDemoNum: 'استخدم رقمًا تجريبيًا',
  lookingUp: 'جارٍ البحث عن خدمتك…',
  found: '✓ تم العثور على الخدمة',
  fromISP: 'من أنظمة مزود الخدمة',
  idPrivacy: 'نستخدم رقمك فقط للعثور على هذه الخدمة. لا تتم مشاركة أي شيء.',
  notMe: 'ليس أنا — استخدم رقمًا آخر',
  camH: 'السماح بالوصول إلى الكاميرا',
  camP: 'نستخدم الكاميرا لرسم الجدران والأثاث وموقع الراوتر. يبقى الفيديو على هاتفك — نستخدم فقط مخطط الغرفة والعناصر المكتشفة.',
  cam1: 'تتم المعالجة على جهازك',
  cam2: 'لا يتم حفظ أي صور أو فيديو',
  cam3: 'يمكنك إيقافها في أي وقت من إعدادات المتصفح',
  camNoteB: 'الكاميرا لا تقيس قوة Wi‑Fi.',
  camNote: 'تأتي قوة الإشارة من الراوتر وهذا الهاتف، ثم ندمجها مع مخطط الغرفة.',
  allowCam: 'السماح بالكاميرا',
  useDemoRoom: 'استخدم غرفة تجريبية بدلًا من ذلك',
  room: 'غرفة',
  device: 'جهاز',
  measPhone: 'مُقاس · الهاتف',
  seeAR: 'شاهد التغطية بالواقع المعزز',
  current: 'الحالي',
  recommended: 'المقترح',
  estFrom4: 'تقديري · من 4 نقاط مُقاسة',
  strong: 'قوية',
  moderate: 'متوسطة',
  weak: 'ضعيفة',
  model3d: 'نموذج ثلاثي الأبعاد',
  home3d: 'منزلك بالأبعاد الثلاثية',
  enterVR: 'دخول VR',
  estHeat: 'خريطة حرارية تقديرية',
  pillars: 'الأعمدة = غرف مُقاسة · اسحب للتدوير',
  weakDead: 'مناطق ضعيفة أو ميتة',
  seeDiag: 'عرض التشخيص',
  aiDiag: 'تشخيص بالذكاء الاصطناعي',
  why: 'لماذا نعتقد ذلك',
  whatDo: 'ماذا تفعل',
  backDiag: '› التشخيص',
  aiAssess: 'تقييم الذكاء الاصطناعي',
  impactOut: 'التأثير خارج منزلك',
  etaLbl: 'الوقت المتوقع للإصلاح',
  recActions: 'الإجراءات الموصى بها',
  escalation: 'التصعيد',
  recognised: 'تم التعرف على Hub Pro 6 · 94%',
  open: 'مفتوح',
  attached: 'مرفق: اختبار الخط · سجلات الراوتر · خريطة الغرف · الفحوصات التي أجريتها',
  backResult: '› النتيجة',
  treat: 'تقرير المعالجة',
  date: '27 أكتوبر 2026 · 09:41',
  overall: 'التحسن الإجمالي',
  metric: 'المؤشر',
  before: 'قبل',
  after: 'بعد',
  change: 'التغيّر',
  issues: 'المشكلات المكتشفة',
  actionsTaken: 'الإجراءات المتخذة',
  share: 'مشاركة التقرير',
  done: 'تم',
  askAva: 'اسأل آفا',
  ava: 'آفا',
  avaSub: 'مساعدة ذكية · ترى المسح والنتائج',
  thinking: 'آفا تفكر…',
  tagMeasured: 'مُقاس',
  ai: 'ذكاء',
  arrow: '›',
  switchLang: 'English',
  stepMeasure: 'الخطوة 6 من 13',
};

export type Strings = typeof T_EN;

// Prototype navigator (left column). Kept in English — it is demo chrome, not part of the customer app.
export const SCREENS = [
  'host',
  'lang',
  'welcome',
  'identify',
  'permission',
  'scan',
  'measure',
  'ar',
  'model',
  'diagnosis',
  'impact',
  'guide',
  'outcome',
  'report',
] as const;
export type Screen = (typeof SCREENS)[number];
export const LABELS = [
  'Main app',
  'Language',
  'Start',
  'Your service',
  'Camera access',
  'Scan rooms',
  'Measure connection',
  'AR coverage',
  '3D / VR model',
  'AI diagnosis',
  'Network impact',
  'Guided check',
  'Result',
  'Treatment report',
];
