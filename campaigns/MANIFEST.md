# Campaign asset manifest

Every file in `campaigns/`, where it came from and whether it may be used. Copies are byte-identical to their sources (verified by git blob hash), so originals and quality are preserved.

**Status key:** ✅ approved = passed the prelaunch checks below; still needs your final sign-off before posting · ⚠️ needs review = do not post until the listed issue is resolved · 🎞 source = internal raw material · 📄 reference = planning document · ⛔ do not publish = not copied here (see the end of this file).

**Prelaunch checks applied to every file:** no private website URL or preview URL, no QR codes (all images and video frames scanned), no contract address, no launch date, no token amounts or holder-reward terms, rarity odds match `gameConfig` (40/30/17/8/3.5/1.5, re-checked 21 Oct; assets printing the old 60/25/10/3.8/1/0.2 odds are retired), no egg-tracking or wallet claims presented as live, no misleading CTA, and a visual check for overlaps and readability.

**Totals:** 57 asset files, 101.5 MB.

## ads/

| File | Status | Purpose | Format | Ratio | Size | Source (branch : path) | Notes / restrictions |
|---|---|---|---|---|---|---|---|
| [`ads/needs-review/phoenix-prelaunch-promo/solanites-prelaunch-promo-16x9.mp4`](ads/needs-review/phoenix-prelaunch-promo/solanites-prelaunch-promo-16x9.mp4) | ⚠️ needs review | Phoenix promo, prelaunch-safe end card (17.75 s) | MP4 H.264+AAC, 1920x1080, 17.75 s | 16:9 | 20.8 MB | `prelaunch-phoenix` : `art/promo/solanites-x-16x9.mp4` | Captions say "1 EGG PER 1,000,000 $SLNT / Earned by holding": real egg tracking is not verified live in production. End card is prelaunch-safe (no URL). |
| [`ads/needs-review/phoenix-prelaunch-promo/solanites-prelaunch-promo-1x1.mp4`](ads/needs-review/phoenix-prelaunch-promo/solanites-prelaunch-promo-1x1.mp4) | ⚠️ needs review | Phoenix promo, prelaunch-safe end card (17.75 s) | MP4 H.264+AAC, 1080x1080, 17.75 s | 1:1 | 8.2 MB | `prelaunch-phoenix` : `art/promo/solanites-x-1x1.mp4` | Captions say "1 EGG PER 1,000,000 $SLNT / Earned by holding": real egg tracking is not verified live in production. End card is prelaunch-safe (no URL). |
| [`ads/needs-review/phoenix-prelaunch-promo/solanites-prelaunch-promo-9x16.mp4`](ads/needs-review/phoenix-prelaunch-promo/solanites-prelaunch-promo-9x16.mp4) | ⚠️ needs review | Phoenix promo, prelaunch-safe end card (17.75 s) | MP4 H.264+AAC, 1080x1920, 17.75 s | 9:16 | 8.5 MB | `prelaunch-phoenix` : `art/promo/solanites-x-9x16.mp4` | Captions say "1 EGG PER 1,000,000 $SLNT / Earned by holding" (egg tracking not verified live). Visual: the 16:9 footage sits small in the middle of the frame with large empty black areas, so it reads weakly on phones. |
| [`ads/needs-review/phoenix-studio-cut/solanites-phoenix-studio-16x9.mp4`](ads/needs-review/phoenix-studio-cut/solanites-phoenix-studio-16x9.mp4) | ⚠️ needs review | Phoenix advert, Content Studio cut (11.6 s) | MP4 H.264+AAC, 1920x1080, 11.58 s | 16:9 | 12.4 MB | `campaign/phoenix-content-studio` : `public/campaign/ads/solanites-phoenix-16x9.mp4` | Ends on an "ENTER THE HATCHERY" button with no destination while the site is private. Approve the CTA, or re-render with a prelaunch ending. Claims (28 species, 6 rarity tiers, Hatch. Collect. Evolve.) verified against game config. |
| [`ads/needs-review/phoenix-studio-cut/solanites-phoenix-studio-1x1.mp4`](ads/needs-review/phoenix-studio-cut/solanites-phoenix-studio-1x1.mp4) | ⚠️ needs review | Phoenix advert, Content Studio cut (11.6 s) | MP4 H.264+AAC, 1080x1080, 11.58 s | 1:1 | 7.0 MB | `campaign/phoenix-content-studio` : `public/campaign/ads/solanites-phoenix-1x1.mp4` | Ends on an "ENTER THE HATCHERY" button with no destination while the site is private. Approve the CTA, or re-render with a prelaunch ending. Claims (28 species, 6 rarity tiers, Hatch. Collect. Evolve.) verified against game config. |
| [`ads/needs-review/phoenix-studio-cut/solanites-phoenix-studio-4x5.mp4`](ads/needs-review/phoenix-studio-cut/solanites-phoenix-studio-4x5.mp4) | ⚠️ needs review | Phoenix advert, Content Studio cut (11.6 s) | MP4 H.264+AAC, 1080x1350, 11.58 s | 4:5 | 7.5 MB | `campaign/phoenix-content-studio` : `public/campaign/ads/solanites-phoenix-4x5.mp4` | Ends on an "ENTER THE HATCHERY" button with no destination while the site is private. Approve the CTA, or re-render with a prelaunch ending. Claims (28 species, 6 rarity tiers, Hatch. Collect. Evolve.) verified against game config. |
| [`ads/needs-review/phoenix-studio-cut/solanites-phoenix-studio-9x16.mp4`](ads/needs-review/phoenix-studio-cut/solanites-phoenix-studio-9x16.mp4) | ⚠️ needs review | Phoenix advert, Content Studio cut (11.6 s) | MP4 H.264+AAC, 1080x1920, 11.58 s | 9:16 | 8.2 MB | `campaign/phoenix-content-studio` : `public/campaign/ads/solanites-phoenix-9x16.mp4` | Ends on an "ENTER THE HATCHERY" button with no destination while the site is private. Approve the CTA, or re-render with a prelaunch ending. Claims (28 species, 6 rarity tiers, Hatch. Collect. Evolve.) verified against game config. |

## posters/

| File | Status | Purpose | Format | Ratio | Size | Source (branch : path) | Notes / restrictions |
|---|---|---|---|---|---|---|---|
| [`posters/needs-review/solanites-poster-new-world-4x5.jpg`](posters/needs-review/solanites-poster-new-world-4x5.jpg) | ⚠️ needs review | Poster: A new world is waiting to hatch | JPEG 2160x2700 | 4:5 | 569 KB | `prelaunch-phoenix` : `art/promo/solanites-poster-4x5.jpg` | "Hold $SLNT" implies live holder egg tracking; "Genesis Hatchery · Season 0" implies a launch event. No URL (the earlier version with the URL is excluded). |
| [`posters/needs-review/solanites-poster-not-just-another-egg-2x3.jpg`](posters/needs-review/solanites-poster-not-just-another-egg-2x3.jpg) | ⚠️ needs review | Poster: Not just another egg | JPEG 1200x1800 | 2:3 | 275 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/poster.jpg` | "Hold $SLNT. Earn eggs.": egg tracking not verified live in production. |
| [`posters/needs-review/solanites-still-your-solanite-is-waiting-1x1.jpg`](posters/needs-review/solanites-still-your-solanite-is-waiting-1x1.jpg) | ⚠️ needs review | Static: Your Solanite is waiting | JPEG 1080x1080 | 1:1 | 218 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/square-1x1.jpg` | "Hold $SLNT and eggs arrive on their own": egg tracking not verified live in production. |
| [`posters/solanites-still-incubation-9x16.jpg`](posters/solanites-still-incubation-9x16.jpg) | ✅ approved | Static: incubation stages (story format) | JPEG 1080x1920 | 9:16 | 281 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/vertical-9x16.jpg` |  |
| [`posters/solanites-still-six-bloodlines-4x5.jpg`](posters/solanites-still-six-bloodlines-4x5.jpg) | ⛔ retired (old odds) | Static: 6 bloodlines with published odds | JPEG 1080x1350 | 4:5 | 246 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/portrait-4x5.jpg` |  RETIRED 21 Oct: prints the old odds (60/25/10/3.8/1/0.2). Live odds are 40/30/17/8/3.5/1.5 (`gameConfig.rarityWeights`). Do not post; use the art-free odds card from `marketing/x-campaign/posts/04-odds-card-*.jpg` on `marketing/plan`. |

## social/

| File | Status | Purpose | Format | Ratio | Size | Source (branch : path) | Notes / restrictions |
|---|---|---|---|---|---|---|---|
| [`social/x/copy/needs-review/phoenix-studio-content-pack.md`](social/x/copy/needs-review/phoenix-studio-content-pack.md) | ⚠️ needs review | Eight-post pack for the Content Studio creatives | Markdown/text | n/a | 5 KB | `campaign/phoenix-content-studio` : `docs/campaign/x-content-pack.md` | Posts 1, 3, 4, 7 check out. Posts 2, 5, 8 claim live egg tracking / wallet lookup; post 6 and the CTAs say "Enter the Hatchery"; post 5 wrongly says its end card shows the website (it does not). Paths inside refer to the source branch. |
| [`social/x/copy/needs-review/x-starter-pack.md`](social/x/copy/needs-review/x-starter-pack.md) | ⚠️ needs review | Ten-post starter pack (several posts conditional) | Markdown/text | n/a | 3 KB | `prelaunch-phoenix` : `docs/marketing/x-posts.md` | Posts 2, 3 and 10 are marked by their author as "only once tracking is live" / "only after terms are published": do not publish those yet. Post 1 says eggs are "earned by holding $SLNT". Prelaunch-safe version (the earlier version with the private URL is excluded). |
| [`social/x/copy/x-post-01.md`](social/x/copy/x-post-01.md) | ✅ approved | Caption, alt text and reply for X post 01 | Markdown/text | n/a | 2 KB | `prelaunch-phoenix` : `docs/marketing/x-post-01.md` | Paths inside refer to art/campaign/x-post-01/ on the source branch; see README for the new paths. |
| [`social/x/copy/x-teasers-content-pack.md`](social/x/copy/x-teasers-content-pack.md) | ✅ approved | Captions, replies and posting order for the six teasers | Markdown/text | n/a | 5 KB | `campaign/x-teasers` : `campaign/x-teasers/CONTENT-PACK.md` | Paths inside are relative to campaign/x-teasers/ on the source branch; see README for the new paths. |
| [`social/x/graphics/infographics/x-01-phoenix-reveal-16x9.jpg`](social/x/graphics/infographics/x-01-phoenix-reveal-16x9.jpg) | ✅ approved | Infographic: The Phoenix rises (Legendary species) | JPEG 1600x900 | 16:9 | 209 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/x-01-phoenix-reveal.jpg` |  |
| [`social/x/graphics/infographics/x-02-hatchery-16x9.jpg`](social/x/graphics/infographics/x-02-hatchery-16x9.jpg) | ✅ approved | Infographic: four egg stages and four forms | JPEG 1600x900 | 16:9 | 225 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/x-02-hatchery.jpg` | Image approved; its original caption (studio pack post 2) needs review. |
| [`social/x/graphics/infographics/x-03-collection-16x9.jpg`](social/x/graphics/infographics/x-03-collection-16x9.jpg) | ✅ approved | Infographic: 28 species, 13 elements | JPEG 1600x900 | 16:9 | 228 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/x-03-collection.jpg` |  |
| [`social/x/graphics/infographics/x-04-rarity-16x9.jpg`](social/x/graphics/infographics/x-04-rarity-16x9.jpg) | ⛔ retired (old odds) | Infographic: six rarity tiers and published odds | JPEG 1600x900 | 16:9 | 226 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/x-04-rarity.jpg` |  RETIRED 21 Oct: prints the old odds (60/25/10/3.8/1/0.2). Live odds are 40/30/17/8/3.5/1.5 (`gameConfig.rarityWeights`). Do not post; use the art-free odds card from `marketing/x-campaign/posts/04-odds-card-*.jpg` on `marketing/plan`. |
| [`social/x/graphics/infographics/x-07-community-16x9.jpg`](social/x/graphics/infographics/x-07-community-16x9.jpg) | ✅ approved | Infographic: What will you name it? | JPEG 1600x900 | 16:9 | 247 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/x-07-community.jpg` |  |
| [`social/x/graphics/needs-review/infographics/x-08-explore-16x9.jpg`](social/x/graphics/needs-review/infographics/x-08-explore-16x9.jpg) | ⚠️ needs review | Infographic: No wallet needed / Enter the Hatchery | JPEG 1600x900 | 16:9 | 215 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/x-08-explore.jpg` | "No wallet needed / Look up any wallet's eggs / ENTER THE HATCHERY": wallet lookup depends on production tracking; CTA has no destination prelaunch. |
| [`social/x/graphics/teasers/1x1/01-awakening.jpg`](social/x/graphics/teasers/1x1/01-awakening.jpg) | ✅ approved | X teaser 1: The Awakening | JPEG 1440x1440 | 1:1 | 661 KB | `campaign/x-teasers` : `campaign/x-teasers/export/1x1/01-awakening.jpg` |  |
| [`social/x/graphics/teasers/1x1/02-which-creature.jpg`](social/x/graphics/teasers/1x1/02-which-creature.jpg) | ✅ approved | X teaser 2: Which creature would you hatch? | JPEG 1440x1440 | 1:1 | 486 KB | `campaign/x-teasers` : `campaign/x-teasers/export/1x1/02-which-creature.jpg` |  |
| [`social/x/graphics/teasers/1x1/03-stirring.jpg`](social/x/graphics/teasers/1x1/03-stirring.jpg) | ✅ approved | X teaser 3: Something is stirring | JPEG 1440x1440 | 1:1 | 240 KB | `campaign/x-teasers` : `campaign/x-teasers/export/1x1/03-stirring.jpg` |  |
| [`social/x/graphics/teasers/1x1/04-fire-beginning.jpg`](social/x/graphics/teasers/1x1/04-fire-beginning.jpg) | ✅ approved | X teaser 4: Fire is only the beginning | JPEG 1440x1440 | 1:1 | 543 KB | `campaign/x-teasers` : `campaign/x-teasers/export/1x1/04-fire-beginning.jpg` |  |
| [`social/x/graphics/teasers/1x1/05-legendary.jpg`](social/x/graphics/teasers/1x1/05-legendary.jpg) | ✅ approved | X teaser 5: What makes a creature legendary? | JPEG 1440x1440 | 1:1 | 455 KB | `campaign/x-teasers` : `campaign/x-teasers/export/1x1/05-legendary.jpg` |  |
| [`social/x/graphics/teasers/1x1/06-taking-shape.jpg`](social/x/graphics/teasers/1x1/06-taking-shape.jpg) | ✅ approved | X teaser 6: The story is taking shape | JPEG 1440x1440 | 1:1 | 397 KB | `campaign/x-teasers` : `campaign/x-teasers/export/1x1/06-taking-shape.jpg` |  |
| [`social/x/graphics/teasers/4x5/01-awakening.jpg`](social/x/graphics/teasers/4x5/01-awakening.jpg) | ✅ approved | X teaser 1: The Awakening | JPEG 1440x1800 | 4:5 | 745 KB | `campaign/x-teasers` : `campaign/x-teasers/export/4x5/01-awakening.jpg` |  |
| [`social/x/graphics/teasers/4x5/02-which-creature.jpg`](social/x/graphics/teasers/4x5/02-which-creature.jpg) | ✅ approved | X teaser 2: Which creature would you hatch? | JPEG 1440x1800 | 4:5 | 605 KB | `campaign/x-teasers` : `campaign/x-teasers/export/4x5/02-which-creature.jpg` |  |
| [`social/x/graphics/teasers/4x5/03-stirring.jpg`](social/x/graphics/teasers/4x5/03-stirring.jpg) | ✅ approved | X teaser 3: Something is stirring | JPEG 1440x1800 | 4:5 | 294 KB | `campaign/x-teasers` : `campaign/x-teasers/export/4x5/03-stirring.jpg` |  |
| [`social/x/graphics/teasers/4x5/04-fire-beginning.jpg`](social/x/graphics/teasers/4x5/04-fire-beginning.jpg) | ✅ approved | X teaser 4: Fire is only the beginning | JPEG 1440x1800 | 4:5 | 647 KB | `campaign/x-teasers` : `campaign/x-teasers/export/4x5/04-fire-beginning.jpg` |  |
| [`social/x/graphics/teasers/4x5/05-legendary.jpg`](social/x/graphics/teasers/4x5/05-legendary.jpg) | ✅ approved | X teaser 5: What makes a creature legendary? | JPEG 1440x1800 | 4:5 | 504 KB | `campaign/x-teasers` : `campaign/x-teasers/export/4x5/05-legendary.jpg` |  |
| [`social/x/graphics/teasers/4x5/06-taking-shape.jpg`](social/x/graphics/teasers/4x5/06-taking-shape.jpg) | ✅ approved | X teaser 6: The story is taking shape | JPEG 1440x1800 | 4:5 | 433 KB | `campaign/x-teasers` : `campaign/x-teasers/export/4x5/06-taking-shape.jpg` |  |
| [`social/x/graphics/x-post-01/solanites-x-post-01-1x1.jpg`](social/x/graphics/x-post-01/solanites-x-post-01-1x1.jpg) | ✅ approved | X post 01: Which creature would you hatch? (first launch teaser) | JPEG 1440x1440 | 1:1 | 330 KB | `prelaunch-phoenix` : `art/campaign/x-post-01/solanites-x-post-01-1x1.jpg` |  |
| [`social/x/graphics/x-post-01/solanites-x-post-01-4x5.jpg`](social/x/graphics/x-post-01/solanites-x-post-01-4x5.jpg) | ✅ approved | X post 01: Which creature would you hatch? (first launch teaser) | JPEG 1440x1800 | 4:5 | 379 KB | `prelaunch-phoenix` : `art/campaign/x-post-01/solanites-x-post-01-4x5.jpg` |  |

## end-cards/

| File | Status | Purpose | Format | Ratio | Size | Source (branch : path) | Notes / restrictions |
|---|---|---|---|---|---|---|---|
| [`end-cards/needs-review/studio-cut/endcard-enter-the-hatchery-16x9.jpg`](end-cards/needs-review/studio-cut/endcard-enter-the-hatchery-16x9.jpg) | ⚠️ needs review | End card of the Content Studio cut | JPEG 1920x1080 | 16:9 | 238 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/endcard-16x9.jpg` | "ENTER THE HATCHERY" CTA with no destination while the site is private. |
| [`end-cards/needs-review/studio-cut/endcard-enter-the-hatchery-1x1.jpg`](end-cards/needs-review/studio-cut/endcard-enter-the-hatchery-1x1.jpg) | ⚠️ needs review | End card of the Content Studio cut | JPEG 1080x1080 | 1:1 | 154 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/endcard-1x1.jpg` | "ENTER THE HATCHERY" CTA with no destination while the site is private. |
| [`end-cards/needs-review/studio-cut/endcard-enter-the-hatchery-4x5.jpg`](end-cards/needs-review/studio-cut/endcard-enter-the-hatchery-4x5.jpg) | ⚠️ needs review | End card of the Content Studio cut | JPEG 1080x1350 | 4:5 | 173 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/endcard-4x5.jpg` | "ENTER THE HATCHERY" CTA with no destination while the site is private. |
| [`end-cards/needs-review/studio-cut/endcard-enter-the-hatchery-9x16.jpg`](end-cards/needs-review/studio-cut/endcard-enter-the-hatchery-9x16.jpg) | ⚠️ needs review | End card of the Content Studio cut | JPEG 1080x1920 | 9:16 | 208 KB | `campaign/phoenix-content-studio` : `public/campaign/stills/endcard-9x16.jpg` | "ENTER THE HATCHERY" CTA with no destination while the site is private. |
| [`end-cards/prelaunch/endcard-hatching-begins-soon-16x9.png`](end-cards/prelaunch/endcard-hatching-begins-soon-16x9.png) | ✅ approved | Transparent end-card overlay: The hatching begins soon | PNG 1920x1080 | 16:9 | 263 KB | `prelaunch-phoenix` : `art/promo/overlays/endcard-16x9.png` | Transparent PNG overlay for video edits. No URL. |
| [`end-cards/prelaunch/endcard-hatching-begins-soon-1x1.png`](end-cards/prelaunch/endcard-hatching-begins-soon-1x1.png) | ✅ approved | Transparent end-card overlay: The hatching begins soon | PNG 1080x1080 | 1:1 | 139 KB | `prelaunch-phoenix` : `art/promo/overlays/endcard-1x1.png` | Transparent PNG overlay for video edits. No URL. |
| [`end-cards/prelaunch/endcard-hatching-begins-soon-9x16.png`](end-cards/prelaunch/endcard-hatching-begins-soon-9x16.png) | ✅ approved | Transparent end-card overlay: The hatching begins soon | PNG 1080x1920 | 9:16 | 202 KB | `prelaunch-phoenix` : `art/promo/overlays/endcard-9x16.png` | Transparent PNG overlay for video edits. No URL. |

## videos/

| File | Status | Purpose | Format | Ratio | Size | Source (branch : path) | Notes / restrictions |
|---|---|---|---|---|---|---|---|
| [`videos/source/phoenix-clip-1-awakening.mp4`](videos/source/phoenix-clip-1-awakening.mp4) | 🎞 source (internal) | Runway source footage, shot 1 (awakening) | MP4 H.264+AAC, 1280x720, 5.06 s | 16:9 | 4.0 MB | `prelaunch-phoenix` : `art/intro/clip-1-awakening.mp4` | Internal source footage (Runway). Not for direct posting. |
| [`videos/source/phoenix-clip-2-rebirth.mp4`](videos/source/phoenix-clip-2-rebirth.mp4) | 🎞 source (internal) | Runway source footage, shot 2 (rebirth); also the Content Studio source clip | MP4 H.264+AAC, 1280x720, 10.08 s | 16:9 | 9.3 MB | `prelaunch-phoenix` : `art/intro/clip-2-rebirth.mp4` | Byte-identical to public/campaign/phoenix-source.mp4 on campaign/phoenix-content-studio (not duplicated). Internal source: not for direct posting. |
| [`videos/source/phoenix-rebirth-frame-6s.png`](videos/source/phoenix-rebirth-frame-6s.png) | 🎞 source (internal) | Frame at 6.0 s of clip 2 (teaser 4 source) | PNG 1280x720 | 16:9 | 1.7 MB | `campaign/x-teasers` : `campaign/x-teasers/source/rebirth-frame.png` | Internal source footage (Runway). Not for direct posting. |

## brand/

| File | Status | Purpose | Format | Ratio | Size | Source (branch : path) | Notes / restrictions |
|---|---|---|---|---|---|---|---|
| [`brand/fonts/LICENSE-OFL.txt`](brand/fonts/LICENSE-OFL.txt) | ✅ approved | SIL Open Font License for the fonts above | Markdown/text | n/a | 4 KB | `campaign/x-teasers` : `campaign/x-teasers/build/fonts/LICENSE-OFL.txt` | SIL Open Font License; keep LICENSE-OFL.txt with the fonts. |
| [`brand/fonts/inter-latin-wght-normal.woff2`](brand/fonts/inter-latin-wght-normal.woff2) | ✅ approved | Body font (Inter) | WOFF2 | n/a | 48 KB | `campaign/x-teasers` : `campaign/x-teasers/build/fonts/inter-latin-wght-normal.woff2` | SIL Open Font License; keep LICENSE-OFL.txt with the fonts. |
| [`brand/fonts/jetbrains-mono-latin-400-normal.woff2`](brand/fonts/jetbrains-mono-latin-400-normal.woff2) | ✅ approved | Mono font (JetBrains Mono) | WOFF2 | n/a | 21 KB | `campaign/x-teasers` : `campaign/x-teasers/build/fonts/jetbrains-mono-latin-400-normal.woff2` | SIL Open Font License; keep LICENSE-OFL.txt with the fonts. |
| [`brand/fonts/unbounded-latin-wght-normal.woff2`](brand/fonts/unbounded-latin-wght-normal.woff2) | ✅ approved | Display font (Unbounded) | WOFF2 | n/a | 51 KB | `campaign/x-teasers` : `campaign/x-teasers/build/fonts/unbounded-latin-wght-normal.woff2` | SIL Open Font License; keep LICENSE-OFL.txt with the fonts. |
| [`brand/logo/solanites-logo-mark.svg`](brand/logo/solanites-logo-mark.svg) | ✅ approved | Logo mark (vector) | SVG 40x40 viewBox | 1:1 | 1 KB | `main` : `src/components/layout/Logo.tsx (paths)` | New file: exact paths and gradient from src/components/layout/Logo.tsx. |
| [`brand/phoenix-key-art-16x9.png`](brand/phoenix-key-art-16x9.png) | ✅ approved | Runway Phoenix reference still (key art) | PNG 2000x1116 | ≈16:9 | 2.4 MB | `campaign/x-teasers` : `campaign/x-teasers/source/phoenix-still.png` | Byte-identical copies also on phoenix-intro and prelaunch-phoenix (art/intro/phoenix-still.png). |
| [`brand/wordmark/solanites-wordmark-16x9.png`](brand/wordmark/solanites-wordmark-16x9.png) | ✅ approved | SOLANITES wordmark on transparent frame | PNG 1920x1080 | 16:9 | 143 KB | `phoenix-intro` : `art/intro/wordmark-16x9.png` |  |
| [`brand/wordmark/solanites-wordmark-9x16.png`](brand/wordmark/solanites-wordmark-9x16.png) | ✅ approved | SOLANITES wordmark on transparent frame | PNG 1080x1920 | 9:16 | 109 KB | `phoenix-intro` : `art/intro/wordmark-9x16.png` |  |

## plans/

| File | Status | Purpose | Format | Ratio | Size | Source (branch : path) | Notes / restrictions |
|---|---|---|---|---|---|---|---|
| [`plans/phoenix-intro-production-notes.md`](plans/phoenix-intro-production-notes.md) | 📄 reference | Runway prompts, shot list, costs and build steps for the Phoenix footage | Markdown/text | n/a | 7 KB | `prelaunch-phoenix` : `docs/phoenix-intro.md` |  |
| [`plans/phoenix-studio-campaign-brief.md`](plans/phoenix-studio-campaign-brief.md) | 📄 reference | Content Studio campaign brief, advert timeline and claims policy | Markdown/text | n/a | 5 KB | `campaign/phoenix-content-studio` : `docs/campaign/README.md` |  |
| [`plans/prelaunch-rules.md`](plans/prelaunch-rules.md) | ✅ approved | Prelaunch rules for all campaign material | Markdown/text | n/a | 2 KB | `prelaunch-phoenix` : `docs/marketing/prelaunch-rules.md` |  |

## ⛔ Do not publish: found but deliberately not copied

These files show or contain the private website URL. Copying them would put the URL somewhere new, so they stay only on their original branch. The prelaunch-safe replacement is listed in each row.

| Original (branch : path) | Problem | Use instead |
|---|---|---|
| `phoenix-intro` : `art/promo/solanites-x-16x9.mp4` | End screen shows the private URL and a "HATCH YOURS" button | `ads/needs-review/phoenix-prelaunch-promo/solanites-prelaunch-promo-16x9.mp4` |
| `phoenix-intro` : `art/promo/solanites-x-1x1.mp4` | Same | `…-prelaunch-promo-1x1.mp4` |
| `phoenix-intro` : `art/promo/solanites-x-9x16.mp4` | Same | `…-prelaunch-promo-9x16.mp4` |
| `phoenix-intro` : `art/promo/solanites-poster-4x5.jpg` | Shows the private URL | `posters/needs-review/solanites-poster-new-world-4x5.jpg` |
| `phoenix-intro` : `art/promo/overlays/endcard-{16x9,1x1,9x16}.png` | Show the private URL | `end-cards/prelaunch/` |
| `phoenix-intro` : `art/promo/overlays/poster-4x5.png` | Shows the private URL (poster overlay) | n/a (build intermediate) |
| `phoenix-intro` : `docs/marketing/x-posts.md` | Contains the private URL twice | `social/x/copy/needs-review/x-starter-pack.md` |

## Inspected but not copied (duplicates, intermediates and site files)

| Original (branch : path) | Why not copied |
|---|---|
| `campaign/phoenix-content-studio` : `public/campaign/phoenix-source.mp4` | Byte-identical to `videos/source/phoenix-clip-2-rebirth.mp4` |
| `campaign/phoenix-content-studio` : `public/campaign/phoenix-source.webm` | VP9 transcode of the same clip for browser playback; regenerable |
| `campaign/phoenix-content-studio` : `public/campaign/manifest.json` | Render log; superseded by this manifest |
| `phoenix-intro`, `prelaunch-phoenix` : `art/intro/clip-*.mp4`, `art/intro/phoenix-still.png` | Byte-identical to the copies in `videos/source/` and `brand/` |
| `campaign/x-teasers` : `campaign/x-teasers/source/phoenix-still.png` | Copied once, as `brand/phoenix-key-art-16x9.png` |
| `prelaunch-phoenix` : `art/promo/overlays/caption-*.png`, `brand-*.png`, `poster-4x5.png` | Transparent build layers for the promo videos (identical on `phoenix-intro` except the poster layer); regenerate with `scripts/promo-overlays.mjs` |
| `prelaunch-phoenix` : `public/intro/phoenix-{16x9,9x16}.{mp4,webm}` and `-poster.jpg` | Website intro video files (part of the site, not campaign assets) |
| `prelaunch-phoenix` : `public/hero/phoenix-{1200,2000}.*` | Website hero images, resized from the key art |
| `main` : `docs/creature-art/reference/**` | Design references for creature art, not final artwork; left in place (see README) |
| All tooling (Content Studio, render scripts, teaser build) | Code depends on its branch; documented in [`tooling/README.md`](tooling/README.md) |
