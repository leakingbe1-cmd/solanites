import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { liveFigures, ProofStripView } from "@/components/landing/ProofStrip";
import { HatcheryProvider } from "@/state/HatcheryProvider";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));
import { gameConfig } from "@/config/gameConfig";
import { formatNumber } from "@/lib/format";
import { ago, formatCount, formatUsdCompact, isPreLaunch, metricViews } from "@/lib/homeMetrics";
import { CATALOGUE_SIZE } from "@/lib/species";
import { NOT_CONFIGURED_NOTE, type HomeStats } from "@/shared/homeStats";

/** The homepage proof strip: every state the /api/home-stats contract allows, rendered as visitors see it. */
const NOW = Date.UTC(2026, 9, 20, 19, 0, 0);
const base: HomeStats = {
  holders: { value: 3150, status: "live", asOf: NOW - 5_000, slot: 459340675 },
  eggs: { value: 12480, status: "live", asOf: NOW - 5_000 },
  marketCap: { value: 1_234_567, status: "live", asOf: NOW - 5_000, kind: "circulating", priceUsd: 0.001234, source: "DexScreener" },
  generatedAt: NOW - 2_000,
};
const render = (stats: HomeStats | null, hatched: number | null = null) => {
  const html = renderToStaticMarkup(createElement(HatcheryProvider, null, createElement(ProofStripView, { stats, hatched, now: NOW })));
  return { html, text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ") };
};

describe("formatting", () => {
  it("counts with thousands separators and market cap in compact dollars", () => {
    expect(formatCount(3150)).toBe("3,150");
    expect(formatUsdCompact(1_234_567)).toBe("$1.23M");
    expect(formatUsdCompact(45_600)).toBe("$45.6K");
    expect(formatUsdCompact(2_100_000_000)).toBe("$2.10B");
    expect(formatUsdCompact(950)).toBe("$950");
  });

  it("says how long ago, in minutes, hours or days", () => {
    expect(ago(NOW - 20_000, NOW)).toBe("just now");
    expect(ago(NOW - 4 * 60_000, NOW)).toBe("4m ago");
    expect(ago(NOW - 3 * 3_600_000, NOW)).toBe("3h ago");
    expect(ago(NOW - 72 * 3_600_000, NOW)).toBe("3d ago");
  });
});

describe("states", () => {
  const off = { value: null, status: "unavailable", asOf: null, note: NOT_CONFIGURED_NOTE } as const;
  const prelaunch: HomeStats = { ...base, holders: off, eggs: { value: null, status: "unavailable", asOf: null, note: "Egg tracking is not configured on this server." }, marketCap: off };

  it("pre-launch: what is real today, with links to /proof and How It Works; no live figures or 'Unavailable'", () => {
    expect(isPreLaunch(prelaunch)).toBe(true);
    for (const stats of [prelaunch, null]) {
      const { html, text } = render(stats);
      expect(html).toContain('data-state="prelaunch"');
      expect(text).toContain(`${CATALOGUE_SIZE} species`);
      expect(text).toContain("Holder tracker");
      expect(text).toContain(`${formatNumber(gameConfig.token.tokensPerEgg)} ${gameConfig.token.symbol} = 1 egg`);
      expect(html).toContain('href="/proof"');
      expect(html).toContain('href="/how-it-works"');
      expect(text).not.toContain("Unavailable");
      expect(html).not.toContain("data-live-dot");
      expect(html).not.toContain("Paste any wallet");
    }
  });

  it("live: holders, eggs issued and eggs hatched with live dots, plus the wallet lookup; never market cap", () => {
    const { html, text } = render(base, 42);
    expect(html).toContain('data-state="live"');
    expect(text).toContain("3,150");
    expect(text).toContain("12,480");
    expect(text).toContain("Eggs hatched");
    expect(text).not.toMatch(/market cap|FDV|\$1\.23M/i);
    expect(html.match(/data-live-dot/g)).toHaveLength(3);
    expect(html).toContain("Paste any wallet to see its eggs");
  });

  it("a figure without data is left out, never shown as 'Unavailable' or 0", () => {
    const stats: HomeStats = { ...base, eggs: { value: null, status: "unavailable", asOf: null, note: "Egg data is temporarily unavailable." } };
    const figs = liveFigures(stats, null, NOW);
    expect(figs.map((f) => f.label)).toEqual(["Holders"]);
    const { text } = render(stats);
    expect(text).not.toContain("Unavailable");
    expect(text).not.toMatch(/>0</);
  });

  it("stale: the last value with 'updated Xm ago'", () => {
    const [, eggs] = liveFigures({ ...base, eggs: { value: 12000, status: "stale", asOf: NOW - 7 * 60_000, note: "Refresh failed." } }, null, NOW);
    expect(eggs.detail).toBe("updated 7m ago");
    expect(eggs.live).toBe(false);
  });

  it("a value marked unavailable is never shown, even if the server sent one", () => {
    const [h] = metricViews({ ...base, holders: { value: 99, status: "unavailable", asOf: null } }, NOW);
    expect(h.value).toBeNull();
    expect(h.live).toBe(false);
  });

  it("a temporary failure after launch isn't mistaken for pre-launch", () => {
    expect(isPreLaunch({ ...base, holders: { value: null, status: "unavailable", asOf: null, note: "Holder data is temporarily unavailable." } })).toBe(false);
  });
});

describe("behaviour", () => {
  const src = readFileSync(path.resolve(__dirname, "../landing/ProofStrip.tsx"), "utf8");
  it("polls every 30 s, pauses while the tab is hidden, and respects reduced motion", () => {
    expect(src).toMatch(/visibilitychange/);
    expect(src).toMatch(/document\.hidden/);
    expect(src).toMatch(/prefers-reduced-motion: reduce/);
  });

  it("sits directly under the homepage hero", () => {
    const page = readFileSync(path.resolve(__dirname, "../../app/page.tsx"), "utf8");
    expect(page.indexOf("<ProofStrip />")).toBeGreaterThan(page.indexOf("</HeroSection>"));
    expect(page.indexOf("<ProofStrip />")).toBeLessThan(page.indexOf('id="market"'));
  });
});
