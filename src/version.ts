/**
 * CareSolis Version Control - Single Source of Truth
 *
 * SEMANTIC VERSIONING: MAJOR.MINOR.PATCH
 * - MAJOR: Breaking changes, incompatible API changes
 * - MINOR: New features, backward compatible
 * - PATCH: Bug fixes, backward compatible
 *
 * FDA COMPLIANCE: Version must be updated for any changes affecting:
 * - Medication dispensing logic
 * - Escalation algorithms
 * - Safety-critical features
 * - Audit logging mechanisms
 */

export const VERSION = {
  major: 1,
  minor: 3,
  patch: 3,

  // Full version string
  get full() {
    return `${this.major}.${this.minor}.${this.patch}`;
  },

  // Release designation
  release: 'STABLE' as 'ALPHA' | 'BETA' | 'RC' | 'STABLE',

  // Build/signature for FDA audit trail
  signature: 'CARESOLIS_RELEASE_SIG_10D',

  // Full display string
  get display() {
    return `v${this.full} ${this.release}`;
  },

  // Compact display for UI
  get compact() {
    return `v${this.full}`;
  }
};

// Freeze to prevent runtime modifications (immutability)
Object.freeze(VERSION);
