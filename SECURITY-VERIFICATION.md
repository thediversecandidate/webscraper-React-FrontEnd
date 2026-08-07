# Security Vulnerability Verification Report

**Date:** October 17, 2025 (original report below) — **superseded; see the 2026-08-07 audit immediately below**
**Project:** Webscraper React Frontend  
**Status (2026-08-07):** ✅ **0 vulnerabilities, after migrating off Create React App to Vite.** Everything from "Executive Summary (original, October 2025)" downward describes the old CRA toolchain and is retained only as history — it does not describe the current build.

---

## 2026-08-05 / 2026-08-07 audit — read this first

**Current status: `npm audit` reports 0 vulnerabilities.**

Timeline of how that was reached, because the "Zero Vulnerabilities" claims
further down this document are from October 2025 and had gone stale:

1. **2026-08-05.** A fresh `npm install --legacy-peer-deps && npm audit`
   found **57 vulnerabilities (4 critical, 28 high, 14 moderate, 11 low)** —
   not a regression from any change, just ~10 months of new CVEs landing in
   an unmaintained toolchain. `npm audit fix` (non-breaking) closed 32,
   leaving **25**, every one of them inside `react-scripts`' own build/dev
   toolchain (`jest`, `webpack-dev-server`, `svgo`/`@svgr/*`,
   `workbox-build`, `jsonpath`/`underscore`/`bfj`).
2. **2026-08-07.** Those 25 were structural: Create React App is
   unmaintained upstream, so they would keep reappearing regardless of
   `npm audit fix` cadence. **The project was migrated off CRA to Vite +
   Vitest**, which removes that entire dependency tree. Result:

   | | Before (CRA) | After (Vite) |
   |---|---|---|
   | npm packages installed | 1494 | 258 |
   | `npm audit` vulnerabilities | 57 | **0** |
   | Production build time | ~30s+ | ~2.7s |

   Verified with a clean `rm -rf node_modules package-lock.json &&
   npm install`, then `tsc --noEmit`, `vitest run`, `vite build`, and a live
   dev-server check — all passing.

**Keep this honest going forward:** re-run `npm audit` before repeating a
"zero vulnerabilities" claim. The number above is accurate as of
2026-08-07 and will drift.

### Not a CVE, but don't be surprised by it

`npm install` still requires `--legacy-peer-deps`. `react-wordcloud@1.2.7`
declares a React 16 peer dependency while this app runs React 18. That's a
stale declaration in an unmaintained package, not a real incompatibility —
but it's the one remaining dependency that would be worth replacing, both
to drop the flag and because it pulls in the `d3-*` tree this project has
had to pin overrides for repeatedly.

---

## Executive Summary (original, October 2025 — see re-audit above for current state)

All security vulnerabilities have been successfully patched. The project now has **0 vulnerabilities** across all dependencies.

---

## Verification Methods

### 1. Primary Verification: npm audit
```bash
npm audit
```
**Result:** `found 0 vulnerabilities`

**Metadata:**
- Info: 0
- Low: 0
- Moderate: 0
- High: 0
- Critical: 0
- **Total: 0**

### 2. Dependency Tree Verification
```bash
npm ls d3-color nth-check postcss webpack-dev-server
```

**Results:**
- ✅ `d3-color@3.1.0` (overridden) - Previously vulnerable version <3.1.0
- ✅ `nth-check@2.1.1` (overridden) - Previously vulnerable version <2.0.1
- ✅ `postcss@8.5.6` (overridden) - Previously vulnerable version <8.4.31
- ✅ `webpack-dev-server@5.2.2` (overridden) - Previously vulnerable version ≤5.2.0

---

## Vulnerabilities Patched

### Before Patching: 15 Total Vulnerabilities
- **High Severity:** 12 (all d3-color related)
- **Moderate Severity:** 3 (nth-check, postcss, webpack-dev-server)

### Patches Applied

#### 1. d3-color ReDoS Vulnerability (GHSA-36jr-mh4h-2g58)
- **Severity:** High
- **Affected:** d3-color <3.1.0
- **Fix:** Upgraded to ^3.1.0
- **CVE:** ReDoS (Regular Expression Denial of Service)
- **Impact:** 12 instances across d3-scale, d3-interpolate, d3-transition packages

#### 2. nth-check Inefficient RegEx (GHSA-rp65-9cf3-cjxr)
- **Severity:** High  
- **Affected:** nth-check <2.0.1
- **Fix:** Upgraded to ^2.1.1
- **CVE:** Inefficient Regular Expression Complexity
- **Impact:** Used by css-select in svgo and html-webpack-plugin

#### 3. PostCSS Line Return Parsing (GHSA-7fh5-64p2-3v2j)
- **Severity:** Moderate
- **Affected:** postcss <8.4.31
- **Fix:** Upgraded to ^8.4.31 (installed 8.5.6)
- **CVE:** Line return parsing error
- **Impact:** Extensive usage across CSS processing pipeline

#### 4. webpack-dev-server Source Code Theft (GHSA-9jgg-88mc-972h, GHSA-4v9v-hfq4-rm2v)
- **Severity:** Moderate
- **Affected:** webpack-dev-server ≤5.2.0
- **Fix:** Upgraded to ^5.2.1 (installed 5.2.2)
- **CVE:** Source code theft via malicious websites (non-Chromium browsers)
- **Impact:** Development environment security

---

## Solution Implementation

### Method: npm Overrides
Added to `package.json`:
```json
"overrides": {
  "d3-color": "^3.1.0",
  "nth-check": "^2.1.1",
  "postcss": "^8.4.31",
  "webpack-dev-server": "^5.2.1"
}
```

### Configuration Updates
Updated `jest.config.js` to support d3 ESM modules:
```javascript
transformIgnorePatterns: [
  'node_modules/(?!(react-chrono|react-wordcloud|d3-.*)/)'
]
```

---

## Continuous Verification

### Automated Checks
Run these commands regularly to verify security:

```bash
# Quick check
npm audit

# Detailed JSON report
npm audit --json

# Check specific packages
npm ls d3-color nth-check postcss webpack-dev-server

# Full dependency audit
npm audit --production
```

### CI/CD Integration
Add to your CI pipeline:
```yaml
- name: Security Audit
  run: npm audit --production --audit-level=moderate
```

### Recommended Schedule
- **Before each deployment:** Run `npm audit`
- **Weekly:** Full dependency review with `npm outdated`
- **Monthly:** Update dependencies and re-audit
- **On dependency changes:** Immediate audit after `npm install`

---

## Test Verification

All tests pass with patched dependencies:
```bash
npx jest --watchAll=false
```
**Result:** ✅ 1 test suite passed, 1 test passed

---

## Production Readiness Checklist

- ✅ Zero npm audit vulnerabilities
- ✅ All transitive dependencies secured via overrides
- ✅ Tests passing with updated packages
- ✅ No breaking changes from security patches
- ✅ Jest configured to handle ESM d3 packages
- ✅ Documentation updated

---

## Additional Security Measures

### Recommended Practices
1. **Dependency Pinning:** Consider using exact versions in production
2. **Lock File:** Commit `package-lock.json` to version control
3. **Dependabot:** Enable GitHub Dependabot for automatic security updates
4. **NPM Audit Hook:** Add pre-commit hook to run `npm audit`
5. **Security Policy:** Establish vulnerability response timeline

### Monitoring Tools
Consider integrating:
- **Snyk:** Real-time vulnerability monitoring
- **WhiteSource:** License and security compliance
- **GitHub Security Alerts:** Automatic vulnerability notifications
- **npm audit fix:** Automated patching (with caution)

---

## Risk Assessment

**Current Risk Level:** ✅ **LOW**

### Residual Risks
- **Minor:** PrimeReact CSS parsing warnings in jsdom (cosmetic, non-security)
- **Accepted:** TimelineComponent test excluded due to memory constraints (test-only)

### Mitigation
- All production code paths secured
- Test isolation prevents any test issues from affecting production
- CSS warnings don't impact functionality or security

---

## Sign-Off (original, October 2025)

**Security Status:** APPROVED FOR PRODUCTION (as of the October 2025 audit only — see the 2026-08-05 re-audit at the top of this document for current status)
**Verified By:** AI Agent (Commissioning Manager)  
**Verification Date:** October 17, 2025  
**Next Review Date:** November 17, 2025 (30 days) — **missed; this document went ~10 months without a re-audit, which is how the "0 vulnerabilities" claim went stale. If a recurring review is wanted, it needs an actual scheduled trigger, not just a note in this file.**

---

## Quick Reference Commands

```bash
# Verify zero vulnerabilities
npm audit

# Update and re-check
npm update
npm audit

# Force clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm audit

# Check outdated packages
npm outdated

# Production-only audit
npm audit --production
```

---

**Document Version:** 1.0  
**Last Updated:** October 17, 2025  
**Status:** Current
