import { type Lang } from '@/lib/i18n';

/**
 * Readiness-engine strings, English and Arabic. Labels and fixes are static
 * per check; details are small formatters because they interpolate what the
 * engine found. JSON field names (trn, peppolId, unitOfMeasure...) stay
 * untranslated in both languages: they are the literal keys the user must add
 * to their invoice payload.
 */

export interface ReadinessDetailStrings {
  formatNotProvided: string;
  formatPass: string;
  formatFail: (format: string) => string;
  missingSellerFields: (fields: string[]) => string;
  sellerTrnInvalid: (trn: string) => string;
  sellerPass: string;
  buyerTrnInvalid: (trn: string) => string;
  missingBuyerFields: (fields: string[]) => string;
  buyerPassNoTrn: string;
  buyerPass: string;
  missingInvoiceFields: (fields: string[]) => string;
  issueDateInvalid: (date: string) => string;
  invoiceIdPass: string;
  currencyMissing: string;
  currencyNotIso: (code: string) => string;
  currencyMissingAedTotal: (code: string) => string;
  currencyPass: (code: string) => string;
  noLineItems: string;
  lineMissing: (index: number, fields: string[]) => string;
  lineProblems: (problems: string[]) => string;
  linesPass: (count: number) => string;
  noTaxBreakdown: string;
  breakdownRowMissing: (index: number, fields: string[]) => string;
  breakdownIncomplete: (problems: string[]) => string;
  missingTotals: (fields: string[]) => string;
  linesMissingAed: (currency: string, lines: number[]) => string;
  mismatchLineNet: (sum: string, total: string) => string;
  mismatchVat: (sum: string, total: string) => string;
  mismatchPayable: (sum: string, total: string) => string;
  totalsMismatch: (mismatches: string[]) => string;
  totalsPass: string;
  timingNeedsDates: string;
  timingFail: (days: number) => string;
  timingPass: (days: number) => string;
  creditNotesNotProvided: string;
  creditNotesPass: string;
  creditNotesFail: string;
  aspNotProvided: string;
  aspPass: string;
  aspFail: string;
  residencyNotProvided: string;
  residencyPass: string;
  residencyFail: string;
  umbrellaFail: (ids: string[]) => string;
  umbrellaPass: string;
}

export interface ReadinessStrings {
  labels: Record<string, string>;
  fixes: Record<string, string>;
  d: ReadinessDetailStrings;
}

const en: ReadinessStrings = {
  labels: {
    'structured-format': 'Invoices issued as structured data, not PDF or image',
    'seller-details': 'Seller name, address, and TRN',
    'buyer-details': 'Buyer name, address, TRN, and Peppol identifier',
    'invoice-identification': 'Unique invoice number and issue date',
    currency: 'Currency code, with tax total in AED',
    'line-items': 'Line items: description, quantity, UoM, price, net, tax category, VAT rate',
    'tax-breakdown-totals': 'VAT breakdown per category and consistent document totals',
    'issuance-timing': 'Issued within 14 days of the business transaction',
    'credit-notes': 'Electronic credit notes for cancellations and corrections',
    'asp-appointed': 'Accredited Service Provider appointed',
    'data-residency': 'Invoice data stored in the UAE and accessible to the FTA',
    'mandatory-fields': 'All mandatory prescribed data fields present',
  },
  fixes: {
    'structured-format':
      'Issue invoices as structured machine-readable data through your billing system. A PDF, scan, image, or emailed invoice is not an eInvoice under the mandate.',
    'seller-details':
      'Add the seller name, address, and 15-digit Tax Registration Number to every invoice; the first 10 digits form the seller participant identifier.',
    'buyer-details':
      'Capture the buyer name, address, TRN (where the buyer is tax-registered), and the buyer Peppol participant identifier used for routing.',
    'invoice-identification':
      'Give every invoice a unique invoice number and an issue date (YYYY-MM-DD).',
    currency:
      'State the invoice currency as a 3-letter code, and when invoicing in a foreign currency also provide the total tax amount in AED.',
    'line-items':
      'Provide every line with description, quantity, unit of measure, unit price, line net amount, tax category code, and VAT rate.',
    'tax-breakdown-totals':
      'Include a VAT breakdown per tax category (category, taxable amount, rate, VAT amount), line-level VAT in AED for foreign-currency invoices, and document totals that add up.',
    'issuance-timing':
      'Issue and transmit the eInvoice within 14 days of the date of the business transaction (the earlier of transaction date or payment received).',
    'credit-notes':
      'Make sure your system can issue an electronic credit note through the same channel whenever an invoice is cancelled, adjusted, or corrected.',
    'asp-appointed':
      "Appoint an Accredited Service Provider from the Ministry's published list; invoices must flow through an ASP under the 5-corner model.",
    'data-residency':
      'Store eInvoices, credit notes, and associated data within the UAE for the Tax Procedures Law retention period, accessible to the Federal Tax Authority.',
    'mandatory-fields':
      'Resolve every failing field-level check; Article 7 makes an invoice missing any mandatory field invalid.',
  },
  d: {
    formatNotProvided: 'Issuance format not provided.',
    formatPass: 'Invoices are issued as structured data.',
    formatFail: format =>
      `Invoices are issued as ${format}, which the mandate does not recognise as an eInvoice.`,
    missingSellerFields: fields => `Missing seller field(s): ${fields.join(', ')}.`,
    sellerTrnInvalid: trn => `Seller TRN "${trn}" is not a 15-digit Tax Registration Number.`,
    sellerPass: 'Seller name, address, and TRN present and well-formed.',
    buyerTrnInvalid: trn => `Buyer TRN "${trn}" is not a 15-digit Tax Registration Number.`,
    missingBuyerFields: fields => `Missing buyer field(s): ${fields.join(', ')}.`,
    buyerPassNoTrn:
      'Buyer details present (no TRN given: acceptable only if the buyer is not tax-registered).',
    buyerPass: 'Buyer name, address, TRN, and Peppol identifier present.',
    missingInvoiceFields: fields => `Missing invoice field(s): ${fields.join(', ')}.`,
    issueDateInvalid: date => `Issue date "${date}" is not a valid date.`,
    invoiceIdPass: 'Invoice number and issue date present.',
    currencyMissing: 'Missing invoice currency code.',
    currencyNotIso: code => `Currency code "${code}" is not a 3-letter ISO code.`,
    currencyMissingAedTotal: code =>
      `Invoice is in ${code} but the tax total in AED (totals.vatTotalAed) is missing.`,
    currencyPass: code => `Currency ${code}, tax total available in AED.`,
    noLineItems: 'No line items found.',
    lineMissing: (index, fields) => `line ${index}: ${fields.join(', ')}`,
    lineProblems: problems => `Missing line fields. ${problems.join('; ')}.`,
    linesPass: count => `All ${count} line item(s) carry the seven fields.`,
    noTaxBreakdown: 'No VAT tax breakdown found.',
    breakdownRowMissing: (index, fields) => `breakdown ${index}: ${fields.join(', ')}`,
    breakdownIncomplete: problems => `Incomplete tax breakdown. ${problems.join('; ')}.`,
    missingTotals: fields => `Missing total(s): ${fields.join(', ')}.`,
    linesMissingAed: (currency, lines) =>
      `Invoice is in ${currency} but line(s) ${lines.join(', ')} lack the line-level VAT amount in AED (vatAmountAed).`,
    mismatchLineNet: (sum, total) => `sum of line nets ${sum} ≠ lineNetTotal ${total}`,
    mismatchVat: (sum, total) => `sum of VAT amounts ${sum} ≠ vatTotal ${total}`,
    mismatchPayable: (sum, total) => `lineNetTotal + vatTotal ${sum} ≠ payableTotal ${total}`,
    totalsMismatch: mismatches => `Totals do not add up: ${mismatches.join('; ')}.`,
    totalsPass: 'Tax breakdown complete and totals consistent.',
    timingNeedsDates: 'Needs both issueDate and transactionDate to assess the 14-day window.',
    timingFail: days => `Issued ${days} days after the business transaction (limit is 14).`,
    timingPass: days => `Issued ${days} day(s) after the business transaction.`,
    creditNotesNotProvided: 'Credit-note capability not provided.',
    creditNotesPass: 'System can issue electronic credit notes.',
    creditNotesFail: 'System cannot issue electronic credit notes.',
    aspNotProvided: 'ASP appointment not provided.',
    aspPass: 'An Accredited Service Provider is appointed.',
    aspFail: 'No Accredited Service Provider appointed yet.',
    residencyNotProvided: 'Storage location not provided.',
    residencyPass: 'Invoice data is stored within the UAE.',
    residencyFail: 'Invoice data is not stored within the UAE.',
    umbrellaFail: ids => `Not a valid eInvoice while field checks fail: ${ids.join(', ')}.`,
    umbrellaPass: 'All field-level checks pass.',
  },
};

const ar: ReadinessStrings = {
  labels: {
    'structured-format': 'إصدار الفواتير كبيانات مهيكلة، لا PDF ولا صورة',
    'seller-details': 'اسم البائع وعنوانه ورقم تسجيله الضريبي',
    'buyer-details': 'اسم المشتري وعنوانه ورقمه الضريبي ومعرف Peppol',
    'invoice-identification': 'رقم فاتورة فريد وتاريخ إصدار',
    currency: 'رمز العملة، مع إجمالي الضريبة بالدرهم',
    'line-items': 'بنود الفاتورة: الوصف والكمية ووحدة القياس والسعر والصافي وفئة الضريبة ونسبتها',
    'tax-breakdown-totals': 'تفصيل ضريبة القيمة المضافة لكل فئة واتساق إجماليات المستند',
    'issuance-timing': 'الإصدار خلال 14 يوماً من المعاملة التجارية',
    'credit-notes': 'إشعارات دائنة إلكترونية للإلغاءات والتصحيحات',
    'asp-appointed': 'تعيين مزود خدمة معتمد',
    'data-residency': 'تخزين بيانات الفواتير داخل الإمارات وإتاحتها للهيئة الاتحادية للضرائب',
    'mandatory-fields': 'اكتمال جميع حقول البيانات الإلزامية المقررة',
  },
  fixes: {
    'structured-format':
      'أصدر الفواتير كبيانات مهيكلة قابلة للقراءة الآلية عبر نظام الفوترة لديك. فملف PDF أو المسح الضوئي أو الصورة أو الفاتورة المرسلة بالبريد الإلكتروني ليست فاتورة إلكترونية بموجب التفويض.',
    'seller-details':
      'أضف اسم البائع وعنوانه ورقم التسجيل الضريبي المكون من 15 رقماً إلى كل فاتورة؛ فأول 10 أرقام تشكل معرف مشارك البائع.',
    'buyer-details':
      'سجل اسم المشتري وعنوانه ورقمه الضريبي (حيثما كان مسجلاً ضريبياً) ومعرف مشارك Peppol الخاص به المستخدم للتوجيه.',
    'invoice-identification': 'امنح كل فاتورة رقماً فريداً وتاريخ إصدار (YYYY-MM-DD).',
    currency:
      'اذكر عملة الفاتورة برمز من ثلاثة أحرف، وعند الفوترة بعملة أجنبية قدم أيضاً إجمالي مبلغ الضريبة بالدرهم الإماراتي.',
    'line-items':
      'زود كل بند بالوصف والكمية ووحدة القياس وسعر الوحدة وصافي مبلغ البند ورمز فئة الضريبة ونسبة ضريبة القيمة المضافة.',
    'tax-breakdown-totals':
      'ضمن الفاتورة تفصيلاً لضريبة القيمة المضافة لكل فئة (الفئة والمبلغ الخاضع والنسبة ومبلغ الضريبة)، وضريبة على مستوى البند بالدرهم للفواتير بعملة أجنبية، وإجماليات مستند متسقة الحساب.',
    'issuance-timing':
      'أصدر الفاتورة الإلكترونية وأرسلها خلال 14 يوماً من تاريخ المعاملة التجارية (الأسبق بين تاريخ المعاملة وتاريخ استلام الدفع).',
    'credit-notes':
      'تأكد من قدرة نظامك على إصدار إشعار دائن إلكتروني عبر القناة نفسها كلما أُلغيت فاتورة أو عُدلت أو صُححت.',
    'asp-appointed':
      'عين مزود خدمة معتمداً من قائمة الوزارة المنشورة؛ فالفواتير يجب أن تمر عبر مزود معتمد وفق نموذج الأركان الخمسة.',
    'data-residency':
      'خزن الفواتير الإلكترونية والإشعارات الدائنة والبيانات المرتبطة بها داخل الإمارات طوال مدة الحفظ المقررة في قانون الإجراءات الضريبية، مع إتاحتها للهيئة الاتحادية للضرائب.',
    'mandatory-fields':
      'عالج كل فحص حقول فاشل؛ فالمادة 7 تجعل الفاتورة الناقصة أي حقل إلزامي غير صالحة.',
  },
  d: {
    formatNotProvided: 'لم يُحدد شكل إصدار الفواتير.',
    formatPass: 'تصدر الفواتير كبيانات مهيكلة.',
    formatFail: format => `تصدر الفواتير بصيغة ${format}، ولا يعتبرها التفويض فاتورة إلكترونية.`,
    missingSellerFields: fields => `حقول البائع الناقصة: ${fields.join('، ')}.`,
    sellerTrnInvalid: trn => `رقم التسجيل الضريبي للبائع "${trn}" ليس رقماً من 15 خانة.`,
    sellerPass: 'اسم البائع وعنوانه ورقمه الضريبي موجودة وسليمة الشكل.',
    buyerTrnInvalid: trn => `رقم التسجيل الضريبي للمشتري "${trn}" ليس رقماً من 15 خانة.`,
    missingBuyerFields: fields => `حقول المشتري الناقصة: ${fields.join('، ')}.`,
    buyerPassNoTrn:
      'بيانات المشتري موجودة (دون رقم ضريبي: مقبول فقط إذا لم يكن المشتري مسجلاً ضريبياً).',
    buyerPass: 'اسم المشتري وعنوانه ورقمه الضريبي ومعرف Peppol موجودة.',
    missingInvoiceFields: fields => `حقول الفاتورة الناقصة: ${fields.join('، ')}.`,
    issueDateInvalid: date => `تاريخ الإصدار "${date}" ليس تاريخاً صالحاً.`,
    invoiceIdPass: 'رقم الفاتورة وتاريخ الإصدار موجودان.',
    currencyMissing: 'رمز عملة الفاتورة مفقود.',
    currencyNotIso: code => `رمز العملة "${code}" ليس رمز ISO من ثلاثة أحرف.`,
    currencyMissingAedTotal: code =>
      `الفاتورة بعملة ${code} لكن إجمالي الضريبة بالدرهم (totals.vatTotalAed) مفقود.`,
    currencyPass: code => `العملة ${code}، وإجمالي الضريبة متوفر بالدرهم.`,
    noLineItems: 'لا توجد بنود في الفاتورة.',
    lineMissing: (index, fields) => `البند ${index}: ${fields.join('، ')}`,
    lineProblems: problems => `حقول بنود ناقصة. ${problems.join('؛ ')}.`,
    linesPass: count => `جميع البنود (${count}) تحمل الحقول السبعة.`,
    noTaxBreakdown: 'لا يوجد تفصيل لضريبة القيمة المضافة.',
    breakdownRowMissing: (index, fields) => `التفصيل ${index}: ${fields.join('، ')}`,
    breakdownIncomplete: problems => `تفصيل ضريبي ناقص. ${problems.join('؛ ')}.`,
    missingTotals: fields => `إجماليات مفقودة: ${fields.join('، ')}.`,
    linesMissingAed: (currency, lines) =>
      `الفاتورة بعملة ${currency} لكن البنود ${lines.join('، ')} تفتقد مبلغ الضريبة بالدرهم على مستوى البند (vatAmountAed).`,
    mismatchLineNet: (sum, total) => `مجموع صافي البنود ${sum} ≠ lineNetTotal ${total}`,
    mismatchVat: (sum, total) => `مجموع مبالغ الضريبة ${sum} ≠ vatTotal ${total}`,
    mismatchPayable: (sum, total) => `lineNetTotal + vatTotal ${sum} ≠ payableTotal ${total}`,
    totalsMismatch: mismatches => `الإجماليات لا تتطابق حسابياً: ${mismatches.join('؛ ')}.`,
    totalsPass: 'التفصيل الضريبي مكتمل والإجماليات متسقة.',
    timingNeedsDates: 'يلزم توفر issueDate وtransactionDate معاً لتقييم نافذة الـ14 يوماً.',
    timingFail: days => `صدرت بعد ${days} يوماً من المعاملة التجارية (الحد 14).`,
    timingPass: days => `صدرت بعد ${days} يوم/أيام من المعاملة التجارية.`,
    creditNotesNotProvided: 'لم تُحدد قدرة إصدار الإشعارات الدائنة.',
    creditNotesPass: 'النظام قادر على إصدار إشعارات دائنة إلكترونية.',
    creditNotesFail: 'النظام غير قادر على إصدار إشعارات دائنة إلكترونية.',
    aspNotProvided: 'لم يُحدد تعيين مزود الخدمة المعتمد.',
    aspPass: 'تم تعيين مزود خدمة معتمد.',
    aspFail: 'لم يُعين مزود خدمة معتمد بعد.',
    residencyNotProvided: 'لم يُحدد موقع التخزين.',
    residencyPass: 'بيانات الفواتير مخزنة داخل الإمارات.',
    residencyFail: 'بيانات الفواتير غير مخزنة داخل الإمارات.',
    umbrellaFail: ids =>
      `ليست فاتورة إلكترونية صالحة ما دامت فحوص الحقول فاشلة: ${ids.join('، ')}.`,
    umbrellaPass: 'جميع فحوص الحقول ناجحة.',
  },
};

export const READINESS_STRINGS: Record<Lang, ReadinessStrings> = { en, ar };
