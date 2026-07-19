import {
  CORPUS_CURRENCY,
  CORPUS_DISCLAIMER,
  type CorpusDocument,
  type RequirementUnit,
  corpusDocumentSchema,
  parseCorpus,
} from '@/lib/corpus';
import law26 from '@/data/corpus/law-26-2007.json';
import decree43 from '@/data/corpus/decree-43-2013.json';
import tenancyDocs from '@/data/corpus/documents.json';
import einvoicingUnits from '@/data/corpus/einvoicing/units.json';
import einvoicingDocs from '@/data/corpus/einvoicing/documents.json';

/**
 * The corpus registry. Each corpus is a self-contained set of requirement
 * units plus the metadata the app needs to answer, audit, and render against
 * it. Adding a corpus is one entry here; the engines and UI read from this.
 */
export interface Corpus {
  id: string;
  name: string;
  nameAr: string;
  shortName: string;
  shortNameAr: string;
  blurb: string;
  /** Named in the model's system prompts to scope answers and audits. */
  scopeForPrompt: string;
  documents: CorpusDocument[];
  units: RequirementUnit[];
  disclaimer: { en: string; ar?: string };
  currencyNote?: string;
  currencyNoteAr?: string;
  bilingual: boolean;
}

const dubaiTenancy: Corpus = {
  id: 'dubai-tenancy',
  name: 'Dubai tenancy law',
  nameAr: 'قانون إيجارات دبي',
  shortName: 'Dubai tenancy',
  shortNameAr: 'إيجارات دبي',
  blurb:
    'Law No. (26) of 2007 as amended by Law No. (33) of 2008, and Decree No. (43) of 2013 on rent increases.',
  scopeForPrompt:
    'Dubai tenancy law: Law No. (26) of 2007 regulating the relationship between landlords and tenants in Dubai (as amended by Law No. (33) of 2008) and Decree No. (43) of 2013 on rent increases',
  documents: tenancyDocs.map(d => corpusDocumentSchema.parse(d)),
  units: [...parseCorpus(law26), ...parseCorpus(decree43)],
  disclaimer: CORPUS_DISCLAIMER,
  currencyNote: CORPUS_CURRENCY.note,
  currencyNoteAr: CORPUS_CURRENCY.noteAr,
  bilingual: true,
};

const uaeEinvoicing: Corpus = {
  id: 'uae-einvoicing',
  name: 'UAE eInvoicing mandate',
  nameAr: 'تفويض الفوترة الإلكترونية في الإمارات',
  shortName: 'UAE eInvoicing',
  shortNameAr: 'الفوترة الإلكترونية',
  blurb:
    'Ministerial Decisions 243 and 244 of 2025, the mandatory invoice fields, and Cabinet Decision 106 of 2025 on penalties.',
  scopeForPrompt:
    'the UAE eInvoicing mandate: Ministerial Decision No. (243) of 2025 on the Electronic Invoicing System, Ministerial Decision No. (244) of 2025 on its implementation, the Ministry of Finance mandatory invoice fields, and Cabinet Decision No. (106) of 2025 on administrative penalties',
  documents: einvoicingDocs.map(d => corpusDocumentSchema.parse(d)),
  units: parseCorpus(einvoicingUnits),
  disclaimer: {
    en: 'Unofficial reproduction for demonstration purposes, not legal advice. Source: UAE Ministry of Finance and Federal Tax Authority. Verify against the official texts before relying on it.',
    ar: 'استنساخ غير رسمي لأغراض العرض فقط وليس استشارة قانونية أو ضريبية. المصدر: وزارة المالية والهيئة الاتحادية للضرائب في الإمارات. النص العربي هنا ترجمة غير رسمية؛ تحقق من النصوص الرسمية قبل الاعتماد عليها.',
  },
  currencyNote:
    'As of July 2026: the eInvoicing pilot and voluntary phase open 1 July 2026; businesses with revenue at or above AED 50 million must appoint an Accredited Service Provider by 30 October 2026 and go live 1 January 2027; other businesses go live 1 July 2027; government entities 1 October 2027. B2C transactions are excluded until a future decision.',
  currencyNoteAr:
    'كما في يوليو 2026: يبدأ البرنامج التجريبي والمرحلة الطوعية للفوترة الإلكترونية في 1 يوليو 2026؛ وعلى المنشآت التي تبلغ إيراداتها 50 مليون درهم أو أكثر تعيين مزود خدمة معتمد بحلول 30 أكتوبر 2026 وبدء التشغيل في 1 يناير 2027؛ وتبدأ بقية المنشآت في 1 يوليو 2027، والجهات الحكومية في 1 أكتوبر 2027. وتظل معاملات الأعمال مع المستهلكين مستثناة إلى حين صدور قرار لاحق.',
  bilingual: false,
};

const CORPORA: Record<string, Corpus> = {
  [dubaiTenancy.id]: dubaiTenancy,
  [uaeEinvoicing.id]: uaeEinvoicing,
};

export const DEFAULT_CORPUS_ID = dubaiTenancy.id;

export const CORPUS_LIST: Corpus[] = Object.values(CORPORA);

export function getCorpus(id: string | undefined): Corpus {
  return (id && CORPORA[id]) || dubaiTenancy;
}

export function isCorpusId(id: string): boolean {
  return id in CORPORA;
}

/** All units across every corpus, for id lookups. */
export function allUnits(): RequirementUnit[] {
  return CORPUS_LIST.flatMap(c => c.units);
}
