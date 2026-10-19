#!/usr/bin/env bash
# Builds the website intro videos from the Runway clips.
#
#   scripts/phoenix-intro.sh art/intro/clip-1-awakening.mp4 art/intro/clip-2-rebirth.mp4
#
# Fades up from black, cuts the clips together under one set of 2.39:1 cinema bars (the
# awakening clip has bars baked into its first seconds only, so every frame gets the same
# bars), holds the settled phoenix, and plays the SOLANITES wordmark reveal over the
# ending (rendered in the site's fonts by scripts/intro-wordmark.mjs). Writes to public/intro/:
#   phoenix-16x9.{webm,mp4} + phoenix-16x9-poster.jpg   (1920x1080, landscape)
#   phoenix-9x16.{webm,mp4} + phoenix-9x16-poster.jpg   (1080x1920, phones)
# and full-quality masters to art/intro/master-*.mp4.
#
# Options: HOLD=seconds the final frame is held (default 1.6), REVEAL_AT=seconds before the
# end of the footage that the wordmark starts (default 2.4), KEEP_AUDIO=0 to drop the sound
# (on the site it always starts muted), PORTRAIT_ZOOM=how much larger than "fit" the phone cut
# shows the footage (default 1.3; wings run off the sides), LETTERBOX=0, WEB_CRF=, WEBM_CRF=.
# Needs ffmpeg and Playwright (for the wordmark).
set -euo pipefail
[ "$#" -ge 1 ] || { echo "usage: $0 clip.mp4 [clip.mp4 ...]" >&2; exit 1; }

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ART="$ROOT/art/intro"
OUT="$ROOT/public/intro"
HOLD="${HOLD:-1.6}"
REVEAL_AT="${REVEAL_AT:-2.4}"
ZOOM="${PORTRAIT_ZOOM:-1.3}"
FPS=24                      # Runway renders at 24 fps; keep it to avoid judder
BG=0x05040a                 # the site's intro background, also used for the bars
mkdir -p "$OUT"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# 1. Join the clips with uniform bars, hold the last frame, and smooth the audio at each cut.
inputs=(); vf=""; af=""; n=0; total="$HOLD"; footage=0
for c in "$@"; do
  inputs+=(-i "$c")
  bars=""; [ "${LETTERBOX:-1}" = "1" ] && bars=",crop=iw:iw/2.39,pad=iw:iw*9/16:(ow-iw)/2:(oh-ih)/2:color=$BG"
  vf+="[$n:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080${bars},fps=$FPS,setsar=1[v$n];"
  d="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$c")"
  total="$(awk -v t="$total" -v d="$d" 'BEGIN{print t+d}')"; footage="$(awk -v t="$footage" -v d="$d" 'BEGIN{print t+d}')"
  if [ -n "$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$c")" ]; then
    af+="[$n:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:$d,afade=t=in:d=0.05,afade=t=out:st=$(awk -v d="$d" 'BEGIN{print d-0.08}'):d=0.08[a$n];"
  else
    af+="aevalsrc=0:c=stereo:s=48000:d=$d[a$n];"
  fi
  n=$((n + 1))
done
vcat=""; acat=""; for ((j = 0; j < n; j++)); do vcat+="[v$j]"; acat+="[a$j]"; done
ffmpeg -y -loglevel error "${inputs[@]}" -filter_complex \
  "${vf}${af}${vcat}concat=n=$n:v=1:a=0,tpad=stop_mode=clone:stop_duration=$HOLD,fade=t=in:d=0.8[v];${acat}concat=n=$n:v=0:a=1,apad=whole_dur=$total,afade=t=in:d=0.3,afade=t=out:st=$(awk -v t="$total" 'BEGIN{print t-1.5}'):d=1.5[a]" \
  -map "[v]" -map "[a]" -t "$total" -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k "$work/joined.mp4"
start="$(awk -v f="$footage" -v r="$REVEAL_AT" 'BEGIN{s=f-r; if(s<0)s=0; print s}')"

# 2. The wordmark reveal, as transparent frames for both cuts.
node "$ROOT/scripts/intro-wordmark.mjs" "$work/wm" "$FPS" >/dev/null

# 3. Per cut: frame the footage, play the reveal from $start and hold its last frame, then encode for the web.
build() { # name width height background-filter
  local name="$1" w="$2" h="$3" frame="$4"
  ffmpeg -y -loglevel error -i "$work/joined.mp4" -framerate "$FPS" -i "$work/wm/$name/%03d.png" -filter_complex \
    "[0:v]${frame}[bg];[1:v]format=rgba,setpts=PTS-STARTPTS+${start}/TB[wm];[bg][wm]overlay=0:0:eof_action=repeat,format=yuv420p[v]" \
    -map "[v]" -map 0:a -c:a copy -t "$total" -c:v libx264 -crf 12 -preset slow -r "$FPS" -movflags +faststart "$ART/master-$name.mp4"
  local a_mp4=(-an) a_webm=(-an)
  [ "${KEEP_AUDIO:-1}" = "1" ] && a_mp4=(-c:a aac -b:a 96k) && a_webm=(-c:a libopus -b:a 96k)
  # Web files at the footage's own 720p (the masters keep 1080p for the wordmark): quick to start.
  local web=(-vf "scale=$((w * 2 / 3 / 2 * 2)):-2:flags=lanczos")
  ffmpeg -y -loglevel error -i "$ART/master-$name.mp4" "${web[@]}" -c:v libx264 -crf "${WEB_CRF:-26}" -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart "${a_mp4[@]}" "$OUT/phoenix-$name.mp4"
  # WebM (VP9): smaller; offered first, with the MP4 as the fallback (Safari and older browsers).
  ffmpeg -y -loglevel error -i "$ART/master-$name.mp4" "${web[@]}" -c:v libvpx-vp9 -crf "${WEBM_CRF:-35}" -b:v 0 -row-mt 1 -deadline good -cpu-used 2 -pix_fmt yuv420p "${a_webm[@]}" "$OUT/phoenix-$name.webm"
  # Poster: the final frame with the wordmark (shown while the video loads).
  ffmpeg -y -loglevel error -sseof -0.3 -i "$ART/master-$name.mp4" "${web[@]}" -frames:v 1 -q:v 3 "$OUT/phoenix-$name-poster.jpg"
  echo "  $name: $(du -h "$OUT/phoenix-$name.webm" | cut -f1) webm, $(du -h "$OUT/phoenix-$name.mp4" | cut -f1) mp4, $(du -h "$ART/master-$name.mp4" | cut -f1) master"
}
echo "Building intro (${total}s, wordmark from ${start}s):"
build 16x9 1920 1080 "scale=1920:1080"
# Phones: the wide shot a little larger than fit, nudged above centre so the wordmark sits beneath it.
pw="$(awk -v z="$ZOOM" 'BEGIN{printf "%d", 1080*z/2*2}')"
build 9x16 1080 1920 "scale=${pw}:-2,crop=min(iw\,1080):ih,pad=1080:1920:(ow-iw)/2:(oh-ih)/2-110:color=$BG"
echo "Done. Preview with ?intro=video; PHOENIX_INTRO.enabled in src/config/intro.ts makes it the default."
