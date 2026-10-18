"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDuration, shortAddress } from "@/lib/format";
import { encodeBase58 } from "@/lib/base58";
import { injectedWallet } from "@/services/wallet/injectedWallet";
import type { ClaimQuote, ClaimsApiError, ClaimsStatus, FeeClaimRecord } from "@/shared/claims";

type Step =
  | { kind: "idle" }
  | { kind: "busy"; label: string }
  | { kind: "signedIn"; address: string; quote: ClaimQuote | null; claims: FeeClaimRecord[] }
  | { kind: "error"; message: string };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init, headers: { "content-type": "application/json", ...(init?.headers ?? {}) } });
  const body = (await res.json().catch(() => null)) as T | ClaimsApiError | null;
  if (!body) throw new Error(`The server answered HTTP ${res.status}.`);
  if (typeof body === "object" && body && "error" in body) throw new Error((body as ClaimsApiError).error.message);
  return body as T;
}

/**
 * Workflow B: the fee-claim flow. Opening time, eligibility and amounts all
 * come from the server; the browser never supplies a balance, time or amount.
 */
export function ClaimsPanel() {
  const [status, setStatus] = useState<{ s: ClaimsStatus; offset: number } | { error: string } | null>(null);
  const [, setTick] = useState(0);
  const [step, setStep] = useState<Step>({ kind: "idle" });

  const loadStatus = useCallback(() => {
    api<ClaimsStatus>("/api/claims/status")
      .then((s) => setStatus({ s, offset: s.serverNow - Date.now() }))
      .catch((e: Error) => setStatus({ error: e.message }));
  }, []);

  useEffect(() => {
    loadStatus();
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    const poll = setInterval(loadStatus, 60_000);
    return () => {
      clearInterval(t);
      clearInterval(poll);
    };
  }, [loadStatus]);

  async function connectAndSignIn() {
    try {
      setStep({ kind: "busy", label: "Waiting for your wallet…" });
      const session = await injectedWallet.connect();
      setStep({ kind: "busy", label: "Sign the message in your wallet. It costs nothing and sends no transaction." });
      const { message, nonce } = await api<{ message: string; nonce: string }>("/api/claims/nonce", { method: "POST", body: JSON.stringify({ address: session.address }) });
      const signature = await injectedWallet.signMessage!(message);
      await api("/api/claims/session", { method: "POST", body: JSON.stringify({ address: session.address, nonce, signature: encodeBase58(signature) }) });
      await refreshSignedIn(session.address);
    } catch (e) {
      setStep({ kind: "error", message: (e as Error).message });
    }
  }

  async function refreshSignedIn(address: string) {
    setStep({ kind: "busy", label: "Checking your holdings on Solana…" });
    const [quote, list] = await Promise.all([api<ClaimQuote>("/api/claims/quote").catch(() => null), api<{ claims: FeeClaimRecord[] }>("/api/claims")]);
    setStep({ kind: "signedIn", address, quote, claims: list.claims });
  }

  async function submit(address: string) {
    try {
      setStep({ kind: "busy", label: "Recording your claim…" });
      await api("/api/claims", { method: "POST", body: "{}" });
      await refreshSignedIn(address);
    } catch (e) {
      setStep({ kind: "error", message: (e as Error).message });
    }
  }

  async function signOut() {
    await fetch("/api/claims/session", { method: "DELETE" }).catch(() => {});
    await injectedWallet.disconnect().catch(() => {});
    setStep({ kind: "idle" });
  }

  if (!status) return <div className="mt-10 h-40 animate-pulse rounded-3xl bg-white/[0.03]" />;
  if ("error" in status) return <Panel tone="warn" title="Claims aren't available on this server yet">{status.error}</Panel>;

  const { s, offset } = status;
  const now = Date.now() + offset;
  if (s.launchAt === null) return <Panel title="Not scheduled yet">The launch time hasn&apos;t been announced. Claims open six hours after launch; this page will show a countdown once it is set.</Panel>;
  if (!s.open && s.opensAt !== null && now < s.opensAt)
    return (
      <Panel title="Claims are not open yet">
        <span className="block font-display text-4xl text-white">{formatDuration(s.opensAt - now, { seconds: true })}</span>
        <span className="mt-2 block">Opens {new Date(s.opensAt).toLocaleString()}, six hours after launch. Your eggs keep being tracked in the meantime, with nothing to connect.</span>
      </Panel>
    );
  if (!s.open) return <Panel title="The claim period has ended">Recorded claims keep their status below once you sign in.</Panel>;
  if (!s.policyConfigured)
    return (
      <Panel tone="warn" title="Claims are open, but amounts aren't available yet">
        The refund rules haven&apos;t been confirmed, so no amount can be calculated or claimed. Nothing is promised until they are published here.
      </Panel>
    );

  return (
    <div className="mt-10 space-y-4">
      {step.kind === "idle" && (
        <Panel title="Connect to check your claim">
          <span className="block">Your wallet will ask you to sign a short message proving the address is yours. Signing is free and sends no transaction.</span>
          <button
            onClick={connectAndSignIn}
            disabled={!injectedWallet.isAvailable()}
            className="sl-btn-primary mt-5 rounded-full px-7 py-3.5 font-display text-xs font-semibold tracking-[0.2em] text-white disabled:opacity-50"
          >
            CONNECT WALLET
          </button>
          {!injectedWallet.isAvailable() && <span className="mt-3 block text-xs text-amber-200">No Solana wallet extension detected (Phantom, Solflare or Backpack).</span>}
        </Panel>
      )}
      {step.kind === "busy" && <Panel title="One moment">{step.label}</Panel>}
      {step.kind === "error" && (
        <Panel tone="warn" title="That didn't work">
          {step.message}
          <button onClick={() => setStep({ kind: "idle" })} className="mt-4 block rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-widest text-mist hover:text-white">
            Try again
          </button>
        </Panel>
      )}
      {step.kind === "signedIn" && (
        <>
          <div className="flex items-center justify-between text-sm text-mist">
            <span>
              Signed in as <span className="font-mono text-white">{shortAddress(step.address)}</span>
            </span>
            <button onClick={signOut} className="rounded-full border border-white/10 px-4 py-1.5 text-xs uppercase tracking-widest hover:text-white">
              Sign out
            </button>
          </div>
          {step.claims.length > 0 ? (
            step.claims.map((c) => (
              <Panel key={c.id} title={`Claim recorded · ${c.amount} ${c.payoutAsset}`}>
                <span className="block">
                  Status: <span className="text-white">{{ pending_payout: "Recorded, awaiting payout", paid: "Paid", rejected: "Rejected" }[c.status]}</span>
                </span>
                {c.payoutSignature && (
                  <a className="mt-2 block break-all font-mono text-xs underline" href={`https://solscan.io/tx/${c.payoutSignature}`} target="_blank" rel="noreferrer">
                    {c.payoutSignature}
                  </a>
                )}
                <Lines lines={c.lines} />
              </Panel>
            ))
          ) : step.quote?.eligible ? (
            <Panel title={`You can claim ${step.quote.amount} ${step.quote.payoutAsset}`}>
              <span className="block">Calculated on the server from your balance verified at slot {step.quote.verifiedAt.slot.toLocaleString()}.</span>
              <Lines lines={step.quote.lines} />
              <button onClick={() => submit(step.address)} className="sl-btn-primary mt-5 rounded-full px-7 py-3.5 font-display text-xs font-semibold tracking-[0.2em] text-white">
                SUBMIT CLAIM
              </button>
              <span className="mt-3 block text-xs text-mist/70">Submitting records your claim once. Payouts are sent separately after review; you&apos;ll see the transaction here when it is.</span>
            </Panel>
          ) : (
            <Panel title="No claim available">{step.quote?.reason ?? "This wallet has nothing to claim under the current rules."}</Panel>
          )}
        </>
      )}
      <p className="text-xs leading-relaxed text-mist/70">Solanites will never ask for your seed phrase or private key. Only sign messages on this site that match the text shown in your wallet.</p>
    </div>
  );
}

function Lines({ lines }: { lines: { label: string; value: string }[] }) {
  if (!lines.length) return null;
  return (
    <dl className="mt-4 grid gap-2 border-t border-white/5 pt-4 text-sm sm:grid-cols-[1fr_auto]">
      {lines.map((l) => (
        <div key={l.label} className="contents">
          <dt className="text-mist">{l.label}</dt>
          <dd className="font-mono text-white">{l.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Panel({ title, children, tone }: { title: string; children: React.ReactNode; tone?: "warn" }) {
  return (
    <section className={`mt-10 rounded-3xl border p-6 sm:p-8 ${tone === "warn" ? "border-amber-400/25 bg-amber-400/[0.06]" : "sl-glass border-white/[0.07]"}`}>
      <h2 className={`font-display text-xl ${tone === "warn" ? "text-amber-200" : "text-white"}`}>{title}</h2>
      <div className={`mt-3 text-sm leading-relaxed ${tone === "warn" ? "text-amber-100/90" : "text-mist"}`}>{children}</div>
    </section>
  );
}
