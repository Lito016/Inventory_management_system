"""Phase 6 token/modal probe — evidence for design-token and component-quality checks."""
import json
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4178"
out = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 800})
    pg = ctx.new_page()
    pg.goto(BASE + "/login", wait_until="networkidle")
    pg.locator("button:has-text('Admin')").first.click()
    pg.wait_for_url("**/dashboard", timeout=10000)
    pg.wait_for_timeout(500)
    out["dashboard_h2_sizes"] = pg.evaluate("""() => [...document.querySelectorAll('h2')].map(h => getComputedStyle(h).fontSize + '/' + getComputedStyle(h).fontWeight)""")

    pg.locator("aside a[href='/inventory/products']").first.click()
    pg.wait_for_url("**/inventory/products", timeout=8000)
    pg.wait_for_selector("table", timeout=8000)
    pg.wait_for_timeout(600)
    out["tokens"] = pg.evaluate("""() => {
      const btn = document.querySelector('button.bg-primary-600, button[class*="primary-600"]');
      const inp = document.querySelector('input');
      const th = document.querySelector('th');
      const td = document.querySelector('tbody td');
      const g = (el, prop) => el ? getComputedStyle(el)[prop] : null;
      return {
        primary_btn_bg: g(btn, 'backgroundColor'),
        input_radius: g(inp, 'borderRadius'),
        th_font: g(th, 'fontSize'), th_weight: g(th, 'fontWeight'), th_transform: g(th, 'textTransform'),
        td_font: g(td, 'fontSize'),
        aside_bg: g(document.querySelector('aside'), 'backgroundColor'),
      };
    }""")
    # modal: click first data row -> dialog
    row = pg.locator("tbody tr").first
    row.click()
    pg.wait_for_timeout(400)
    dlg = pg.locator("[role='dialog'], .fixed:has(h2, h3)")
    out["modal_open"] = dlg.count() >= 1
    if out["modal_open"]:
        pg.keyboard.press("Escape")
        pg.wait_for_timeout(300)
        out["modal_close_esc"] = pg.evaluate("() => !document.querySelector('[role=dialog]') || [...document.querySelectorAll('[role=dialog]')].every(d => d.offsetHeight === 0)")
    b.close()

with open("prime/evidence/ui-audit/p6-token-probe.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=1)
print(json.dumps(out, indent=1))
