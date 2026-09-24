"""v2 dual-theme visual audit: screenshots (3 viewports x 2 themes), overflow, console errors, axe contrast."""
import json, os, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4178"
HERE = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(HERE, "..", "screenshots", "v2")
AXE = os.path.join(HERE, "axe.min.js")
AXE_JS = """async () => {
  const res = await axe.run(document, {runOnly: ['color-contrast']});
  return JSON.parse(JSON.stringify(res.violations));
}"""
def axe_contrast(page):
    return page.evaluate(AXE_JS)

VIEWPORTS = {"desktop": (1280, 800), "tablet": (768, 1024), "mobile": (375, 812)}
PAGES = [
    ("login", "/login", None),
    ("dashboard", None, "/dashboard"),
    ("finance", None, "/finance"),
    ("products", None, "/inventory/products"),
]

report = {"base": BASE, "themes": {}, "toggle_test": None, "console_errors": [], "defects": []}

def shot(page, name, theme, vp):
    d = os.path.join(SHOTS, theme, vp)
    os.makedirs(d, exist_ok=True)
    page.screenshot(path=os.path.join(d, f"{name}.png"), full_page=(name != "products"))

def run_theme(browser, theme):
    results = {}
    for vp, (w, h) in VIEWPORTS.items():
        ctx = browser.new_context(viewport={"width": w, "height": h})
        ctx.add_init_script(f"try{{localStorage.setItem('ims-theme','{theme}')}}catch(e){{}}")
        page = ctx.new_page()
        page.on("console", lambda m, v=vp: report["console_errors"].append({"viewport": v, "text": m.text}) if m.type == "error" else None)
        page.on("pageerror", lambda e, v=vp: report["console_errors"].append({"viewport": v, "text": str(e)}))
        for name, url, nav in PAGES[1:]:
            page.goto(BASE + "/login", wait_until="networkidle")
            btn = page.get_by_role("button", name="Continue as Admin")
            if btn.count() > 0:
                btn.first.click()
                page.wait_for_url("**/dashboard", timeout=10000)
            # demo session is memory-only: navigate client-side, never full-reload
            page.evaluate("""(path) => {
                history.pushState({}, '', path);
                window.dispatchEvent(new PopStateEvent('popstate', { state: history.state }));
            }""", nav)
            page.wait_for_timeout(600)
            overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1")
            theme_attr = page.evaluate("document.documentElement.getAttribute('data-theme')")
            landed = page.url.rstrip("/") == BASE + nav.rstrip("/")
            results.setdefault(vp, {})[name] = {"overflow": overflow, "theme_attr": theme_attr, "landed": landed}
            if not landed:
                report["defects"].append(f"{theme}/{vp}/{name}: nav landed on {page.url}")
            shot(page, name, theme, vp)
        ctx.close()
    return results

with sync_playwright() as p:
    browser = p.chromium.launch()
    # login screenshot needs capture BEFORE clicking; redo properly:
    for theme in ("light", "dark"):
        # dedicated login captures
        for vp, (w, h) in VIEWPORTS.items():
            ctx = browser.new_context(viewport={"width": w, "height": h})
            ctx.add_init_script(f"try{{localStorage.setItem('ims-theme','{theme}')}}catch(e){{}}")
            page = ctx.new_page()
            page.goto(BASE + "/login", wait_until="networkidle")
            page.wait_for_timeout(250)
            shot(page, "login", theme, vp)
            ctx.close()
        report["themes"][theme] = run_theme(browser, theme)

    # toggle interaction test at desktop
    ctx = browser.new_context(viewport={"width": 1280, "height": 800})
    ctx.add_init_script("try{localStorage.setItem('ims-theme','light')}catch(e){}")
    page = ctx.new_page()
    page.goto(BASE + "/login", wait_until="networkidle")
    page.get_by_role("button", name="Continue as Admin").first.click()
    page.wait_for_url("**/dashboard", timeout=10000)
    page.wait_for_timeout(600)
    before = page.evaluate("document.documentElement.getAttribute('data-theme')")
    toggle = page.get_by_role("button", name="Switch to dark theme")
    toggle_visible = toggle.count()
    if toggle_visible:
        toggle.first.click()
        page.wait_for_timeout(200)
    after = page.evaluate("document.documentElement.getAttribute('data-theme')")
    stored = page.evaluate("localStorage.getItem('ims-theme')")
    report["toggle_test"] = {"before": before, "after_click": after, "localStorage": stored, "toggle_found": bool(toggle_visible)}
    page.screenshot(path=os.path.join(SHOTS, "dark", "desktop", "dashboard-after-toggle.png"), full_page=True)
    # reload persistence
    page.reload(wait_until="networkidle")
    if page.url.endswith("/login"):
        page.get_by_role("button", name="Continue as Admin").first.click()
        page.wait_for_url("**/dashboard", timeout=10000)
        page.wait_for_timeout(600)
    report["toggle_test"]["after_reload"] = page.url + " theme=" + page.evaluate("document.documentElement.getAttribute('data-theme')")
    # axe contrast scan on dashboard, current (dark) theme
    page.add_script_tag(path=AXE)
    violations_dark = axe_contrast(page)
    report["axe_dark"] = {"violations": [{ "id": v["id"], "impact": v["impact"],
        "nodes": [{"target": n["target"], "summary": n["failureSummary"][:200]} for n in v["nodes"][:12]]}
        for v in violations_dark]}
    # switch back to light and scan
    page.evaluate("document.documentElement.setAttribute('data-theme','light')")
    page.wait_for_timeout(200)
    violations_light = axe_contrast(page)
    report["axe_light"] = {"violations": [{ "id": v["id"], "impact": v["impact"],
        "nodes": [{"target": n["target"], "summary": n["failureSummary"][:200]} for n in v["nodes"][:12]]}
        for v in violations_light]}
    ctx.close()

    # genuine dark-theme scan in its own context
    ctx2 = browser.new_context(viewport={"width": 1280, "height": 800})
    ctx2.add_init_script("try{localStorage.setItem('ims-theme','dark')}catch(e){}")
    page2 = ctx2.new_page()
    page2.goto(BASE + "/login", wait_until="networkidle")
    page2.get_by_role("button", name="Continue as Admin").first.click()
    page2.wait_for_url("**/dashboard", timeout=10000)
    page2.wait_for_timeout(600)
    page2.add_script_tag(path=AXE)
    violations_dark2 = axe_contrast(page2)
    report["axe_dark"] = {"violations": [{ "id": v["id"], "impact": v["impact"],
        "nodes": [{"target": n["target"], "summary": n["failureSummary"][:200]} for n in v["nodes"][:12]]}
        for v in violations_dark2]}
    # also scan a table page in dark
    page2.evaluate("""(path) => { history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate', { state: history.state })); }""", "/finance/receivables")
    page2.wait_for_timeout(600)
    violations_dark3 = axe_contrast(page2)
    report["axe_dark_receivables"] = {"violations": [{ "id": v["id"], "impact": v["impact"],
        "nodes": [{"target": n["target"], "summary": n["failureSummary"][:200]} for n in v["nodes"][:12]]}
        for v in violations_dark3]}
    ctx2.close()

    # collect overflow defects
    for theme, vps in report["themes"].items():
        for vp, pages in vps.items():
            for name, info in pages.items():
                if info["overflow"]:
                    report["defects"].append(f"{theme}/{vp}/{name}: horizontal overflow")
                if info["theme_attr"] != theme:
                    report["defects"].append(f"{theme}/{vp}/{name}: data-theme={info['theme_attr']}")
    browser.close()

out = os.path.join(HERE, "..", "..", "reports", "v2-theme-audit.json")
with open(out, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)
print("DEFECTS:", len(report["defects"]))
for d in report["defects"]:
    print(" -", d)
print("AXE dark violations:", sum(v["nodes"].__len__() for v in report.get("axe_dark", {}).get("violations", [])))
print("AXE light violations:", sum(v["nodes"].__len__() for v in report.get("axe_light", {}).get("violations", [])))
print("TOGGLE:", report["toggle_test"])
print("CONSOLE ERRORS:", len(report["console_errors"]))
print("report ->", os.path.normpath(out))
