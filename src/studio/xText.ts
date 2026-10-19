/** X (Twitter) text rules used by the Content Studio. */

export const X_LIMIT = 280;
/** X shortens every link to t.co, which always counts as 23 characters. */
const URL_WEIGHT = 23;
const URL_RE = /\bhttps?:\/\/\S+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:app|com|io|xyz|net|org|gg|fun)(?:\/\S*)?/gi;

/**
 * Character count as X counts it: links are 23, most Latin text is 1 per
 * character, and emoji and CJK characters count double.
 */
export function xLength(text: string): number {
  let n = 0;
  const rest = text.replace(URL_RE, () => {
    n += URL_WEIGHT;
    return "";
  });
  for (const ch of rest) {
    const cp = ch.codePointAt(0)!;
    // Emoji joiners and variation selectors belong to the emoji they modify.
    if (cp === 0x200d || cp === 0xfe0f) continue;
    n += cp <= 0x10ff || (cp >= 0x2000 && cp <= 0x200c) || (cp >= 0x2010 && cp <= 0x201f) || (cp >= 0x2032 && cp <= 0x2037) ? 1 : 2;
  }
  return n;
}

export interface ClaimWarning {
  match: string;
  reason: string;
}

/**
 * Wording that would make a financial promise, imply guaranteed outcomes, or
 * claim something the project can't back up. The studio shows these as
 * warnings on generated and hand-edited copy alike.
 */
const RULES: { re: RegExp; reason: string }[] = [
  { re: /(?<!\b(?:no|not|never|isn't)(?: \w+){0,2} )\bguarantee[ds]?\b|\brisk[- ]free\b|\bcan'?t lose\b/i, reason: "Implies a guaranteed outcome. Hatch results are random by rarity weight." },
  { re: /\b\d+(?:\.\d+)?\s?x\b(?!\s*\d)|\bmoon(?:ing|shot)?\b|\bpump\b|\blambo\b|\bto the moon\b/i, reason: "Price hype. Solanites makes no price or return claims." },
  { re: /\bprofits?\b|\broi\b|\breturns?\b|\bpassive income\b|\bearn money\b|\bget rich\b|\binvest(?:ment|ing|ors?)?\b|\bfinancial advice\b|\byield\b|\bapy\b|\bapr\b/i, reason: "Financial language. Eggs and creatures are collectibles, not an investment." },
  { re: /\bpayouts?\b|\bfee claims?\b|\brevenue share\b|\brewards?\b|\brefunds?\b/i, reason: "Fee payouts are not implemented and no refund policy is active, so don't promote rewards." },
  { re: /\bairdrop\b|\bgiveaway\b|\bwhitelist\b|\bpresale\b/i, reason: "No airdrop, giveaway or presale exists in the project." },
  { re: /\bpartner(?:s|ship|ed|ing)?\b|\bbacked by\b|\blisted on\b|\bbinance\b|\bcoinbase\b/i, reason: "No partnerships or listings are confirmed. Don't imply any." },
  { re: /\b\d[\d,.]*\s?k?\+?\s+(?:holders|members|users|players|hatchers)\b|\bthousands of\b|\beveryone is\b/i, reason: "Social proof figures need a verified source; the project doesn't publish any." },
  { re: /\bleaderboard\b/i, reason: "The leaderboard uses simulated data. Don't present it as real activity." },
  { re: /\bnfts?\b|\bminted on-?chain\b/i, reason: "Eggs and creatures are not NFTs and nothing is minted on-chain." },
];

export function lintClaims(text: string): ClaimWarning[] {
  const out: ClaimWarning[] = [];
  for (const { re, reason } of RULES) {
    const m = text.match(re);
    if (m) out.push({ match: m[0], reason });
  }
  return out;
}
