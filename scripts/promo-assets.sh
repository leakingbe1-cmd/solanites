#!/usr/bin/env bash
# Builds the Solanites promo creatives from the Runway phoenix clips and still.
#
#   scripts/promo-assets.sh art/intro/clip-1-awakening.mp4 art/intro/clip-2-rebirth.mp4 art/intro/phoenix-still.png
#
# Writes to art/promo/:
#   solanites-x-16x9.mp4      1920x1080  X advert / announcements
#   solanites-x-9x16.mp4      1080x1920  vertical (X, Stories, Reels)
#   solanites-x-1x1.mp4       1080x1080  square feed creative
#   solanites-poster-4x5.jpg  2160x2700  static poster (also fine for X images)
# Text layers come from art/promo/overlays/ (render them with: node scripts/promo-overlays.mjs).
#
# Sequence: fade up from black, the clips cut together under one set of 2.39:1 cinema bars
# (the awakening clip has bars only for its first seconds), four feature captions, then the
# end card (SOLANITES, tagline, call to action, site address) over the settled phoenix.
# Caption times are tuned for the 5 s + 10 s clips; adjust CAPTIONS if the footage changes.
#
# Options: HOLD=seconds the final frame is held (default 2.6), LETTERBOX=0 to drop the bars,
# MUTE=1 to drop audio. Needs ffmpeg.
set -euo pipefail
"$(dirname "$0")/check-prelaunch-urls.sh"
[ "$#" -ge 2 ] || { echo "usage: $0 clip.mp4 [clip.mp4 ...] still.png" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OV="$ROOT/art/promo/overlays"
OUT="$ROOT/art/promo"
HOLD="${HOLD:-2.6}"
FPS=24                       # Runway renders at 24 fps; keep it to avoid judder
CAPTIONS=("0.8 3.4" "5.4 7.6" "7.9 10.1" "10.4 12.9")   # start end (seconds) for caption-1..4
END_AT="${END_AT:-13.6}"     # end card fade-in start
still="${!#}"
clips=("${@:1:$#-1}")
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
mkdir -p "$OUT"

# 1. Join the clips at 1920x1080 with uniform cinema bars, hold the final frame, smooth the audio at each cut.
inputs=(); vf=""; af=""; n=0; total="$HOLD"
for c in "${clips[@]}"; do
  inputs+=(-i "$c")
  bars=""; [ "${LETTERBOX:-1}" = "1" ] && bars=",crop=iw:iw/2.39,pad=iw:iw*9/16:(ow-iw)/2:(oh-ih)/2:black"
  vf+="[$n:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080${bars},fps=$FPS,setsar=1[v$n];"
  d="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$c")"; total="$(awk -v t="$total" -v d="$d" 'BEGIN{print t+d}')"
  if [ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$c")" ]; then
    af+="[$n:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:$d,afade=t=in:d=0.05,afade=t=out:st=$(awk -v d="$d" 'BEGIN{print d-0.08}'):d=0.08[a$n];"
  else
    af+="aevalsrc=0:c=stereo:s=48000:d=$d[a$n];"
  fi
  n=$((n + 1))
done
vcat=""; acat=""; for ((j = 0; j < n; j++)); do vcat+="[v$j]"; acat+="[a$j]"; done
ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "${vf}${af}${vcat}concat=n=$n:v=1:a=0,tpad=stop_mode=clone:stop_duration=$HOLD[v];${acat}concat=n=$n:v=0:a=1,apad=whole_dur=$total[a]" \
  -map "[v]" -map "[a]" -t "$total" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k "$work/joined.mp4"
dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$work/joined.mp4")"
audio=(-map 0:a -af "afade=t=in:d=0.3,afade=t=out:st=$(awk -v d="$dur" 'BEGIN{print d-2}'):d=2" -c:a aac -b:a 192k); [ "${MUTE:-0}" = "1" ] && audio=(-an)

# 2. One video per format: the wide shot fitted onto the footage's near-black, captions and end card faded in and out.
video() { # name width height
  local name="$1" w="$2" h="$3" ins=() fc k=1 prev="bg"
  fc="[0:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=0x05040a,fade=t=in:d=0.8[bg];"
  layer() { # png fade-in-start [fade-out-start]
    ins+=(-loop 1 -framerate "$FPS" -t "$dur" -i "$1")
    fc+="[$k:v]format=rgba,fade=t=in:st=$2:d=${4:-0.5}:alpha=1${3:+,fade=t=out:st=$3:d=0.5:alpha=1}[l$k];[$prev][l$k]overlay=0:0[o$k];"
    prev="o$k"; k=$((k + 1))
  }
  [ -f "$OV/brand-$name.png" ] && layer "$OV/brand-$name.png" 0.4 "$END_AT" 0.8
  local i=1
  for t in "${CAPTIONS[@]}"; do set -- $t; layer "$OV/caption-$i-$name.png" "$1" "$2"; i=$((i + 1)); done
  layer "$OV/endcard-$name.png" "$END_AT" "" 1.0
  ffmpeg -y -loglevel error -i "$work/joined.mp4" "${ins[@]}" -filter_complex "${fc}[$prev]format=yuv420p[v]" \
    -map "[v]" "${audio[@]}" -t "$dur" -c:v libx264 -crf 17 -preset slow -profile:v high -r "$FPS" -movflags +faststart "$OUT/solanites-x-$name.mp4"
  echo "  solanites-x-$name.mp4  $(du -h "$OUT/solanites-x-$name.mp4" | cut -f1)"
}
echo "Building promo videos (${dur}s, end card from ${END_AT}s):"
video 16x9 1920 1080
video 9x16 1080 1920
video 1x1 1080 1080

# 3. Poster: the phoenix still fitted across the width, faded into black top and bottom, with the type on top.
ffmpeg -y -loglevel error -i "$still" -i "$OV/poster-4x5.png" -filter_complex \
  "color=c=0x05040a:s=2160x2700[bg];[0:v]scale=2160:-2,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,min(Y,H-Y)/(H*0.18))'[art];[bg][art]overlay=0:(H-h)/2+40[b2];[b2][1:v]overlay=0:0" \
  -frames:v 1 -q:v 2 "$OUT/solanites-poster-4x5.jpg"
echo "  solanites-poster-4x5.jpg  $(du -h "$OUT/solanites-poster-4x5.jpg" | cut -f1)"
