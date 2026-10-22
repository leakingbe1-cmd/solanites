import { HATCH_CLIP_BASE as BASE, type HatchClip } from "@/config/hatchClips";
import clipNames from "@/data/hatch-clips.json";

const NAMES = clipNames as Record<string, string>;

/** The clip for a hatched species, or null (the built-in hatch plays). Kept out of the homepage's first load. */
export function hatchClipFor(speciesId: string): HatchClip | null {
  const name = NAMES[speciesId];
  if (!name) return null;
  return { name, webm: `${BASE}/${name}.webm`, mp4: `${BASE}/${name}.mp4`, end: `${BASE}/stills/${name}-end.webp` };
}
