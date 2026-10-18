import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { path: "/", heading: /./ },
  { path: "/hatchery", heading: "Your eggs are sealed until you arrive." },
  { path: "/collection", heading: "The Collection" },
  { path: "/how-it-works", heading: /./ },
  { path: "/leaderboard", heading: "Leaderboard" },
];

/**
 * Collects uncaught page errors and console errors for the whole test.
 * The site ships no favicon yet, so the browser's automatic /favicon.ico 404 is ignored.
 */
function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() !== "error" || m.location().url.endsWith("/favicon.ico")) return;
    errors.push(`console: ${m.text()} (${m.location().url})`);
  });
  return errors;
}

for (const route of ROUTES) {
  test(`${route.path} renders without errors or horizontal overflow`, async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto(route.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.heading);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, "page scrolls horizontally").toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test("primary navigation reaches every page", async ({ page, isMobile }) => {
  const errors = trackErrors(page);
  await page.goto("/");
  for (const [label, path] of [
    ["Hatchery", "/hatchery"],
    ["Collection", "/collection"],
    ["How It Works", "/how-it-works"],
    ["Leaderboard", "/leaderboard"],
  ] as const) {
    if (isMobile) await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("banner").getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(path);
  }
  await page.getByRole("link", { name: "Solanites home" }).click();
  await expect(page).toHaveURL("/");
  expect(errors).toEqual([]);
});

test("demo wallet journey: enter hatchery and hatch an egg", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/hatchery");
  await page.getByRole("button", { name: /enter with demo wallet/i }).click();
  await expect(page.getByRole("heading", { level: 1, name: "The Hatchery" })).toBeVisible();

  await page.getByRole("button", { name: "HATCH NOW", exact: true }).first().click();
  const reveal = page.getByRole("dialog", { name: "Hatching" });
  await expect(reveal).toBeVisible();
  // The charge-up runs longer for rarer rolls; Secret is the slowest.
  await expect(reveal.getByRole("button", { name: /meet your solanite/i })).toBeVisible({ timeout: 15_000 });
  await reveal.getByRole("button", { name: /back to hatchery/i }).click();
  await expect(reveal).toBeHidden();
  expect(errors).toEqual([]);
});

test("collection filters narrow the species list", async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto("/collection");
  const discovery = page.getByRole("combobox", { name: "Discovery filter" });
  await expect(discovery).toBeVisible();
  const options = await discovery.locator("option").allTextContents();
  expect(options.length).toBeGreaterThan(1);
  await discovery.selectOption({ index: 1 });
  await expect(page.getByRole("heading", { level: 1, name: "The Collection" })).toBeVisible();
  expect(errors).toEqual([]);
});
