# X post 01: "Which creature would you hatch?"

**Account:** @solanites_ · **Type:** community engagement (not an announcement, not a sales post)
**Status:** ready for owner approval. Not posted, not scheduled.

## Image

Attach one of these (both 1440 px wide, sRGB JPEG, well under X's 5 MB image limit):

| Format | File |
|---|---|
| 4:5 portrait (recommended: largest in the feed on phones) | `art/campaign/x-post-01/solanites-x-post-01-4x5.jpg` (1440x1800) |
| 1:1 square (alternative) | `art/campaign/x-post-01/solanites-x-post-01-1x1.jpg` (1440x1440) |

Rebuild with `node scripts/x-post-01.mjs` (uses the Runway still and clips already in `art/intro/`; no credits).

**Alt text** (paste into X's image description):

> SOLANITES. Which creature would you hatch? Three choices: Phoenix, a golden fire bird with a halo; Something rare, violet lightning over flame; The unknown, a dark silhouette with a question mark. Reply with your pick.

## Caption (copy everything between the lines)

---

Every legend starts somewhere. 🐦‍🔥

28 creatures. One world. Your story hasn't begun yet.

When your egg hatches, what are you hoping for?

🔥 A Phoenix
⚡ Something rare
👁️ The unknown

Reply with your pick 👇

SOLANITES. The beginning is near.

---

About 240 characters, inside the 280 limit for standard accounts.
Changes from the draft: "Something nobody has seen before" became "The unknown" to match the image, and the
reply line was shortened so the post fits the limit without X Premium.
Note: 🐦‍🔥 (phoenix) is a newer emoji; very old phones show it as 🐦 followed by 🔥.

## Follow-up reply (post under the main post, from @solanites_)

---

Be honest: are you chasing rarity, or picking the creature that looks the coolest?

---

## Checks

- **"28 creatures"** verified: `src/data/creatureDesigns.json` lists 28 species (also the homepage's "species to find").
- **"Six rarities"** (image) verified: `src/config/gameConfig.ts` rarity weights, Common to Secret.
- **"Classified until hatched"** (image) verified: Mythic and Secret species stay hidden until hatched.
- No website or preview URL, no contract address, no launch date, no token amounts, no
  financial claims, no fake scarcity (see `prelaunch-rules.md`).
- "The beginning is near" / "The hatching begins soon" promise no date.
