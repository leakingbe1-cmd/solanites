#!/usr/bin/env bash
# Build the Solanites product-reveal campaign from the website recordings and the Phoenix footage.
#   campaign/product-reveal/build/build.sh            # renders (recordings must exist)
#   CAPTURE=1 campaign/product-reveal/build/build.sh  # re-record the site first (needs it on :3100)
set -euo pipefail
cd "$(dirname "$0")"
OUT=../export
CACHE=../.cache
mkdir -p "$OUT/clips" "$CACHE"
./prep.sh
[ "${CAPTURE:-0}" = 1 ] && node capture.mjs
# recordings are committed as MP4; rebuild the frame folders from them if missing
for mp4 in ../captures/*.mp4; do
  name=$(basename "$mp4" .mp4); dir="../captures/.frames/$name"
  [ -f "$dir/0000.jpg" ] && continue
  mkdir -p "$dir"; ffmpeg -v error -i "$mp4" -q:v 2 -start_number 0 "$dir/%04d.jpg"
done

audio() { # comp variant name
  node cues.mjs "$1" "$2" > "$CACHE/$3-cues.json"
  python3 audio.py "$CACHE/$3-cues.json" "$CACHE/$3-raw.wav"
  ./loudnorm.sh "$CACHE/$3-raw.wav" "$CACHE/$3.wav"
}

audio reveal.js main main
node render.mjs reveal.js 1920x1080 "$OUT/solanites-product-reveal-16x9.mp4" --audio "$CACHE/main.wav"
node render.mjs reveal.js 1080x1920 "$OUT/solanites-product-reveal-9x16.mp4" --audio "$CACHE/main.wav"
for v in collection hatch rarity; do
  audio reveal.js "$v" "clip-$v"
  node render.mjs "reveal.js?v=$v" 1080x1350 "$OUT/clips/solanites-clip-$v-4x5.mp4" --audio "$CACHE/clip-$v.wav"
done
node render.mjs still.js 1440x1800 "$CACHE/still.jpg" --stills 0
mv "$CACHE/still-t0.00.jpg" "$OUT/solanites-product-reveal-4x5.jpg"
mv "$CACHE/still.text.json" "$OUT/solanites-product-reveal-4x5.text.json"
node check.mjs
