"use client";

import { useState } from "react";
import type { WalletLookupError, WalletLookupResult } from "@/shared/walletLookup";
import { shortAddress } from "@/lib/format";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; code: string; message: string } | { kind: "done"; result: WalletLookupResult };

const ERROR_TITLES: Record<string, string> = {
  INVALID_ADDRESS: "That isn't a valid Solana address",
  RATE_LIMITED: "Too many lookups",
  NOT_CONFIGURED: "Live lookups aren't switched on yet",
  RPC_UNAVAILABLE: "Solana data is temporarily unavailable",
  UPSTREAM_ERROR: "The data provider returned something unexpected",
};

/** Read-only public-address lookup. Never asks for a signature, seed phrase or private key. */
export function WalletLookup() {
  const [address, setAddress] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const a = address.trim();
    if (!a) return;
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/wallet/${encodeURIComponent(a)}`, { cache: "no-store" });
      const body = (await res.json().catch(() => null)) as WalletLookupResult | WalletLookupError | null;
      if (!body) setState({ kind: "error", code: "UPSTREAM_ERROR", message: `Lookup failed (HTTP ${res.status}).` });
      else if ("error" in body) setState({ kind: "error", code: body.error.code, message: body.error.message });
      else setState({ kind: "done", result: body });
    } catch {
      setState({ kind: "error", code: "UPSTREAM_ERROR", message: "Could not reach the Solanites server. Check your connection and try again." });
    }
  }

  return (
    <section className="sl-glass rounded-3xl p-5 sm:p-8" aria-labelledby="lookup-title">
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-sol-green/80">Read-only lookup</p>
      <h2 id="lookup-title" className="mt-3 font-display text-2xl text-white sm:text-3xl">
        Check a wallet
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">
        Paste a public Solana address to see its token balance and egg eligibility. No wallet connection is needed.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="wallet-address" className="sr-only">
          Public Solana wallet address
        </label>
        <input
          id="wallet-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Public wallet address, e.g. 7xKX…9fQa"
          autoComplete="off"
          spellCheck={false}
          maxLength={60}
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3.5 font-mono text-sm text-white outline-none placeholder:text-mist/50 focus:border-sol-purple"
        />
        <button type="submit" disabled={state.kind === "loading" || !address.trim()} className="sl-btn-primary rounded-2xl px-7 py-3.5 font-display text-xs font-semibold tracking-[0.2em] text-white disabled:opacity-50">
          {state.kind === "loading" ? "CHECKING…" : "LOOK UP"}
        </button>
      </form>

      <p className="mt-3 text-xs leading-relaxed text-mist/70">
        Solanites will never ask for your seed phrase or private key, and looking up an address never needs a signature. Balances are public: anyone who knows an address can see this information.
      </p>

      {state.kind === "error" && (
        <div role="alert" className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-4 text-sm">
          <p className="font-medium text-amber-200">{ERROR_TITLES[state.code] ?? "Lookup failed"}</p>
          <p className="mt-1 text-amber-100/80">{state.message}</p>
        </div>
      )}

      {state.kind === "done" && <LookupResult r={state.result} />}
    </section>
  );
}

function LookupResult({ r }: { r: WalletLookupResult }) {
  const observed = new Date(r.source.observedAt);
  return (
    <div className="mt-6 space-y-4" aria-live="polite">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Chip tone="live">Live on-chain · {r.source.commitment}</Chip>
        <span className="font-mono text-mist">
          slot {r.source.slot.toLocaleString()} · {observed.toLocaleTimeString()}
          {r.source.cached ? " · cached" : ""}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Token balance" value={Number(r.balance.amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} sub={`${r.balance.tokenAccounts.length} token account${r.balance.tokenAccounts.length === 1 ? "" : "s"}`} />
        <Stat
          label="Egg eligibility"
          value={r.eggs.excluded ? "Excluded" : r.eggs.meetsThreshold ? `${r.eggs.eligibleEggs} egg${r.eggs.eligibleEggs === 1 ? "" : "s"}` : "Not eligible"}
          sub={r.eggs.excluded ? "Project, treasury or pool address" : `${r.eggs.tokensPerEgg.toLocaleString()} per egg · max ${r.eggs.maxEggsPerWallet}`}
          accent={r.eggs.meetsThreshold && !r.eggs.excluded ? "#14f195" : undefined}
        />
        <Stat label="Holding duration" value="Not tracked yet" sub={r.holding.note} muted />
        <Stat label="Reward weight" value="Not available yet" sub={r.rewards.note} muted />
      </div>

      {!r.eggs.excluded && r.eggs.toNextEgg !== "0" && (
        <p className="text-sm text-mist">
          {Number(r.eggs.toNextEgg).toLocaleString(undefined, { maximumFractionDigits: 6 })} more tokens qualify this wallet for {r.eggs.meetsThreshold ? "another egg" : "its first egg"}.
        </p>
      )}
      {r.balance.frozenAmount !== "0" && <p className="text-sm text-amber-200/90">{r.balance.frozenAmount} tokens sit in frozen token accounts and are not counted.</p>}

      <details className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm">
        <summary className="cursor-pointer text-mist">Where this comes from</summary>
        <dl className="mt-3 grid gap-2 font-mono text-xs text-mist sm:grid-cols-[140px_1fr]">
          <dt>Wallet</dt>
          <dd className="break-all text-white/80">{r.address}</dd>
          <dt>Token mint</dt>
          <dd className="break-all text-white/80">
            <a className="underline decoration-white/20 underline-offset-4 hover:text-white" href={`https://solscan.io/token/${r.token.mint}`} target="_blank" rel="noreferrer">
              {r.token.mint}
            </a>
          </dd>
          <dt>Token program</dt>
          <dd className="text-white/80">
            {r.token.tokenProgram} · {r.token.decimals} decimals
          </dd>
          <dt>Exact balance</dt>
          <dd className="break-all text-white/80">
            {r.balance.amount} ({r.balance.amountBase} base units)
          </dd>
          {r.balance.tokenAccounts.map((a) => (
            <div key={a.address} className="contents">
              <dt>Account {shortAddress(a.address)}</dt>
              <dd className="text-white/80">
                {a.amount}
                {a.state === "frozen" ? " · frozen" : ""}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs leading-relaxed text-mist/70">
          Balances are read from Solana when you look up, at “{r.source.commitment}” commitment. The egg progress shown elsewhere in the Hatchery is still the simulated prototype and is not linked to this wallet yet.
        </p>
      </details>
    </div>
  );
}

function Stat({ label, value, sub, accent, muted }: { label: string; value: string; sub: string; accent?: string; muted?: boolean }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">{label}</p>
      <p className={`mt-2 font-display text-xl ${muted ? "text-white/50" : "text-white"}`} style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-mist">{sub}</p>
    </div>
  );
}

function Chip({ tone, children }: { tone: "live"; children: React.ReactNode }) {
  return <span className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${tone === "live" ? "bg-sol-green/15 text-sol-green" : ""}`}>{children}</span>;
}
