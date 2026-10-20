import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";
import { gameConfig, type GameConfig, type RarityId } from "@/config/gameConfig";
import {
  DEFAULT_DEV_ODDS,
  baseWeights,
  chancesOf,
  devGameConfig,
  effectiveWeights,
  parseDevOdds,
  percentLabels,
  simulateHatch,
  simulateRarity,
  type DevOddsSettings,
} from "@/lib/devOdds";
import { rarityChances, rollSpecies } from "@/lib/progression";
import { RARITY_ORDER } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";
import { studioAccess } from "../studioAuth";

const SECRET = "owner:correct-horse-battery-staple";
const basic = (s: string) => `Basic ${btoa(s)}`;
const env = process.env.STUDIO_BASIC_AUTH;
const devEnv = process.env.DEVELOPER_MODE;
afterEach(() => {
  if (env === undefined) delete process.env.STUDIO_BASIC_AUTH;
  else process.env.STUDIO_BASIC_AUTH = env;
  if (devEnv === undefined) delete process.env.DEVELOPER_MODE;
  else process.env.DEVELOPER_MODE = devEnv;
});
const sum = (r: Record<RarityId, number>) => RARITY_ORDER.reduce((s, k) => s + r[k], 0);
const odds = (patch: Partial<DevOddsSettings> = {}): DevOddsSettings => ({ ...DEFAULT_DEV_ODDS, ...patch });

/* ── Developer hatch odds ───────────────────────────────────── */

describe("developer hatch odds", () => {
  const PUBLISHED = { common: 60, rare: 25, epic: 10, legendary: 3.8, mythic: 1, secret: 0.2 };

  it("starts at 1×, which reproduces the public odds exactly", () => {
    expect(DEFAULT_DEV_ODDS.multiplier).toBe(1);
    expect(DEFAULT_DEV_ODDS.force).toBeNull();
    expect(DEFAULT_DEV_ODDS.includeZeroWeight).toBe(false);
    expect(chancesOf(effectiveWeights(gameConfig, DEFAULT_DEV_ODDS))).toEqual(rarityChances(gameConfig));
  });

  it("changing the multiplier updates the test odds, renormalised (not simply ×10)", () => {
    const c = chancesOf(effectiveWeights(gameConfig, odds({ multiplier: 10 })));
    // Mythic and Secret boosted: weights 60, 25, 10, 3.8, 10, 2 → total 110.8
    expect(c.mythic).toBeCloseTo(10 / 110.8, 12);
    expect(c.secret).toBeCloseTo(2 / 110.8, 12);
    expect(c.common).toBeCloseTo(60 / 110.8, 12);
    expect(c.mythic / rarityChances(gameConfig).mythic).toBeLessThan(10);
    // boosted tiers keep their ratio to each other
    expect(c.mythic / c.secret).toBeCloseTo(5, 12);
  });

  it("reset restores 1× and the original base configuration, which is never modified", () => {
    const before = structuredClone(gameConfig.rarityWeights);
    for (const m of [2, 25, 50, 100]) {
      effectiveWeights(gameConfig, odds({ multiplier: m, boosted: [...RARITY_ORDER], includeZeroWeight: true }));
      devGameConfig(gameConfig, odds({ multiplier: m }));
    }
    expect(gameConfig.rarityWeights).toEqual(before);
    expect(gameConfig.rarityWeights).toEqual(PUBLISHED);
    expect(chancesOf(effectiveWeights(gameConfig, { ...DEFAULT_DEV_ODDS }))).toEqual(rarityChances(gameConfig));
  });

  it("effective probabilities always total 100%, and the displayed percentages add up exactly", () => {
    for (const m of [1, 3, 10, 25, 50, 77, 100]) {
      for (const boosted of [[], ["mythic"], ["mythic", "secret"], [...RARITY_ORDER]] as RarityId[][]) {
        const c = chancesOf(effectiveWeights(gameConfig, odds({ multiplier: m, boosted })));
        expect(sum(c)).toBeCloseTo(1, 12);
        expect(RARITY_ORDER.every((r) => c[r] >= 0 && c[r] <= 1)).toBe(true);
        const shown = percentLabels(c);
        expect(Math.round(sum(shown) * 100)).toBe(10000);
      }
    }
  });

  it("a tier with base weight 0 stays excluded unless the explicit override is on", () => {
    const zero: GameConfig = { ...gameConfig, rarityWeights: { ...gameConfig.rarityWeights, mythic: 0, secret: 0 } };
    const plain = effectiveWeights(zero, odds({ multiplier: 100 }));
    expect(plain.mythic).toBe(0);
    expect(plain.secret).toBe(0);
    const over = effectiveWeights(zero, odds({ multiplier: 100, includeZeroWeight: true }));
    expect(over.mythic).toBeGreaterThan(0);
    expect(over.secret).toBeGreaterThan(0);
    // the stand-in weight is the smallest positive base weight (Legendary's 3.8), then boosted
    expect(over.mythic).toBeCloseTo(3.8 * 100, 9);
  });

  it("forcing Mythic or Secret makes every simulated hatch that tier", () => {
    for (const force of ["mythic", "secret"] as RarityId[]) {
      for (let seed = 0; seed < 200; seed++) expect(SPECIES_BY_ID[simulateHatch(seed, gameConfig, odds({ force }))].rarity).toBe(force);
    }
  });

  it("simulated hatches follow the displayed odds", () => {
    const s = odds({ multiplier: 25, boosted: ["legendary", "mythic", "secret"] });
    const expected = chancesOf(effectiveWeights(gameConfig, s));
    const n = 40_000;
    const tally = Object.fromEntries(RARITY_ORDER.map((r) => [r, 0])) as Record<RarityId, number>;
    for (let seed = 0; seed < n; seed++) {
      const r = simulateRarity(seed, gameConfig, s);
      tally[r] += 1;
      expect(SPECIES_BY_ID[simulateHatch(seed, gameConfig, s)].rarity).toBe(r);
    }
    for (const r of RARITY_ORDER) {
      const sd = Math.sqrt((expected[r] * (1 - expected[r])) / n);
      expect(Math.abs(tally[r] / n - expected[r])).toBeLessThan(5 * sd + 1e-9);
    }
  });

  it("at 1× a simulated hatch is exactly the production roll for the same seed", () => {
    for (let seed = 0; seed < 2_000; seed++) expect(simulateHatch(seed, gameConfig, DEFAULT_DEV_ODDS)).toBe(rollSpecies(seed, gameConfig));
  });

  it("refuses invalid settings instead of guessing", () => {
    for (const bad of [{ multiplier: 0 }, { multiplier: 101 }, { multiplier: -5 }, { multiplier: Number.NaN }, { multiplier: "10" }, { boosted: ["ultra"] }, { boosted: "mythic" }, { force: "ultra" }, { includeZeroWeight: "yes" }, null, 42]) {
      expect(parseDevOdds(bad).ok).toBe(false);
    }
    expect(parseDevOdds({ multiplier: 50, boosted: ["mythic", "mythic"], force: null })).toEqual({ ok: true, settings: { multiplier: 50, boosted: ["mythic"], includeZeroWeight: false, force: null } });
  });

  it("base weights treat negative or invalid public weights as 0", () => {
    const odd = { ...gameConfig, rarityWeights: { ...gameConfig.rarityWeights, rare: -3, epic: Number.NaN } } as GameConfig;
    expect(baseWeights(odd).rare).toBe(0);
    expect(baseWeights(odd).epic).toBe(0);
  });
});

/* ── Developer Mode authorisation ───────────────────────────── */

describe("Developer Mode authorisation", () => {
  const simulate = async (auth?: string, body: unknown = { settings: { multiplier: 100, force: "secret" }, count: 50 }) => {
    const { POST } = await import("@/app/studio/dev/simulate/route");
    return POST(new Request("http://localhost/studio/dev/simulate", { method: "POST", headers: { "content-type": "application/json", ...(auth ? { authorization: auth } : {}) }, body: JSON.stringify(body) }));
  };

  it("without the owner secret configured, Developer Mode does not exist (404), credentials or not", async () => {
    delete process.env.STUDIO_BASIC_AUTH;
    expect((await simulate()).status).toBe(404);
    expect((await simulate(basic(SECRET))).status).toBe(404);
    const { middleware } = await import("@/middleware");
    expect(middleware(new NextRequest("http://localhost/studio/dev")).status).toBe(404);
    expect(middleware(new NextRequest("http://localhost/studio/dev/simulate", { method: "POST" })).status).toBe(404);
  });

  it("unauthorised requests cannot reach the page or run the simulation", async () => {
    process.env.STUDIO_BASIC_AUTH = SECRET;
    expect((await simulate()).status).toBe(401);
    expect((await simulate(basic("owner:wrong-horse-battery-staple"))).status).toBe(401);
    expect((await simulate("Bearer " + SECRET)).status).toBe(401);
    const { middleware, config } = await import("@/middleware");
    expect(config.matcher).toContain("/studio/:path*");
    expect(middleware(new NextRequest("http://localhost/studio/dev")).status).toBe(401);
    expect(middleware(new NextRequest("http://localhost/studio/dev/simulate", { method: "POST", headers: { authorization: basic("nobody:guess-guess-guess-guess") } })).status).toBe(401);
    // a client-side flag, query parameter or cookie is not a credential
    expect(studioAccess(null)).toBe("unauthenticated");
    expect(middleware(new NextRequest("http://localhost/studio/dev?developer=1", { headers: { cookie: "developer=1" } })).status).toBe(401);
  });

  it("the authorised owner can open Developer Mode and simulate restricted hatches", async () => {
    process.env.STUDIO_BASIC_AUTH = SECRET;
    const { middleware } = await import("@/middleware");
    const page = middleware(new NextRequest("http://localhost/studio/dev", { headers: { authorization: basic(SECRET) } }));
    expect(page.status).toBe(200);
    expect(page.headers.get("cache-control")).toBe("no-store");
    expect(page.headers.get("x-robots-tag")).toContain("noindex");
    const res = await simulate(basic(SECRET));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const data = await res.json();
    expect(data.simulated).toBe(true);
    expect(data.count).toBe(50);
    expect(sum(data.tally)).toBe(50);
    expect(data.tally.secret).toBe(50);
    expect(data.results.every((r: { speciesId: string }) => SPECIES_BY_ID[r.speciesId].rarity === "secret")).toBe(true);
    // the owner sees the real classified species, not the public sealed stand-in
    expect(data.results.every((r: { speciesId: string }) => !r.speciesId.startsWith("sealed-"))).toBe(true);
  });

  it("the authorised simulation still validates its input", async () => {
    process.env.STUDIO_BASIC_AUTH = SECRET;
    expect((await simulate(basic(SECRET), { settings: { multiplier: 500 } })).status).toBe(400);
    expect((await simulate(basic(SECRET), { settings: {}, count: 1_000_000 })).status).toBe(400);
    expect((await simulate(basic(SECRET), { settings: {}, seed: -1 })).status).toBe(400);
  });

  it("removing the owner secret immediately removes Developer Mode access", async () => {
    process.env.STUDIO_BASIC_AUTH = SECRET;
    expect((await simulate(basic(SECRET))).status).toBe(200);
    delete process.env.STUDIO_BASIC_AUTH;
    expect((await simulate(basic(SECRET))).status).toBe(404);
  });

  it("DEVELOPER_MODE=off removes Developer Mode even with the secret set and the right credentials", async () => {
    process.env.STUDIO_BASIC_AUTH = SECRET;
    const { middleware } = await import("@/middleware");
    for (const off of ["off", "OFF", "0", "false", "no", "disabled", " off "]) {
      process.env.DEVELOPER_MODE = off;
      expect((await simulate(basic(SECRET))).status).toBe(404);
      expect(middleware(new NextRequest("http://localhost/studio/dev", { headers: { authorization: basic(SECRET) } })).status).toBe(404);
      expect(studioAccess(basic(SECRET))).toBe("disabled");
    }
    for (const on of ["", "on", "1", "true"]) {
      process.env.DEVELOPER_MODE = on;
      expect((await simulate(basic(SECRET))).status).toBe(200);
    }
  });

  it("an owner password under 24 characters in total keeps Developer Mode switched off", async () => {
    process.env.STUDIO_BASIC_AUTH = "owner:shortpw";
    expect((await simulate(basic("owner:shortpw"))).status).toBe(404);
  });

  it("the Developer Mode page itself re-checks the credentials on the server", () => {
    const src = readFileSync(path.join(process.cwd(), "src/app/studio/dev/page.tsx"), "utf8");
    expect(src).toMatch(/studioAccess\(\(await headers\(\)\)\.get\("authorization"\)\) !== "authorised"\) notFound\(\)/);
    const route = readFileSync(path.join(process.cwd(), "src/app/studio/dev/simulate/route.ts"), "utf8");
    expect(route).toMatch(/const denied = studioApiGuard\(req\);\s+if \(denied\) return denied;/);
  });
});

/* ── Production isolation ───────────────────────────────────── */

describe("production hatches are isolated from developer odds", () => {
  const src = (p: string) => readFileSync(path.join(process.cwd(), p), "utf8");
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = path.join(dir, f);
      return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
    });

  it("the public hatch endpoint reads only the egg id: no body, query, odds or seed", () => {
    const route = src("src/app/api/eggs/[id]/hatch/route.ts");
    expect(route).not.toMatch(/req\.(json|text|formData|arrayBuffer|body)|searchParams|multiplier|devOdds|rarityWeights|seed/);
    expect(route).toMatch(/tracker\.hatch\(id\)/);
  });

  it("server code, the Hatchery and the public pages never import the developer odds", () => {
    const allowed = [/src\/lib\/devOdds\.ts$/, /src\/components\/dev\//, /src\/app\/studio\//, /__tests__\//];
    const users = files(path.join(process.cwd(), "src"))
      .filter((f) => !allowed.some((a) => a.test(f)))
      .filter((f) => /from "@\/lib\/devOdds"|from "\.\.?\/.*devOdds"/.test(readFileSync(f, "utf8")));
    expect(users).toEqual([]);
  });

  it("eggs are sealed with the published config", () => {
    expect(src("src/server/tracker/service.ts")).toMatch(/rollSpecies\(seed, gameConfig, SPECIES\)/);
    expect(gameConfig.rarityWeights).toEqual({ common: 60, rare: 25, epic: 10, legendary: 3.8, mythic: 1, secret: 0.2 });
  });

  it("the public hatch endpoint does not respond to developer settings in a request", async () => {
    const { POST } = await import("@/app/api/eggs/[id]/hatch/route");
    // a malformed id is refused before anything else, whatever the body carries
    const res = await POST(new Request("http://localhost/api/eggs/x/hatch", { method: "POST", body: JSON.stringify({ multiplier: 100, force: "secret" }) }), { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(400);
  });
});
