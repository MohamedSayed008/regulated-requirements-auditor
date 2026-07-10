/**
 * Audit engine CLI. Runs one audit pass against the sample-app snapshot and
 * writes the cached run the public /audit page replays.
 *
 * Run: yarn audit   (needs ANTHROPIC_API_KEY)
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { auditRunSchema } from '../src/lib/findings';
import { runAudit } from '../src/lib/audit-engine';

const OUT = join(__dirname, '..', 'src', 'data', 'audit', 'latest-run.json');

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }
  const run = auditRunSchema.parse(await runAudit());
  mkdirSync(join(__dirname, '..', 'src', 'data', 'audit'), { recursive: true });
  writeFileSync(OUT, JSON.stringify(run, null, 2) + '\n');
  console.log(
    `Audit complete: ${run.findings.length} findings across ${run.filesScanned.length} files, $${run.usage.estimatedCostUsd}`
  );
  for (const f of run.findings) {
    console.log(`  [${f.severity}] ${f.requirementId} ${f.filePath}:${f.lineStart} ${f.summary}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
