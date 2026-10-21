# Marketing plan: @Solanites_ (consolidated)

Owner: SOL · Marketing lane. Written 21 Oct 2026 from `origin/main` (03084fb) and the branches below. **Nothing here is posted or scheduled.** Typefully holds drafts only (set 349175).

**Truth sources.** Odds are `src/config/gameConfig.ts` `rarityWeights`: **Common 40 · Rare 30 · Epic 17 · Legendary 8 · Mythic 3.5 · Secret 1.5**. Species counts per tier are 6/5/5/6/4/2 (28). Mythic = Astravex, Orbelith, Eventide, Helivane. Secret = GENESIS, Nullborn.

**Rules applied to every item.** No contract/mint address, buy or chart links, launch dates, or price/return/profit talk. No site or `*.vercel.app` URL (`docs/marketing/prelaunch-rules.md`). Mythic and Secret designs stay out of all X content (owner, 21 Oct). Free local tools only; no Runway, no paid services.

---

## 1. Inventory

Status key: ✅ cleared (owner sign-off still needed on the day) · 🔧 fix first · ⛔ hold · ⏳ media missing.

### A. Profile kit: `marketing/x-warmup` (12ddfc1), `marketing/x-profile/`
| Asset | Use | Status |
|---|---|---|
| `avatar-400x400.png` (same file as `x-campaign/profile/x-avatar`) | profile picture | ✅ |
| `banner-1500x500.png` (4 silhouettes: Mossling, a crested bird, an anglerfish, Pyraurum: none Mythic/Secret) | header | ✅ |
| `og-1200x630.png` | link-card image for the site OG | ✅ (only matters once a link is allowed) |
| `bios.md` (3 options) | bio | ✅ option 1 "mystery". Option 3 says "earn sealed eggs": 🔧 until holder tracking is live |
| `pinned-thread.md` (4-post teaser) | first pinned item | ✅ |
| `content-plan.md`, `drafts.json`, `build/` | 2-week calendar, source of the Typefully drafts | ✅ |

### B. Warm-up media `marketing/x-profile/media/` (14 images, 1600×900)
W01 Mossling silhouette · W02 Mossling reveal · W03 Frostkit sil · W04 Frostkit reveal · W05 Stormquill sil · W06 Stormquill reveal · W07 Neonyx sil · W08 Neonyx reveal · W09 Pyraurum sil · W10 Pyraurum reveal · W11 lore Solgem · W12 lore bloodlines (Mossling, Cryovant, Velynx; Common/Rare/Legendary only, copy mentions four tiers) · W13 lore four forms · W14 countdown. All ✅. I checked W12, the OG card and the banner by eye; **W11, W13, W14 and the reveal/silhouette images were not eyeballed, so run a quick visual pass before posting.**

### C. Typefully drafts (set 349175), checked with `list_drafts`
23 drafts, all status `draft`, none with `scheduled_date`: the Typefully welcome draft (11388775, ignore) + 22 of the 24 warm-up drafts. Media is attached (spot-checked D01). **Not yet created: D12 "reveal: Neonyx" (media W08 exists) and D12 "countdown: a crack" (text only).** BTS drafts D04 (11389116), D09 (11389130), D14 (11389194) have no media. Four polls (D02, D06, D10, D13) are text approximations; they must become native X polls by hand.

### D. 10-post campaign: `marketing/x-campaign` (37760ef), 1600×900
| # | Image | Copy | Status |
|---|---|---|---|
| 01 | intro, phoenix key art | captions.md §1 | ✅ |
| 02 | hatchery | §2 | 🔧 "every 1,000,000 $SLNT you hold earns one" (see §2c) |
| 03 | hatching | §3 | ✅ (non-fast-track copy; fast-track variant needs its own image) |
| 04 | six-tier cards, **old odds 60/25/10/4/1/0.2**, shows Mythic/Secret tiers | §4 | ⛔ |
| 05 | evolution (Pyraurum) | §5 | 🔧 caption's "rests if balance drops" is a mechanic claim; drop that sentence unless Site confirms it is live |
| 06 | catalogue (Mossling, Velynx, Cryovant) | §6 | ✅ |
| 07 | GENESIS on its biome | §7 | ⛔ Mythic/Secret design |
| 08 | leaderboard, Aurelion, "LIVE SOON" | §8 | ✅ keep "live soon" (STATUS: tracking "not configured" until launch settings) |
| 09 | collection capture | §9 | 🔧 must re-check the capture for Mythic/Secret cards; also §2c |
| 10 | CTA, hatchery egg | §10 | ✅ |
Plus `profile/` header 1500×500 and avatar, `template/` (SPEC, fonts, sigils), `copy/` (captions, profile, schedule, profile-audit), `contact-sheet.png`, `build/` (render + validate). Posts were rendered from design 42d39c4 and the site has moved on.

### E. Videos
| Asset | Where | Status |
|---|---|---|
| 42 s campaign video `final.mp4`, `final-captions.mp4` (1080p, 10 MB each) | `promo/video-42s` @ 54279ff, `marketing/x-campaign/video/` | ⛔ uses `rarity-cards.jpg` (old odds, 4% Legendary) and a Collection scroll (likely shows Mythic/Secret). Rebuild via `render.mjs` (~9 min) after the odds fix and a Mythic/Secret frame audit. End card "The hatching begins soon" has no URL (OCR checked). |
| 27 s website promo 16:9/9:16/1:1 + 4:5 poster | `campaign/website-promo-video` @ fd37c13, `campaign/website-promo-video/export/` | 🔧 not yet reviewed by me; built from Runway clips and site footage. Audit frames for odds and Mythic/Secret before use |
| 26.5 s teaser, 17.75 s prelaunch promo (16:9/9:16/1:1) | chat attachments / `campaign/library` `ads/needs-review/` | 🔧 captions say "1 EGG PER 1,000,000 $SLNT / Earned by holding"; 9:16 cut is weak (small footage, black bars) |
| 11.6 s Studio ads (4 ratios) | `campaign/library` `ads/needs-review/` | ⛔ end on "ENTER THE HATCHERY" with no destination |

### F. Gameplay infographics: `campaign/x-gameplay-infographics` (553fb13), 1440×1800 + 1:1 (these two branches are on origin, contrary to the handoff note)
| # | Title | Status |
|---|---|---|
| 1 | From egg to Solanite | ✅ (shows labelled Hatchery demo screens; confirm owner is fine showing demo) |
| 2 | Six tiers. Which will you find? | ⛔ old odds 60/25/10/3.8/1/0.2, shows GENESIS/Astravex silhouettes, caption says Mythic/Secret "stay classified" (no longer true) |
| 3 | Every legend has a beginning (Pyraurum, 4 forms) | ✅ |
| 4 | Which one are you hatching? (Pyraurum / Zephrax / Cryovant) | ✅ best reply-bait |
| 5 | More than just a creature collection | ⛔ uses `collection-mythic.jpg` and "Mythic and Secret hidden until hatched" |
Content pack with captions, sources and validator (`build/validate.mjs`) is solid and reusable.

### G. Teasers: `campaign/x-gameplay-infographics` `campaign/x-teasers/` (77ee850), also in `campaign/library`
6 teasers, 4:5 and 1:1, Phoenix art, own copy and replies: 01 Awakening · 02 Which creature would you hatch · 03 Something is stirring · 04 Fire is only the beginning · 05 What makes a creature legendary · 06 The story is taking shape. ✅ Copy has no numbers. Teaser 2's "👁️ The unknown" option is fine. Note these use the Unbounded/Inter look, while x-campaign uses Cormorant/gilt, so the grid will look like two brands (see §4).

### H. Library: `campaign/library` (91e0f3c, based on an older main), `campaigns/`
57 assets with `MANIFEST.md` and `README.md`. Mostly duplicates of F/G plus: `x-post-01` (1:1, 4:5, "Which creature would you hatch?"), infographics x-01 phoenix ✅, x-02 hatchery ✅ (caption needs review), x-03 collection (28 species, 13 elements: 🔧 check for Mythic/Secret art), **x-04 rarity ⛔ and poster "six bloodlines" ⛔ (both print old odds; the manifest's "odds match gameConfig" is now stale)**, x-07 community "What will you name it?" ✅, x-08 explore ⛔ (no-wallet/CTA), 3 prelaunch end-card overlays ✅, brand kit (logo, wordmark, fonts) ✅. Library's `prelaunch-rules.md` still lists the old odds; fix when merging.

**Count:** 14 warm-up images + 3 profile images (avatar, banner, OG) + 10 campaign posts + header + 5 infographics + 6 teasers + 7 library-only graphics (x-post-01, x-01…x-08 minus overlaps) + 4 video families (42 s, 27 s, 17.75 s, 11.6 s) + 22 Typefully drafts = **~70 distinct deliverables** (~150 files counting ratios/duplicates).

---

## 2. Conflicts to fix

### a. Mythic/Secret designs in X content (hold)
- Campaign **04** (tier cards) and **07** (GENESIS): ⛔ held, per Manager. Both have replacements below.
- Infographic **2** (silhouettes) and **5** (Collection screenshot): ⛔.
- 42 s video, 27 s video, library x-03/x-04 and "six bloodlines" poster: ⛔ until a frame audit confirms no Mythic/Secret design or name. GENESIS, Astravex, Nullborn names must not appear.
- Campaign 09 and any Collection/grid capture: check card art.
- Warm-up set: clean (W12 shows only Common/Rare/Legendary; silhouettes are Common–Legendary).
- STATUS asks whether the 2D Mythic/Secret art in `public/creatures` should be hidden on the live Collection. This matters to us: anyone can screenshot it, but X content from this account stays clean either way.

### b. Old odds (60/25/10/4|3.8/1/0.2) in copy and images
Images: campaign 04, infographic 2, library x-04, "six bloodlines" poster, `rarity-cards.jpg` inside the 42 s video, campaign `build/captures/rarity-cards.jpg`. Text: `x-campaign/copy/captions.md` §4 note, gameplay `CONTENT-PACK.md` post 2 and its alt text, `campaigns/README.md`, `campaigns/plans/prelaunch-rules.md`, `needs-review/phoenix-studio-content-pack.md` and `x-starter-pack.md`. All captions in x-campaign quote no odds (good). **Owner decision: publish exact odds on X at all?** A public number is a commitment; the Legendary 3.8-vs-4 dispute is moot now (8%, no rounding issue). Recommended: a text-and-numbers card, no creature art, built from `gameConfig`, posted only after owner sign-off.

### c. Rule breaks and rule risks
| Item | Rule | Fix |
|---|---|---|
| Contract/mint address, buy or chart links | none found in any inventoried file | keep as is. Note main now has live TradingView charts on creature pages (`MARKET_WIDGET=tradingview`); **never screenshot those pages** |
| Site/`vercel.app` URL | none found in the six branches' marketing files; `phoenix-intro` assets contain it and are excluded | keep excluded. Handoff notes the repo homepage field and some `main` comments still show it |
| Launch dates | none in copy; "no date yet" lines in D07 are fine | keep. Also keep `launchAt` out of anything we quote |
| Price/return/profit talk | none found. Wording to watch: Stormquill reveal "every wingbeat finalises a thousand transactions. probably." (joke about transactions: fine); "brighter each time its keeper refuses to sell" (Pyraurum lore) is excluded already | keep excluded |
| "1,000,000 $SLNT per egg" | prelaunch rules list it as a verified fact, but also forbid "holder reward amounts". Appears in campaign 02, 09, pinned-video text, library promo captions. Holder tracking has never run on mainnet (`docs/holder-tracking.md`) | **Owner decision.** Until then use the safe wording "holding $SLNT earns eggs" / drop the figure, in 02, 09 and bio option 3 |
| "Provably fair" | not used | keep |
| "Hatchery demo" screens | infographics 1 use demo screens, labelled | keep the label |
| Echo of the "Twitterbot blocked" issue | `robots.txt` blocks Twitterbot, so no link cards | irrelevant while we post no links; Site lane owns it |

### d. Other inconsistencies
- Pinned item conflict: `pinned-thread.md` (4-post teaser), `x-campaign/copy/profile.md` (pinned text for the video) and schedule Day 0 (pinned video). **One pin at a time:** the teaser thread first; swap to the 42 s video once rebuilt.
- Duplicate concepts: "Which creature would you hatch?" exists as x-post-01 and teaser 2; "four forms" as warm-up D06, campaign 05 and infographic 3; "something is stirring" as pinned thread, banner, teaser 3 and D07/D12. The order below uses each once.
- Visual styles: x-campaign/x-warmup (Cormorant + gilt) vs teasers/infographics/library (Unbounded + purple). Pick one for the grid: recommend x-campaign style; the teasers read as a separate series and can run as a labelled "Phoenix" series.
- Campaign post 3 originally said Mythic/Secret stay classified "until someone hatches one" (discovery is per viewer): not in current 03 copy, only in the old pack (library). Don't use it.
- Warm-up D10 poll hints at "two more hiding"; this is true (six tiers) and reveals no design, so it is kept, but it must never be answered in replies.

---

## 3. One posting order

Day 1 = the day the owner approves the first post. 1 to 2 posts a day, 15:00 to 18:00 UTC. Every post needs the owner's sign-off on the day. Items marked ⛔/🔧/⏳ move later as noted; there is a "fallback filler" for each so no day is empty.

| Day | Slot A | Slot B (optional) |
|---|---|---|
| 0 | Profile: avatar, banner, bio option 1, location "the hatchery", empty website | none |
| 1 | **Pinned teaser thread** (pin) | D01 silhouette: Mossling |
| 2 | D02 reveal: Mossling | D02 poll: first hatch (native) |
| 3 | D03 lore: Solgem | campaign **01 intro** (phoenix key art) |
| 4 | D04 silhouette: Frostkit | D04 BTS the studio ⏳ (else teaser 03 "Something is stirring") |
| 5 | D05 reveal: Frostkit | campaign **06 catalogue** |
| 6 | D06 poll: which form | D06 lore: four forms (**covers campaign 05**, skip 05) |
| 7 | D07 countdown: eggs warming | infographic **1** From egg to Solanite |
| 8 | D08 silhouette: Stormquill | teaser **02 / x-post-01** (use one: x-post-01 4:5) |
| 9 | D09 reveal: Stormquill | D09 BTS 3D turntable ⏳ (else infographic **4** Which one are you hatching?) |
| 10 | D10 lore: bloodlines | D10 poll: rarest guess |
| 11 | D11 silhouette: Neonyx | campaign **02 hatchery** 🔧 (wording) |
| 12 | D12 reveal: Neonyx (**draft to create**) | D12 countdown "a crack" (**draft to create**) |
| 13 | D13 silhouette: Pyraurum | D13 poll: keeper vibe |
| 14 | D14 reveal: Pyraurum | D14 countdown: soon; D14 BTS hatch reveal ⏳ |
| 15 | infographic **3** Every legend has a beginning | campaign **03 hatching** |
| 16 | teaser **04 Fire is only the beginning** (Phoenix series) | campaign **09 collection** 🔧 |
| 17 | campaign **08 leaderboard** ("live soon") | teaser **05 legendary** |
| 18 | 42 s video 🔧 (rebuilt, pin swap) | |
| 19+ | odds card ⛔ (owner), campaign **04 replacement**, **07 replacement** | campaign **10 CTA** the day before launch; teaser **06** as the last follow call |

Dropped as duplicates: campaign 05 (D06 lore), teaser 01 (campaign 01/x-post-01 intro) and teaser 03 (if D04 BTS is ready), infographic 5, library x-08/x-04. Replies: only facts in captions; if asked about date, price or contract: "not yet. follow for launch updates."

---

## 4. Missing, blocked, and decisions needed

**Missing assets**
1. BTS media for D04, D09, D14: 3D turntable and studio shot (Creature Art lane, Aurelion redo pending art approval; the first pass de07a4c was rejected). D14 hatch clip can be made now with Remotion (Common/Rare only), local and free.
2. Typefully drafts D12 reveal Neonyx and D12 "a crack" (media exists). I can create these as drafts on request.
3. Replacements for campaign 04 and 07 (see decisions). Re-render source: `node marketing/x-campaign/build/render.mjs`.
4. A rebuilt 42 s video with the correct, Mythic/Secret-free frames (~9 min render).
5. Fast-track variant of post 3 (fast track is live on main).
6. 4:5 and better-framed 9:16 cuts of the prelaunch promo.
7. Native X polls (4) must be made by hand in X; Typefully can't.
8. Official hashtag/handle check (#Solanites, @Solanites_), and a first look at the live profile: x.com is blocked from this container, so the profile audit rests on repo records only.

**Decisions for the owner**
1. Publish exact odds (40/30/17/8/3.5/1.5) on X? If yes, approve an art-free odds card. If no, retire post 04, infographic 2 and the odds posters for good.
2. Replacement for post 07: a "six bloodlines exist, four shown" text post, or drop it. Recommended: drop; the warm-up D10/W12 already hint.
3. State the "1,000,000 $SLNT per egg" figure publicly, or use "holding $SLNT earns eggs" until tracking is live?
4. Show Hatchery demo screens (infographic 1) before tracked eggs are live?
5. Pin order: teaser thread first, 42 s video second. OK?
6. One visual style for the grid (recommend Cormorant/gilt), with teasers as a labelled Phoenix series.
7. Hide 2D Mythic/Secret art on the live Collection until launch (STATUS question)?
8. Allow Twitterbot in `robots.txt` (Site lane) before the first link post: later.

**Not touched:** `main`, `design/*`, `feature/*`, `art/*`, STATUS.md. No post was created, scheduled or published.
