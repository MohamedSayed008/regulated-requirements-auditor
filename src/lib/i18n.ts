/**
 * Bilingual UI dictionary (English / Arabic) and locale helpers.
 *
 * The site ships at / (English) and /ar (Arabic, RTL). Components take a
 * `lang` prop and read from `translations[lang]`; links go through
 * `localePath` so navigation stays inside the active locale. The two
 * dictionaries are mirrored key for key.
 *
 * Terminology is anchored to the corpus's own Arabic legal register:
 * corpus = المدونة, citation = استشهاد, finding = ملاحظة, audit = تدقيق,
 * requirement unit = وحدة متطلبات. Numbers stay in Western digits to match
 * the official gazette style used inside the corpus texts themselves.
 */

export type Lang = 'en' | 'ar';

export const LANGS: Lang[] = ['en', 'ar'];

export function isRtl(lang: Lang): boolean {
  return lang === 'ar';
}

/** Prefixes a site-internal href with /ar when the locale is Arabic. */
export function localePath(lang: Lang, href: string): string {
  if (lang !== 'ar') return href;
  return href === '/' ? '/ar' : `/ar${href}`;
}

/** Derives the locale from a pathname ('/ar' subtree is Arabic). */
export function langFromPathname(pathname: string): Lang {
  return pathname === '/ar' || pathname.startsWith('/ar/') ? 'ar' : 'en';
}

/** Strips the /ar prefix so the same route can be re-rooted in either locale. */
export function stripLocale(pathname: string): string {
  if (pathname === '/ar') return '/';
  return pathname.startsWith('/ar/') ? pathname.slice(3) : pathname;
}

const en = {
  nav: {
    items: [
      { href: '/requirements', label: 'Requirements' },
      { href: '/ask', label: 'Ask' },
      { href: '/audit', label: 'Audit' },
      { href: '/audit-repo', label: 'Audit a repo' },
      { href: '/readiness', label: 'Readiness' },
      { href: '/review', label: 'Review' },
      { href: '/evals', label: 'Evals' },
      { href: '/activity', label: 'Activity' },
    ],
    tryIt: 'Try it',
    menu: 'Menu',
    openMenu: 'Open navigation menu',
    home: 'Mizan, home',
    langSwitch: 'عربي',
    langSwitchAria: 'التبديل إلى النسخة العربية',
  },
  session: {
    signIn: 'Reviewer sign in',
    signOut: 'Sign out',
    reviewer: 'reviewer',
    popoverBody:
      'Reviewer decisions persist to the audit trail and unlock event detail on the activity log.',
    passwordPlaceholder: 'Reviewer password',
    passwordAria: 'Reviewer password',
    submit: 'Sign in',
    failed: 'That password was not accepted.',
  },
  footer: {
    disclaimer:
      'Demonstration only, not legal advice. Reproduces official public legal texts; where Arabic and English conflict, the Arabic prevails. Built by Mohamed Sayed.',
  },
  theme: {
    toLight: 'Switch to light mode',
    toDark: 'Switch to dark mode',
    title: 'Toggle light / dark',
  },
  home: {
    badge: 'Governed agentic AI · live',
    h1a: 'Reads the law.',
    h1b: 'Cites the clause.',
    h1cAccent: 'Weighs your code',
    h1cTail: ' against it.',
    lede: 'A requirements auditor on two live corpora: Dubai tenancy law and the UAE eInvoicing mandate. No citation, no answer. No human approval, no finding. No eval report, no release.',
    heroQuestion: 'How much notice is needed before a rent increase?',
    askPill: 'Ask',
    statEvalPass: 'eval cases pass',
    statPrecision: 'min audit precision',
    statRecall: 'min audit recall',
    statBilingual: 'English · العربية',
    statBilingualLabel: 'bilingual, RTL-aware',
    rules: [
      'No citation, no answer',
      'No human approval, no finding',
      'No eval report, no release',
    ],
    rulesAria: 'The three governing rules',
    findingEyebrow: 'One finding, weighed',
    findingTitle: 'Every finding ties one line of code to the clause it breaks.',
    theLaw: 'The law',
    lawClausePre: 'The Landlord must notify the Tenant of the eviction reasons at least ',
    lawClauseAccent: 'twelve (12) months',
    lawClausePost: ' before the date of eviction, through a Notary Public or by registered mail.',
    theCode: 'The code · eviction.ts:16',
    codeExplain:
      'Enforces three months where the law requires twelve: evictions become lawful far sooner than Article 25(2) allows.',
    critical: 'critical',
    findingFooter: 'Detected, cited, and routed to human review.',
    approvedInReview: 'approved in review',
    pipelineTitle: 'The pipeline, end to end',
    pipelineTag: 'governed at every step',
    pipeline: [
      {
        route: '/ask',
        title: 'Ask with citations',
        body: "Grounded Q&A over the corpus. Citations come from the model's citation output, not prompt engineering. Out-of-corpus questions are refused, and the refusal is eval-tested.",
      },
      {
        route: '/audit',
        title: 'Audit code',
        body: 'Zod-validated findings, each tied to a clause with file and line.',
      },
      {
        route: '/review',
        title: 'Human approval',
        body: 'The AI proposes; a person decides. Nothing counts until approved.',
      },
      {
        route: '/readiness',
        title: 'eInvoicing readiness',
        body: 'Field-level invoice validation against the mandate, every gap cited to its ministerial requirement.',
      },
      {
        route: '/evals',
        title: 'Published evals',
        body: 'Groundedness, refusal, injection resistance, and audit precision/recall against a seeded ground truth. Graders are programmatic, so the numbers are reproducible.',
      },
    ],
  },
  ask: {
    eyebrow: 'Ask with citations',
    title: 'Ask the regulation',
    lede: 'Answered only from the corpus, every claim carries a citation that links to the exact requirement unit. Ask in English or Arabic. If the corpus does not cover it, the answer says so: refusal is a feature.',
    placeholder: 'e.g. How much notice is needed before a rent increase?',
    inputAria: 'Your question about the regulation',
    sectionAria: 'Ask a question',
    submit: 'Ask',
    submitting: 'Answering',
    aiNote:
      'AI-generated answer. Verify every claim against the cited requirement units before relying on it.',
    streaming: 'Reading the corpus and grounding the answer',
    pageDisclaimer:
      'Demo only, not legal advice. In case of conflict the Arabic text of the law prevails.',
    errors: {
      demo_disabled:
        'The live demo is paused right now (budget cap). Cached runs and the corpus remain available.',
      not_configured: 'The demo backend is not configured yet.',
      rate_limited: 'Rate limit reached. Please try again in a while.',
      upstream_rate_limited: 'The model is busy. Please try again shortly.',
      invalid_question: 'Questions need to be between 8 and 500 characters.',
      default: 'Something went wrong. Please try again.',
    } as Record<string, string>,
  },
  audit: {
    eyebrow: 'Code audit · replayed run',
    title: 'The code, audited against the law',
    lede: (count: number) =>
      `A tenancy-management app checked against the ${count} testable requirement units. This replays a real run: the model read the source and raised each finding below, tying code to the clause it violates. Findings are proposed, never final.`,
    openQueue: 'Open the review queue →',
    statFindings: 'Findings raised',
    statRequirements: 'Requirements checked',
    statFiles: 'Files scanned',
    statCost: 'Run cost',
    tokens: (input: string, output: string) => `${input} in / ${output} out tokens`,
    target: 'target:',
    corpusLabel: 'Dubai tenancy law',
    trace: {
      heading: 'How this run was governed',
      sub: 'The pipeline that produced the findings below, traced from the run itself.',
      openQueue: 'Open the queue.',
      steps: {
        requirements: (count: number, corpus: string) => ({
          title: 'Requirements loaded',
          detail: `${count} testable units from ${corpus}, each with a stable citable id.`,
        }),
        source: (files: number) => ({
          title: 'Source snapshot',
          detail: `${files} files handed to the model line-numbered; comments are treated as data, not instructions.`,
        }),
        model: (model: string) => ({
          title: 'Model audit',
          detail: `${model}, forced to answer through one structured tool (report_findings) so the output is data, not prose.`,
        }),
        structured: (findings: number) => ({
          title: 'Structured output',
          detail: `${findings} findings emitted as JSON, each citing the requirement id it violates with file and line.`,
        }),
        schema: () => ({
          title: 'Schema validation',
          detail:
            'Every finding is parsed against the Zod findingSchema before it is trusted; a malformed finding fails the run.',
        }),
        review: () => ({
          title: 'Human review',
          detail:
            'Findings enter the queue as proposed. None are final until a person approves or rejects them.',
        }),
        cost: (input: string, output: string, cost: number) => ({
          title: 'Cost accounted',
          detail: `${input} in / ${output} out tokens, $${cost} for the run.`,
        }),
      },
    },
  },
  auditRepo: {
    eyebrow: 'Audit your code',
    title: 'Audit a public repo against the law',
    lede: 'Paste a public GitHub repository URL and pick a corpus. Mizan fetches a bounded set of source files and audits them, raising findings tied to the requirement they violate. For unrelated code it will honestly report nothing applicable.',
    placeholder: 'https://github.com/owner/repo',
    inputAria: 'Public GitHub repository URL',
    submit: 'Audit',
    submitting: 'Auditing',
    running: 'Fetching the repository and auditing its code against the requirements',
    statFindings: 'Findings',
    statFiles: 'Files scanned',
    statRequirements: 'Requirements',
    statCost: 'Run cost',
    target: 'target:',
    noFindings:
      'No applicable findings. The audited code did not conflict with any testable requirement, the expected result for code outside this domain.',
    errors: {
      invalid_url: 'That does not look like a public GitHub repository URL.',
      not_found: 'Repository not found. It must be public and exist.',
      empty: 'No auditable source files were found in that repository.',
      too_large: 'That request is too large.',
      rate_limited: 'Rate limit reached. Please try again in a while.',
      upstream_rate_limited: 'The model is busy. Please try again shortly.',
      fetch_failed: 'Could not reach GitHub to fetch the repository.',
      audit_failed: 'The audit could not be completed. Please try again.',
      demo_disabled: 'The live demo is paused right now (budget cap).',
      default: 'Something went wrong. Please try again.',
    } as Record<string, string>,
  },
  readiness: {
    eyebrow: 'Are you ready?',
    title: 'UAE eInvoicing readiness check',
    lede: 'Paste a sample invoice as JSON and answer four process questions. Every check is deterministic and cites the exact ministerial requirement it validates, so each gap comes with the clause to read and a concrete fix. Nothing you paste is sent to a model.',
    invoiceLabel: 'INVOICE JSON',
    loadPassing: 'Load compliant sample',
    loadGappy: 'Load gappy sample',
    placeholder:
      'Paste an invoice as JSON, e.g. { "seller": { "name": "...", "trn": "..." }, "lines": [...] }, or load a sample.',
    processLabel: 'PROCESS FACTS (OPTIONAL, UNANSWERED = NOT ASSESSED)',
    questions: {
      format: 'How are invoices issued today?',
      formatOptions: {
        structured: 'Structured data',
        pdf: 'PDF',
        image: 'Scan / image',
        email: 'Email',
      } as Record<string, string>,
      aspAppointed: 'Accredited Service Provider appointed?',
      storageInUae: 'Invoice data stored in the UAE?',
      canIssueCreditNotes: 'Can your system issue electronic credit notes?',
      yes: 'Yes',
      no: 'No',
    },
    submit: 'Check readiness',
    scoreReady: 'ready',
    scorePass: 'checks pass',
    scoreFail: 'checks fail',
    scoreNotAssessed: 'not assessed',
    fixFirst: 'WHAT TO FIX FIRST',
    allChecks: 'ALL CHECKS',
    fixPrefix: 'Fix:',
    statusPass: 'pass',
    statusFail: 'fail',
    statusNotAssessed: 'not assessed',
    disclaimerSuffix:
      'This checker is a demonstration, not tax advice; the authoritative field list is the Ministry of Finance data dictionary.',
    errors: {
      invalid_json: 'That is not valid JSON. Paste the invoice as a JSON object.',
      invalid_request: 'That request shape was not recognised.',
      too_large: 'That invoice payload is too large for the demo.',
      rate_limited: 'Rate limit reached. Please try again in a while.',
      default: 'Something went wrong. Please try again.',
    } as Record<string, string>,
  },
  review: {
    eyebrow: 'Human approval',
    title: 'Review queue',
    ledeBase: 'The AI proposes, a human decides. Each finding below is a proposal, not a verdict.',
    ledeReviewer: ' You are signed in as the reviewer: decisions persist to the audit trail.',
    ledeVisitor:
      ' Approve or reject to try the workflow; as a visitor your decisions stay in this session only. The reviewer signs in from the top bar, and those decisions are the durable record.',
    saveError: 'A decision could not be saved. It has been reverted; try again.',
    approved: 'Approved',
    rejected: 'Rejected',
    pending: 'Pending',
    approve: 'Approve',
    reject: 'Reject',
    reset: 'Reset',
    saved: 'saved',
    notePlaceholder: 'Reviewer note (optional)',
    noteAria: (id: string) => `Reviewer note for ${id}`,
    trail: 'Decision trail',
    trailSaved: ' · saved',
    trailSession: ' · this session',
    notePrefix: 'note:',
  },
  evals: {
    eyebrow: 'Published evals',
    title: 'How reliable is it?',
    lede: 'Every claim this demo makes is measured here, per corpus. Graders are programmatic, so the numbers are reproducible: groundedness, refusal correctness, injection resistance, and audit precision/recall against a seeded ground truth. The misses are shown too.',
    empty: 'The eval reports have not been generated yet.',
    generated: 'generated',
    precisionRecall: (p: string, r: string) => `${p} / ${r}`,
    precisionLabel: (detected: number, seeded: number, fp: number) =>
      `Precision / recall · ${detected}/${seeded} seeded, ${fp} FP`,
    suiteLabel: (name: string, passed: number, total: number) => `${name} · ${passed}/${total}`,
    fpNote:
      'The false positive here is a legitimate extra finding raised on a genuinely non-compliant file: scored honestly rather than suppressed.',
    passedBadge: (passed: number, total: number) => `${passed}/${total} passed`,
    casePass: 'pass',
    caseFail: 'fail',
  },
  requirements: {
    eyebrow: 'The corpora',
    title: 'Requirements',
    lede: 'Each corpus is a regulation parsed into citable requirement units. Every answer and every audit finding in this demo points back to one of the units below.',
    legendTitle: 'Left rule',
    legendEditorial: 'Editorial caveat',
    legendTestable: 'Testable against code',
    legendReference: 'Reference only',
    corpusLabel: 'Corpus',
    unitsLine: (units: number, testable: number) =>
      `${units} units, ${testable} testable against code`,
    bilingualSuffix: ' · bilingual (English / العربية)',
    unitsBadge: (n: number) => `${n} units`,
    amendedByPrefix: 'as amended by',
    officialSource: 'official source',
    testable: 'testable',
    amendedBy: (by: string) => `amended by ${by}`,
    editorialNote: 'Editorial note:',
  },
  activity: {
    eyebrow: 'The audit trail',
    title: 'Activity',
    lede: 'A governed system should be auditable, so the log is public: every question, audit run, and review decision, with what it cost. Event payloads are visible to the signed-in reviewer; visitors see the shape of the activity without its contents.',
    statQuestions: 'questions asked',
    statRepos: 'repos audited',
    statDecisions: 'decisions recorded',
    statSpend: (input: string, output: string) =>
      `total model spend · ${input} in / ${output} out tokens`,
    recent: 'Recent events',
    reviewerView: 'reviewer view: full detail',
    publicView: 'public view: details masked',
    empty: 'No recorded activity yet. Ask a question or audit a repo and it will appear here.',
    actionLabel: {
      ask: 'question asked',
      audit_repo: 'repo audited',
      review_decide: 'decision recorded',
      readiness: 'readiness checked',
    } as Record<string, string>,
    masked: {
      ask: 'question content visible to the reviewer',
      audit_repo: 'repository and findings visible to the reviewer',
      readiness: 'result summary visible to the reviewer',
      review_decide: 'decision detail visible to the reviewer',
    } as Record<string, string>,
  },
  finding: {
    requirement: 'Requirement',
    code: 'Code',
    evidence: 'Evidence:',
    recommended: 'Recommended:',
    severity: {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low',
    } as Record<string, string>,
    status: {
      proposed: 'proposed',
      approved: 'approved',
      rejected: 'rejected',
    } as Record<string, string>,
  },
  loading: 'Weighing',
};

type Dictionary = typeof en;

const ar: Dictionary = {
  nav: {
    items: [
      { href: '/requirements', label: 'المتطلبات' },
      { href: '/ask', label: 'اسأل' },
      { href: '/audit', label: 'التدقيق' },
      { href: '/audit-repo', label: 'دقق مستودعاً' },
      { href: '/readiness', label: 'الجاهزية' },
      { href: '/review', label: 'المراجعة' },
      { href: '/evals', label: 'التقييمات' },
      { href: '/activity', label: 'النشاط' },
    ],
    tryIt: 'جربه',
    menu: 'القائمة',
    openMenu: 'فتح قائمة التنقل',
    home: 'ميزان، الصفحة الرئيسية',
    langSwitch: 'English',
    langSwitchAria: 'Switch to the English version',
  },
  session: {
    signIn: 'دخول المراجع',
    signOut: 'تسجيل الخروج',
    reviewer: 'مراجع',
    popoverBody: 'قرارات المراجع تُحفظ في سجل التدقيق وتكشف تفاصيل الأحداث في سجل النشاط.',
    passwordPlaceholder: 'كلمة مرور المراجع',
    passwordAria: 'كلمة مرور المراجع',
    submit: 'تسجيل الدخول',
    failed: 'كلمة المرور غير صحيحة.',
  },
  footer: {
    disclaimer:
      'عرض توضيحي فقط وليس استشارة قانونية. يستنسخ نصوصاً قانونية رسمية منشورة؛ وعند التعارض بين العربية والإنجليزية يسود النص العربي. من تطوير محمد سيد.',
  },
  theme: {
    toLight: 'التبديل إلى الوضع الفاتح',
    toDark: 'التبديل إلى الوضع الداكن',
    title: 'تبديل الوضع الفاتح / الداكن',
  },
  home: {
    badge: 'ذكاء اصطناعي وكيلي محوكم · مباشر',
    h1a: 'يقرأ القانون.',
    h1b: 'يستشهد بالمادة.',
    h1cAccent: 'يزن كودك',
    h1cTail: ' في ميزانه.',
    lede: 'مدقق متطلبات يعمل على مدونتين حيتين: قانون إيجارات دبي وتفويض الفوترة الإلكترونية في الإمارات. لا إجابة بلا استشهاد، ولا ملاحظة بلا موافقة بشرية، ولا إصدار بلا تقرير تقييم.',
    heroQuestion: 'ما مدة الإخطار المطلوبة قبل زيادة الإيجار؟',
    askPill: 'اسأل',
    statEvalPass: 'حالة تقييم ناجحة',
    statPrecision: 'الحد الأدنى لدقة التدقيق',
    statRecall: 'الحد الأدنى لاستدعاء التدقيق',
    statBilingual: 'العربية · English',
    statBilingualLabel: 'ثنائي اللغة، يدعم الكتابة من اليمين لليسار',
    rules: ['لا إجابة بلا استشهاد', 'لا ملاحظة بلا موافقة بشرية', 'لا إصدار بلا تقرير تقييم'],
    rulesAria: 'القواعد الحاكمة الثلاث',
    findingEyebrow: 'ملاحظة واحدة، موزونة',
    findingTitle: 'كل ملاحظة تربط سطراً من الكود بالمادة التي يخالفها.',
    theLaw: 'القانون',
    lawClausePre: 'يجب على المؤجر إخطار المستأجر بأسباب الإخلاء قبل ',
    lawClauseAccent: 'اثني عشر (12) شهراً',
    lawClausePost:
      ' على الأقل من التاريخ المحدد للإخلاء، وذلك عن طريق الكاتب العدل أو بالبريد المسجل.',
    theCode: 'الكود · eviction.ts:16',
    codeExplain:
      'يفرض الكود ثلاثة أشهر حيث يشترط القانون اثني عشر شهراً: يصبح الإخلاء قانونياً أبكر بكثير مما تسمح به المادة 25(2).',
    critical: 'حرجة',
    findingFooter: 'رُصدت، واستُشهد بمصدرها، وأُحيلت إلى المراجعة البشرية.',
    approvedInReview: 'معتمدة في المراجعة',
    pipelineTitle: 'خط المعالجة من طرف إلى طرف',
    pipelineTag: 'محوكم في كل خطوة',
    pipeline: [
      {
        route: '/ask',
        title: 'اسأل مع الاستشهادات',
        body: 'أسئلة وأجوبة مؤسسة على المدونة. الاستشهادات تأتي من مخرجات الاستشهاد في النموذج لا من هندسة التلقين، والأسئلة خارج المدونة تُرفض، والرفض نفسه مختبر بالتقييم.',
      },
      {
        route: '/audit',
        title: 'دقق الكود',
        body: 'ملاحظات مُتحقق منها عبر Zod، كل منها مربوطة بمادة مع الملف ورقم السطر.',
      },
      {
        route: '/review',
        title: 'موافقة بشرية',
        body: 'الذكاء الاصطناعي يقترح؛ والإنسان يقرر. لا شيء يُعتد به قبل الاعتماد.',
      },
      {
        route: '/readiness',
        title: 'جاهزية الفوترة الإلكترونية',
        body: 'تحقق من حقول الفاتورة مقابل التفويض، وكل ثغرة مستشهد لها بالمتطلب الوزاري.',
      },
      {
        route: '/evals',
        title: 'تقييمات منشورة',
        body: 'التأسيس على المصادر، وصحة الرفض، ومقاومة الحقن، ودقة واستدعاء التدقيق مقابل حقيقة أرضية مزروعة. المصححات برمجية، فالأرقام قابلة لإعادة الإنتاج.',
      },
    ],
  },
  ask: {
    eyebrow: 'اسأل مع الاستشهادات',
    title: 'اسأل التشريع',
    lede: 'الإجابة من المدونة وحدها، وكل ادعاء يحمل استشهاداً يقود إلى وحدة المتطلبات بعينها. اسأل بالعربية أو الإنجليزية. وإن لم تغط المدونة سؤالك قالت الإجابة ذلك صراحة: الرفض ميزة.',
    placeholder: 'مثال: ما مدة الإخطار المطلوبة قبل زيادة الإيجار؟',
    inputAria: 'سؤالك عن التشريع',
    sectionAria: 'اطرح سؤالاً',
    submit: 'اسأل',
    submitting: 'يجيب',
    aiNote:
      'إجابة مولدة بالذكاء الاصطناعي. تحقق من كل ادعاء مقابل وحدات المتطلبات المستشهد بها قبل الاعتماد عليها.',
    streaming: 'يقرأ المدونة ويؤسس الإجابة',
    pageDisclaimer: 'عرض توضيحي فقط وليس استشارة قانونية. عند التعارض يسود النص العربي للقانون.',
    errors: {
      demo_disabled:
        'العرض المباشر متوقف حالياً (سقف الميزانية). التشغيلات المخزنة والمدونة متاحة.',
      not_configured: 'الواجهة الخلفية للعرض غير مهيأة بعد.',
      rate_limited: 'تم بلوغ حد الاستخدام. حاول مجدداً بعد قليل.',
      upstream_rate_limited: 'النموذج مشغول. حاول مجدداً بعد لحظات.',
      invalid_question: 'يجب أن يكون طول السؤال بين 8 و500 حرف.',
      default: 'حدث خطأ ما. حاول مرة أخرى.',
    } as Record<string, string>,
  },
  audit: {
    eyebrow: 'تدقيق الكود · تشغيلة معادة',
    title: 'الكود مدققاً في ميزان القانون',
    lede: (count: number) =>
      `تطبيق لإدارة الإيجارات فُحص مقابل ${count} وحدة متطلبات قابلة للاختبار. هذه إعادة لتشغيلة حقيقية: قرأ النموذج المصدر ورفع كل ملاحظة أدناه رابطاً الكود بالمادة التي يخالفها. الملاحظات مقترحة، وليست نهائية أبداً.`,
    openQueue: 'افتح قائمة المراجعة ←',
    statFindings: 'ملاحظات مرفوعة',
    statRequirements: 'متطلبات مفحوصة',
    statFiles: 'ملفات ممسوحة',
    statCost: 'تكلفة التشغيلة',
    tokens: (input: string, output: string) => `${input} إدخال / ${output} إخراج من الرموز`,
    target: 'الهدف:',
    corpusLabel: 'قانون إيجارات دبي',
    trace: {
      heading: 'كيف حُوكمت هذه التشغيلة',
      sub: 'خط المعالجة الذي أنتج الملاحظات أدناه، متتبعاً من التشغيلة نفسها.',
      openQueue: 'افتح القائمة.',
      steps: {
        requirements: (count: number, corpus: string) => ({
          title: 'تحميل المتطلبات',
          detail: `${count} وحدة قابلة للاختبار من ${corpus}، لكل منها معرف استشهاد ثابت.`,
        }),
        source: (files: number) => ({
          title: 'لقطة المصدر',
          detail: `${files} ملفاً سُلمت للنموذج مرقمة الأسطر؛ والتعليقات تُعامل كبيانات لا كتعليمات.`,
        }),
        model: (model: string) => ({
          title: 'تدقيق النموذج',
          detail: `${model}، مُلزم بالإجابة عبر أداة مهيكلة واحدة (report_findings) ليكون الناتج بيانات لا نثراً.`,
        }),
        structured: (findings: number) => ({
          title: 'مخرجات مهيكلة',
          detail: `${findings} ملاحظات صدرت بصيغة JSON، كل منها تستشهد بمعرف المتطلب المخالف مع الملف والسطر.`,
        }),
        schema: () => ({
          title: 'التحقق من المخطط',
          detail:
            'كل ملاحظة تُفسر مقابل مخطط Zod قبل الوثوق بها؛ والملاحظة المشوهة تُفشل التشغيلة.',
        }),
        review: () => ({
          title: 'مراجعة بشرية',
          detail:
            'تدخل الملاحظات القائمة بصفة مقترحة، ولا تصبح نهائية حتى يعتمدها إنسان أو يرفضها.',
        }),
        cost: (input: string, output: string, cost: number) => ({
          title: 'حساب التكلفة',
          detail: `${input} إدخال / ${output} إخراج من الرموز، بتكلفة $${cost} للتشغيلة.`,
        }),
      },
    },
  },
  auditRepo: {
    eyebrow: 'دقق كودك',
    title: 'دقق مستودعاً عاماً في ميزان القانون',
    lede: 'الصق رابط مستودع GitHub عام واختر المدونة. يجلب ميزان مجموعة محدودة من ملفات المصدر ويدققها، رافعاً ملاحظات مربوطة بالمتطلب المخالف. وللكود غير ذي الصلة سيقرر بأمانة أن لا شيء ينطبق.',
    placeholder: 'https://github.com/owner/repo',
    inputAria: 'رابط مستودع GitHub عام',
    submit: 'دقق',
    submitting: 'يدقق',
    running: 'يجلب المستودع ويدقق كوده مقابل المتطلبات',
    statFindings: 'ملاحظات',
    statFiles: 'ملفات ممسوحة',
    statRequirements: 'متطلبات',
    statCost: 'تكلفة التشغيلة',
    target: 'الهدف:',
    noFindings:
      'لا ملاحظات منطبقة. الكود المدقق لم يتعارض مع أي متطلب قابل للاختبار، وهي النتيجة المتوقعة لكود خارج هذا المجال.',
    errors: {
      invalid_url: 'هذا لا يبدو رابط مستودع GitHub عام.',
      not_found: 'المستودع غير موجود. يجب أن يكون عاماً وموجوداً.',
      empty: 'لم يُعثر على ملفات مصدر قابلة للتدقيق في هذا المستودع.',
      too_large: 'هذا الطلب أكبر من المسموح.',
      rate_limited: 'تم بلوغ حد الاستخدام. حاول مجدداً بعد قليل.',
      upstream_rate_limited: 'النموذج مشغول. حاول مجدداً بعد لحظات.',
      fetch_failed: 'تعذر الوصول إلى GitHub لجلب المستودع.',
      audit_failed: 'تعذر إتمام التدقيق. حاول مرة أخرى.',
      demo_disabled: 'العرض المباشر متوقف حالياً (سقف الميزانية).',
      default: 'حدث خطأ ما. حاول مرة أخرى.',
    } as Record<string, string>,
  },
  readiness: {
    eyebrow: 'هل أنت جاهز؟',
    title: 'فحص جاهزية الفوترة الإلكترونية في الإمارات',
    lede: 'الصق فاتورة نموذجية بصيغة JSON وأجب عن أربعة أسئلة عن إجراءاتك. كل فحص حتمي ويستشهد بالمتطلب الوزاري الذي يتحقق منه، فكل ثغرة تأتي مع المادة التي تقرؤها وإصلاح ملموس. لا يُرسل ما تلصقه إلى أي نموذج.',
    invoiceLabel: 'الفاتورة بصيغة JSON',
    loadPassing: 'حمل نموذجاً ممتثلاً',
    loadGappy: 'حمل نموذجاً ناقصاً',
    placeholder:
      'الصق فاتورة بصيغة JSON، مثال: { "seller": { "name": "...", "trn": "..." }, "lines": [...] }، أو حمل نموذجاً.',
    processLabel: 'حقائق الإجراءات (اختيارية، وغير المجاب عنها = غير مقيمة)',
    questions: {
      format: 'كيف تصدر الفواتير اليوم؟',
      formatOptions: {
        structured: 'بيانات مهيكلة',
        pdf: 'PDF',
        image: 'مسح ضوئي / صورة',
        email: 'بريد إلكتروني',
      } as Record<string, string>,
      aspAppointed: 'هل عُين مزود خدمة معتمد؟',
      storageInUae: 'هل تُخزن بيانات الفواتير داخل الإمارات؟',
      canIssueCreditNotes: 'هل يستطيع نظامك إصدار إشعارات دائنة إلكترونية؟',
      yes: 'نعم',
      no: 'لا',
    },
    submit: 'افحص الجاهزية',
    scoreReady: 'جاهزية',
    scorePass: 'فحوص ناجحة',
    scoreFail: 'فحوص فاشلة',
    scoreNotAssessed: 'غير مقيمة',
    fixFirst: 'ما يجب إصلاحه أولاً',
    allChecks: 'كل الفحوص',
    fixPrefix: 'الإصلاح:',
    statusPass: 'ناجح',
    statusFail: 'فاشل',
    statusNotAssessed: 'غير مقيم',
    disclaimerSuffix:
      'هذا الفاحص عرض توضيحي وليس استشارة ضريبية؛ والقائمة الرسمية للحقول هي قاموس بيانات وزارة المالية.',
    errors: {
      invalid_json: 'هذا ليس JSON صالحاً. الصق الفاتورة ككائن JSON.',
      invalid_request: 'شكل الطلب غير معروف.',
      too_large: 'حجم بيانات الفاتورة أكبر من المسموح في العرض.',
      rate_limited: 'تم بلوغ حد الاستخدام. حاول مجدداً بعد قليل.',
      default: 'حدث خطأ ما. حاول مرة أخرى.',
    } as Record<string, string>,
  },
  review: {
    eyebrow: 'موافقة بشرية',
    title: 'قائمة المراجعة',
    ledeBase: 'الذكاء الاصطناعي يقترح، والإنسان يقرر. كل ملاحظة أدناه اقتراح لا حكم.',
    ledeReviewer: ' أنت مسجل الدخول بصفة المراجع: القرارات تُحفظ في سجل التدقيق.',
    ledeVisitor:
      ' اعتمد أو ارفض لتجربة سير العمل؛ وبصفتك زائراً تبقى قراراتك في هذه الجلسة فقط. المراجع يسجل الدخول من الشريط العلوي، وقراراته هي السجل الدائم.',
    saveError: 'تعذر حفظ قرار. تم التراجع عنه؛ حاول مرة أخرى.',
    approved: 'معتمدة',
    rejected: 'مرفوضة',
    pending: 'معلقة',
    approve: 'اعتمد',
    reject: 'ارفض',
    reset: 'إعادة تعيين',
    saved: 'محفوظ',
    notePlaceholder: 'ملاحظة المراجع (اختيارية)',
    noteAria: (id: string) => `ملاحظة المراجع على ${id}`,
    trail: 'سجل القرارات',
    trailSaved: ' · محفوظ',
    trailSession: ' · هذه الجلسة',
    notePrefix: 'ملاحظة:',
  },
  evals: {
    eyebrow: 'تقييمات منشورة',
    title: 'ما مدى موثوقيته؟',
    lede: 'كل ادعاء يقدمه هذا العرض يُقاس هنا، لكل مدونة على حدة. المصححات برمجية فالأرقام قابلة لإعادة الإنتاج: التأسيس على المصادر، وصحة الرفض، ومقاومة الحقن، ودقة واستدعاء التدقيق مقابل حقيقة أرضية مزروعة. والإخفاقات معروضة أيضاً.',
    empty: 'لم تُولد تقارير التقييم بعد.',
    generated: 'وُلد في',
    precisionRecall: (p: string, r: string) => `${p} / ${r}`,
    precisionLabel: (detected: number, seeded: number, fp: number) =>
      `الدقة / الاستدعاء · ${detected}/${seeded} مزروعة، ${fp} إيجابيات خاطئة`,
    suiteLabel: (name: string, passed: number, total: number) => `${name} · ${passed}/${total}`,
    fpNote:
      'الإيجابية الخاطئة هنا ملاحظة إضافية مشروعة رُفعت على ملف غير ممتثل فعلاً: سُجلت بأمانة بدلاً من إخفائها.',
    passedBadge: (passed: number, total: number) => `${passed}/${total} ناجحة`,
    casePass: 'ناجحة',
    caseFail: 'فاشلة',
  },
  requirements: {
    eyebrow: 'المدونات',
    title: 'المتطلبات',
    lede: 'كل مدونة تشريع مفكك إلى وحدات متطلبات قابلة للاستشهاد. كل إجابة وكل ملاحظة تدقيق في هذا العرض تشير إلى إحدى الوحدات أدناه.',
    legendTitle: 'الخط الجانبي',
    legendEditorial: 'تنبيه تحريري',
    legendTestable: 'قابل للاختبار مقابل الكود',
    legendReference: 'مرجعي فقط',
    corpusLabel: 'المدونة',
    unitsLine: (units: number, testable: number) =>
      `${units} وحدة، منها ${testable} قابلة للاختبار مقابل الكود`,
    bilingualSuffix: ' · ثنائية اللغة (العربية / English)',
    unitsBadge: (n: number) => `${n} وحدة`,
    amendedByPrefix: 'كما عُدل بموجب',
    officialSource: 'المصدر الرسمي',
    testable: 'قابل للاختبار',
    amendedBy: (by: string) => `معدل بموجب ${by}`,
    editorialNote: 'تنبيه تحريري:',
  },
  activity: {
    eyebrow: 'سجل التدقيق',
    title: 'النشاط',
    lede: 'النظام المحوكم ينبغي أن يكون قابلاً للتدقيق، لذا السجل علني: كل سؤال وكل تشغيلة تدقيق وكل قرار مراجعة، مع تكلفته. حمولات الأحداث مرئية للمراجع المسجل؛ والزوار يرون شكل النشاط دون محتواه.',
    statQuestions: 'أسئلة مطروحة',
    statRepos: 'مستودعات مدققة',
    statDecisions: 'قرارات مسجلة',
    statSpend: (input: string, output: string) =>
      `إجمالي إنفاق النموذج · ${input} إدخال / ${output} إخراج من الرموز`,
    recent: 'أحدث الأحداث',
    reviewerView: 'عرض المراجع: التفاصيل كاملة',
    publicView: 'العرض العام: التفاصيل محجوبة',
    empty: 'لا نشاط مسجل بعد. اطرح سؤالاً أو دقق مستودعاً وسيظهر هنا.',
    actionLabel: {
      ask: 'سؤال مطروح',
      audit_repo: 'مستودع مدقق',
      review_decide: 'قرار مسجل',
      readiness: 'جاهزية مفحوصة',
    } as Record<string, string>,
    masked: {
      ask: 'محتوى السؤال مرئي للمراجع',
      audit_repo: 'المستودع والملاحظات مرئية للمراجع',
      readiness: 'ملخص النتيجة مرئي للمراجع',
      review_decide: 'تفاصيل القرار مرئية للمراجع',
    } as Record<string, string>,
  },
  finding: {
    requirement: 'المتطلب',
    code: 'الكود',
    evidence: 'الدليل:',
    recommended: 'التوصية:',
    severity: {
      critical: 'حرجة',
      high: 'مرتفعة',
      medium: 'متوسطة',
      low: 'منخفضة',
    } as Record<string, string>,
    status: {
      proposed: 'مقترحة',
      approved: 'معتمدة',
      rejected: 'مرفوضة',
    } as Record<string, string>,
  },
  loading: 'يزن',
};

export const translations: Record<Lang, Dictionary> = { en, ar };
