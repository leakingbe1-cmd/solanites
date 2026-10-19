#!/usr/bin/env bash
# Builds the website intro videos from Runway clips.
#
#   scripts/phoenix-intro.sh art/intro/clip-1.mp4 [art/intro/clip-2.mp4 ...]
#
# Joins the clips, fades the SOLANITES wordmark (art/intro/wordmark-*.png, the
# site's own Unbounded font) in over the final seconds and holds it, then writes
# web-optimised files to public/intro/:
#   phoenix-16x9.{webm,mp4} + phoenix-16x9-poster.jpg   (1920x1080, landscape)
#   phoenix-9x16.{webm,mp4} + phoenix-9x16-poster.jpg   (1080x1920 for phones and X; PORTRAIT=fit|crop)
# and full-quality masters to art/intro/master-*.mp4 for X and announcements.
#
# Needs ffmpeg. Set KEEP_AUDIO=1 to keep the clips' audio track (muted on the site until the visitor turns it on).
set -euo pipefail
[ "$#" -ge 1 ] || { echo "usage: $0 clip.mp4 [clip.mp4 ...]" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ART="$ROOT/art/intro"
OUT="$ROOT/public/intro"
HOLD="${HOLD:-1.8}"        # seconds to hold the final frame with the wordmark
FADE_IN="${FADE_IN:-1.2}"  # wordmark fade-in length
mkdir -p "$OUT"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# 1. Join clips (re-encode so mixed sources concatenate cleanly), then hold the last frame.
inputs=(); filters=""; i=0
for c in "$@"; do inputs+=(-i "$c"); filters+="[$i:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,setsar=1[v$i];"; i=$((i + 1)); done
concat=""; for ((j = 0; j < i; j++)); do concat+="[v$j]"; done
ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "${filters}${concat}concat=n=$i:v=1:a=0,tpad=stop_mode=clone:stop_duration=$HOLD[v]" -map "[v]" -c:v libx264 -crf 14 -preset slow -pix_fmt yuv420p "$work/joined.mp4"
dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$work/joined.mp4")"
start="$(awk -v d="$dur" -v h="$HOLD" -v f="$FADE_IN" 'BEGIN { s = d - h - f; if (s < 0) s = 0; print s }')"

audio=(-an)
if [ "${KEEP_AUDIO:-0}" = "1" ]; then
  # Clips without an audio track get silence of the same length, so the sound stays in sync.
  af=""; ins=""; j=0
  for c in "$@"; do
    if [ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$c")" ]; then
      af+="[$j:a]aresample=48000,aformat=channel_layouts=stereo[a$j];"
    else
      d="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$c")"
      af+="aevalsrc=0:c=stereo:s=48000:d=$d[a$j];"
    fi
    ins+="[a$j]"; j=$((j + 1))
  done
  ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex "${af}${ins}concat=n=$i:v=0:a=1,apad[a]" -map "[a]" -t "$dur" -c:a aac -b:a 128k "$work/audio.m4a"
  audio=(-i "$work/audio.m4a" -map 2:a -c:a aac -b:a 128k)
fi

# 2. Wordmark: fade in over the final seconds; overlay on the landscape and portrait cuts.
# Portrait framing: "fit" (default) keeps the whole wide shot, so spread wings are never cut,
# centred on the same near-black as the footage; "crop" fills the screen and cuts the sides.
frame() { # width height -> filter for the background video
  if [ "$1" -lt "$2" ] && [ "${PORTRAIT:-fit}" = "fit" ]; then
    echo "scale=$1:-2,pad=$1:$2:(ow-iw)/2:(oh-ih)/2:color=0x05040a"
  else
    echo "scale=$1:$2:force_original_aspect_ratio=increase,crop=$1:$2"
  fi
}
build() { # name width height wordmark
  local name="$1" w="$2" h="$3" mark="$4"
  ffmpeg -y -loglevel error -i "$work/joined.mp4" -loop 1 -i "$mark" "${audio[@]}" \
    -filter_complex "[0:v]$(frame "$w" "$h")[bg];[1:v]format=rgba,fade=t=in:st=${start}:d=${FADE_IN}:alpha=1[wm];[bg][wm]overlay=0:0:shortest=1,format=yuv420p[v]" \
    -map "[v]" -c:v libx264 -crf 12 -preset slow -movflags +faststart "$ART/master-$name.mp4"
  # Web file: small enough to start quickly, still clean on large screens.
  ffmpeg -y -loglevel error -i "$ART/master-$name.mp4" -c:v libx264 -crf "${WEB_CRF:-26}" -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart \
    $( [ "${KEEP_AUDIO:-0}" = "1" ] && echo "-c:a aac -b:a 96k" || echo "-an" ) "$OUT/phoenix-$name.mp4"
  # WebM (VP9): smaller; offered first, with the MP4 as the fallback (Safari and older browsers).
  ffmpeg -y -loglevel error -i "$ART/master-$name.mp4" -c:v libvpx-vp9 -crf "${WEBM_CRF:-36}" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p \
    $( [ "${KEEP_AUDIO:-0}" = "1" ] && echo "-c:a libopus -b:a 96k" || echo "-an" ) "$OUT/phoenix-$name.webm"
  # Poster: the final frame with the wordmark (also the reduced-motion / loading image).
  ffmpeg -y -loglevel error -sseof -0.2 -i "$ART/master-$name.mp4" -frames:v 1 -q:v 3 "$OUT/phoenix-$name-poster.jpg"
  echo "  $name: $(du -h "$OUT/phoenix-$name.webm" | cut -f1) webm, $(du -h "$OUT/phoenix-$name.mp4" | cut -f1) mp4, $(du -h "$ART/master-$name.mp4" | cut -f1) master"
}
echo "Building intro (${dur}s, wordmark from ${start}s):"
build 16x9 1920 1080 "$ART/wordmark-16x9.png"
build 9x16 1080 1920 "$ART/wordmark-9x16.png"
echo "Done. Preview with ?intro=video, then set PHOENIX_INTRO.enabled in src/config/intro.ts."
