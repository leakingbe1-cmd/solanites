import { isContractAddress } from "@/config/social";
import { TOKENOMICS, type Tokenomics } from "@/config/tokenomics";

/** Which tokenomics and trust facts have owner values. Anything missing is left out of the page. */
export interface TrustFact {
  key: string;
  label: string;
  value: string;
  /** A public address to copy, when the fact is one. */
  address?: string;
  /** A public proof link (lock, vesting). */
  proofUrl?: string;
}

const AUTHORITY = { revoked: "Revoked", active: "Active" } as const;

export function trustFacts(t: Tokenomics = TOKENOMICS): TrustFact[] {
  const facts: TrustFact[] = [];
  if (t.mintAuthority) facts.push({ key: "mint", label: "Mint authority", value: AUTHORITY[t.mintAuthority] });
  if (t.freezeAuthority) facts.push({ key: "freeze", label: "Freeze authority", value: AUTHORITY[t.freezeAuthority] });
  for (const a of t.allocations) facts.push({ key: `alloc-${a.label}`, label: a.label, value: `${Number(a.percent.toFixed(2))}% of supply`, address: a.address, proofUrl: a.proofUrl });
  if (t.liquidity) facts.push({ key: "liquidity", label: "Liquidity", value: t.liquidity });
  if (t.fees) facts.push({ key: "fees", label: "Fees", value: t.fees });
  for (const w of t.teamWallets) facts.push({ key: `wallet-${w.address}`, label: w.label, value: "Team wallet", address: w.address });
  return facts;
}

/** Problems with the configured values (an empty list means valid). Checked by tests, so a bad edit fails CI. */
export function tokenomicsProblems(t: Tokenomics = TOKENOMICS): string[] {
  const out: string[] = [];
  const total = t.allocations.reduce((n, a) => n + a.percent, 0);
  if (total > 100.0001) out.push(`allocations add up to ${total}%`);
  for (const a of t.allocations) {
    if (!(a.percent > 0)) out.push(`${a.label}: percent must be above 0`);
    if (a.address !== undefined && !isContractAddress(a.address)) out.push(`${a.label}: invalid address`);
    if (a.proofUrl !== undefined && !/^https:\/\//.test(a.proofUrl)) out.push(`${a.label}: proof must be an https link`);
  }
  for (const w of t.teamWallets) if (!isContractAddress(w.address)) out.push(`${w.label}: invalid address`);
  return out;
}
