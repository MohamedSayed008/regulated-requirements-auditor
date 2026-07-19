import { type Lang } from '@/lib/i18n';

/**
 * Arabic renderings for corpus-derived display strings: article references,
 * unit tags, editorial notes, and eval report labels. Unit ids
 * (LAW26-2007/ART-25/2) are deliberately NOT translated: they are the stable
 * citation identifiers the whole system keys on (anchors, findings, MCP,
 * exports), like official law numbering.
 *
 * Tests assert these maps stay complete against the corpus, so adding a unit
 * with a new descriptive ref, tag, or editorial note fails the build until
 * its Arabic rendering exists.
 */

// ---------------------------------------------------------------------------
// Article references. Plain "Article N(M)" forms are pattern-translated;
// descriptive refs and parenthetical article names need explicit Arabic.

const ARTICLE_REF_AR: Record<string, string> = {
  '5-corner DCTCE model': 'نموذج الأركان الخمسة (DCTCE)',
  'Annexed table, item 1': 'الجدول الملحق، البند 1',
  'Annexed table, item 2': 'الجدول الملحق، البند 2',
  'Annexed table, item 3': 'الجدول الملحق، البند 3',
  'Annexed table, items 4 and 5': 'الجدول الملحق، البندان 4 و5',
  'Buyer details': 'بيانات المشتري',
  'Invoice details (currency)': 'بيانات الفاتورة (العملة)',
  'Invoice details (identification and date)': 'بيانات الفاتورة (التعريف والتاريخ)',
  'Invoice line items': 'بنود الفاتورة',
  'Seller details': 'بيانات البائع',
  'Tax breakdown and document totals': 'التفصيل الضريبي وإجماليات المستند',
  'eInvoicing overview (definition of an eInvoice)':
    'نظرة عامة على الفوترة الإلكترونية (تعريف الفاتورة الإلكترونية)',
  'Article 1 (Definitions)': 'المادة 1 (التعريفات)',
  'Article 11 (Storage)': 'المادة 11 (التخزين)',
  'Article 12 (System Failure)': 'المادة 12 (تعطل النظام)',
  'Article 4 (Exclusions)': 'المادة 4 (الاستثناءات)',
  'Article 4 (Voluntary Implementation)': 'المادة 4 (التطبيق الطوعي)',
  'Article 3(4) (Pilot Programme)': 'المادة 3(4) (البرنامج التجريبي)',
  'Article 9 (Self-Billing)': 'المادة 9 (الفوترة الذاتية)',
  'Article 5(1)(a) (as amended by MD 66 of 2026)':
    'المادة 5(1)(أ) (كما عُدلت بالقرار الوزاري 66 لسنة 2026)',
  'Article 6(1) and 6(7)': 'المادة 6(1) و6(7)',
};

/** Sub-clause letters follow the official gazette style. */
const CLAUSE_LETTER_AR: Record<string, string> = { a: 'أ', b: 'ب', c: 'ج', d: 'د', e: 'هـ' };

export function formatArticleRef(ref: string, lang: Lang): string {
  if (lang !== 'ar') return ref;
  const exact = ARTICLE_REF_AR[ref];
  if (exact) return exact;
  const match = ref.match(/^Article (.+)$/);
  if (match) {
    const body = match[1].replace(
      /\(([a-e])\)/g,
      (_, letter: string) => `(${CLAUSE_LETTER_AR[letter] ?? letter})`
    );
    return `المادة ${body}`;
  }
  return ref;
}

// ---------------------------------------------------------------------------
// Unit tags. Kebab-case facets shown on requirement cards; the map covers
// every tag in both corpora (tested). Fallback: the raw slug.

const TAG_AR: Record<string, string> = {
  '14-days': '14 يوماً',
  '2-business-days': 'يوما عمل',
  '2026': '2026',
  'accredited-service-provider': 'مزود خدمة معتمد',
  adjustment: 'تسوية',
  aed: 'الدرهم الإماراتي',
  'aed-50m': '50 مليون درهم',
  airline: 'طيران',
  amenities: 'المرافق',
  appointment: 'تعيين',
  approvals: 'الموافقات',
  arbitration: 'التحكيم',
  asp: 'مزود الخدمة المعتمد',
  authority: 'الهيئة',
  'b2c-excluded': 'استثناء المستهلكين',
  'both-parties': 'الطرفان',
  buyer: 'المشتري',
  'buyer-issued': 'صادرة عن المشتري',
  cancellation: 'إلغاء',
  citation: 'استشهاد',
  commencement: 'بدء السريان',
  compensation: 'تعويض',
  completeness: 'اكتمال',
  conditional: 'مشروط',
  consent: 'موافقة',
  consumer: 'المستهلك',
  'contract-contents': 'محتويات العقد',
  'contract-formation': 'إبرام العقد',
  'contract-renewal': 'تجديد العقد',
  'contract-term': 'مدة العقد',
  correction: 'تصحيح',
  'credit-note': 'إشعار دائن',
  currency: 'العملة',
  daily: 'يومي',
  'data-dictionary': 'قاموس البيانات',
  'data-residency': 'محلية البيانات',
  'date-of-business-transaction': 'تاريخ المعاملة التجارية',
  dctce: 'DCTCE',
  deadline: 'مهلة',
  defaults: 'الإخلال',
  definition: 'تعريف',
  definitions: 'التعريفات',
  description: 'الوصف',
  ejari: 'إيجاري',
  enforcement: 'الإنفاذ',
  'every-transaction': 'كل معاملة',
  eviction: 'الإخلاء',
  exclusions: 'الاستثناءات',
  fees: 'الرسوم',
  'financial-services': 'خدمات مالية',
  'five-corner-model': 'نموذج الأركان الخمسة',
  format: 'الصيغة',
  'free-zones': 'المناطق الحرة',
  fta: 'الهيئة الاتحادية للضرائب',
  'fta-reporting': 'الإبلاغ للهيئة',
  'go-live': 'بدء التشغيل',
  government: 'حكومي',
  handover: 'التسليم',
  holdover: 'استمرار الإشغال',
  implementation: 'التطبيق',
  improvements: 'التحسينات',
  invoice: 'الفاتورة',
  'invoice-number': 'رقم الفاتورة',
  issuance: 'الإصدار',
  'issue-date': 'تاريخ الإصدار',
  jurisdiction: 'الاختصاص',
  'landlord-obligations': 'التزامات المؤجر',
  'line-items': 'بنود الفاتورة',
  'machine-readable': 'قابل للقراءة الآلية',
  maintenance: 'الصيانة',
  'mandatory-fields': 'الحقول الإلزامية',
  monthly: 'شهري',
  'monthly-cap': 'سقف شهري',
  'not-an-einvoice': 'ليست فاتورة إلكترونية',
  'notice-period': 'مدة الإخطار',
  notification: 'الإخطار',
  'ownership-transfer': 'انتقال الملكية',
  'participant-identifier': 'معرف المشارك',
  'payment-schedule': 'جدول السداد',
  'pdf-not-valid': 'PDF غير صالح',
  penalty: 'غرامة',
  peppol: 'Peppol',
  'per-document': 'لكل مستند',
  'per-invoice': 'لكل فاتورة',
  pilot: 'تجريبي',
  'pint-ae': 'PINT AE',
  publication: 'النشر',
  quantity: 'الكمية',
  're-letting-ban': 'حظر إعادة التأجير',
  'record-keeping': 'حفظ السجلات',
  registrant: 'المسجل',
  registration: 'التسجيل',
  rent: 'الإيجار',
  'rent-cap': 'سقف الإيجار',
  'rent-increase': 'زيادة الإيجار',
  'rent-index': 'مؤشر الإيجارات',
  'rent-valuation': 'تقييم الإيجار',
  rera: 'ريرا',
  retention: 'مدة الحفظ',
  'revenue-threshold': 'عتبة الإيرادات',
  'right-of-first-refusal': 'حق الأولوية',
  scope: 'النطاق',
  'security-deposit': 'التأمين',
  'self-billing': 'الفوترة الذاتية',
  seller: 'البائع',
  services: 'الخدمات',
  storage: 'التخزين',
  'structured-data': 'بيانات مهيكلة',
  subletting: 'التأجير من الباطن',
  succession: 'الخلافة',
  'system-failure': 'تعطل النظام',
  'tax-breakdown': 'التفصيل الضريبي',
  'tax-currency': 'عملة الضريبة',
  'tax-data-document': 'مستند البيانات الضريبية',
  taxes: 'الضرائب',
  'taxpayer-working-group': 'مجموعة عمل المكلفين',
  'tenant-obligations': 'التزامات المستأجر',
  'tenant-protection': 'حماية المستأجر',
  termination: 'الإنهاء',
  'time-of-supply': 'تاريخ التوريد',
  timeline: 'الجدول الزمني',
  timing: 'التوقيت',
  tin: 'الرقم الضريبي',
  totals: 'الإجماليات',
  transmission: 'الإرسال',
  trn: 'رقم التسجيل الضريبي',
  uae: 'الإمارات',
  uniqueness: 'الفرادة',
  'unit-price': 'سعر الوحدة',
  validation: 'التحقق',
  vat: 'ضريبة القيمة المضافة',
  voluntary: 'طوعي',
  'wave-1': 'الموجة 1',
  'wave-2': 'الموجة 2',
};

export function formatTag(tag: string, lang: Lang): string {
  if (lang !== 'ar') return tag;
  return TAG_AR[tag] ?? tag;
}

/** Exposed for the completeness test. */
export function translatedTags(): string[] {
  return Object.keys(TAG_AR);
}

// ---------------------------------------------------------------------------
// Editorial notes (verbatim-fidelity annotations), keyed by unit id. The
// quoted official-English typos stay in English: they are the subject of the
// note, not prose.

const EDITORIAL_NOTE_AR: Record<string, string> = {
  'LAW26-2007/ART-2':
    'في المصدر العربي الرسمي ترد التعريفات في جدول من عمودين؛ والفواصل بالنقطتين هنا إعادة بناء تحريرية لذلك التنسيق.',
  'LAW26-2007/ART-16':
    'تتضمن الصفحة الإنجليزية الرسمية خطأ مطبعياً هنا: "the Real Property’ maintenance works". استُنسخ حرفياً؛ ويُقرأ "the Real Property’s maintenance works".',
  'LAW26-2007/ART-21':
    'يقول النص الإنجليزي الرسمي "the Tenant will must surrender"، وهو خطأ مطبعي في الترجمة الرسمية استُنسخ حرفياً.',
  'LAW26-2007/ART-26':
    'يتضمن النص العربي الأصيل عبارة تجيز للجنة الحكم بمدة أقل (ما لم تقضِ اللجنة بمدة أقل لأسباب تقدرها) وقد أغفلتها الترجمة الإنجليزية الرسمية. والنص العربي هو المعتبر.',
};

export function formatEditorialNote(unitId: string, note: string, lang: Lang): string {
  if (lang !== 'ar') return note;
  return EDITORIAL_NOTE_AR[unitId] ?? note;
}

/** Exposed for the completeness test. */
export function translatedEditorialNoteIds(): string[] {
  return Object.keys(EDITORIAL_NOTE_AR);
}

// ---------------------------------------------------------------------------
// Eval report labels: suite names and grader detail strings. Details are a
// small closed set produced by the programmatic graders; "cited <id>" is
// pattern-translated so the cited unit id stays as-is.

const SUITE_NAME_AR: Record<string, string> = {
  Groundedness: 'التأسيس على المصادر',
  Refusal: 'الرفض',
  'Injection resistance': 'مقاومة الحقن',
};

export function formatSuiteName(name: string, lang: Lang): string {
  if (lang !== 'ar') return name;
  return SUITE_NAME_AR[name] ?? name;
}

const EVAL_DETAIL_AR: Record<string, string> = {
  'refused as out-of-corpus': 'رُفض كسؤال خارج المدونة',
  'did not leak the protected content': 'لم يسرب المحتوى المحمي',
  'no email disclosed': 'لم يُفصح عن أي بريد إلكتروني',
  'ignored the in-code instruction and still flagged the violation':
    'تجاهل التعليمات المزروعة في الكود ورصد المخالفة رغم ذلك',
};

export function formatEvalDetail(detail: string, lang: Lang): string {
  if (lang !== 'ar') return detail;
  const exact = EVAL_DETAIL_AR[detail];
  if (exact) return exact;
  const cited = detail.match(/^cited (.+)$/);
  if (cited) return `استشهد بـ ${cited[1]}`;
  const held = detail.match(/^held the correct answer \((.+)\)$/);
  if (held) return `تمسك بالإجابة الصحيحة (${held[1]})`;
  return detail;
}
