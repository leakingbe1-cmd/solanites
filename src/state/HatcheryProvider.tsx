"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { incubationMsFor } from "@/config/eggProgression";
import { gameConfig, TIME, type GameConfig } from "@/config/gameConfig";
import { advance, eggsAllowed, phaseOf, rollSpecies, type SolaniteRecord } from "@/lib/progression";
import { randomSeed } from "@/lib/rng";
import { setSoundEnabled } from "@/lib/sound";
import { demoWallet } from "@/services/wallet/demoWallet";
import { injectedWallet } from "@/services/wallet/injectedWallet";
import type { WalletKind, WalletSession } from "@/services/wallet/types";
import { ApiBalanceProvider } from "@/services/token/apiBalance";

/**
 * Client-side game state for the PROTOTYPE.
 *
 * This provider plays the role of the `SolaniteRegistry` locally: it keeps
 * records in localStorage and advances them with a simulated clock. Swap the
 * reducer's claim/hatch/tick logic for API calls once a backend exists — the
 * UI only consumes the context below.
 */

const STORAGE_KEY = "solanites:prototype:v1";

export const SPEED_OPTIONS = [
  { label: "Real time", value: 1 },
  { label: "1 min / s", value: 60 },
  { label: "1 hour / s", value: 3600 },
  { label: "1 day / s", value: 86400 },
] as const;

interface State {
  hydrated: boolean;
  wallet: WalletSession | null;
  balance: number;
  balanceSource: "mock" | "rpc";
  balanceError: string | null;
  records: SolaniteRecord[];
  simNow: number;
  speed: number;
  discovered: string[];
  sound: boolean;
}

type Action =
  | { type: "hydrate"; state: Partial<State> }
  | { type: "connect"; wallet: WalletSession; demo: boolean }
  | { type: "disconnect" }
  | { type: "balance"; value: number; source: "mock" | "rpc"; error?: string | null }
  | { type: "balanceError"; error: string }
  | { type: "tick"; deltaMs: number }
  | { type: "claim"; seed: number }
  | { type: "hatch"; id: string }
  | { type: "speed"; value: number }
  | { type: "sound"; value: boolean }
  | { type: "rename"; id: string; name: string }
  | { type: "discover"; speciesId: string }
  | { type: "watch"; address: string }
  | { type: "resetDemo" };

const initial: State = {
  hydrated: false,
  wallet: null,
  balance: 0,
  balanceSource: "mock",
  balanceError: null,
  records: [],
  simNow: 0,
  speed: 3600,
  discovered: [],
  sound: false,
};

function makeId(seed: number) {
  return `sol-${seed.toString(36)}`;
}

/** Pre-built demo collection so the Hatchery is alive on first visit. */
/** Demo balance: backs the five demo records plus a fraction toward the next egg. */
export const DEMO_BALANCE = 5.2 * gameConfig.token.tokensPerEgg;

function demoRecords(now: number, cfg: GameConfig): SolaniteRecord[] {
  // Each demo egg uses the real per-egg schedule for its position (egg 1 = 5 min, egg 2 = 6 h, …).
  const base = (n: number, seed: number, speciesId: string, ageMs: number, extra: Partial<SolaniteRecord>): SolaniteRecord => ({
    id: makeId(seed),
    seed,
    acquiredAt: now - ageMs,
    incubationMs: 0,
    durationMs: incubationMsFor(n),
    speciesId,
    hatchedAt: null,
    growthMs: 0,
    backed: true,
    ...extra,
  });
  const d = (n: number) => incubationMsFor(n);
  return [
    base(1, 9101, "duskwing", d(1) + 52 * TIME.DAY, { incubationMs: d(1), hatchedAt: now - 52 * TIME.DAY, growthMs: 52 * TIME.DAY, nickname: "Nightwarden" }),
    base(2, 4410, "mossling", d(2) + 9 * TIME.DAY, { incubationMs: d(2), hatchedAt: now - 9 * TIME.DAY, growthMs: 9 * TIME.DAY }),
    base(3, 7777, "aurelion", d(3) + TIME.HOUR, { incubationMs: d(3) }),
    base(4, 2024, "neonyx", d(4) * 0.82, { incubationMs: d(4) * 0.82 }),
    base(5, 1337, rollSpecies(1337, cfg), d(5) * 0.46, { incubationMs: d(5) * 0.46 }),
  ];
}

function reducer(state: State, action: Action): State {
  const cfg = gameConfig;
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, hydrated: true };
    case "connect": {
      if (action.demo) {
        const now = Date.now();
        const sameDemo = state.wallet?.kind === "demo" && state.records.length > 0;
        const records = sameDemo ? state.records : demoRecords(now, cfg);
        const discovered = Array.from(new Set([...state.discovered, ...records.filter((r) => r.hatchedAt !== null).map((r) => r.speciesId)]));
        return { ...state, wallet: action.wallet, balance: DEMO_BALANCE, balanceSource: "mock", balanceError: null, records, simNow: sameDemo ? state.simNow : now, discovered };
      }
      return { ...state, wallet: action.wallet, balance: 0, balanceSource: "rpc", records: [], simNow: Date.now(), speed: 1 };
    }
    case "disconnect":
      return { ...state, wallet: null };
    case "balance":
      return { ...state, balance: action.value, balanceSource: action.source, balanceError: action.error ?? null };
    case "balanceError":
      // Keep the last known balance rather than inventing a zero.
      return { ...state, balanceError: action.error };
    case "tick": {
      if (!state.wallet || state.wallet.kind === "watch" || action.deltaMs <= 0) return state;
      return { ...state, simNow: state.simNow + action.deltaMs, records: advance(state.records, action.deltaMs, state.balance, cfg) };
    }
    case "claim": {
      // Same rule a server must enforce: owned eggs + creatures ≤ eggs the balance backs.
      if (!state.wallet || state.records.length >= eggsAllowed(state.balance, cfg)) return state;
      const rec: SolaniteRecord = {
        id: makeId(action.seed),
        seed: action.seed,
        acquiredAt: state.simNow,
        incubationMs: 0,
        durationMs: incubationMsFor(state.records.length + 1),
        speciesId: rollSpecies(action.seed, cfg),
        hatchedAt: null,
        growthMs: 0,
        backed: true,
      };
      return { ...state, records: [...state.records, rec] };
    }
    case "hatch": {
      const rec = state.records.find((r) => r.id === action.id);
      if (!rec || phaseOf(rec, cfg) !== "ready") return state;
      return {
        ...state,
        records: state.records.map((r) => (r.id === action.id ? { ...r, hatchedAt: state.simNow, growthMs: 0 } : r)),
        discovered: state.discovered.includes(rec.speciesId) ? state.discovered : [...state.discovered, rec.speciesId],
      };
    }
    case "speed":
      return { ...state, speed: action.value };
    case "sound":
      return { ...state, sound: action.value };
    case "rename":
      return { ...state, records: state.records.map((r) => (r.id === action.id ? { ...r, nickname: action.name.slice(0, 24) || undefined } : r)) };
    case "resetDemo": {
      const now = Date.now();
      const records = demoRecords(now, cfg);
      return { ...state, records, balance: DEMO_BALANCE, simNow: now, discovered: records.filter((r) => r.hatchedAt !== null).map((r) => r.speciesId) };
    }
    case "discover":
      return state.discovered.includes(action.speciesId) ? state : { ...state, discovered: [...state.discovered, action.speciesId] };
    case "watch":
      // Read-only: follow an address's automatically tracked eggs. No connection, no signature, no local records.
      return { ...state, wallet: { kind: "watch", address: action.address, label: "Tracked address" }, records: [], balance: 0, balanceSource: "rpc", balanceError: null };
  }
}

interface HatcheryContextValue extends State {
  config: GameConfig;
  isDemo: boolean;
  allowedEggs: number;
  canClaim: boolean;
  injectedAvailable: boolean;
  connect(kind: WalletKind): Promise<void>;
  disconnect(): void;
  setDemoBalance(v: number): void;
  claimEgg(): void;
  hatch(id: string): void;
  setSpeed(v: number): void;
  warp(ms: number): void;
  toggleSound(): void;
  rename(id: string, name: string): void;
  resetDemo(): void;
  /** Follow a public address's tracked eggs. No wallet connection. */
  watch(address: string): void;
  /** Mark a species as discovered (after a tracked hatch). */
  discover(speciesId: string): void;
}

const Ctx = createContext<HatcheryContextValue | null>(null);

export function HatcheryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const lastReal = useRef<number>(0);

  // Hydrate from storage.
  useEffect(() => {
    let saved: Partial<State> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {
      /* storage unavailable — start fresh */
    }
    dispatch({ type: "hydrate", state: { ...saved, hydrated: true, balanceError: null } });
  }, []);

  // Persist.
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      const { hydrated: _h, balanceError: _e, ...rest } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      /* ignore */
    }
  }, [state]);

  useEffect(() => setSoundEnabled(state.sound), [state.sound]);

  // Simulated clock (demo only; tracked eggs use the server clock).
  useEffect(() => {
    if (!state.wallet || state.wallet.kind === "watch") return;
    lastReal.current = performance.now();
    const t = setInterval(() => {
      const now = performance.now();
      const dt = now - lastReal.current;
      lastReal.current = now;
      dispatch({ type: "tick", deltaMs: dt * state.speed });
    }, 250);
    return () => clearInterval(t);
  }, [state.wallet, state.speed]);

  // Live balance polling for real wallets via the server (display only — see ApiBalanceProvider).
  useEffect(() => {
    if (state.wallet?.kind !== "injected") return;
    const provider = new ApiBalanceProvider();
    const address = state.wallet.address;
    let cancelled = false;
    const load = () =>
      provider
        .getBalance(address)
        .then((v) => !cancelled && dispatch({ type: "balance", value: v, source: "rpc" }))
        .catch((e: Error) => !cancelled && dispatch({ type: "balanceError", error: e.message }));
    load();
    const t = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [state.wallet]);

  const connect = useCallback(async (kind: WalletKind) => {
    const adapter = kind === "demo" ? demoWallet : injectedWallet;
    const session = await adapter.connect();
    dispatch({ type: "connect", wallet: session, demo: kind === "demo" });
  }, []);

  const value = useMemo<HatcheryContextValue>(() => {
    const allowed = eggsAllowed(state.balance, gameConfig);
    return {
      ...state,
      config: gameConfig,
      isDemo: state.wallet?.kind === "demo",
      allowedEggs: allowed,
      canClaim: !!state.wallet && state.records.length < allowed,
      injectedAvailable: typeof window !== "undefined" && injectedWallet.isAvailable(),
      connect,
      disconnect: () => {
        if (state.wallet?.kind === "injected") injectedWallet.disconnect().catch(() => {});
        dispatch({ type: "disconnect" });
      },
      setDemoBalance: (v) => state.wallet?.kind === "demo" && dispatch({ type: "balance", value: Math.max(0, Math.round(v)), source: "mock" }),
      claimEgg: () => dispatch({ type: "claim", seed: randomSeed() }),
      hatch: (id) => dispatch({ type: "hatch", id }),
      setSpeed: (v) => dispatch({ type: "speed", value: v }),
      warp: (ms) => state.wallet?.kind === "demo" && dispatch({ type: "tick", deltaMs: ms }),
      toggleSound: () => dispatch({ type: "sound", value: !state.sound }),
      rename: (id, name) => dispatch({ type: "rename", id, name }),
      resetDemo: () => dispatch({ type: "resetDemo" }),
      watch: (address) => dispatch({ type: "watch", address }),
      discover: (speciesId) => dispatch({ type: "discover", speciesId }),
    };
  }, [state, connect]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHatchery() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHatchery must be used inside <HatcheryProvider>");
  return v;
}
