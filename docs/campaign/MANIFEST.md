# Phoenix campaign manifest (PROPOSED: awaiting owner approval)

**Phase: PRELAUNCH TEASER.** Nothing below is approved for posting until the owner signs it off. Nothing has been posted, scheduled, merged or deployed.

Two pipelines produced campaign assets on separate branches. This manifest proposes one official set and keeps everything else intact until the owner approves the selection. No asset has been deleted.

| | Proposed official | Alternative |
|---|---|---|
| Branch | `x-campaign` (from `campaign/phoenix-content-studio`) | `phoenix-intro` / `prelaunch-phoenix` (website session) |
| Pipeline | `npm run campaign:render` → `scripts/campaign/render.mjs` + `src/studio/render/draw.ts` | `scripts/promo-assets.sh` + `scripts/promo-overlays.mjs` |
| Source footage | `public/campaign/phoenix-source.mp4` (Runway, 1280×720, 10.08 s) | `art/intro/clip-2-rebirth.mp4` (byte-identical, MD5 `4bf02570…`) and `art/intro/clip-1-awakening.mp4` (5.06 s, not in the official set) |

**Why this pipeline:**
- **Per-ratio layouts:** each ratio is composed (feathered band plus copy zones) rather than letterboxed, so wings and halo are never cut.
- **Four formats:** it renders 16:9, 9:16, 1:1 and 4:5.
- **Claims and the URL rule are enforced in code:** a render-time guard plus OCR, with tests behind both.
- **One renderer:** the same code drives the Studio, so edits and re-renders stay consistent.
- **The alternative's current exports aren't eligible.** Its 16:9 video has overlapping captions around 8 s, and its videos, poster and overlay template print the website URL (OCR-confirmed from 14.0 s in the 16:9 video, and on the poster).

**Worth carrying over from the alternative after review:** `clip-1-awakening.mp4`, a 5 s Phoenix awakening shot that could open a longer cut. It's not used yet, and adding it would mean re-rendering. Its 4:5 poster artwork is also clean apart from the URL; the owner may prefer its composition to `poster-4x5.jpg` once the URL is replaced by a teaser CTA.

## Preferred assets

| Use | File | Status |
|---|---|---|
| X video, 16:9 | `public/campaign/ads/solanites-phoenix-16x9.mp4` | proposed |
| Vertical video, 9:16 | `public/campaign/ads/solanites-phoenix-9x16.mp4` | proposed |
| Square video, 1:1 | `public/campaign/ads/solanites-phoenix-1x1.mp4` | proposed |
| Portrait video, 4:5 | `public/campaign/ads/solanites-phoenix-4x5.mp4` | proposed |
| Poster, 4:5 | `public/campaign/stills/poster-4x5.jpg` | proposed |
| Poster, 2:3 (print/alt) | `public/campaign/stills/poster.jpg` | proposed |
| First X post, 4:5 + 1:1 | `public/campaign/stills/x-00-which-creature-4x5.jpg`, `…-1x1.jpg` | proposed |
| Phoenix reveal post | `public/campaign/stills/x-01-phoenix-reveal.jpg` | proposed |
| Collection post | `public/campaign/stills/x-03-collection.jpg` | proposed |
| Community post | `public/campaign/stills/x-07-community.jpg` | proposed |
| End cards | `public/campaign/stills/endcard-{16x9,9x16,1x1,4x5}.jpg` | proposed |
| Static variants | `public/campaign/stills/square-1x1.jpg`, `vertical-9x16.jpg` | proposed |
| Held stills | `x-02-hatchery.jpg`, `x-04-rarity.jpg`, `x-08-explore.jpg`, `portrait-4x5.jpg` (rarity odds) | HOLD until the reveal |

## Posts (`docs/campaign/x-content-pack.md`)

- **Approved in principle (teaser-safe):** 1 First post (which creature would you hatch?), 2 Phoenix reveal, 3 Collection, 4 Phoenix film, 5 Community: name it.
- **Hold:**
  - 6 Hatchery: earning eggs by holding needs live tracking, and the post names the token.
  - 7 Rarity: odds and sealing describe live hatching.
  - 8 Brand intro: "Hold $SLNT, earn eggs".
  - 9 Website traffic: reveals the site.
- **The alternative's ten posts (`docs/marketing/x-posts.md`)** are not part of the official set. Post 1 includes the URL; posts 2, 3 and 10 are self-marked as waiting; post 10 (holder rewards) describes a planned feature.

## Verification (this render)

- **Exports:** 4 videos and 19 stills rendered. Each was checked with ffprobe for size and duration: videos are 11.58 s, H.264 + AAC, with 0 decode errors over a full decode and audio at mean −17.7 dB, peak −2.0 dB.
- **OCR leak scan** (`scripts/campaign/scan-urls.mjs`, tesseract 5.3.4): 0 detections. It covers every still and a frame every 0.25 s of every video, 46 frames per video. The scan caught the website session's URL on its poster and from 14.0 s in its 16:9 video, which proves it can detect one.
- **QR/barcode scan** (zbarimg): 0 detections across 201 images (every video at 4 fps and every still).
- **Metadata:** the only URL-like strings in the files are the x264 encoder's own tag in the MP4s, plus the Runway source clip's signed C2PA provenance metadata. Neither is the website.
- **Visual review:** hook, all three callouts and the end screen were checked in every video format, plus the poster, the first-post images and the X stills.

## Known defects and limits

- **The awakening clip and the egg-hatching sequence aren't in the adverts.** The hatching sequence was never generated, and generating it needs explicit approval.
- **The OCR scan is a backstop, not proof.** It reads frames every 0.25 s; the render-time guard is what actually stops a URL. A human visual review is still required.
- **In-browser recordings from the Studio are WebM** unless the browser records H.264. The committed MP4s are the masters.

## Approvals needed

1. Accept this selection (then the alternative's exports can be retired, not before).
2. Sign off each approved post before posting.
3. Approve pushing `x-campaign`: every push to this repository automatically creates a preview deployment of the website.
4. Lift the prelaunch phase (`PHASE = "launch"`) only at the official reveal.
