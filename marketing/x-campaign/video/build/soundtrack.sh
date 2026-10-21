#!/usr/bin/env bash
# Rebuilds soundtrack.m4a (42 s, about -19 LUFS). Everything is generated locally with ffmpeg,
# plus the Runway awakening clip's own audio under the first 3.5 s. No music, no licensed audio.
set -euo pipefail
cd "$(dirname "$0")"
T=$(mktemp -d)
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.16*sin(2*PI*55*t)*(0.65+0.35*sin(2*PI*0.2*t))+0.09*sin(2*PI*82.41*t)*(0.6+0.4*sin(2*PI*0.27*t+1))|0.16*sin(2*PI*55.4*t)*(0.65+0.35*sin(2*PI*0.22*t))+0.09*sin(2*PI*82.9*t)*(0.6+0.4*sin(2*PI*0.25*t))':s=48000:d=42" -af "afade=t=in:d=3,afade=t=out:st=39.5:d=2.5,lowpass=f=800" $T/drone.wav
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=42:c=pink:r=48000:a=0.035" -af "lowpass=f=600,highpass=f=90,afade=t=in:d=3,afade=t=out:st=39:d=3,aformat=channel_layouts=stereo" $T/air.wav
ffmpeg -v error -y -f lavfi -i "aevalsrc='(0.32*sin(2*PI*659.3*t)+0.16*sin(2*PI*1318.5*t)+0.08*sin(2*PI*1977*t))*exp(-2.6*t)|(0.32*sin(2*PI*660.1*t)+0.16*sin(2*PI*1319.6*t)+0.08*sin(2*PI*1978*t))*exp(-2.6*t)':s=48000:d=2.5" $T/bell.wav
ffmpeg -v error -y -f lavfi -i "aevalsrc='(0.28*sin(2*PI*493.9*t)+0.14*sin(2*PI*987.8*t))*exp(-2.4*t)|(0.28*sin(2*PI*494.5*t)+0.14*sin(2*PI*988.6*t))*exp(-2.4*t)':s=48000:d=2.5" $T/bell2.wav
ffmpeg -v error -y -f lavfi -i "anoisesrc=d=1.2:c=pink:r=48000:a=0.3" -af "bandpass=f=800:w=1200,afade=t=in:d=0.8:curve=exp,afade=t=out:st=0.8:d=0.4,aformat=channel_layouts=stereo" $T/whoosh.wav
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.8*sin(2*PI*(44+60*exp(-9*t))*t)*exp(-3.4*t)|0.8*sin(2*PI*(44.5+60*exp(-9*t))*t)*exp(-3.4*t)':s=48000:d=2.4" $T/hit.wav
ffmpeg -v error -y -f lavfi -i "aevalsrc='0.6*sin(2*PI*(40+40*exp(-4*t))*t)*exp(-1.1*t)+0.2*sin(2*PI*329.6*t)*exp(-1.4*t)|0.6*sin(2*PI*(40.4+40*exp(-4*t))*t)*exp(-1.1*t)+0.2*sin(2*PI*330.2*t)*exp(-1.4*t)':s=48000:d=5" $T/swell.wav
ffmpeg -v error -y -ss 1.6 -t 3.46 -i source/clip-1-awakening.mp4 -i $T/drone.wav -i $T/air.wav -i $T/bell.wav -i $T/bell2.wav -i $T/whoosh.wav -i $T/hit.wav -i $T/swell.wav -filter_complex "$(cat soundtrack-filter.txt)" -map "[out]" -c:a aac -b:a 192k -ar 48000 soundtrack.m4a
rm -rf "$T"
echo "soundtrack.m4a written"
