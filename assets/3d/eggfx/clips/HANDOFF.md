# Egg hatch clips: handoff to SOL · Workstream Manager

Owner-approved 22 Oct: put these on the website (demo hatch + real hatch reveal).

## Files
- Web versions to ship (this branch): `assets/3d/eggfx/clips/web/hatch_<rarity>_<element>.mp4` and `.webm` (1080x1080, 6.25 s, 24 fps, no audio, ~0.9 MB mp4 / ~0.55 MB webm). 24 clips.
- Masters (1440x1440) stay on the owner's PC; they are not in git.
- `hatch-clips.json` (next to this file): species id -> clip name, for all 28 species (24 unique clips).

## How the clip plays
- Frames 1-100: identical for every rarity until ~frame 60, then the cracks shift to the rarity colour (secret flickers green/magenta). Shell bursts at frame 100 (4.17 s).
- Frames 100-150: element effect + shards settle; a soft glow sits where the creature appears.
- Fade the painted creature art (existing stage-1 image) in over the glow from ~4.4 s, then show name, rarity, element.

## Rules
- Choose the clip only AFTER the server returns the hatch result (rarity/species must not leak before). Never pick from client-side data for real eggs.
- Demo mode: same flow, labelled "Demo · simulated".
- Preload the clip after first paint; show its first frame as the poster; `muted playsinline autoplay` on tap; prefer webm with mp4 fallback.
- Put files in `public/hatch/` (or the CDN base if one is configured); keep total weight in mind (24 x ~1 MB), load only the needed clip.
- Respect prefers-reduced-motion: show the final frame + creature instead of the video.
- Verify: phone (390 px) and desktop (1440 px) screenshots of the reveal, timing from tap to burst, and that reduced motion works. Don't deploy to production; PR + preview link, owner says "ship it".
