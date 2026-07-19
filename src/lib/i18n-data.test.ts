import { describe, expect, it } from 'vitest';
import { CORPUS_LIST } from '@/lib/corpora';
import {
  formatArticleRef,
  formatEditorialNote,
  formatEvalDetail,
  formatSuiteName,
  formatTag,
  translatedEditorialNoteIds,
  translatedTags,
} from '@/lib/i18n-data';
import { evalReportSetSchema } from '@/lib/eval-report';
import reportsJson from '@/data/evals/reports.json';

const allUnits = CORPUS_LIST.flatMap(c => c.units);

describe('arabic corpus renderings stay complete', () => {
  it('every articleRef has an Arabic rendering (no raw English leaks)', () => {
    for (const unit of allUnits) {
      const ar = formatArticleRef(unit.articleRef, 'ar');
      expect(ar, unit.id).not.toMatch(/Article|details|items?|overview|model|table/);
    }
  });

  it('every tag in the corpora has an Arabic label', () => {
    const translated = new Set(translatedTags());
    for (const unit of allUnits) {
      for (const tag of unit.tags) {
        expect(translated.has(tag), `missing Arabic label for tag "${tag}" (${unit.id})`).toBe(
          true
        );
      }
    }
  });

  it('every editorial note has an Arabic rendering', () => {
    const translated = new Set(translatedEditorialNoteIds());
    for (const unit of allUnits) {
      if (unit.editorialNote) {
        expect(translated.has(unit.id), `missing Arabic editorial note for ${unit.id}`).toBe(true);
      }
    }
  });

  it('every corpus carries Arabic names', () => {
    for (const corpus of CORPUS_LIST) {
      expect(corpus.nameAr.length, corpus.id).toBeGreaterThan(0);
      expect(corpus.shortNameAr.length, corpus.id).toBeGreaterThan(0);
    }
  });

  it('every eval suite name and grader detail translates', () => {
    const reports = evalReportSetSchema.parse(reportsJson);
    for (const entry of reports) {
      for (const suite of entry.report.suites) {
        expect(formatSuiteName(suite.name, 'ar'), suite.name).not.toBe(suite.name);
        for (const c of suite.cases) {
          const ar = formatEvalDetail(c.detail, 'ar');
          expect(ar, `untranslated detail: "${c.detail}"`).not.toBe(c.detail);
        }
      }
    }
  });

  it('english passthrough is identity', () => {
    expect(formatArticleRef('Article 25(2)', 'en')).toBe('Article 25(2)');
    expect(formatTag('rent-increase', 'en')).toBe('rent-increase');
    expect(formatEditorialNote('LAW26-2007/ART-2', 'note', 'en')).toBe('note');
  });

  it('translates sub-clause letters to gazette style', () => {
    expect(formatArticleRef('Article 1(a)', 'ar')).toBe('المادة 1(أ)');
    expect(formatArticleRef('Article 5(1)(b)', 'ar')).toBe('المادة 5(1)(ب)');
  });
});
