# The manager's rubric

Derived from `brain/HOW-BILLY-THINKS.md` section 8 (the 22-point checklist) and sections 1 to 3, plus
`research/design/web-standard/defect-register.md`. Every line carries the brain file's own provenance tag so the
weight is visible: `[said]` is Billy's bar in his words, `[inferred]` is a pattern read across his reactions,
`[proposed]` is a Claude suggestion he has not approved. Nothing here is a new owner rule; anything the manager adds
is `[proposed]`.

## Score 0-10: how to arrive at it

Start at the wow test, not at the defect list. A site that wows and has two small faults is an 8 with two fixes; a
clean site that bores him is a 5. Then subtract for faults. Then check the instant rejects, which override the score.

| Score | Meaning |
|---|---|
| 9-10 | He'd show the client right now with no apology (check 8). Wow on the phone, one idea carried through, nothing to fix. |
| 8 | Wows; a short list of small faults he wouldn't notice first, all with crops. **Pass threshold.** |
| 6-7 | Competent but not his level: correct-but-sloppy, or "nothing wrong with it" without a wow. `redo`. |
| 4-5 | Several visible faults, or sections that read as different sites, or template-with-a-logo. `redo`. |
| 0-3 | Broken, placeholder, or an instant reject. `redo`. |

## A. Instant rejects (any one = `redo`, whatever the score)

- **AI slop** `[said]`: cartoon proportions, big eyes, stock 3D blobs, glow on everything, chrome text, grime specks, three identical cards, generic "AI" look. (sol STATUS, tmu DESIGN §12, lk defect register)
- **Plain and grey, hero doesn't wow, sections feel samey** `[said]` (Northcut v1, audit chat 29 Oct).
- **"The same website reskinned"** `[said]`: a shared skeleton you could swap the logo on (lk BRIEF.md).
- **Cheap-looking effects** `[said]`: TMU v1 hounds, chrome-gold lettering, pricing off-theme.
- **Fake anything** `[inferred]`: invented claims, placeholder numbers that look real, "live" numbers that aren't, prices or reviews the client never gave. (lk lessons #3, defect register "Content")
- **Rules put in his mouth** `[said]`: any "owner rule / owner decision / Billy said" without a [said] backing.
- **Money spent without his yes** `[said]`: credits, licences, subscriptions, domains. (tmu STATUS 6 Nov, 150 Runway credits)
- **Members' faces or bodies shown (TMU); claims he said not to make** `[said]` (tmu relabel audit).

## B. Taste (checks 1-8): what wow means to him

1. **First ten seconds on a phone** `[said]` "If it doesn't wow me, it ain't gonna wow Rob." Judge from the wow strip / video, not a still. `[inferred]` the first ten seconds on a phone is the bar.
2. **One concept, one hero idea carried through every section** `[inferred]`; no screenshot could be mistaken for another site. (TMU v1 "each section reads as a different site")
3. **The client's real world** `[said]`: their photos, walls, colours; not a template with a logo.
4. **Nothing cheap or slop** (see A).
5. **Premium motion** `[inferred]` from the defect register + Emil skills: one orchestrated moment, motion answers actions, ease-out, nothing loops (marquee excepted), nothing starts at opacity 0 on load without a reason. `[proposed]` as a scoring item.
6. **Signature 3D/video moment tested rough first, route picked by Billy** `[said]` (10-minute test; "do what you think" counts as his pick only if he said it).
7. **Built from an approved board/frames and matches them at 390 and 1440** `[said]` (web-build gates).
8. **Could the client be shown this in person right now with no apology?** `[said]` (pitch plan: show don't tell).
- What he loves `[said]`: dark, lit, metallic, real; gold and flash in motion; big product-shot hero; real photos shot by him; raw kept raw; premium realism; "brought to life, 3D, aggressive".

## C. Defects (checks 9-17): every picture looked at

9. Every image looked at, at card size or larger, on the live page, critiqued in writing `[said]` (Surge: five rounds).
10. The whole site walked as a customer on a phone (tap, scroll back, open menus, add to basket) `[said]`.
11. Screenshots in Chromium, WebKit and Firefox at 375/390 and 1440, every one looked at; no sideways scroll; no console errors `[said]` (defect register).
12. QA kit run (`css-lint`, `site-qa`, `browser-matrix`) and FAILs fixed, not excepted `[said]`.
13. `/impeccable audit` and `review-animations` run with findings fixed `[said]` (CLAUDE.md Skills to use).
14. Defect register walked by a reviewer who did not build it `[said]`; new kinds added to the register.
15. Fonts judged in a real browser, self-hosted `[said]` (defect register "Fonts look fine").
16. Every fix says where it is ("fixed on branch X, live once merged") `[said]`.
17. Anything looked at three times and still passed has not been looked at: do it again differently `[inferred]`.

Defect-register kinds to look for in the pictures (the register has the full list):
torn or ragged cut-outs, white smears, bitten packs, badges baked into photos, wrong photo for the variant, tiny
multipack cans, mixed photo backgrounds, soft or upscaled images (natural < rendered × DPR), stretched aspect,
no-photo tiles, sticky hover after a tap, labels over names, stacked buttons, double focus rings, `[hidden]`
showing, bullet on a wrapped line, overlays covering buttons, placeholders live, fake contact details, generic
titles, sideways scroll, grid item wider than the viewport, map labels shrunk, low contrast, tap targets under 44 px,
headline half-appearing on load, hero line wrapping into the product, a pinned scene that stops the page.

## D. Honesty and provenance (checks 18-22)

18. Every fact is the client's own; unknowns marked "to confirm"; nothing invented `[inferred]`.
19. Every claim labelled VERIFIED / NOT TESTED / BLOCKED; real phones, GPUs, Safari, Firefox honestly NOT TESTED until someone looks `[said]`.
20. Nothing labelled "owner rule / owner decision / Billy said" unless he said it or clearly agreed `[said]` (Billy, 6 Nov 2026).
21. No money spent without his yes on that specific spend `[said]`.
22. The report fits on one phone screen: verdict, "Waiting on you" as three-word choices, links `[proposed]`.

## What is NOT a rule

The brain file's section 7 lists rules Claude invented that he never approved (3D creature ban, "unattended runs"
wording, "Hard-won rules", TMU banned list, niche price tiers, and more). The manager never enforces those as his;
if a doc states one as an owner rule, that is a provenance flag, not a design fault.
