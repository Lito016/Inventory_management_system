# Phase 2 — Define: UI/UX Enhancement (v1.2)

**Run:** `ims-uiux-enhance` · **Quality mode:** Autopilot · **Date:** 2026-09-24
**Owner role:** prime-requirement (assumed in main agent per orchestrator routing)

## Methodology checklist — steps applied

- [x] Evidence recall: resumed prior session context (demo pipeline, deployment state, design docs) from compaction summary and `prime/state-archive-ubms-complete/`
- [x] Research/verified audit of the running product rather than assumption: Playwright drove the **live deployed demo** (`https://inventory-management-system-55w.pages.dev`) at 1280×800, 768×1024, 375×812; 15 full-page screenshots + interaction probes captured
- [x] Requirement elicitation from source-of-truth documents: `docs/DESIGN.md` v1.0 (tokens, density principles, WCAG AA table), `docs/PRD.md` §3 personas, current component source
- [x] Benchmark reference: ui-ux-pro-max design-system selector run for "dense inventory admin panel" (`prime/evidence/ui-audit/design-system-recommendation.md`); adopted its pre-delivery checklist (focus states, hover transitions, contrast, responsive breakpoints 375/768/1024/1440), rejected dark-OLED style + Fira typography as conflicting with the approved light Inter theme
- [x] False-positive control: banner "missing" flags were re-verified against the DOM (`querySelector('[role=status]')` → true) and dismissed; header search/bell dead-affordance claim verified in source (no handlers, `Header.tsx:81-89`)

## Evidence

| Artifact | Path |
|---|---|
| Automated findings (corrected) | `prime/evidence/ui-audit/audit-findings.json` (UX-1…UX-8) |
| Screenshots ×3 viewports ×5 pages | `prime/evidence/ui-audit/shots/` |
| Design-system benchmark output | `prime/evidence/ui-audit/design-system-recommendation.md` |
| Audit script (reproducible) | `prime/evidence/ui-audit/audit.py` |

## Problem → requirement mapping

| Finding | Severity | Requirement |
|---|---|---|
| UX-1 no mobile layout (fixed 240px sidebar on 375px viewport) | critical | U1 drawer shell |
| UX-2 horizontal page overflow on tables (768/375) | major | U2 contained table scroll |
| UX-3 collapse leaves ~172px dead gap (`ml-60` hardcoded) | major | U3 synced content offset |
| UX-4 no visible focus indicator (computed shadow/outline none) | major | U4 focus ring |
| UX-5 duplicated page title (breadcrumb = H1) | minor | U6 single title |
| UX-6 token drift slate/blue vs DESIGN.md gray/primary | minor | U8 token fidelity |
| UX-7 dashboard dead space below Modules grid | minor | U7 density |
| UX-8 header search/bell are dead buttons | minor | U5 honest affordances |

## Scope decision

Contained front-end increment: responsive shell + interaction quality + density, no IA/route changes, no new dependencies, no schema impact. Traceability written into `docs/PRD.md` → "Increment: UI/UX Enhancement (v1.2)" with Given/When/Then acceptance criteria U1–U8.

## Assumptions & risks

- Demo build (`VITE_DEMO=true`) is the shareable surface; enhancements must not break mock-mode login flow or the Cloudflare auto-deploy pipeline.
- U5 search popover scope reduced to "navigate to finance search with query" if a global popover proves disproportionate — recorded as acceptable substitution, not silent drop.
- Mobile support target is "usable and non-overflowing", not a redesigned touch UI (out of scope v1.2).

## Gate criteria for later phases

Phase 6 must re-run the same 3-viewport Playwright audit and show: zero horizontal overflow at 768/375, drawer operable at 375, focus ring present on Tab, dashboard populated below Modules, and contrast/layout checks per `docs/DESIGN.md` §8.
