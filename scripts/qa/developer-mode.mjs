#!/usr/bin/env node
/**
 * Developer Mode, end to end in a browser, against a running build started with an owner
 * secret, e.g.  STUDIO_BASIC_AUTH="owner:some-long-local-secret" npx next start -p 3100
 *
 *   STUDIO_QA_CREDENTIALS="owner:some-long-local-secret" node scripts/qa/developer-mode.mjs [base-url]
 *
 * The credentials come from the environment and are never written anywhere.
 */
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "/opt/node22/lib/node_modules/playwright/index.mjs").catch(() => import("playwright"));
const B = process.argv[2] ?? "http://localhost:3100";
const creds = process.env.STUDIO_QA_CREDENTIALS ?? "";
if (!creds.includes(":")) {
  console.error("Set STUDIO_QA_CREDENTIALS to the server's STUDIO_BASIC_AUTH value.");
  process.exit(2);
}
const [username, password] = [creds.slice(0, creds.indexOf(":")), creds.slice(creds.indexOf(":") + 1)];
const res = [];
const ok = (name, cond, extra = "") => res.push(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? `  (${extra})` : ""}`);
const SEEN = () => {
  try {
    localStorage.setItem("solanites:intro:v1", '{"seen":true}');
  } catch {}
};
const browser = await chromium.launch();

// 1. Without the owner credentials there is no Developer Mode.
{
  const c = await browser.newContext();
  const p = await c.newPage();
  ok("no credentials: /studio/dev refused", (await p.goto(B + "/studio/dev")).status() === 401);
  const r = await p.request.post(B + "/studio/dev/simulate", { data: { settings: { multiplier: 100, force: "secret" }, count: 10 } });
  ok("no credentials: simulation refused", r.status() === 401, String(r.status()));
  await c.close();
  const w = await browser.newContext({ httpCredentials: { username, password: password + "x" } });
  ok("wrong credentials: /studio/dev refused", (await (await w.newPage()).goto(B + "/studio/dev")).status() === 401);
  await w.close();
}

// 2. The public Collection names the Mythic and Secret species (owner decision 20 Oct).
{
  const c = await browser.newContext();
  await c.addInitScript(SEEN);
  const p = await c.newPage();
  await p.goto(B + "/collection", { waitUntil: "networkidle" });
  const text = await p.locator("main").innerText();
  const leaked = ["Astravex", "Orbelith", "Eventide", "Helivane", "GENESIS", "NULLBORN"].filter((n) => text.includes(n));
  ok("public collection: all six Mythic and Secret species are named", leaked.length === 6, leaked.join(", "));
  await c.close();
}

// 3. The owner's Developer Mode.
{
  const c = await browser.newContext({ httpCredentials: { username, password }, viewport: { width: 1440, height: 900 } });
  await c.addInitScript(SEEN);
  const p = await c.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  // the public site's own stored state, to prove Developer Mode never changes it
  await p.goto(B + "/hatchery", { waitUntil: "networkidle" });
  await p.getByRole("button", { name: /explore the demo/i }).click();
  await p.waitForTimeout(1200);
  // what defines ownership in the demo: its eggs and creatures (id, species, hatched or not), the
  // discovered species, the wallet and balance. Its simulated clock and growth tick on their own.
  const ownership = () =>
    p.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("solanites:prototype:v1") ?? "{}");
      return JSON.stringify({
        wallet: s.wallet ?? null,
        balance: s.balance ?? null,
        discovered: [...(s.discovered ?? [])].sort(),
        records: (s.records ?? []).map((r) => [r.id, r.speciesId, r.hatchedAt !== null]).sort(),
        keys: Object.keys(localStorage).sort(),
      });
    });
  const storageBefore = await ownership();

  const resp = await p.goto(B + "/studio/dev", { waitUntil: "networkidle" });
  ok("owner: /studio/dev opens", resp.status() === 200);
  ok("owner: response is not cached or indexed", resp.headers()["cache-control"]?.includes("no-store") && resp.headers()["x-robots-tag"]?.includes("noindex"));
  ok("owner: Developer Mode banner shown", await p.getByTestId("developer-banner").isVisible());
  ok("owner: page title marks Developer Mode", (await p.title()).startsWith("[Developer Mode]"), await p.title());
  const species = await p.locator('[data-testid="dev-species-grid"] [data-species]').count();
  ok("owner: all 28 species listed", species === 28, String(species));
  for (const id of ["astravex", "orbelith", "eventide", "helivane", "genesis", "nullborn"]) {
    ok(`owner: ${id} (Mythic/Secret) available`, (await p.locator(`[data-species="${id}"]`).count()) === 1);
  }
  await p.locator('[data-species="genesis"]').click();
  ok("owner: four evolution stages previewed", (await p.locator('[data-testid="dev-stages"] button').count()) === 4);
  ok("owner: Secret species named in the preview", (await p.locator("#dev-selected").innerText()).includes("GENESIS"));
  await p.screenshot({ path: "/tmp/dev-mode-top.png" }).catch(() => {});

  // odds panel
  const mult = () => p.getByTestId("multiplier-value").innerText();
  const cell = (r, col) => p.locator(`[data-testid="odds-table"] tr[data-rarity="${r}"] td[data-col="${col}"]`).innerText();
  ok("odds: default 1×", (await mult()) === "1×");
  ok("odds: at 1× test odds equal public odds", (await cell("mythic", "test")) === (await cell("mythic", "public")) && (await cell("secret", "test")) === (await cell("secret", "public")), `${await cell("mythic", "test")}`);
  await p.locator("#dev-multiplier").fill("50");
  ok("odds: slider sets 50×", (await mult()) === "50×");
  ok("odds: Mythic test odds update (50 / (60+25+10+3.8+50+10) = 31.49%)", (await cell("mythic", "test")) === "31.49%", await cell("mythic", "test"));
  ok("odds: public odds unchanged", (await cell("mythic", "public")) === "1.00%");
  ok("odds: test odds total exactly 100%", (await p.getByTestId("test-total").innerText()) === "100.00%");
  await p.getByTestId("reset-odds").click();
  ok("odds: reset returns to 1×", (await mult()) === "1×" && (await cell("mythic", "test")) === "1.00%");
  ok("odds: labelled as simulated, not public", (await p.getByTestId("simulated-badge").innerText()).toLowerCase().includes("not public"));

  // forced Secret simulation and a 10,000-hatch run
  await p.getByTestId("force-rarity").selectOption("secret");
  await p.getByTestId("simulate-one").click();
  const dialog = p.getByRole("dialog", { name: "Hatching" });
  await dialog.waitFor({ timeout: 8000 });
  await p.getByRole("button", { name: /back to hatchery/i }).waitFor({ timeout: 12000 });
  const outcome = await p.getByTestId("simulated-outcome").innerText();
  ok("simulation: forced Secret hatch reveals a Secret species", /Secret/.test(outcome) && /GENESIS|NULLBORN/.test(outcome), outcome);
  await p.getByRole("button", { name: /back to hatchery/i }).click();
  await p.getByTestId("force-rarity").selectOption("");
  await p.locator("#dev-multiplier").fill("25");
  await p.getByTestId("simulate-many").click();
  await p.getByTestId("simulation-tally").waitFor({ timeout: 15000 });
  ok("simulation: 10,000 hatches tallied", (await p.getByTestId("simulation-tally").innerText()).includes("10,000 simulated hatches"));
  await p.screenshot({ path: "/tmp/dev-mode-odds.png", fullPage: true }).catch(() => {});

  // leaving Developer Mode resets the test settings and changes nothing public
  await p.getByTestId("exit-developer-mode").click();
  await p.waitForURL((u) => new URL(u).pathname === "/", { timeout: 8000 });
  ok("exit: returns to the public site", new URL(p.url()).pathname === "/");
  ok("exit: no Developer Mode on the public page", (await p.locator('[data-developer-mode]').count()) === 0);
  const storageAfter = await ownership();
  ok("isolation: no eggs, creatures, discoveries or balance changed by Developer Mode", storageAfter === storageBefore, storageAfter === storageBefore ? "" : `${storageBefore} → ${storageAfter}`);
  const stored = await p.evaluate(() => JSON.stringify(Object.keys(localStorage)) + JSON.stringify(sessionStorage));
  ok("isolation: no developer settings stored in the browser", !/multiplier|devOdds|developer/i.test(stored), stored);
  await p.goto(B + "/studio/dev", { waitUntil: "networkidle" });
  ok("exit: coming back starts at 1×", (await mult()) === "1×");
  ok("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await c.close();
}

await browser.close();
console.log(res.join("\n"));
const fails = res.filter((r) => r.startsWith("FAIL")).length;
console.log(`${res.length - fails}/${res.length} passed`);
process.exit(fails ? 1 : 0);
