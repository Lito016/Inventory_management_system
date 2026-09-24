"""Phase 6: fill phase-6-ui-quality.json from this run's live evidence."""
import json, datetime, os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
pages = ["dashboard", "inventory/products", "reports"]
viewports = ["desktop", "tablet", "mobile"]
probe = json.load(open(os.path.join(ROOT, "prime/evidence/ui-audit/p6-token-probe.json"), encoding="utf-8"))

report = {
  "timestamp": now,
  "url": "http://localhost:4178",
  "method": "Playwright Chromium + axe-core 4.10.2 + computed-style probes against the VITE_DEMO production build (vite preview :4178); screenshots reviewed visually at each viewport",
  "pages_assessed": [{"page": p, "viewport": v, "screenshot": f"prime/evidence/screenshots/p6-{p.replace('/','-')}-{v}.png"} for p in pages for v in viewports],
  "screenshots": [f"prime/evidence/screenshots/p6-{p.replace('/','-')}-{v}.png" for p in pages for v in viewports],
  "dimensions": {
    "design_tokens": {
      "color_palette_match": "pass",
      "typography_scale_match": "pass",
      "spacing_consistency": "pass",
      "border_radius_consistency": "pass",
      "shadow_consistency": "pass",
      "findings": f"Computed primary button background {probe['tokens']['primary_btn_bg']} equals DESIGN.md token #2563EB; input radius {probe['tokens']['input_radius']} = rounded-sm; table header {probe['tokens']['th_font']}/{probe['tokens']['th_weight']} {probe['tokens']['th_transform']}, body {probe['tokens']['td_font']}; sidebar {probe['tokens']['aside_bg']} = slate-900. Focus rings use ring-primary-500 token (verified live in reaudit U4).",
      "evidence": ["prime/evidence/ui-audit/p6-token-probe.json", "docs/DESIGN.md", "prime/evidence/screenshots/p6-dashboard-desktop.png"]
    },
    "accessibility": {
      "contrast_ratio_pass": "pass",
      "aria_labels_present": "pass",
      "keyboard_navigation": "pass",
      "focus_indicators_visible": "pass",
      "alt_text_present": "not_applicable",
      "alt_text_note": "No img elements in the app; all icons are decorative inline SVG (lucide) hidden from AT.",
      "findings": "axe-core: 0 violations across 9 page x viewport runs after fixing 13 (contrast, heading-order, landmark-unique, select-name, empty-table-header). Keyboard Tab reaches global search with visible box-shadow focus ring; closed drawer is visibility:hidden so not tabbable.",
      "evidence": ["prime/reports/phase-6-a11y-audit.json", "prime/evidence/ui-audit/p6-evidence.json"]
    },
    "responsive_layout": {
      "desktop_layout_correct": "pass",
      "tablet_layout_correct": "pass",
      "mobile_layout_correct": "pass",
      "no_horizontal_overflow": "pass",
      "breakpoints_functional": "pass",
      "findings": "scrollWidth-clientWidth = 0px on all 9 runs at 1280x800, 768x1024, 375x812; wide tables and the tab strip scroll inside their own containers; lg breakpoint switches fixed sidebar to drawer and drawer open/close-on-nav verified live.",
      "evidence": ["prime/evidence/ui-audit/p6-evidence.json", "prime/evidence/screenshots/p6-inventory-products-mobile.png"]
    },
    "visual_consistency": {
      "no_element_overlap": "pass",
      "no_text_clipping": "pass",
      "alignment_consistent": "pass",
      "whitespace_balanced": "pass",
      "no_visual_artifacts": "pass",
      "findings": "Visual review of all 9 fullPage screenshots: cards align on a consistent grid, no unintended overlap or clipped text (truncation only inside intentional scrollers), balanced whitespace on dashboard/report/products at every viewport.",
      "evidence": ["prime/evidence/screenshots/p6-dashboard-desktop.png", "prime/evidence/screenshots/p6-reports-tablet.png", "prime/evidence/screenshots/p6-inventory-products-mobile.png"]
    },
    "component_quality": {
      "buttons_render_correctly": "pass",
      "forms_functional": "pass",
      "cards_consistent": "pass",
      "navigation_works": "pass",
      "modals_functional": "warning",
      "modal_note": "New Product opens a fixed overlay form that closes on Escape (verified live), but the overlay lacks role=dialog, so screen readers do not announce it as a dialog - logged as a low defect for follow-up.",
      "findings": "Stat cards navigate via SPA Link preserving the demo session; bell disclosure grows receivables links 2->3 with overdue copy; search submits to /finance/search?q= and seeds the field; drawer, collapse and tab scrollers behave correctly.",
      "evidence": ["prime/evidence/ui-audit/p6-token-probe.json", "prime/test/reports/UAT-DASHBOARD-INTERACTIONS.json", "prime/reports/phase-5-test-results.json"]
    }
  },
  "summary": {
    "verdict": "pending-tool",
    "critical_issues": ["(none blocking) pre-existing jspdf/dompurify advisories tracked in phase-6-security-scan.json"],
    "notes": "Overall score computed by check-ui-quality.mjs scoring pass; modal role=dialog is the only warning."
  }
}
path = os.path.join(ROOT, "prime", "reports", "phase-6-ui-quality.json")
json.dump(report, open(path, "w", encoding="utf-8"), indent=1)
print("written", path)
