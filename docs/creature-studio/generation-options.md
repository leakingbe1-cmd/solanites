# Generation options and cost

Checked 2026-10-19 using read-only calls. Nothing was generated and no credits were spent.

## What is confirmed (from the connected Runway workspace)

| | |
|---|---|
| Workspace | personal workspace "Billy" (the only one this connection can use) |
| Credit balance | **2,035 credits**: 1,735 from the plan and 300 purchased (`whoami`, read-only) |
| Image models available | nano-banana-pro, nano-banana-2.1, nano-banana-2, nano-banana-2-lite, gpt-image-2, gpt-image-2.5-flare, gpt-image-2.5-sunburst, seedream-5, seedream-5-pro, seedream-5-flash, ideogram-4, ideogram-4.5, ideogram-4.5-precise-edit, grok-imagine-image-2, muse-image, fibo-1.5, fibo-edit-1.5, recraft-v4.1-vector, recraft-v4.1-flash, gen-4, gen-4-image-turbo |
| Deprecations | none announced |
| Transparent output | only seedream-5-pro, seedream-5-flash, gpt-image-2, gpt-image-2.5-sunburst |
| Reference images | supported (tagged references; edits by passing the source image as reference 0) |
| Images per call | 1–4 (`count`) |
| Background removal | sam3, birefnet-v2 (separate tool, for cutting out art made on a plain background) |
| Video models (later, Milestone D) | seedance-2 / 2.5 / fast / mini, kling-o3 / kling-3 variants, gen-4.5, gen-4-turbo, veo-3.1, hailuo-3, wan3, and others |

**Higgsfield** is connected too, but its connector cannot generate media (browse and balance only), so it is not an option for this work.

## Measured cost (2026-10-19)

**nano-banana-pro at 1K = 20 credits per image** in this workspace (balance 2,035 → 2,015 after one generation). Reference uploads cost nothing. The estimate table below used 4–20; actual cost sits at the top of that range, so the whole-collection figure is about 6,000 credits at 3 tries per stage with this model.

## What was not confirmed before the first generation: the exact cost per image

The Runway tool's per-model cost notes are cut off in the tool listing this session receives, and Runway's pricing pages are blocked by this environment's network policy. So **the exact credit cost per image in this workspace could not be read**. The best available figures:

| Model | Published Runway **API** price (credits per image) | Source |
|---|---|---|
| seedream-5-pro | 5 at 1K, 9 at 2K | Runway developer pricing page, as quoted in search results (page itself unreachable from here) |
| seedream-5 (Lite) | 4 at any resolution | same |
| nano-banana-2.1 | 4 at 1K, 6 at 2K, 12 at 4K | same |
| gpt-image-2 | 1 to 41, by quality and resolution | same |
| nano-banana-pro | not listed; third-party resellers quote 8 / 12 / 16 at 1K / 2K / 4K on their own credit scales | unreliable |

These are **API** prices. The app workspace this connector bills may price differently, so treat them as a planning range, not a quote.

## How to get the exact number for one image's cost

Generate **one** image with the chosen model at 1K, then call `whoami` again (free) and read the balance change. That gives the true price in this workspace before anything else is spent. If it costs more than the planning ceiling below, stop and report back.

## Planning estimates

Range used: **4–20 credits per 1K image** (the low end matches the published API prices, the high end allows for app pricing of premium models).

| Scope | Images | Credits (range) | Share of 2,035 |
|---|---|---|---|
| Calibration | 1 | 4–20 | ≤ 1% |
| **Round 1 concepts** (6 + up to 3 retries, calibration image counted as the first concept) | ≤ 9 | **36–180** | 2–9% |
| Prototype evolution lines after concept approval (3 species × 3 remaining stages × 2 tries + 6 fixes) | ≤ 24 | 96–480 | 5–24% |
| Original full prototype batch (no longer planned as one step) | 48 | 192–960 | 9–47% |
| Whole collection, 25 more species × 4 stages × ~3 tries | ~300 | 1,200–6,000 | likely **more than the current balance** at the upper end |

So the current balance covers the prototype phase comfortably, but the full 112-stage collection may need more credits or the cheaper model for exploration. That decision can wait until the measured cost is known.

## Recommended model for Round 1

**nano-banana-pro at 1K**, on a plain near-black background.
- It is the tool's default and the strongest at following reference images (Runway's own workflow docs recommend the Gemini image models for "strong reference fidelity"), which matters because the originals are the reference.
- No transparency is needed for concept review. Final stage art will use a transparent-capable model or a background-removal pass (sam3).
- If the measured cost is above about 12 credits per image, switch iterations to **nano-banana-2.1** (published at 4 credits per 1K image).

## Approval needed before any spend

1. Uploading the three baseline renders (Velynx, Mossling and Cryovant at the Evolved stage) to Runway as reference images. This sends the artwork to an external service; the uploads themselves are not described as costing credits.
2. One calibration image, then up to 8 more for Round 1: **≤ 9 images, ceiling 180 credits**. I stop and report if the calibration image costs more than 20 credits.
