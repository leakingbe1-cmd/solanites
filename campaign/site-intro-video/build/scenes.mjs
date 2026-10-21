// Scene script for the site intro video. t0/t1 are seconds inside captures/<name>/index.json.
// crop = [x, y, w, h] in the 1920x1080 capture. bar = opacity of the caption gradient (hides page UI behind it).
export const SCENES = [
  { id: "hero", src: "hero", t0: 0.3, t1: 4.8, bar: 0.98, kicker: "Solanites", head: "28 creatures. <i>Sealed</i> in eggs.", sub: "Hatch one. Raise it. Keep it." },
  { id: "odds", card: "odds", dur: 4.5 },
  { id: "collection", src: "collection", t0: 0.4, t1: 6.4, bar: 0.9, kicker: "The Collection", head: "Meet the <i>Collection.</i>", sub: "28 species. Four forms each. Every one with its own lore." },
  { id: "market", src: "market", t0: 5.2, t1: 9.7, crop: [438, 262, 962, 166], frame: true, kicker: "Live charts", head: "Every Solanite follows a <i>live</i> market.", sub: "Charts by TradingView. For game flavour only.", tag: "Market chart · game flavour only" },
  { id: "hatch", src: "hatch", t0: 2.2, t1: 12.0, bar: 0.9, kicker: "The Hatchery", head: "Hatch it. <i>Reveal</i> it.", sub: "Fast track: your first eggs hatch in a minute.", tag: "Hatchery demo · simulated data" },
  { id: "evolution", src: "evolution", t0: 0.9, t1: 6.9, crop: [352, 445, 1216, 540], kicker: "Evolution", head: "One creature. Four <i>forms.</i>", sub: "Eggling, Hatchling, Evolved, Ascended." },
  { id: "leaderboard", src: "leaderboard", t0: 0.2, t1: 3.2, bar: 0.9, kicker: "The Leaderboard", head: "The Keepers' <i>board.</i>", sub: "Most evolved. Longest held. Rarest finds.", tag: "Live soon" },
  { id: "end", card: "end", dur: 4.5 },
];
export const ODDS = [["Common", 40, "#8fb9a0"], ["Rare", 30, "#6f8cff"], ["Epic", 17, "#c47bff"], ["Legendary", 8, "#e8b75c"], ["Mythic", 3.5, "#ff7a8a"], ["Secret", 1.5, "#eee6ff"]];
