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

/**
 * Prelaunch teaser rules: nothing may reveal the website or the coin before the
 * official reveal. Applied on top of `lintClaims` while PHASE is "prelaunch".
 */
export const PRELAUNCH_RULES: { re: RegExp; reason: string }[] = [
  { re: /vercel/i, reason: "The current website domain must not appear before the reveal." },
  { re: /https?:\/\/|\bwww\.|\b[a-z0-9-]{2,}\.(?:app|com|io|xyz|net|org|gg|fun|site|link)\b/i, reason: "No website or preview links during the teaser phase." },
  { re: /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/, reason: "Looks like a contract or wallet address. Token details stay private until the reveal." },
  { re: /\$SLNT\b|\bticker\b|\bcontract address\b|\bCA:/i, reason: "Token details stay private until the reveal." },
  { re: /\b(?:live now|available now|launch(?:es|ing)? (?:on|at|in)|out now|mint(?:ing)? (?:now|on))\b/i, reason: "Implies a launch or availability that hasn't been announced." },
  { re: /\b\d{1,2}(?:st|nd|rd|th)? (?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b|\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?) \d{1,2}(?:st|nd|rd|th)?\b/i, reason: "No launch dates until they are announced." },
  { re: /\bhold(?:ing)? \$?\w* ?(?:to )?earn\b|\beggs? (?:arrive|appear)s? (?:on (?:its|their) own|automatically)\b/i, reason: "Earning eggs by holding needs live tracking in production, which is not verified." },
];

export function lintPrelaunch(text: string): ClaimWarning[] {
  const out: ClaimWarning[] = [];
  for (const { re, reason } of PRELAUNCH_RULES) {
    const m = text.match(re);
    if (m) out.push({ match: m[0], reason });
  }
  return out;
}

/** True when text contains anything that could reveal the site: links, domains or addresses. */
export function revealsSite(text: string): boolean {
  return PRELAUNCH_RULES.slice(0, 3).some(({ re }) => re.test(text));
}
