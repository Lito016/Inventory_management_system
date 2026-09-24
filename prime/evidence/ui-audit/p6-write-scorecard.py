"""Phase 6: output-quality-scorecard.json (G39) with embedded design benchmark."""
import json, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
intent = json.load(open(os.path.join(ROOT, "prime/reports/output-intent.json"), encoding="utf-8"))
import datetime

card = {
  "output_type": "dashboard",
  "artifact_inspected": "IMS demo build (VITE_DEMO production bundle) after UI/UX enhancement increment T-101..T-107: responsive shell, focus-visible tokens, honest disclosure bell, SPA-link navigation, dashboard density and data-honest movement display",
  "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
  "evidence_paths": [
    "prime/evidence/screenshots/p6-dashboard-desktop.png",
    "prime/evidence/screenshots/p6-dashboard-tablet.png",
    "prime/evidence/screenshots/p6-dashboard-mobile.png",
    "prime/evidence/screenshots/p6-inventory-products-desktop.png",
    "prime/evidence/screenshots/p6-inventory-products-tablet.png",
    "prime/evidence/screenshots/p6-inventory-products-mobile.png",
    "prime/evidence/screenshots/p6-reports-desktop.png",
    "prime/evidence/screenshots/p6-reports-tablet.png",
    "prime/evidence/screenshots/p6-reports-mobile.png",
    "prime/evidence/ui-audit/p6-evidence.json",
    "prime/evidence/ui-audit/p6-token-probe.json",
    "prime/evidence/ui-audit/pnpm-audit-prod.txt",
    "prime/reports/phase-6-a11y-audit.json",
    "prime/reports/phase-6-browser-console.json",
    "prime/reports/phase-6-ui-quality.json",
    "prime/reports/phase-6-security-scan.json",
    "prime/reports/phase-6-e2e-results.json",
    "prime/reports/phase-6-runtime-errors.json"
  ],
  "defects_found": [
    {"description": "New Product modal overlay lacks role=dialog, so screen readers do not announce it as a dialog (works visually and closes on Escape)", "severity": "medium", "status": "open-follow-up", "ref": "prime/evidence/ui-audit/p6-token-probe.json"},
    {"description": "Pre-existing jsPDF critical advisories (LFI/path traversal <=3.0.4; HTML injection <=4.2.0) in the reports PDF dependency; not introduced by this increment, browser-only exposure limited", "severity": "critical", "status": "open-preexisting-out-of-scope", "ref": "prime/reports/phase-6-security-scan.json"},
    {"description": "8 high + 15 moderate + 3 low advisories in the same jspdf/dompurify chain", "severity": "high", "status": "open-preexisting-out-of-scope", "ref": "prime/evidence/ui-audit/pnpm-audit-prod.txt"},
    {"description": "Vite build warns main chunk >500kB (pre-existing reports bundle size; demo scale unaffected - max DCL 151ms measured)", "severity": "low", "status": "accepted", "ref": "prime/reports/phase-5-build.md"},
    {"description": "No dedicated unit tests for dashboard card derivation beyond the shared movementQuantityDisplay helper (closed as acceptable in round-2 review)", "severity": "low", "status": "accepted", "ref": "prime/reports/phase-5-quality-review.md"}
  ],
  "refinement_actions": [
    "Fixed all 13 axe violations found by the evidence run: sidebar contrast (slate-400), dashboard heading order (h2), unique nav landmarks, labeled report Select, visible Actions headers on all 12 action tables",
    "Replaced sr-only table-header fallback with visible Actions header after discovering the absolute-positioned span escaped the scroller and caused 132-205px page overflow at 375px",
    "Corrected movement sign rendering to use unit-tested movementQuantityDisplay (released rows now show negative red)",
    "Converted stat-card anchors to SPA Links so the memory-only demo session survives dashboard navigation",
    "Applied sanitizeSearchTerm to the URL q parameter before ilike interpolation in finance search",
    "Follow-ups logged: add role=dialog + focus trap to Modal; upgrade jspdf/dompurify in a dedicated dependency increment"
  ],
  "final_rating": "good",
  "rating_rationale": "All increment acceptance criteria verified at the live surface (19/19 browser checks, 0 axe violations, 0 console/network errors, 0 overflow at 3 viewports, token parity #2563EB computed-style match); rating held at good rather than excellent because of the open pre-existing dependency advisories and the modal dialog-semantics gap.",
  "ui_specific": {
    "screenshots_reference": True,
    "viewports_tested": ["desktop", "tablet", "mobile"],
    "overlap_clipping_checked": True,
    "responsive_layout_checked": True
  },
  "design_benchmark_record": intent["design_benchmark_record"]
}
path = os.path.join(ROOT, "prime", "reports", "output-quality-scorecard.json")
json.dump(card, open(path, "w", encoding="utf-8"), indent=1)
print("written", path)
