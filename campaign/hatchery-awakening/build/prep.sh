#!/usr/bin/env bash
# Extract the existing Runway footage to 30 fps JPEG sequences, upscaled 2x (git-ignored .cache/).
set -euo pipefail
cd "$(dirname "$0")/.."
for clip in clip-1-awakening clip-2-rebirth; do
  out=".cache/$clip"
  [ -f "$out/0000.jpg" ] && continue
  mkdir -p "$out"
  ffmpeg -v error -i "source/$clip.mp4" \
    -vf "framerate=fps=30,scale=2560:1440:flags=lanczos,unsharp=5:5:0.6" \
    -q:v 3 -start_number 0 "$out/%04d.jpg"
  echo "prepared $out ($(ls "$out" | wc -l) frames)"
done
