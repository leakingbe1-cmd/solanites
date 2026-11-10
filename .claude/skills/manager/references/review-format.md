# Manager review: <project> (<preview or build>)

This is the shape of `review.md` in the review folder. Copy it, fill every section; nothing is optional.

Round <n> of 3 (nightly: review <n> of tonight, up to 1 + fixRounds) · reviewed <YYYY-MM-DD HH:MM> UK · reviewer: <manager skill in the build session | nightly independent (model)>
Review folder: `<path>` (capture.json, findings.md, pages/, images/, wow/, faults/, provenance.md)

## Verdict: <pass | redo | stuck> · score <n>/10

<One sentence a tired owner can read on his phone: what it is and why it got that score.>

## Wow test (first 10 seconds on a phone)

Looked at: `wow/frame-00..10.png` and `wow/first-10s.webm`.
<Two or three sentences: what loads first, what moves, what he'd feel at second 3 and second 10. Say plainly whether
it wows. If it does not, say what is missing against what he loves (dark, lit, metallic, real; one hero idea; gold
and flash in motion) without inventing a direction for him.>

## Faults (each with a crop)

| # | Where (page, width, y) | Fault | Crop | Rubric / register row |
|---|---|---|---|---|
| 1 | /, 390, y=1180 | Hero still is 343 px shown at 920 device px: soft edges | `faults/01-hero-soft.png` | register: upscaled image; check 9 |
| 2 | ... | ... | ... | ... |

<Every fault has a crop file made with crop.mjs. "Looks fine" is not a row. If there are no faults, say which
pictures were opened (count) and that each was critiqued.>

## Images, one by one (<n> files in images/)

<One line per image or per group with the same verdict: "01-04 product shots: clean cut-outs, consistent background"
/ "05 pub.webp: soft, upscaled 2.1x, see fault 3". Every file in images/ appears here.>

## Pages and states looked at

<List: each pages/*.png opened; menu state; 1440 pair; anything that reads as a different site on the contact sheet.>

## Checklist (brain file §8)

| # | Check | Yes/No | Note |
|---|---|---|---|
| 1 | Wow in 10 s on a phone | | |
| 2 | One concept carried through | | |
| 3 | Client's real world | | |
| 4 | Nothing cheap / slop | | |
| 5 | Premium motion | | |
| 6 | Signature moment tested rough, route picked by Billy | | NOT TESTED if no record |
| 7 | Matches approved frames at 390/1440 | | NOT TESTED if no frames |
| 8 | Showable in person now | | |
| 9-17 | Defect checks | | which ran, which are NOT TESTED |
| 18 | Facts are the client's own | | |
| 19 | VERIFIED / NOT TESTED labels in the session's own report | | |
| 20 | Provenance clean | | see below |
| 21 | No spend without a yes | | see below |
| 22 | Report shape | | |

## Provenance and spend

From `provenance.md`: <n> owner-attributed lines without a [said] backing (list the ones that matter, with
file:line), <n> money lines without a recorded yes. <"None" is fine when true.>

## Fixes for `redo` (specific, in order, one line each)

1. <file or section>: <what to change so the fault is gone>; proof: <which picture to retake>.
2. ...

## Waiting on Billy (only what a Claude cannot decide)

1. <three-word question, if any>

Sort every fault into one list or the other, never both. **Fixes** (above) are what a session can do from the repo
alone. **Owner-only** items need something only Billy or his client can give: a missing or wrong real photo, a fact or
price to confirm, a client's answer, a direction pick, a sign-in. List them here with what each is for; in the nightly
they also go into verdict.json as `owner_only`. A fix session takes an owner-only section off the page until the
material arrives (it never invents a photo, fact, price, review or quote, and never leaves a placeholder), and the item
goes on Billy's list (`owner_todo` and "Waiting for owner" in STATUS.md).

## VERIFIED / NOT TESTED

- VERIFIED: <what was actually opened and looked at; browsers; widths>
- NOT TESTED: <real phone, Safari/Firefox if not run, login-walled pages, anything skipped>
