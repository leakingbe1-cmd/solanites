#!/usr/bin/env bash
# Build the "Hatchery is awakening" teaser: footage frames, original soundtrack, both cuts.
#   campaign/hatchery-awakening/build/build.sh
set -euo pipefail
cd "$(dirname "$0")"
OUT=../export
CACHE=../.cache
mkdir -p "$OUT" "$CACHE"
./prep.sh
node cues.mjs teaser.js > "$CACHE/teaser-cues.json"
python3 audio.py "$CACHE/teaser-cues.json" "$CACHE/teaser-raw.wav"
# loudness for social playback: -14 LUFS integrated, -1.5 dBTP
./loudnorm.sh "$CACHE/teaser-raw.wav" "$CACHE/teaser.wav"
node render.mjs teaser.js 1080x1920 "$OUT/solanites-hatchery-awakening-9x16.mp4" --audio "$CACHE/teaser.wav"
node render.mjs teaser.js 1920x1080 "$OUT/solanites-hatchery-awakening-16x9.mp4" --audio "$CACHE/teaser.wav"
node check.mjs
