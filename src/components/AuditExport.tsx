'use client';

import { Button, HStack } from '@chakra-ui/react';
import { type AuditRun } from '@/lib/findings';

/**
 * Client-side export of a replayed audit run: a CSV of the findings and a
 * print-ready audit report. The report is generated as a self-contained HTML
 * document in a new tab (its own light "filed document" design, independent of
 * the app's dark theme) that auto-opens the print dialog, so a reviewer can save
 * it as a PDF. No dependencies, no server round-trip.
 */

export interface ClauseText {
  articleRef: string;
  textEn: string;
}

interface AuditExportProps {
  run: AuditRun;
  clauses: Record<string, ClauseText>;
  corpusLabel: string;
}

const SEVERITY_INK: Record<string, string> = {
  critical: '#b91c1c',
  high: '#c2410c',
  medium: '#b45309',
  low: '#64748b',
};

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function csvCell(value: string | number): string {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function toCsv(run: AuditRun): string {
  const header = [
    'id',
    'severity',
    'requirementId',
    'filePath',
    'lineStart',
    'lineEnd',
    'summary',
    'evidence',
    'recommendedAction',
    'status',
  ];
  const rows = run.findings.map(f =>
    [
      f.id,
      f.severity,
      f.requirementId,
      f.filePath,
      f.lineStart,
      f.lineEnd,
      f.summary,
      f.evidence,
      f.recommendedAction,
      f.status,
    ]
      .map(csvCell)
      .join(',')
  );
  return [header.map(csvCell).join(','), ...rows].join('\r\n');
}

function download(filename: string, mime: string, contents: string): void {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function runDate(iso: string): string {
  // Deterministic YYYY-MM-DD, no locale surprises across print environments.
  return iso.slice(0, 10);
}

function findingBlock(
  f: AuditRun['findings'][number],
  index: number,
  total: number,
  clause: ClauseText | undefined
): string {
  const ink = SEVERITY_INK[f.severity] ?? '#64748b';
  const clauseText = clause ? esc(clause.textEn) : '';
  const clauseRef = clause ? esc(clause.articleRef) : '';
  const lines = f.lineEnd !== f.lineStart ? `${f.lineStart}-${f.lineEnd}` : String(f.lineStart);
  return `
    <article class="finding" style="border-inline-start-color:${ink}">
      <header class="finding-head">
        <span class="case">Finding ${index + 1} of ${total}</span>
        <span class="sev"><span class="dot" style="background:${ink}"></span>${esc(f.severity)}</span>
        <span class="req">${esc(f.requirementId)}</span>
      </header>
      <h3 class="finding-title">${esc(f.summary)}</h3>
      <div class="cols">
        <div class="col">
          <div class="col-label">The requirement${clauseRef ? ` &middot; ${clauseRef}` : ''}</div>
          <p class="clause">${clauseText || '<span class="faint">Clause text not bundled for this id.</span>'}</p>
        </div>
        <div class="col">
          <div class="col-label">The code &middot; ${esc(f.filePath)}:${lines}</div>
          <pre class="code">${esc(f.codeExcerpt)}</pre>
        </div>
      </div>
      <dl class="notes">
        <dt>Evidence</dt><dd>${esc(f.evidence)}</dd>
        <dt>Recommended</dt><dd>${esc(f.recommendedAction)}</dd>
      </dl>
    </article>`;
}

function buildReportHtml(props: AuditExportProps): string {
  const { run, clauses, corpusLabel } = props;
  const total = run.findings.length;
  const meta: [string, string][] = [
    ['Regulation', corpusLabel],
    ['Target', run.target],
    ['Model', run.model],
    ['Run date', runDate(run.ranAt)],
    ['Requirements checked', String(run.requirementsChecked)],
    ['Files scanned', String(run.filesScanned.length)],
    ['Findings raised', String(total)],
    ['Estimated cost', `$${run.usage.estimatedCostUsd}`],
  ];
  const metaRows = meta
    .map(([k, v]) => `<div class="meta-cell"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');
  const findings = run.findings
    .map((f, i) => findingBlock(f, i, total, clauses[f.requirementId]))
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Mizan Audit Report &middot; ${esc(corpusLabel)}</title>
<style>
  :root {
    --ink: #14211f;
    --muted: #52635f;
    --faint: #7c8b87;
    --line: #dfe6e3;
    --accent: #0f766e;
    --paper: #ffffff;
    --serif: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif;
    --mono: ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body {
    margin: 0;
    background: #eef1f0;
    color: var(--ink);
    font-family: var(--serif);
    line-height: 1.5;
  }
  .sheet {
    max-width: 820px;
    margin: 24px auto;
    background: var(--paper);
    padding: 44px 52px 56px;
    box-shadow: 0 1px 3px rgba(20, 33, 31, 0.12);
  }
  .letterhead {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 2px solid var(--accent);
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .scale { font-size: 30px; line-height: 1; color: var(--accent); }
  .wordmark { display: flex; flex-direction: column; }
  .wordmark .en {
    font-family: var(--mono);
    font-size: 14px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: var(--ink);
  }
  .wordmark .ar { font-size: 20px; color: var(--accent); line-height: 1.1; }
  .doc-kind {
    text-align: end;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--faint);
  }
  .doc-kind strong { display: block; color: var(--ink); font-size: 12px; margin-top: 2px; }
  .lede { margin: 22px 0 26px; font-size: 15px; color: var(--muted); max-width: 60ch; }
  .meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
    border: 1px solid var(--line);
    margin-bottom: 34px;
  }
  .meta-cell { padding: 12px 14px; border-inline-start: 1px solid var(--line); }
  .meta-cell:nth-child(4n + 1) { border-inline-start: 0; }
  .meta-cell:nth-child(n + 5) { border-top: 1px solid var(--line); }
  .meta dt {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 4px;
  }
  .meta dd { margin: 0; font-size: 14px; color: var(--ink); }
  .section-rule {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 20px;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .section-rule::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--line);
  }
  .finding {
    border-inline-start: 3px solid;
    padding: 2px 0 22px 18px;
    margin-bottom: 26px;
    break-inside: avoid;
  }
  .finding-head {
    display: flex;
    align-items: center;
    gap: 14px;
    font-family: var(--mono);
    font-size: 11px;
  }
  .finding-head .case { color: var(--faint); letter-spacing: 0.06em; }
  .finding-head .sev {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  .finding-head .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .finding-head .req { margin-inline-start: auto; color: var(--accent); }
  .finding-title { font-size: 17px; font-weight: 600; margin: 8px 0 14px; color: var(--ink); }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-bottom: 14px; }
  .col-label {
    font-family: var(--mono);
    font-size: 9.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--faint);
    margin-bottom: 6px;
  }
  .clause { margin: 0; font-size: 13.5px; color: var(--muted); }
  .code {
    margin: 0;
    font-family: var(--mono);
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--ink);
    background: #f4f7f6;
    border: 1px solid var(--line);
    border-radius: 4px;
    padding: 10px 12px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .notes { margin: 0; display: grid; grid-template-columns: max-content 1fr; gap: 4px 14px; }
  .notes dt {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--faint);
    padding-top: 2px;
  }
  .notes dd { margin: 0; font-size: 13.5px; color: var(--ink); }
  .faint { color: var(--faint); font-style: italic; }
  footer {
    margin-top: 38px;
    padding-top: 16px;
    border-top: 1px solid var(--line);
    font-size: 11.5px;
    color: var(--faint);
    line-height: 1.6;
  }
  footer .disc { color: var(--muted); }
  @page { margin: 16mm; }
  @media print {
    body { background: #fff; }
    .sheet { box-shadow: none; margin: 0; max-width: none; padding: 0; }
  }
  @media (max-width: 640px) {
    .sheet { padding: 24px; }
    .meta { grid-template-columns: repeat(2, 1fr); }
    .meta-cell:nth-child(4n + 1) { border-inline-start: 1px solid var(--line); }
    .meta-cell:nth-child(odd) { border-inline-start: 0; }
    .meta-cell:nth-child(n + 3) { border-top: 1px solid var(--line); }
    .cols { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <main class="sheet">
    <div class="letterhead">
      <div class="brand">
        <span class="scale" aria-hidden="true">&#9878;</span>
        <span class="wordmark">
          <span class="en">Mizan</span>
          <span class="ar">&#x645;&#x64A;&#x632;&#x627;&#x646;</span>
        </span>
      </div>
      <div class="doc-kind">Regulated requirements auditor<strong>Compliance Audit Report</strong></div>
    </div>
    <p class="lede">A replayed audit of <strong>${esc(run.target)}</strong> against ${esc(
      corpusLabel
    )}. Each finding ties specific code to the clause it violates. Findings are proposed, never final: a human approves or rejects each one in the review queue before it counts.</p>
    <dl class="meta">${metaRows}</dl>
    <div class="section-rule">Findings</div>
    ${findings}
    <footer>
      <p class="disc">Demonstration only, not legal advice and not a shipped compliance tool. The corpus reproduces official public legal texts; where an Arabic and English text conflict, the Arabic prevails.</p>
      <p>Generated by Mizan from a cached run recorded ${esc(runDate(run.ranAt))} &middot; model ${esc(
        run.model
      )} &middot; audit.mohamedattwa.com</p>
    </footer>
  </main>
  <script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 250); });</script>
</body>
</html>`;
}

export function AuditExport(props: AuditExportProps) {
  const { run } = props;

  const onCsv = () => {
    download(
      `mizan-audit-${run.target}-${runDate(run.ranAt)}.csv`,
      'text/csv;charset=utf-8',
      toCsv(run)
    );
  };

  const onPdf = () => {
    const html = buildReportHtml(props);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    // Popup blocked: fall back to downloading the same self-contained report.
    if (!win) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `mizan-audit-${run.target}-${runDate(run.ranAt)}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <HStack gap="3" flexWrap="wrap">
      <Button onClick={onPdf} bg="accent.solid" color="white" _hover={{ bg: 'teal.600' }} size="sm">
        Save as PDF
      </Button>
      <Button
        onClick={onCsv}
        variant="outline"
        borderColor="border.default"
        color="fg.default"
        _hover={{ borderColor: 'accent.solid', color: 'accent.fg' }}
        size="sm"
      >
        Export CSV
      </Button>
    </HStack>
  );
}
