# Intro footage at genuine 1080p: quote

Status: **quote only. Nothing has been generated and no credits have been spent.** Generation waits for the owner's approval of one option below and its cost.

## Why new footage is needed

The intro on the site today is two Runway clips rendered at **1280 × 720** (`art/intro/clip-1-awakening.mp4`, 5.06 s; `clip-2-rebirth.mp4`, 10.08 s; 24 fps). The 1920 × 1080 masters in `art/intro/master-*.mp4` are those clips enlarged by `scripts/phoenix-intro.sh`, so no frame carries more than 720p detail. The phone cut is worse: it crops a 9:16 window out of the 16:9 footage, so the bird is drawn from roughly 405 source pixels across.

The only way to get real 1080p is to render new clips natively at 1080p. Upscaling the old clips adds sharpness but no painted detail, so it is not offered as "genuine 1080p".

## Proposed method

- **Image to video** with **Seedance 2** in Runway (Billy workspace, paid plan; the model is listed as available and has no deprecation notice).
- **Start frame:** the approved hand-painted phoenix still, `art/intro/phoenix-still-2752.png` (2752 × 1536, unchanged). The phone cut needs a 9:16 start frame. This is a crop of the same still, and the tallest one it allows is 864 × 1536. That is below 1080 × 1920, so the first frames on phones would be slightly soft until the motion takes over. Avoiding that would need a taller painted still, which is a separate paid image and is not included in this quote. No new image is generated.
- **Same story as today:** shot 1 is the awakening, eyes and fire igniting in darkness. Shot 2 is the rebirth, wings opening and settling. Then come the held frame and the SOLANITES wordmark, which `scripts/phoenix-intro.sh` already adds for free.
- **Canon:** no added halo, rays, particles or ground (W1 and W2). Fire that comes from the bird itself is the bird's anatomy.
- Every clip is checked at its native output size before it is used. A weak clip is reported, never silently regenerated.

## Deliverables

| Deliverable | Resolution | Aspect | Length |
|---|---|---|---|
| `phoenix-16x9.{mp4,webm}` and poster | 1920 × 1080 | 16:9 | about 16.7 s (15 s of footage, plus the hold and wordmark) |
| `phoenix-9x16.{mp4,webm}` and poster | 1080 × 1920 | 9:16 | about 16.7 s |
| Masters in `art/intro/` | 1920 × 1080 and 1080 × 1920 | | |

The existing 720p clips and masters are kept, not overwritten. The new clips get new file names.

## Credit cost

Rate: **Seedance 2 at 1080p, 40 credits per second.** Runway's public pricing gives this figure: 40 credits per second, and 160 credits for a 4-second 1080p clip. For comparison, this account was charged about 30 credits per second at 720p.

This connection cannot read the exact price before a job is submitted. Runway shows the price in its app before generation, so the owner should confirm this figure there before approving. Seedance 2.5 costs more, about 68 credits per second at 1080p, and is not proposed.

| Option | Clips | Footage | Credits |
|---|---|---|---|
| **A. Both aspects, native** (recommended for quality) | 16:9: 5 s + 10 s; 9:16: 5 s + 10 s | 30 s | **1,200** |
| B. Shorter, both aspects | 16:9: 4 s + 6 s; 9:16: 4 s + 6 s, with a longer hold | 20 s | **800** |
| C. Desktop only, native 1080p | 16:9: 5 s + 10 s; phones keep today's 720p cut | 15 s | **600** |
| D. Minimal | one 8 s 16:9 shot; phones keep today's cut | 8 s | **320** |

These figures assume the first take of each clip is accepted. Each retake costs as much again as the clip it replaces. Retakes always need a fresh approval.

**Budget check:** every option exceeds the shared 180-credit budget that was set for future paid work. Option D alone is about 1.8 times that budget. The workspace currently shows 1,895 credits (1,595 from the plan and 300 purchased), so the account could cover any option. The decision is the owner's. Nothing will be generated until the owner approves one option, its credit cost and the start frames.
