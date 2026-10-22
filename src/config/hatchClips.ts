/**
 * The owner's 3D hatch clips (art/3d-creatures 10cde2d, assets/3d/eggfx/clips/HANDOFF.md): 24 clips,
 * one per rarity and element, mapped to all 28 species by src/data/hatch-clips.json. Each is
 * 1080 × 1080, 6.25 s, silent; the shell bursts at 4.17 s and the creature fades in over the glow
 * from 4.4 s. The clip is looked up from the hatch result, so it is only known once the result is.
 * Files live in public/hatch/; stills/ holds the shared first frame (the poster) and each clip's last
 * frame (shown instead of the video under reduced motion). The lookup is src/lib/hatchClip.ts.
 */
export const HATCH_CLIP_BASE = "/hatch";

export interface HatchClip {
  name: string;
  webm: string;
  mp4: string;
  /** The last frame, for reduced motion. */
  end: string;
}

/** Every clip opens on the same frame, so one poster serves them all. */
export const HATCH_POSTER = `${HATCH_CLIP_BASE}/stills/poster.webp`;
export const HATCH_CLIP_BURST_MS = 4170;
export const HATCH_CLIP_CREATURE_MS = 4400;
