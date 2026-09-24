"""Sidebar collapse smoothness check: mid-transition geometry, end state, knob, persistence."""
import json, os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4178"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "screenshots", "sidebar")
os.makedirs(OUT, exist_ok=True)

report = {"checks": [], "defects": [], "console_errors": []}

def check(name, ok, detail=""):
    report["checks"].append({"name": name, "ok": bool(ok), "detail": detail})
    if not ok:
        report["defects"].append(f"{name}: {detail}")

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_context(viewport={"width": 1280, "height": 800}).new_page()
    page.on("console", lambda m: report["console_errors"].append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: report["console_errors"].append(str(e)))

    page.goto(BASE + "/login", wait_until="networkidle")
    page.get_by_role("button", name="Continue as Admin").first.click()
    page.wait_for_url("**/dashboard", timeout=10000)
    page.wait_for_timeout(600)

    aside = page.locator("aside")
    collapsed_btn = page.get_by_role("button", name="Collapse sidebar")
    expand_btn = page.get_by_role("button", name="Expand sidebar")

    page.screenshot(path=os.path.join(OUT, "1-expanded.png"), clip={"x": 0, "y": 0, "width": 420, "height": 800})
    check("initial width 240", abs(aside.bounding_box()["width"] - 240) < 1, str(aside.bounding_box()["width"]))

    # collapse: capture mid-transition to prove labels fade while width animates (no snap)
    collapsed_btn.click()
    page.wait_for_timeout(100)
    mid_w = aside.bounding_box()["width"]
    page.screenshot(path=os.path.join(OUT, "2-mid-collapse-100ms.png"), clip={"x": 0, "y": 0, "width": 420, "height": 800})
    check("width animating mid-flight", 75 < mid_w < 235, f"mid width {mid_w}")
    mid_label_op = page.evaluate("getComputedStyle(document.querySelector('aside nav a span:last-child')).opacity")
    check("labels fading mid-flight", float(mid_label_op) < 0.5, f"opacity {mid_label_op}")

    page.wait_for_timeout(500)
    box = aside.bounding_box()
    check("collapsed width 68", abs(box["width"] - 68) < 1, str(box["width"]))
    geom = page.evaluate("""() => {
      const labels = [...document.querySelectorAll('aside nav a span:last-child')];
      const icons = [...document.querySelectorAll('aside nav a svg')];
      const nav = document.querySelector('aside nav');
      const asideEl = document.querySelector('aside');
      const r = asideEl.getBoundingClientRect();
      const iconCenters = icons.slice(0,4).map(i => { const b = i.getBoundingClientRect(); return (b.left + b.width/2 - r.left).toFixed(1); });
      return {
        labelOpacity: labels.map(l => getComputedStyle(l).opacity)[0],
        navScrollX: nav.scrollWidth > nav.clientWidth + 1,
        iconCenters,
        docOverflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
        sectionTitleOpacity: getComputedStyle(document.querySelector('aside nav div div')).opacity,
      };
    }""")
    check("nav labels invisible when collapsed", geom["labelOpacity"] == "0", str(geom["labelOpacity"]))
    check("no horizontal scrollbar in nav", not geom["navScrollX"], str(geom["navScrollX"]))
    check("no page overflow", not geom["docOverflowX"], str(geom["docOverflowX"]))
    centers = set(geom["iconCenters"])
    check("icons centered (~33.5px)", all(abs(float(c) - 33.5) < 2.5 for c in centers), str(centers))
    page.screenshot(path=os.path.join(OUT, "3-collapsed.png"), clip={"x": 0, "y": 0, "width": 420, "height": 800})

    # knob geometry + hover tooltip on collapsed item
    knob = expand_btn
    kb = knob.bounding_box()
    check("knob straddles rail border", kb["x"] < 68 < kb["x"] + kb["width"], str(kb))
    inv = page.locator("aside nav a").first
    check("collapsed item has title tooltip", inv.get_attribute("title") == "Dashboard", str(inv.get_attribute("title")))

    # expand back
    knob.click()
    page.wait_for_timeout(100)
    mid_w2 = aside.bounding_box()["width"]
    page.screenshot(path=os.path.join(OUT, "4-mid-expand-100ms.png"), clip={"x": 0, "y": 0, "width": 420, "height": 800})
    check("expand width animating", 75 < mid_w2 < 235, f"mid width {mid_w2}")
    page.wait_for_timeout(500)
    check("expanded width 240", abs(aside.bounding_box()["width"] - 240) < 1, str(aside.bounding_box()["width"]))
    op = page.evaluate("getComputedStyle(document.querySelector('aside nav a span:last-child')).opacity")
    check("labels visible after expand", op == "1", op)
    page.screenshot(path=os.path.join(OUT, "5-expanded-again.png"), clip={"x": 0, "y": 0, "width": 420, "height": 800})

    # persistence: collapse, then simulate route nav staying collapsed (memory session), check localStorage
    collapsed_btn.click()
    page.wait_for_timeout(400)
    stored = page.evaluate("localStorage.getItem('ims-sidebar-collapsed')")
    check("collapse persisted to localStorage", stored == "true", str(stored))

    # active indicator still present when collapsed
    ind = page.evaluate("!!document.querySelector('aside nav a[aria-current=page] span')")
    check("active indicator kept when collapsed", ind, str(ind))

    browser.close()

with open(os.path.join(HERE, "..", "..", "reports", "sidebar-motion-audit.json"), "w") as f:
    json.dump(report, f, indent=2)
print("DEFECTS", len(report["defects"]))
for d in report["defects"]:
    print(" -", d)
print("console errors:", len(report["console_errors"]))
