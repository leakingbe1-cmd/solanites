#!/usr/bin/env bash
# Builds the Solanites promo creatives from the Runway phoenix clips and still.
#
#   scripts/promo-assets.sh art/intro/clip-1.mp4 art/intro/clip-2.mp4 art/intro/phoenix-still.png
#
# Writes to art/promo/:
#   solanites-x-16x9.mp4   1920x1080  X advert / announcements
#   solanites-x-9x16.mp4   1080x1920  vertical (X, Stories, Reels)
#   solanites-x-1x1.mp4    1080x1080  square feed creative
#   solanites-poster-4x5.jpg  2160x2700  static poster (also fine for X images)
# End cards and poster type are pre-rendered in the site's fonts (art/promo/overlays/*.png).
#
# Options: HOLD=seconds on the end card (default 2.5), LETTERBOX=1 to give the whole
# sequence the same 2.39:1 cinema bars (use if a clip has bars baked in), MUTE=1 to drop audio.
# Needs ffmpeg.
set -euo pipefail
[ "$#" -ge 2 ] || { echo "usage: $0 clip.mp4 [clip.mp4 ...] still.png" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OV="$ROOT/art/promo/overlays"
OUT="$ROOT/art/promo"
HOLD="${HOLD:-2.5}"
FADE="${FADE:-1.2}"
still="${!#}"
clips=("${@:1:$#-1}")
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# 1. Join the clips at 1920x1080/30fps (optionally with uniform cinema bars) and hold the final frame.
inputs=(); vf=""; af=""; n=0
for c in "${clips[@]}"; do
  inputs+=(-i "$c")
  bars=""; [ "${LETTERBOX:-0}" = "1" ] && bars=",crop=iw:iw/2.39,pad=iw:iw*9/16:(ow-iw)/2:(oh-ih)/2:black"
  vf+="[$n:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080${bars},fps=30,setsar=1[v$n];"
  if [ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$c")" ]; then
    af+="[$n:a]aresample=48000,aformat=channel_layouts=stereo[a$n];"
  else
    af+="aevalsrc=0:c=stereo:s=48000:d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$c")[a$n];"
  fi
  n=$((n + 1))
done
vcat=""; acat=""; for ((j = 0; j < n; j++)); do vcat+="[v$j]"; acat+="[a$j]"; done
ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "${vf}${af}${vcat}concat=n=$n:v=1:a=0,tpad=stop_mode=clone:stop_duration=$HOLD[v];${acat}concat=n=$n:v=0:a=1,apad[a]" \
  -map "[v]" -map "[a]" -shortest -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k "$work/joined.mp4"
dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$work/joined.mp4")"
start="$(awk -v d="$dur" -v h="$HOLD" -v f="$FADE" 'BEGIN { s = d - h - f + 0.4; if (s < 0) s = 0; print s }')"
audio=(-map 0:a -c:a aac -b:a 192k); [ "${MUTE:-0}" = "1" ] && audio=(-an)

# 2. One video per format: the full wide shot fitted onto matching near-black, end card faded in.
video() { # name width height
  local name="$1" w="$2" h="$3"
  local fit="scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=0x05040a"
  ffmpeg -y -loglevel error -i "$work/joined.mp4" -loop 1 -i "$OV/endcard-$name.png" \
    -filter_complex "[0:v]${fit}[bg];[1:v]format=rgba,fade=t=in:st=${start}:d=${FADE}:alpha=1[t];[bg][t]overlay=0:0:shortest=1,format=yuv420p[v]" \
    -map "[v]" "${audio[@]}" -c:v libx264 -crf 17 -preset slow -profile:v high -r 30 -movflags +faststart "$OUT/solanites-x-$name.mp4"
  echo "  solanites-x-$name.mp4  $(du -h "$OUT/solanites-x-$name.mp4" | cut -f1)"
}
echo "Building promo videos (${dur}s, end card from ${start}s):"
video 16x9 1920 1080
video 9x16 1080 1920
video 1x1 1080 1080

# 3. Poster: the phoenix still fitted across the width, faded into black top and bottom, with the type on top.
ffmpeg -y -loglevel error -i "$still" -i "$OV/poster-4x5.png" -filter_complex \
  "color=c=0x05040a:s=2160x2700[bg];[0:v]scale=2160:-2,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,min(Y,H-Y)/(H*0.18))'[art];[bg][art]overlay=0:(H-h)/2+90[b2];[b2][1:v]overlay=0:0" \
  -frames:v 1 -q:v 2 "$OUT/solanites-poster-4x5.jpg"
echo "  solanites-poster-4x5.jpg  $(du -h "$OUT/solanites-poster-4x5.jpg" | cut -f1)"
