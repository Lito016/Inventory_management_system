"""Phase 6 browser evidence: screenshots at 3 viewports, console/network capture,
load timings, overflow checks and axe-core accessibility runs on the demo build."""
import json, os, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4178"
SHOT_DIR = "prime/evidence/screenshots"
AXE_SRC = open("prime/evidence/ui-audit/axe.min.js", encoding="utf8").read()
VIEWPORTS = {"desktop": (1280, 800), "tablet": (768, 1024), "mobile": (375, 812)}
PAGES = ["/dashboard", "/inventory/products", "/reports"]

evidence = {"timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "url": BASE,
            "console_messages": [], "network_failures": [], "pages": [], "a11y": []}

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)
    for vp, (w, h) in VIEWPORTS.items():
        ctx = b.new_context(viewport={"width": w, "height": h})
        pg = ctx.new_page()
        pg.on("console", lambda m, v=vp: evidence["console_messages"].append(
            {"page": v, "type": m.type, "text": m.text[:200]}) if m.type in ("error", "warning") else None)
        pg.on("pageerror", lambda e, v=vp: evidence["console_messages"].append(
            {"page": v, "type": "error", "text": str(e)[:200]}))
        pg.on("requestfailed", lambda r, v=vp: evidence["network_failures"].append(
            {"page": v, "url": r.url[:160], "failure": (r.failure or "")[:120]}))

        t0 = time.time()
        pg.goto(BASE + "/login", wait_until="networkidle")
        login_ms = round((time.time() - t0) * 1000)
        pg.locator("button:has-text('Admin')").first.click()
        pg.wait_for_url("**/dashboard", timeout=8000)
        pg.wait_for_timeout(700)

        for path in PAGES:
            if path != "/dashboard" and not pg.url.rstrip("/").endswith(path):
                href = path
                mb = pg.locator("button[aria-label='Open navigation menu']")
                if mb.count() and mb.first.is_visible():
                    mb.first.click(); pg.wait_for_timeout(250)
                pg.locator(f"aside a[href='{href}']").first.click()
                pg.wait_for_url("**" + path, timeout=8000)
            pg.wait_for_selector("main", timeout=8000)
            pg.wait_for_timeout(600)
            nav = pg.evaluate("""() => {
                const e = performance.getEntriesByType('navigation')[0];
                return e ? Math.round(e.domContentLoadedEventEnd) : null;
            }""")
            overflow = pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            shot = f"{SHOT_DIR}/p6-{path.strip('/').replace('/', '-')}-{vp}.png"
            pg.screenshot(path=shot, full_page=True)
            # axe run
            pg.evaluate(AXE_SRC)
            axe_res = pg.evaluate("""() => axe.run({ resultTypes: ['violations'] }).then(r => ({
                violations: r.violations.map(v => ({id: v.id, impact: v.impact, nodes: v.nodes.length}))
            }))""")
            evidence["pages"].append({"path": path, "viewport": vp, "screenshot": shot,
                                      "dcl_ms": nav, "h_overflow_px": overflow})
            evidence["a11y"].append({"page": path, "viewport": vp, "tool": "axe",
                                     "violations": axe_res["violations"]})
        ctx.close()
    b.close()

with open("prime/evidence/ui-audit/p6-evidence.json", "w") as f:
    json.dump(evidence, f, indent=2)
print(json.dumps({
    "pages": len(evidence["pages"]),
    "console_errors": sum(1 for m in evidence["console_messages"] if m["type"] == "error"),
    "console_warnings": sum(1 for m in evidence["console_messages"] if m["type"] == "warning"),
    "network_failures": len(evidence["network_failures"]),
    "axe_violations_total": sum(len(a["violations"]) for a in evidence["a11y"]),
    "violations_detail": sorted({v["id"] for a in evidence["a11y"] for v in a["violations"]}),
    "overflow_nonzero": [e_["path"] + "/" + e_["viewport"] for e_ in evidence["pages"] if e_["h_overflow_px"] > 2],
    "max_dcl_ms": max((e_["dcl_ms"] or 0) for e_ in evidence["pages"]),
    "login_ms": login_ms,
}, indent=1))
