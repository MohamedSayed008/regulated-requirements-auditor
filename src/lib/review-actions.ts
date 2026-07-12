import { getStore, logEvent, reviewDecisionSchema } from '@/lib/store';

/**
 * The one governed write path for review decisions, shared by the HTTP API and
 * the MCP tool so both surfaces behave identically: a decision persists (or a
 * reset removes it) and the append-only audit log always records the action.
 */

export interface ReviewActionInput {
  findingId: string;
  runTarget: string;
  status: 'approved' | 'rejected' | 'proposed';
  note?: string;
}

export async function applyReviewDecision(
  input: ReviewActionInput
): Promise<{ reset: true } | { decision: ReturnType<typeof reviewDecisionSchema.parse> }> {
  if (input.status === 'proposed') {
    await getStore().deleteDecision(input.runTarget, input.findingId);
    logEvent({
      ts: new Date().toISOString(),
      actor: 'reviewer',
      action: 'review_decide',
      detail: `reset ${input.findingId} on ${input.runTarget} to proposed`,
    });
    return { reset: true };
  }

  const decision = reviewDecisionSchema.parse({
    findingId: input.findingId,
    runTarget: input.runTarget,
    status: input.status,
    note: input.note,
    reviewer: 'reviewer',
    decidedAt: new Date().toISOString(),
  });
  await getStore().saveDecision(decision);
  logEvent({
    ts: decision.decidedAt,
    actor: 'reviewer',
    action: 'review_decide',
    detail: `${decision.status} ${decision.findingId} on ${decision.runTarget}`,
  });
  return { decision };
}
