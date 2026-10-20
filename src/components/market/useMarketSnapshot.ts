"use client";

import { useEffect, useState } from "react";
import type { MarketRange, MarketSnapshot } from "@/lib/market/types";

export type MarketLoad = { state: "loading" } | { state: "ok"; snap: MarketSnapshot } | { state: "hidden" } | { state: "error"; message: string };

/**
 * A species' linked stock from /api/market/:speciesId: the same endpoint and rules as the
 * creature detail panel (CreatureMarketPanel). A 404 means the link is not shown to this
 * viewer (an unknown id) and is reported as "hidden".
 */
export function useMarketSnapshot(speciesId: string, range: MarketRange): MarketLoad {
  const [load, setLoad] = useState<MarketLoad>({ state: "loading" });
  useEffect(() => {
    const ctl = new AbortController();
    fetch(`/api/market/${encodeURIComponent(speciesId)}?${new URLSearchParams({ range })}`, { signal: ctl.signal })
      .then(async (r) => {
        if (r.status === 404) return setLoad({ state: "hidden" });
        if (!r.ok) {
          const b = await r.json().catch(() => null);
          return setLoad({ state: "error", message: b?.error?.message ?? "Market data is temporarily unavailable." });
        }
        setLoad({ state: "ok", snap: (await r.json()) as MarketSnapshot });
      })
      .catch((e) => {
        if ((e as Error).name !== "AbortError") setLoad({ state: "error", message: "Market data couldn't be reached." });
      });
    return () => ctl.abort();
  }, [speciesId, range]);
  return load;
}
