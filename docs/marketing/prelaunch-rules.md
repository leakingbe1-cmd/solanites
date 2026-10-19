# Prelaunch campaign rules

These apply to every promotional asset, X post, caption, overlay, end card and
publication-ready campaign document until the official launch.

## PRELAUNCH URL RULE

**Do not display, publish, link to or reveal the Solanites website URL or any deployment
preview URL in any promotional asset, X post, caption, overlay, end card or
publication-ready campaign document. Do not include a website URL until the owner
explicitly approves the official launch URL.**

- This covers the current production address (a `*.vercel.app` domain) and every preview
  address (`solanites-git-*.vercel.app`, `solanites-*-<team>.vercel.app`, and so on).
- Use a branded ending instead: "THE HATCHING BEGINS SOON" or "FOLLOW FOR LAUNCH UPDATES".
- Never invent a replacement URL.
- Enforced by `scripts/check-prelaunch-urls.sh`, which `scripts/promo-assets.sh` runs before
  every build, and by a guard in `scripts/promo-overlays.mjs` that refuses to render any
  overlay containing a web address.
- The GitHub repository is currently **public**, so code, docs, branches and history are
  visible to anyone. `scripts/check-prelaunch-urls.sh` therefore scans every tracked file.
  Earlier commits still contain the address; only rewriting history or making the
  repository private removes that.
- Removing the URL from campaign material does **not** make the deployment private: that
  needs Vercel Deployment Protection.

## Also never include before launch

- A contract address or mint address.
- An unannounced launch date or time.
- Unapproved token details (supply, allocations, fees, holder reward amounts or dates).
- Financial promises: "guaranteed", "profit", "returns", "moon", price talk.
- Claims the code cannot back. Verified facts today: 28 species, 1,000,000 $SLNT per egg,
  four forms (Eggling, Hatchling, Evolved, Ascended), six rarities (Common 60%, Rare 25%,
  Epic 10%, Legendary 3.8%, Mythic 1%, Secret 0.2%).
- Fake engagement, artificial scarcity ("only 10 left"), or "provably fair".

The ticker is always `$SLNT`.
