import type { RarityId } from "@/config/gameConfig";

/**
 * Hatch clips for the homepage live demo, one per rarity (the owner's 3D hatch renders,
 * about 0.5 MB each). A null entry plays the built-in CSS hatch instead, so the demo works before
 * the clips are in public/. When they land, copy them to public/hatch/ and fill in the paths, e.g.
 * common: "/hatch/hatch_common.mp4". The clip is chosen after the result is rolled, so the hatch
 * itself is what reveals the rarity.
 */
export const HATCH_CLIPS: Record<RarityId, string | null> = {
  common: null,
  rare: null,
  epic: null,
  legendary: null,
  mythic: null,
  secret: null,
};

/** Shown while a clip loads (and as its first frame); null uses the egg art. */
export const HATCH_POSTER: string | null = null;
