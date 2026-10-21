import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { HatcheryChamber } from "@/components/hatchery/HatcheryChamber";
import { PhoenixHero } from "@/components/landing/PhoenixHero";
import { SPECIES } from "@/lib/species";

/**
 * Approved art canon (docs/canon/solanites-art-canon.md), website rules W1–W2: no ground,
 * contact shadow, floor glow or pedestal under creatures, eggs or the phoenix, and no
 * decorative halo, rays, sparkles, nebula or rarity aura behind them. The "legacy"
 * ornament keeps the original drawings for baseline renders, so originals are not lost.
 */

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);

/** The app's ground shadow under every creature: a blurred ellipse at (200, 376). */
const GROUND_SHADOW = /<ellipse cx="200" cy="376"/;
/**
 * The app-level ornaments CreatureArt drew around every creature: the rarity aura (its
 * disc, rays, rings, motes, nebula and sparkles all sit inside `sl-aura`), the Ascended
 * halo and the Secret scan lines. Effects drawn inside a species' own vector artwork
 * (Solvanth's sun, Orbelith's moons…) are its anatomy and original art, out of scope here.
 */
const CREATURE_ORNAMENTS = /class="(sl-aura|sl-halo|sl-glitch-lines|sl-backlight)"/;

describe("canon W1–W2: creatures", () => {
  for (const s of SPECIES) {
    for (let stage = 0; stage < 4; stage++) {
      it(`${s.id} stage ${stage + 1}: no ground shadow, aura, rays, sparkles or halo`, () => {
        for (const showAura of [true, false]) {
          const out = html(createElement(CreatureArt, { species: s, stage, animated: false, vector: true, showAura }));
          expect(out).not.toMatch(GROUND_SHADOW);
          expect(out).not.toMatch(CREATURE_ORNAMENTS);
        }
      });
    }
  }

  it("legacy ornament still reproduces the original ground shadow, aura and Ascended halo", () => {
    const pyraurum = SPECIES.find((s) => s.id === "pyraurum")!;
    const out = html(createElement(CreatureArt, { species: pyraurum, stage: 3, animated: false, vector: true, ornament: "legacy" }));
    expect(out).toMatch(GROUND_SHADOW);
    expect(out).toMatch(/class="sl-aura"/);
    expect(out).toMatch(/class="sl-halo"/);
  });
});

describe("canon W1–W2: eggs and the Hatchery chamber", () => {
  it("eggs draw no halo or floor glow", () => {
    for (const stage of [1, 2, 3, 4] as const) {
      const out = html(createElement(EggArt, { stage, seed: 3 }));
      expect(out).not.toMatch(/sl-egg-halo/);
      expect(out).not.toMatch(/<ellipse cx="150" cy="364"/);
    }
  });

  it("legacy egg keeps its original halo and floor glow", () => {
    const out = html(createElement(EggArt, { stage: 4, seed: 3, ornament: "legacy" }));
    expect(out).toMatch(/sl-egg-halo/);
    expect(out).toMatch(/<ellipse cx="150" cy="364"/);
  });

  it("the chamber has no floor, platform, light shaft, reflection or motes", () => {
    const out = html(createElement(HatcheryChamber, null, createElement("span", null, "egg")));
    expect(out).toMatch(/sl-chamber-egg/);
    expect(out).not.toMatch(/sl-chamber-(floor|reflection|shaft|motes)/);
  });
});

describe("canon W2: the phoenix hero", () => {
  it("adds no halo ring, glow, haze or embers around the phoenix", () => {
    const out = html(createElement(PhoenixHero));
    expect(out).not.toMatch(/sl-phx-(eclipse|glow|current|embers|pulse)/);
    expect(out).toMatch(/sl-phx-art/);
  });

  it("has no ignition pulse in markup or styles", () => {
    expect(html(createElement(PhoenixHero))).not.toMatch(/pulse/);
    expect(readFileSync("src/app/globals.css", "utf8")).not.toMatch(/sl-phx-pulse/);
  });
});

/**
 * Kept by the owner as intentional design: the 1px gilt header line and the page-wide
 * ambient light. These pin them to their restrained form so they cannot drift into a glow.
 */
describe("restrained site light: the header line and the ambient light", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const rule = (selector: string) => css.match(new RegExp(`${selector.replace(/[.[\]"=]/g, "\\$&")} \\{([^}]*)\\}`))?.[1] ?? "";
  const alphas = (text: string) => [...text.matchAll(/rgba\([^)]*,\s*([\d.]+)\)/g)].map((m) => Number(m[1]));

  it("the header line is 1px, fixed under the header, out of reach of pointer and screen reader", () => {
    const src = readFileSync("src/components/layout/HorizonLine.tsx", "utf8");
    expect(src).toMatch(/className="sl-horizon pointer-events-none fixed inset-x-0 top-16 z-50 h-px lg:top-20"/);
    expect(src).toMatch(/aria-hidden/);
    expect(src).toMatch(/prefers-reduced-motion: reduce/);
    expect(Math.max(...alphas(rule(".sl-horizon")))).toBeLessThanOrEqual(0.55);
  });

  it("the ambient realm light stays faint (alpha 0.1 or less) and only cross-fades", () => {
    for (const tone of ["gold", "cyan", "violet"]) {
      const a = alphas(rule(`.sl-realm-${tone}`));
      expect(a.length).toBeGreaterThan(0);
      expect(Math.max(...a)).toBeLessThanOrEqual(0.1);
    }
    expect(rule(".sl-realm")).toMatch(/transition: opacity/);
  });
});
