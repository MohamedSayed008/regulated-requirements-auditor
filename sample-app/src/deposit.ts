/**
 * Security-deposit handling. Correct implementation, included so the auditor's
 * precision can be measured: it must NOT raise a finding here.
 */

export interface DepositLedger {
  leaseId: string;
  amountHeld: number;
  deductions: { reason: string; amount: number }[];
}

/**
 * Under Article 20 the landlord holds the security deposit to secure
 * maintenance obligations and must return it, less lawful deductions, at the
 * end of the tenancy. This tracks deductions with a reason and returns the
 * remainder, never letting the balance go negative.
 */
export function refundableBalance(ledger: DepositLedger): number {
  const deducted = ledger.deductions.reduce((sum, d) => sum + Math.max(0, d.amount), 0);
  return Math.max(0, ledger.amountHeld - deducted);
}

export function recordDeduction(
  ledger: DepositLedger,
  reason: string,
  amount: number
): DepositLedger {
  if (amount <= 0) return ledger;
  return { ...ledger, deductions: [...ledger.deductions, { reason, amount }] };
}
