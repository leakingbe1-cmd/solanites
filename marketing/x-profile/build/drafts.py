# Single source for the 2-week warm-up calendar: writes drafts.json (for Typefully) and the calendar in content-plan.md.
import json
M = "media/"
D = [
 (1, "silhouette", "PINNED · teaser thread", [
   ("something is stirring in the eggs.\n\n28 creatures. sealed. waiting for their keepers.\n\nhere's what we can tell you so far 🧵", "banner-1500x500.png"),
   ("every solanite carries a solgem: a fragment of the chain that birthed it.\n\nwhat grows around it is up to fate, and to how long you hold.", M+"W11-lore-solgem.jpg"),
   ("each one grows through four forms.\n\neggling. hatchling. evolved. ascended.\n\npatience is the whole game.", M+"W13-lore-forms.jpg"),
   ("common. rare. epic. legendary.\n\nand some bloodlines we're not showing you yet.\n\nno date. no link. follow so you're here for the first crack.", M+"W12-lore-bloodlines.jpg")], None),
 (1, "silhouette", "D01 · silhouette: Mossling", [("who's inside?\n\nthe first solanite stirs. small, green, in no hurry at all.\n\nname it in the replies.", M+"W01-sil-mossling.jpg")], None),
 (2, "silhouette", "D02 · reveal: Mossling", [("meet mossling. 🌱\n\nthe patient sprout. it grows a little greener with every block its keeper holds.\n\ncommon bloodline. first of 28.", M+"W02-reveal-mossling.jpg")], None),
 (2, "poll", "D02 · POLL: first hatch", [("what are you hoping cracks out of your first egg?\n\n🌱 something small and loyal\n❄️ something cold\n⚡ something loud\n🔥 something that rises again", None)], "Convert to a native X poll before posting: options Small & loyal / Something cold / Something loud / Rises again (24h). Typefully's API can't create polls."),
 (3, "lore", "D03 · lore: the Solgem", [("lore drop 001: the solgem.\n\nevery solanite carries one. a fragment of the chain that birthed it.\n\nwhat grows around it is up to fate, and to how long you hold.", M+"W11-lore-solgem.jpg")], None),
 (4, "silhouette", "D04 · silhouette: Frostkit", [("something cold is coming.\n\nsmall. excitable. breathes weather.\n\nguess it.", M+"W03-sil-frostkit.jpg")], None),
 (4, "bts", "D04 · BTS: the studio (media pending)", [("a peek behind the eggshell: every solanite starts as a sketch, then gets rebuilt in 3D, one bloodline at a time.\n\nfirst model is on the bench. more soon.", None)], "MEDIA PENDING Phase 2: attach the Mossling Blender turntable or a viewport screenshot once approved. Don't post without media."),
 (5, "silhouette", "D05 · reveal: Frostkit", [("meet frostkit. ❄️\n\nlittle glacier. it breathes tiny snowstorms when excited.\n\nit is excited constantly.", M+"W04-reveal-frostkit.jpg")], None),
 (6, "poll", "D06 · POLL: which form", [("four forms. which one are you most excited to see?\n\n🥚 eggling\n🐣 hatchling\n🌿 evolved\n✨ ascended", None)], "Convert to a native X poll before posting: Eggling / Hatchling / Evolved / Ascended (24h)."),
 (6, "lore", "D06 · lore: four forms", [("hold, and it grows.\n\neggling → hatchling → evolved → ascended.\n\nsame creature. four very different moods.", M+"W13-lore-forms.jpg")], None),
 (7, "countdown", "D07 · countdown: eggs warming", [("the eggs are warming.\n\nno date yet. follow so you're here for the first crack.", M+"W14-countdown.jpg")], None),
 (8, "silhouette", "D08 · silhouette: Stormquill", [("hear the wings?\n\na rare one is coming through.", M+"W05-sil-stormquill.jpg")], None),
 (9, "silhouette", "D09 · reveal: Stormquill", [("meet stormquill. ⚡\n\nthunder's courier. every wingbeat finalises a thousand transactions.\n\nprobably.", M+"W06-reveal-stormquill.jpg")], None),
 (9, "bts", "D09 · BTS: 3D turntable (media pending)", [("one full turn. 🌀\n\nfrom flat art to something you could walk around.", None)], "MEDIA PENDING Phase 2: attach the approved Mossling turntable loop (MP4). Don't post without media."),
 (10, "lore", "D10 · lore: bloodlines", [("lore drop 002: the bloodlines.\n\ncommon. rare. epic. legendary.\n\nnot every bloodline is equal, and some we're not showing you yet.", M+"W12-lore-bloodlines.jpg")], None),
 (10, "poll", "D10 · POLL: rarest guess", [("how many bloodlines do you think there really are?\n\n4️⃣ what you see is what you get\n5️⃣ one more hiding\n6️⃣ two more hiding\n❓ you're not telling us", None)], "Convert to a native X poll (24h). Don't confirm the answer in replies."),
 (11, "silhouette", "D11 · silhouette: Neonyx", [("it glows.\n\nepic bloodline. the longer it's held, the brighter it gets.", M+"W07-sil-neonyx.jpg")], None),
 (12, "silhouette", "D12 · reveal: Neonyx", [("meet neonyx. 🏮\n\nthe lantern wyrm. a living lantern fed by conviction.", M+"W08-reveal-neonyx.jpg")], None),
 (12, "countdown", "D12 · countdown: a crack", [("did anyone else hear that?", None)], "Text-only on purpose. Optional: attach a short egg-crack clip from Phase 5 if ready."),
 (13, "silhouette", "D13 · silhouette: Pyraurum", [("it rises again.\n\nlegendary. burns, falls, and comes back brighter.", M+"W09-sil-pyraurum.jpg")], None),
 (13, "poll", "D13 · POLL: name your keeper vibe", [("what kind of keeper are you?\n\n🌱 patient gardener\n⚡ chaos collector\n🔥 legendary hunter\n🥚 just here for the eggs", None)], "Convert to a native X poll (24h)."),
 (14, "silhouette", "D14 · reveal: Pyraurum", [("meet pyraurum. 🔥\n\nphoenix of the golden pyre.\n\nfive down. twenty-three still sleeping.", M+"W10-reveal-pyraurum.jpg")], None),
 (14, "bts", "D14 · BTS: hatch reveal (media pending)", [("what a hatch looks like. 🥚→✨", None)], "MEDIA PENDING Phase 5: attach a Remotion hatch-reveal clip (Common or Rare only: never Mythic/Secret). Don't post without media."),
 (14, "countdown", "D14 · countdown: soon", [("two weeks of whispers. the eggs are almost ready.\n\nthe hatching begins soon.", M+"W14-countdown.jpg")], None),
]
json.dump([{"day": d, "pillar": p, "title": t, "posts": [{"text": x, "media": m} for x, m in posts], "note": n} for d, p, t, posts, n in D], open("drafts.json", "w"), indent=1, ensure_ascii=False)
rows = "\n".join(f"| {d} | {p} | {t.split(' · ',1)[1]} | {', '.join(m.split('/')[-1] for _,m in posts if m) or ('pending' if n and 'PENDING' in n else 'text only')} |" for d, p, t, posts, n in D)
open("build/calendar.md", "w").write(rows + "\n")
print(len(D), "drafts")
