# Phoenix intro (Runway)

The cinematic phoenix intro is generated with Runway, finished locally with
`scripts/phoenix-intro.sh`, and shown by the existing first-visit intro.

- **Site switch:** `src/config/intro.ts` → `PHOENIX_INTRO.enabled` (default `false`).
- **Preview on any deployment:** add `?intro=video` to the URL.
- **Fallback:** if the video can't play (missing file, autoplay blocked, slow network), the
  animated intro plays instead. Reduced motion always gets the animated intro's still frame.
- **Files:** `public/intro/phoenix-{16x9,9x16}.{webm,mp4}` and `-poster.jpg`.
  `NEXT_PUBLIC_INTRO_VIDEO_BASE` can point them at a CDN instead.

## The phoenix

All shots are animated from **one reference still**, so it stays the same creature.

| | |
|---|---|
| Runway task | `47944db5-4b5d-42d2-8db2-44d486b9fc69` (image, 16:9, 2K, Nano Banana Pro) |
| Alternative | `af8f2172-597e-47c0-bbea-a533a36060ec` (same prompt, other variation) |

Reference prompt:

> Cinematic key art of a colossal mythical phoenix rising in a vast pitch-black void, seen front-on and slightly from below, enormous wings spread wide and fully open, filling the frame horizontally. Its body and individually defined feathers are made of molten gold and incandescent orange flame, layered and highly detailed like hammered metal turning into fire at the edges. A crown of flame feathers on its head, a thin glowing golden halo ring floating above it, long sweeping tail plumes of fire trailing below. Eyes burn with intense white-gold light. Subtle electric violet energy threads through the wing tips and the smoke, with faint hints of cyan and green light in the deep background haze. Volumetric smoke, drifting embers and sparks, premium film lighting, strong rim light, high contrast, deep blacks, photoreal VFX quality, ancient, regal and imposing. Symmetrical heroic composition with clean empty dark space beneath the phoenix. No text, no logo, no watermark.

## Shots

| # | Scene | Status | Mode |
|---|---|---|---|
| 1 | Awakening + emergence: darkness, embers, the phoenix forms, eyes ignite | **generated** (5 s): opening still `3aba2fd9-47f2-4386-926a-d828468e1f9a` → video, see below | image→video, start = dark still, end = reference |
| 2 | Wings open + rebirth burst + settle | **generated**: task `2095f8b0-af2c-4ee6-bf58-d5c6167859e4` (10 s, 720p, with audio) | image→video, start frame = reference |
| 3 | SOLANITES reveal + hold | added by the script (no generation) | wordmark in the site's Unbounded font |

**Shot 1 opening still** (16:9, 2K): "Almost complete darkness: a vast pitch-black void seen through a cinematic camera. A few tiny glowing orange embers float in the foreground, out of focus. Far in the distance at the centre, a faint warm golden glow barely breaks the darkness, with thin wisps of swirling smoke and a subtle hint of violet energy around it. Deep blacks, extreme low key lighting, film grain, mysterious and ominous, premium VFX quality. No creature visible yet, no text, no logo."

**Shot 1 prompt** (start frame = the opening still, end frame = the reference, so it lands exactly on shot 2's first frame):

> Almost complete darkness in a vast black void. Tiny embers drift slowly through the frame; a faint golden glow appears in the far distance with swirling smoke and subtle violet energy. The camera glides slowly forward. A gigantic phoenix silhouette gathers out of the darkness, its eyes ignite with intense golden light, then flames spread across its head, body and individual feathers until the molten-gold phoenix is fully revealed with wings spread. Slow, ominous, cinematic; deep blacks, volumetric smoke, film-quality VFX. No text.

**Shot 2 prompt** (used):

> Slow cinematic push-in on the colossal molten-gold phoenix in the black void. Its enormous wings unfold further and rise in one slow, powerful beat, releasing trails of fire and glowing embers from every feather. Flames ripple across the layered gold feathers, its eyes flare white-gold, and threads of electric violet energy pulse through the wing tips. Then a controlled burst of golden energy spirals around its body like a rising vortex of sparks and light, and settles back into darkness, leaving the phoenix in a still, regal final pose with embers drifting upward and soft smoke rolling below. Slow, deliberate, majestic motion; volumetric light, deep blacks, high contrast, film-quality VFX. No text, no logos, no camera shake.

Settings: Seedance 2.0 (Runway's default), 16:9, 5 s for shot 1 and 10 s for shot 2, 720p (1080p for a
sharper master, at a higher cost). Keep "no text" in every prompt: the wordmark is added afterwards,
because AI video warps lettering.

**Vertical (9:16):** the script fits the whole 16:9 shot into the vertical frame over matching black, so the wings
are never cut. For a native vertical shot, generate a 9:16 reference still with the same prompt, then the same
shot prompts at 9:16.

## Make the site files

1. Download the clips from Runway (library → download MP4) into `art/intro/`, e.g. `clip-1.mp4`, `clip-2.mp4`.
2. Run:
   ```bash
   KEEP_AUDIO=1 scripts/phoenix-intro.sh art/intro/clip-1.mp4 art/intro/clip-2.mp4
   ```
   It joins the clips, holds the final frame 1.8 s, fades in SOLANITES over the last moments, and writes the
   16:9 and 9:16 web files and posters to `public/intro/`, plus full-quality masters to `art/intro/master-*.mp4`
   for X. Tune with `HOLD=`, `FADE_IN=`, `WEB_CRF=`, `WEBM_CRF=`, `PORTRAIT=fit|crop`.
3. If you kept the audio, set `hasAudio: true` in `src/config/intro.ts` (a "Sound on" button appears; it is always muted at first).
4. Preview with `?intro=video`. When happy, set `enabled: true`.

The wordmark images (`art/intro/wordmark-*.png`) are rendered from the site's own font; regenerate them with
the same headless-browser approach if the brand type changes.

## Costs (Runway credits, from this account's actual charges)

| Item | Credits |
|---|---|
| Reference still, Nano Banana Pro 2K | 20 each |
| Video, Seedance 2.0, 720p, with audio | 30 per second (10 s = 300) |
| Sound effect (separate track) | 1 per second |
| Joining clips in Runway | 1 per 20 s (the script does this locally for free) |

Spent so far: **340** (2 stills + shot 2). A finished two-shot intro needs about **150 more** (shot 1, 5 s).
A native 9:16 set would be about **20 + 450** more. The plan has 2,250 credits a month.

Hosting: the files are static assets on Vercel. Expect roughly 1–4 MB per first visit (only first visits
see the intro, and the browser loads only the one cut it needs). Vercel's Hobby plan includes
100 GB of data transfer a month.
