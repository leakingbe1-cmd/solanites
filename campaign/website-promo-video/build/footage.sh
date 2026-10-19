#!/usr/bin/env bash
# Pull the two existing Runway phoenix clips from the phoenix-intro branch (no new generation)
# and extract upscaled frames plus their audio for render.mjs and audio.py.
#   bash campaign/website-promo-video/build/footage.sh
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
C="$HERE/.cache"
mkdir -p "$C/frames"
for clip in clip-1-awakening clip-2-rebirth; do
  [ -s "$C/$clip.mp4" ] || git -C "$ROOT" show "origin/phoenix-intro:art/intro/$clip.mp4" > "$C/$clip.mp4"
  rm -f "$C/frames/$clip"-*.jpg
  # 1280x720 → 1920x1080 with Lanczos and a light unsharp so the upscale stays crisp
  ffmpeg -v error -y -i "$C/$clip.mp4" -vf "scale=1920:1080:flags=lanczos,unsharp=5:5:0.6:5:5:0.0" -q:v 2 "$C/frames/$clip-%04d.jpg"
  ffmpeg -v error -y -i "$C/$clip.mp4" -vn -ac 2 -ar 48000 "$C/$clip.wav"
  echo "$clip: $(ls "$C/frames/$clip"-*.jpg | wc -l) frames"
done
