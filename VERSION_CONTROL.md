# CareSolis Version Control Procedure

## Overview
CareSolis follows **Semantic Versioning (SemVer)** with FDA compliance requirements for medical device software.

## Single Source of Truth
**File:** `/src/version.ts`

This is the **ONLY** file that defines the application version. All UI displays pull from this file.

## Semantic Versioning Format
```
MAJOR.MINOR.PATCH
```

### Version Number Meanings

#### MAJOR (v**X**.0.0)
Increment when you make **incompatible changes**:
- Breaking API changes
- Database schema changes requiring migration
- Medication dispensing logic changes
- Safety-critical algorithm changes
- Any change that breaks backward compatibility

**Example:** v1.0.0 → v2.0.0

#### MINOR (vX.**Y**.0)
Increment when you add **new features** (backward compatible):
- New pages or modules
- New medication management features
- Enhanced escalation capabilities
- New integrations or webhooks
- UI improvements that don't break existing functionality

**Example:** v1.0.0 → v1.1.0

#### PATCH (vX.Y.**Z**)
Increment when you make **bug fixes** (backward compatible):
- Bug fixes
- Performance improvements
- UI tweaks
- Security patches (non-breaking)
- Documentation updates

**Example:** v1.0.0 → v1.0.1

## Release Designations

- **ALPHA**: Early development, unstable
- **BETA**: Feature complete, testing phase
- **RC** (Release Candidate): Pre-release, final testing
- **STABLE**: Production ready, FDA cleared

## How to Update Version

### Step 1: Edit `/src/version.ts`
```typescript
export const VERSION = {
  major: 1,
  minor: 1,  // ← Increment this
  patch: 0,
  release: 'STABLE'
  // ...
};
```

### Step 2: Update Package.json (Optional but Recommended)
```json
{
  "version": "1.1.0"
}
```

### Step 3: Document Changes
Update `CHANGELOG.md` with:
- Version number
- Date
- List of changes
- Breaking changes (if MAJOR)

### Step 4: Commit with Version Tag
```bash
git add src/version.ts package.json CHANGELOG.md
git commit -m "chore: bump version to v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0 - New medication features"
git push origin main --tags
```

## FDA Compliance Requirements

### When to Update Version (FDA Regulated)
You **MUST** update the version for any changes to:

1. **Medication Management**
   - Dispensing logic
   - Dose scheduling algorithms
   - Time-critical medication handling
   - Blister pack management

2. **Safety-Critical Features**
   - Escalation algorithms
   - Alert thresholds
   - Care circle notifications
   - Emergency protocols

3. **Audit & Logging**
   - Event logging mechanisms
   - Audit trail generation
   - FDA compliance reporting
   - Data integrity checks

4. **Device Communication**
   - Device binding/pairing
   - Firmware updates
   - Sensor readings
   - Malfunction detection

### Audit Trail
The `signature` field in `version.ts` provides a unique identifier for audit purposes:
```typescript
signature: 'CARESOLIS_RELEASE_SIG_7F'
```

Update this for each official release to maintain FDA audit trail.

## Version Display Locations

### 1. FDA Banner (Top of App)
Shows: `FDA CLASS II MEDICAL DEVICE • v1.0.0`
- Always visible
- Automatically updates from `VERSION.compact`

### 2. About/Settings Page (Future)
Shows: `v1.0.0 STABLE`
- Full version with release designation
- Uses `VERSION.display`

### 3. Logs & Audit Trail
Shows: Full version + signature
- For FDA compliance
- Includes `VERSION.signature`

## Pre-Release Checklist

Before incrementing version:

- [ ] All tests pass
- [ ] FDA compliance checks complete
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Backup created
- [ ] Rollback plan documented

## Example Version History

```
v1.0.0 - Initial FDA clearance release
v1.0.1 - Bug fix: Timezone display correction
v1.1.0 - New feature: Care messaging module
v1.1.1 - Bug fix: Mobile responsiveness
v2.0.0 - Breaking: New medication API structure
```

## Emergency Hotfix Procedure

For critical bugs in production:

1. Create hotfix branch from `main`
2. Fix the issue
3. Increment PATCH version
4. Update `signature` with hotfix designation
5. Fast-track FDA notification if safety-critical
6. Deploy immediately
7. Merge back to `main`

## Questions?

Contact the development lead or refer to:
- FDA 21 CFR Part 11 (Electronic Records)
- IEC 62304 (Medical Device Software Lifecycle)
- ISO 13485 (Quality Management Systems)
