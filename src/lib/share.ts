import { gameConfig } from "@/config/gameConfig";
import { X_HANDLE } from "@/config/social";
import { RARITIES } from "@/lib/rarity";
import { SPECIES_BY_ID, type Species } from "@/lib/species";

/**
 * Share cards. A real card is drawn on the server from the tracker's egg record (species, rarity and
 * form come from there, never from the browser). A demo card is stamped DEMO and is only offered
 * for common to legendary species, so Mythic and Secret never appear on simulated marketing.
 */
export type ShareTarget = { kind: "egg"; eggId: string } | { kind: "demo"; speciesId: string; stage: number };

export const EGG_ID = /^egg_[1-9A-HJ-NP-Za-km-z]{32,44}_\d{1,6}$/;
export const LAST_STAGE = gameConfig.evolution.names.length - 1;

export const demoShareable = (s: Species | undefined): s is Species => !!s && s.rarity !== "mythic" && s.rarity !== "secret";
export const validStage = (n: number) => Number.isInteger(n) && n >= 0 && n <= LAST_STAGE;
/** A stage from a query string; a missing or empty value is invalid, not stage 0. */
export const stageParam = (raw: string | null | undefined) => (raw ? Number(raw) : NaN);

const demoQuery = (speciesId: string, stage: number) => `species=${encodeURIComponent(speciesId)}&stage=${stage}`;

export function cardPath(t: ShareTarget): string {
  return t.kind === "egg" ? `/api/card/${encodeURIComponent(t.eggId)}` : `/api/card/demo?${demoQuery(t.speciesId, t.stage)}`;
}

export function sharePagePath(t: ShareTarget): string {
  return t.kind === "egg" ? `/share/${encodeURIComponent(t.eggId)}` : `/share/demo?${demoQuery(t.speciesId, t.stage)}`;
}

/** The prefilled post: what hatched, the handle and the ticker. No price, gains or links other than the card page. */
export function shareText(speciesId: string, demo: boolean): string {
  const s = SPECIES_BY_ID[speciesId];
  const what = s ? `${/^[AEIOU]/.test(RARITIES[s.rarity].label) ? "an" : "a"} ${RARITIES[s.rarity].label} ${s.name}` : "a Solanite";
  return demo ? `I hatched ${what} in the ${X_HANDLE} demo.` : `I hatched ${what} in ${X_HANDLE} by holding ${gameConfig.token.symbol}.`;
}

export function xIntentUrl(text: string, url: string): string {
  return `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}
