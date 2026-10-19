#!/usr/bin/env bash
# Two-pass linear loudness normalisation to -14 LUFS / -1.5 dBTP (keeps the dynamics intact).
set -euo pipefail
in="$1"; out="$2"
m=$(ffmpeg -hide_banner -i "$in" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
get() { echo "$m" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$in" -af "loudnorm=I=-14:TP=-1.5:LRA=11:linear=true:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset)" -ar 48000 "$out"
