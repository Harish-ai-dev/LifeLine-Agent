# Original User Request

## 2026-08-30T13:35:22Z

# LifeLine Agent — Full-App Autonomous Scan, Report & Fix

## Context
You have live browser tools. Use them directly — do not guess at UI state from source code alone. Every finding in your report and every "fixed" claim must be backed by a screenshot you took yourself, before and after.

Source of Truth Documents (read before making any decision):
- docs/01-architecture.md
- docs/03-decision-log.md
- docs/04-agent-contracts.md
- docs/07-scope-lock.md
- docs/09-parallel-build-contract.md
- docs/10-verification-report.md

Golden Rule: If you are about to make a decision not already written in docs/03-decision-log.md, stop and add it there first, then code.

Working directory: c:\Users\shado\Documents\GitHub\ LifeLine Agent
Integrity mode: development

---

## Phase 1 — Full Scan (report only, no fixes yet)
Using your browser tool, visit every reachable page/portal in the app:
1. Public landing / marketing showcase: http://localhost:3000/web, http://localhost:3000/
2. Portal selector ? login flow (all 4 roles: Hospital Console, Clinical Staff, Blood Donor, Health Authority)
3. Each role's post-login dashboard/overview:
   - Hospital Console: /hospital, /hospital/facility/[id]
   - Blood Donor: /donor, /donor/profile, /donor/requests, /donor/donations
   - Government Authority: /government, /government/network, /government/report, /government/audit
4. Every sidebar destination within each role:
   - Facilities directory (/hospital/facilities), beds (/hospital/beds), blood bank (/hospital/blood-bank), requests (/hospital/requests), issues (/hospital/issues), inventory (/hospital/inventory), patients (/hospital/patients), sos (/hospital/sos), audit (/hospital/audit)
5. Modals and overlays:
   - Unified Copilot & Notifications popup overlay (triggered via bell icon & Ask AI button in Topbar)
   - Facility switcher dropdown in Topbar
   - Emergency SOS modal
   - Staff Broadcast modal

At each page, screenshot at these widths: 375px, 768px, 1024px, 1440px, 1920px.

For each page, check for and log:
- Functional bugs (broken links, dead buttons, console errors, unhandled API states, forms that don't submit)
- Data/binding bugs (discrepancies between facility URL and rendered data/telemetry, user identity)
- Layout bugs (overlap, text clipping/truncation, elements bleeding off-screen, broken/empty sections, asymmetric spacing)
- Consistency bugs (lingering dark/light token collisions, duplicate components)
- Security/exposure issues (credentials, tokens, internal usernames or keys visible)
- Responsiveness across all 5 viewports

Compile all findings into docs/11-full-scan-findings.md:
| # | Page | Breakpoint | Category | Severity (P0/P1/P2) | Description | Screenshot |

Severity Guide:
- P0: Security/credential exposure, broken core flow (can't login, can't dispatch), data corruption
- P1: Visible bug that would embarrass the product in a demo (truncation, wrong name, overlapping elements, broken responsive layout)
- P2: Minor polish (spacing, alignment, wording)

---

## Phase 2 — Fix, in severity order
Work through the findings list P0 ? P1 ? P2:
1. Make the change.
2. Re-open the actual page in your browser tool.
3. Screenshot it again at the same breakpoint(s) the bug was found at.
4. Confirm the defect is resolved with no side-effect regressions.
5. If a fix requires a new decision not already in docs/03-decision-log.md, log it there first.

---

## Phase 3 — Final Report
Update docs/10-ui-ux-remediation-report.md with:
| # | Finding | Severity | Status (Fixed / Partially Fixed / Flagged for decision) | Before Screenshot | After Screenshot |

End with a summary paragraph: total findings, count fully resolved, count still open, and any human review notes. Nothing gets marked "Fixed" without an attached after-screenshot proving the fix.
