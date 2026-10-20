import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomeMetricsView } from "@/components/landing/HomeMetrics";
import { ago, formatCount, formatUsdCompact, freshnessLine, metricViews, UNREACHABLE_NOTE } from "@/lib/homeMetrics";
import type { HomeStats } from "@/shared/homeStats";

/** Homepage live metrics: every state the /api/home-stats contract allows, rendered as visitors see it. */
const NOW = Date.UTC(2026, 9, 20, 19, 0, 0);
const base: HomeStats = {
  holders: { value: 3150, status: "live", asOf: NOW - 5_000, slot: 459340675 },
  eggs: { value: 12480, status: "live", asOf: NOW - 5_000 },
  marketCap: { value: 1_234_567, status: "live", asOf: NOW - 5_000, kind: "circulating", priceUsd: 0.001234, source: "DexScreener" },
  generatedAt: NOW - 2_000,
};
const render = (stats: HomeStats | null, error = false) => {
  const html = renderToStaticMarkup(createElement(HomeMetricsView, { stats, error, now: NOW }));
  return { html, text: html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ") };
};
const metric = (html: string, key: string) => html.slice(html.indexOf(`data-metric="${key}"`), html.indexOf("</div>", html.indexOf(`data-metric="${key}"`)));

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
  it("loading: skeletons, no numbers", () => {
    const { html, text } = render(null);
    expect(html.match(/data-skeleton/g)).toHaveLength(3);
    expect(html).toContain('aria-busy="true"');
    expect(text).not.toMatch(/\d/);
  });

  it("live: formatted numbers, a live dot on each, the source credited", () => {
    const { html, text } = render(base);
    expect(text).toContain("3,150");
    expect(text).toContain("12,480");
    expect(text).toContain("$1.23M");
    expect(html.match(/data-live-dot/g)).toHaveLength(3);
    expect(text).toContain("Live market cap");
    expect(freshnessLine(base, NOW)).toBe("Updated just now · refreshes every 30 s · market data: DexScreener");
  });

  it("FDV: labelled FDV, never market cap", () => {
    const { text } = render({ ...base, marketCap: { ...base.marketCap, kind: "fdv" } });
    expect(text).toContain("FDV");
    expect(text).not.toContain("Live market cap");
  });

  it("stale: the last value with 'updated Xm ago' and no live dot", () => {
    const { html } = render({ ...base, eggs: { value: 12000, status: "stale", asOf: NOW - 7 * 60_000, note: "Refresh failed." } });
    const eggs = metric(html, "eggs");
    expect(eggs).toContain("12,000");
    expect(eggs).toContain("updated 7m ago");
    expect(eggs).not.toContain("data-live-dot");
  });

  it("unavailable: 'Unavailable' with the server's reason, never 0", () => {
    const stats: HomeStats = {
      ...base,
      eggs: { value: null, status: "unavailable", asOf: null, note: "Egg tracking is not configured on this server." },
      marketCap: { value: null, status: "unavailable", asOf: null },
    };
    const { html } = render(stats);
    const eggs = metric(html, "eggs");
    expect(eggs).toContain("Unavailable");
    expect(eggs).toContain("Egg tracking is not configured on this server.");
    expect(eggs).not.toMatch(/>0</);
    expect(metric(html, "marketCap")).toContain("Unavailable");
    expect(metric(html, "marketCap")).not.toContain("data-live-dot");
    expect(freshnessLine(stats, NOW)).not.toContain("market data");
  });

  it("a value marked unavailable is never shown, even if the server sent one", () => {
    const [h] = metricViews({ ...base, holders: { value: 99, status: "unavailable", asOf: null } }, NOW);
    expect(h.value).toBeNull();
    expect(h.live).toBe(false);
  });

  it("route unreachable with no earlier answer: all three Unavailable with a plain reason", () => {
    const { html, text } = render(null, true);
    expect(text.match(/Unavailable/g)).toHaveLength(3);
    expect(text).toContain(UNREACHABLE_NOTE);
    expect(html).not.toContain("data-live-dot");
  });
});

describe("behaviour", () => {
  const src = readFileSync(path.resolve(__dirname, "../landing/HomeMetrics.tsx"), "utf8");
  it("polls every 30 s, pauses while the tab is hidden, and respects reduced motion", () => {
    expect(src).toMatch(/visibilitychange/);
    expect(src).toMatch(/document\.hidden/);
    expect(src).toMatch(/prefers-reduced-motion: reduce/);
  });

  it("sits in the homepage hero", () => {
    const page = readFileSync(path.resolve(__dirname, "../../app/page.tsx"), "utf8");
    expect(page.indexOf("<HomeMetrics />")).toBeGreaterThan(page.indexOf("<PhoenixHero />"));
    expect(page.indexOf("<HomeMetrics />")).toBeLessThan(page.indexOf("</HeroSection>"));
  });
});
