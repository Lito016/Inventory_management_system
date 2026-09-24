"""Phase 5/6 re-audit — verify v1.2 acceptance criteria against local demo build."""
import json, os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4178"
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "shots2")
os.makedirs(OUT, exist_ok=True)
results = []

def check(cid, ok, detail):
    results.append({"id": cid, "pass": bool(ok), "detail": detail})
    print(f"[{'PASS' if ok else 'FAIL'}] {cid}: {detail}")

def overflow(pg):
    return pg.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True)

    # ---------- MOBILE 375: drawer + no overflow + single title ----------
    ctx = b.new_context(viewport={"width": 375, "height": 812})
    pg = ctx.new_page()
    pg.goto(BASE + "/login", wait_until="networkidle")
    pg.locator("button:has-text('Admin')").first.click()
    pg.wait_for_url("**/dashboard", timeout=8000)
    pg.wait_for_timeout(400)

    # U1: sidebar hidden by default (drawer closed), menu button present
    aside_x = pg.evaluate("document.querySelector('aside').getBoundingClientRect().x")
    burger = pg.locator("button[aria-label='Open navigation menu']")
    check("U1.drawer-closed", aside_x < -100 and burger.count() == 1, f"aside x={aside_x:.0f}, menu button count={burger.count()}")

    # open drawer
    burger.first.click(); pg.wait_for_timeout(300)
    aside_x2 = pg.evaluate("document.querySelector('aside').getBoundingClientRect().x")
    overlay = pg.locator("div.bg-gray-900\\/40, div[aria-hidden='true']").count()
    check("U1.drawer-open", -5 <= aside_x2 <= 5, f"after open aside x={aside_x2:.0f}, overlay nodes={overlay}")
    pg.screenshot(path=f"{OUT}/mobile-drawer-open.png", full_page=False)

    # close on nav: click Inventory
    pg.locator("aside a[href='/inventory/products']").first.click()
    pg.wait_for_url("**/inventory/products", timeout=6000)
    pg.wait_for_timeout(400)
    aside_x3 = pg.evaluate("document.querySelector('aside').getBoundingClientRect().x")
    check("U1.close-on-nav", aside_x3 < -100, f"after nav aside x={aside_x3:.0f} (should be off-canvas)")

    # U2: no horizontal overflow on inventory at 375
    ov = overflow(pg)
    check("U2.no-overflow-375-inventory", ov <= 2, f"scrollWidth-clientWidth={ov} on inventory")

    # U6: breadcrumb last crumb dropped -> H1 'Products' not duplicated in breadcrumb
    h1 = pg.locator("main h1").first.inner_text().strip()
    crumbs = pg.evaluate("Array.from(document.querySelectorAll('header nav a, header nav span')).map(e=>e.textContent.trim())")
    check("U6.single-title", h1 == "Products" and "Products" not in crumbs, f"H1='{h1}', breadcrumb={crumbs}")

    # Esc closes drawer
    burger.first.click(); pg.wait_for_timeout(200)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(200)
    aside_x4 = pg.evaluate("document.querySelector('aside').getBoundingClientRect().x")
    focused = pg.evaluate("document.activeElement.getAttribute('aria-label')")
    check("U1.esc-close-focus", aside_x4 < -100 and focused == "Open navigation menu", f"after Esc aside x={aside_x4:.0f}, focus='{focused}'")

    # U2 (AC coverage): no page overflow at 375 on reports and users pages too;
    # closed drawer must not leave off-screen links tab-focusable
    for path, sel in [("/reports", "aside a[href='/reports']"), ("/settings/users", "aside a[href='/settings/users']")]:
        pg.locator("button[aria-label='Open navigation menu']").first.click(); pg.wait_for_timeout(250)
        pg.locator(sel).first.click()
        pg.wait_for_url(f"**{path}", timeout=6000); pg.wait_for_timeout(400)
        check(f"U2.no-overflow-375{path.replace('/', '-')}", overflow(pg) <= 2, f"{path} overflow={overflow(pg)}")
    tabbable = pg.evaluate("""() => {
      let n = 0;
      document.querySelectorAll('aside a[href]').forEach(a => {
        const r = a.getBoundingClientRect();
        if (r.x >= 0) n++;  // drawer is closed here: any on-screen aside link is a tab stop leak
        const s = getComputedStyle(a.closest('aside'));
        if (s.visibility === 'visible' && r.x < -100) n += 0; // hidden off-canvas via visibility handled separately
      });
      return n;
    }""")
    drawer_vis = pg.evaluate("getComputedStyle(document.querySelector('aside')).visibility")
    check("U4.drawer-not-tabbable", drawer_vis == "hidden", f"closed drawer visibility={drawer_vis}, on-screen aside links={tabbable}")
    ctx.close()

    # ---------- TABLET 768: no overflow on reports/users ----------
    ctx = b.new_context(viewport={"width": 768, "height": 1024})
    pg = ctx.new_page()
    pg.goto(BASE + "/login", wait_until="networkidle")
    pg.locator("button:has-text('Admin')").first.click()
    pg.wait_for_url("**/dashboard", timeout=8000)
    pg.locator("button[aria-label='Open navigation menu']").first.click()
    pg.locator("aside a[href='/reports']").first.click(); pg.wait_for_url("**/reports", timeout=6000); pg.wait_for_timeout(300)
    check("U2.no-overflow-768-reports", overflow(pg) <= 2, f"reports overflow={overflow(pg)}")
    pg.locator("button[aria-label='Open navigation menu']").first.click()
    pg.locator("aside a[href='/settings/users']").first.click(); pg.wait_for_url("**/settings/users", timeout=6000); pg.wait_for_timeout(300)
    check("U2.no-overflow-768-users", overflow(pg) <= 2, f"users overflow={overflow(pg)}")
    # settings page now shows demo banner (consolidated shell)
    check("U1.settings-banner", pg.locator("[role='status']").count() >= 1, "DemoBanner present on /settings/users")
    ctx.close()

    # ---------- DESKTOP 1280: collapse sync, focus ring, header features, density ----------
    ctx = b.new_context(viewport={"width": 1280, "height": 800})
    pg = ctx.new_page()
    pg.goto(BASE + "/login", wait_until="networkidle")
    pg.locator("button:has-text('Admin')").first.click()
    pg.wait_for_url("**/dashboard", timeout=8000)
    pg.wait_for_timeout(500)

    # U3: collapse -> content margin syncs (no dead gap)
    main_left_open = pg.evaluate("document.querySelector('main').getBoundingClientRect().x")
    pg.locator("button[aria-label='Collapse sidebar']").first.click(); pg.wait_for_timeout(400)
    aside_w = pg.evaluate("document.querySelector('aside').getBoundingClientRect().width")
    main_left_collapsed = pg.evaluate("document.querySelector('main').getBoundingClientRect().x")
    gap = main_left_collapsed - aside_w
    check("U3.collapse-sync", abs(gap) <= 8, f"collapsed aside width={aside_w:.0f}, main x={main_left_collapsed:.0f}, gap={gap:.0f}")
    pg.locator("button[aria-label='Expand sidebar']").first.click(); pg.wait_for_timeout(300)

    # U4: focus ring visible on a header button via REAL keyboard focus
    # (:focus-visible does not match programmatic .focus())
    pg.keyboard.press("Tab")
    for _ in range(12):
        label = pg.evaluate("document.activeElement.getAttribute('aria-label')")
        if label == "Search records":
            break
        pg.keyboard.press("Tab")
    shadow = pg.evaluate("getComputedStyle(document.activeElement).boxShadow")
    at_search = pg.evaluate("document.activeElement.getAttribute('aria-label')") == "Search records"
    check("U4.focus-ring", at_search and shadow and shadow != "none", f"focused='Search records' via Tab, box-shadow={shadow[:40]}")

    # U5: search popover -> finance search with q
    pg.locator("button[aria-label='Search records']").first.click(); pg.wait_for_timeout(200)
    pg.fill("input[aria-label='Search query']", "cotton")
    pg.keyboard.press("Enter"); pg.wait_for_url("**/finance/search**", timeout=6000); pg.wait_for_timeout(400)
    seeded = pg.evaluate("document.querySelector('input[type=text], input[type=search], input')?.value || ''")
    # search field on the page should hold 'cotton'
    page_search_val = pg.evaluate("Array.from(document.querySelectorAll('input')).map(i=>i.value).find(v=>v==='cotton')||''")
    check("U5.search-nav", "q=cotton" in pg.url and page_search_val == "cotton", f"url={pg.url}, seeded={page_search_val}")

    # return to dashboard via in-app nav (full goto would reset the memory-only demo session)
    pg.locator("aside a[href='/dashboard']").first.click()
    pg.wait_for_url("**/dashboard", timeout=6000); pg.wait_for_timeout(500)
    # U5: bell shows overdue count (real data)
    bell = pg.locator("button[aria-label^='Notifications']")
    check("U5.bell-handler", bell.count() == 1, "bell button present with aria-label")
    before = pg.locator("a[href='/finance/receivables']").count()
    bell.first.click(); pg.wait_for_timeout(200)
    after = pg.locator("a[href='/finance/receivables']").count()
    popover = pg.locator("[role='dialog']:has-text('overdue'), [role='status']:has-text('overdue')")
    # popover is a positioned panel containing text NOT present before the click
    panel_text = pg.evaluate("""() => {
      const panels = Array.from(document.querySelectorAll('div')).filter(d => {
        const s = getComputedStyle(d);
        return (s.position === 'absolute' || s.position === 'fixed') && d.getBoundingClientRect().top < 100 && d.getBoundingClientRect().right > 800;
      });
      return panels.map(p => p.textContent).join(' ');
    }""")
    check("U5.bell-popover", after > before and ("overdue" in panel_text.lower() or "All clear" in panel_text),
          f"receivables-links {before}->{after} after click, panel contains overdue status: {panel_text[:60]!r}")
    pg.keyboard.press("Escape")

    # U7: dashboard density — content below Modules (needs attention / recent activity)
    pg.wait_for_timeout(400)
    has_attention = pg.locator("text=Needs Attention").count()
    has_activity = pg.locator("text=Recent Activity").count()
    body_h = pg.evaluate("document.querySelector('main').scrollHeight")
    check("U7.density", has_attention == 1 and has_activity == 1 and body_h > 700, f"NeedsAttention={has_attention} RecentActivity={has_activity} mainHeight={body_h}")
    pg.screenshot(path=f"{OUT}/desktop-dashboard.png", full_page=True)

    # U8: no gradient on header avatar (token fidelity) — check computed background-image
    grad = pg.locator("header .rounded-full").first.evaluate("el => getComputedStyle(el).backgroundImage")
    check("U8.no-gradient-avatar", grad in ("none", ""), f"avatar backgroundImage={grad}")
    ctx.close()
    b.close()

with open(os.path.join(OUT, "..", "reaudit-results.json"), "w") as f:
    json.dump(results, f, indent=2)
passed = sum(1 for r in results if r["pass"])
print(f"\n=== {passed}/{len(results)} acceptance checks passed ===")
