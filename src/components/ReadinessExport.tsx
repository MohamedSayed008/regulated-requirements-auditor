'use client';

import { Button, HStack } from '@chakra-ui/react';
import { type ReadinessReport } from '@/lib/readiness';

/**
 * Client-side export of a readiness report: a CSV of the checks and a
 * print-ready report in the same light "filed document" style as the audit
 * export, opened in a new tab with the print dialog ready so it saves as PDF.
 * No dependencies, no server round-trip.
 */

export interface ReadinessClause {
  articleRef: string;
  textEn: string;
}

interface ReadinessExportProps {
  report: ReadinessReport;
  clauses: Record<string, ReadinessClause>;
  /** YYYY-MM-DD shown on the report; passed in so render stays deterministic. */
  runDate: string;
}

const STATUS_INK: Record<string, string> = {
  pass: '#15803d',
  fail: '#b91c1c',
  not_assessed: '#64748b',
};

const STATUS_LABEL: Record<string, string> = {
  pass: 'Pass',
  fail: 'Fail',
  not_assessed: 'Not assessed',
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

function toCsv(report: ReadinessReport, clauses: Record<string, ReadinessClause>): string {
  const header = ['check', 'status', 'severity', 'requirementId', 'articleRef', 'detail', 'fix'];
  const rows = report.checks.map(check =>
    [
      check.label,
      check.status,
      check.severity,
      check.requirementId,
      clauses[check.requirementId]?.articleRef ?? '',
      check.detail,
      check.status === 'fail' ? check.fix : '',
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

function checkBlock(
  check: ReadinessReport['checks'][number],
  clause: ReadinessClause | undefined
): string {
  const ink = STATUS_INK[check.status] ?? '#64748b';
  return `
    <article class="check" style="border-inline-start-color:${ink}">
      <header class="check-head">
        <span class="status"><span class="dot" style="background:${ink}"></span>${esc(STATUS_LABEL[check.status] ?? check.status)}</span>
        <span class="sev">${esc(check.severity)}</span>
        <span class="req">${esc(check.requirementId)}${clause ? ` &middot; ${esc(clause.articleRef)}` : ''}</span>
      </header>
      <h3 class="check-title">${esc(check.label)}</h3>
      <p class="detail">${esc(check.detail)}</p>
      ${check.status === 'fail' ? `<p class="fix"><strong>Fix:</strong> ${esc(check.fix)}</p>` : ''}
      ${clause ? `<p class="clause">${esc(clause.textEn)}</p>` : ''}
    </article>`;
}

function buildReportHtml(props: ReadinessExportProps): string {
  const { report, clauses, runDate } = props;
  const meta: [string, string][] = [
    ['Regulation', 'UAE eInvoicing mandate'],
    ['Run date', runDate],
    ['Checks passed', String(report.summary.pass)],
    ['Checks failed', String(report.summary.fail)],
    ['Not assessed', String(report.summary.notAssessed)],
    ['Readiness', `${report.summary.readyPercent}%`],
  ];
  const metaRows = meta
    .map(([k, v]) => `<div class="meta-cell"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`)
    .join('');
  const fixes = report.fixes
    .map((f, i) => `<li><strong>${i + 1}.</strong> ${esc(f.label)}: ${esc(f.fix)}</li>`)
    .join('');
  const checks = report.checks.map(c => checkBlock(c, clauses[c.requirementId])).join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Mizan eInvoicing Readiness Report</title>
<style>
  :root {
    --ink: #14211f;
    --muted: #52635f;
    --line: #dfe6e3;
    --accent: #0f766e;
    --serif: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, 'Times New Roman', serif;
    --mono: ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { margin: 0; background: #eef1f0; color: var(--ink); font-family: var(--serif); line-height: 1.5; }
  .sheet { max-width: 820px; margin: 24px auto; background: #fff; padding: 48px 56px; border: 1px solid var(--line); }
  h1 { font-size: 26px; font-weight: 500; margin: 0 0 4px; }
  .subtitle { color: var(--muted); margin: 0 0 24px; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 24px; border-block: 1px solid var(--line); padding: 16px 0; margin-bottom: 28px; }
  .meta-cell dt { font-family: var(--mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
  .meta-cell dd { margin: 2px 0 0; font-size: 14px; }
  h2 { font-size: 16px; margin: 28px 0 10px; }
  .fixes { margin: 0; padding-inline-start: 0; list-style: none; }
  .fixes li { margin-bottom: 8px; font-size: 13px; }
  .check { border: 1px solid var(--line); border-inline-start-width: 4px; padding: 14px 18px; margin-bottom: 14px; break-inside: avoid; }
  .check-head { display: flex; gap: 14px; font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .status { display: inline-flex; align-items: center; gap: 6px; }
  .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
  .check-title { font-size: 15px; margin: 6px 0 4px; }
  .detail { font-size: 13px; margin: 0 0 6px; }
  .fix { font-size: 13px; margin: 0 0 6px; color: #7c2d12; }
  .clause { font-size: 12px; color: var(--muted); border-inline-start: 2px solid var(--line); padding-inline-start: 10px; margin: 6px 0 0; }
  .foot { margin-top: 28px; font-size: 11px; color: var(--muted); border-top: 1px solid var(--line); padding-top: 12px; }
  @media print { body { background: #fff; } .sheet { margin: 0; border: 0; padding: 24px 8px; max-width: none; } }
</style>
</head>
<body>
  <main class="sheet">
    <h1>eInvoicing Readiness Report</h1>
    <p class="subtitle">Field-level validation against the UAE eInvoicing mandate &middot; Mizan</p>
    <dl class="meta">${metaRows}</dl>
    ${fixes ? `<h2>What to fix first</h2><ol class="fixes">${fixes}</ol>` : ''}
    <h2>All checks</h2>
    ${checks}
    <p class="foot">Generated by Mizan (demonstration, not tax advice). Every check cites the requirement unit it validates; verify against the official texts of Ministerial Decision No. (243) of 2025 and the Ministry of Finance data dictionary before relying on it.</p>
  </main>
  <script>window.addEventListener('load', function () { window.print(); });</script>
</body>
</html>`;
}

export function ReadinessExport(props: ReadinessExportProps) {
  const onPdf = () => {
    const html = buildReportHtml(props);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    // Popup blocked: fall back to downloading the same self-contained report.
    if (!win) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `mizan-readiness-${props.runDate}.html`;
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
        size="sm"
        variant="outline"
        borderColor="border.default"
        color="fg.muted"
        _hover={{ color: 'fg.default', borderColor: 'accent.solid' }}
        onClick={() =>
          download(
            `mizan-readiness-${props.runDate}.csv`,
            'text/csv;charset=utf-8',
            toCsv(props.report, props.clauses)
          )
        }
      >
        Download CSV
      </Button>
    </HStack>
  );
}
