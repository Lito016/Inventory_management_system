"""Phase 2 UI/UX audit — drive the live demo, capture evidence at 3 viewports."""
import json, os, sys
from playwright.sync_api import sync_playwright

BASE = "https://inventory-management-system-55w.pages.dev"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots")
os.makedirs(OUT, exist_ok=True)

VIEWPORTS = [("desktop", 1280, 800), ("tablet", 768, 1024), ("mobile", 375, 812)]
findings = []

def note(severity, page, msg):
    findings.append({"severity": severity, "page": page, "issue": msg})
    print(f"[{severity}] {page}: {msg}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for label, w, h in VIEWPORTS:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        pg = ctx.new_page()
        pg.goto(BASE + "/login", wait_until="networkidle")
        pg.screenshot(path=f"{OUT}/login-{label}.png", full_page=True)

        # role picker present on desktop/tablet; check mobile too
        cards = pg.locator("button", has_text="Admin")
        if cards.count() == 0:
            note("major", f"login/{label}", "no Admin role card found")
        # focus ring check on email input (manual form)
        pg.keyboard.press("Tab")
        focused = pg.evaluate("document.activeElement.tagName + ':' + (document.activeElement.type||'')")
        outline = pg.evaluate("getComputedStyle(document.activeElement).outlineStyle + '/' + getComputedStyle(document.activeElement).boxShadow")
        note("info", f"login/{label}", f"first Tab focus={focused} outline/shadow={outline}")

        # sign in as admin via role card
        try:
            admin_btn = pg.locator("button:has-text('Admin')").first
            admin_btn.click()
            pg.wait_for_url("**/dashboard", timeout=8000)
        except Exception as e:
            note("critical", f"login/{label}", f"demo admin sign-in failed: {type(e).__name__}")
            ctx.close(); continue

        # demo banner
        banner = pg.locator("[role=status]")
        if banner.count() == 0:
            note("major", f"dashboard/{label}", "DEMO banner (role=status) missing")

        pg.screenshot(path=f"{OUT}/dashboard-{label}.png", full_page=True)

        # measure key elements on desktop
        if label == "desktop":
            overflow = pg.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
            if overflow: note("major", "dashboard/desktop", "horizontal overflow present")
            # heading hierarchy
            heads = pg.evaluate("Array.from(document.querySelectorAll('h1,h2,h3')).slice(0,6).map(e=>e.tagName+':'+e.textContent.trim().slice(0,40))")
            note("info", "dashboard/desktop", "headings=" + json.dumps(heads))

        # navigate in-app (full goto would reset mock session)
        def nav(href, name):
            link = pg.locator(f'aside a[href="{href}"]')
            if link.count() == 0:
                note("major", f"sidebar/{label}", f"nav link {href} missing ({name})")
                return None
            link.first.click()
            try:
                pg.wait_for_url("**" + href, timeout=6000)
            except Exception:
                note("major", f"{name}/{label}", f"click on {href} did not navigate")
                return None
            pg.wait_for_timeout(400)
            pg.screenshot(path=f"{OUT}/{name}-{label}.png", full_page=True)
            ov = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
            if ov: note("major", f"{name}/{label}", "horizontal overflow at this viewport")
            return pg

        nav("/inventory/products", "inventory")
        if label == "desktop":
            # hover + focus states on a table row action / button
            btn = pg.locator("main button").first
            if btn.count():
                before = btn.evaluate("el => getComputedStyle(el).backgroundColor")
                btn.hover(); pg.wait_for_timeout(250)
                after = btn.evaluate("el => getComputedStyle(el).backgroundColor")
                if before == after: note("minor", "inventory/desktop", "first button has no hover color change")
            btn.focus()
            fo = btn.evaluate("el => getComputedStyle(el).boxShadow + '|' + getComputedStyle(el).outlineStyle")
            note("info", "inventory/desktop", f"button focus style: {fo}")
        nav("/reports", "reports")
        nav("/settings/users", "users")

        # mobile: sidebar behavior
        if label == "mobile":
            sidebar_visible = pg.locator("aside").first.is_visible() if pg.locator("aside").count() else False
            burger = pg.locator("button[aria-label*='menu' i], button[aria-label*='navigation' i]")
            note("info", "mobile", f"aside visible={sidebar_visible} burger buttons={burger.count()}")
            if not sidebar_visible and burger.count() == 0:
                note("critical", "mobile", "sidebar hidden and no menu toggle found — nav unreachable")

        ctx.close()
    browser.close()

with open(os.path.join(OUT, "..", "audit-findings.json"), "w") as f:
    json.dump(findings, f, indent=2)
print("DONE", len(findings), "findings")
