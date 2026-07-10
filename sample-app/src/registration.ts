/**
 * Lease registration. Under the Ejari system a tenancy contract must be
 * registered with RERA / the Dubai Land Department to be enforceable.
 */

export interface Lease {
  id: string;
  landlordId: string;
  tenantId: string;
  annualRent: number;
  ejariNumber?: string;
}

/**
 * A lease should not be treated as active/enforceable until it carries an
 * Ejari registration number.
 *
 * SEEDED VIOLATION (LAW26-2007/ART-4/2): Article 4 requires all lease
 * contracts to be registered (Ejari). This activates a lease regardless of
 * whether it has an Ejari number, so unregistered leases are treated as valid.
 */
export function activateLease(lease: Lease): Lease {
  return { ...lease, ejariNumber: lease.ejariNumber };
}

export function isEnforceable(lease: Lease): boolean {
  // Only checks the parties, not registration.
  return Boolean(lease.landlordId && lease.tenantId);
}
