"use client";

import { useEffect, useRef, useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { gameConfig } from "@/config/gameConfig";
import { formatSpan } from "@/lib/format";
import { FIRST_MATURITY_MS, formUnlockText } from "@/lib/progression";
import { RARITIES } from "@/lib/rarity";
import { ELEMENT_GLYPH, SPECIES_BY_ID } from "@/lib/species";

/**
 * Homepage evolution showcase: one species at a time, laid out across its four
 * forms, each sitting above the holding milestone that unlocks it. Timings and
 * form names come straight from `gameConfig.evolution`, so the copy can never
 * drift from the rules the tracker applies.
 *
 * Featured species span Common → Legendary and different body plans. Mythic
 * and Secret species stay classified, as everywhere else on the landing page.
 */
const FEATURED = ["mossling", "emberlisk", "cryovant", "neonyx", "aurelion", "velynx"] as const;

const FORMS = gameConfig.evolution.names;
const AFTER = gameConfig.evolution.afterMaturityMs;
const LAST = FORMS.length - 1;
const STEP_MS = 2600;

/** For a first creature: grown at 1 min, then later forms counted from maturity ("+30 min", "+2 h"). */
function whenLabel(i: number) {
  return i === 0 ? "At hatch" : i === 1 ? formatSpan(FIRST_MATURITY_MS) : `+${formatSpan(AFTER[i - 2])}`;
}

export function EvolutionShowcase() {
  const [pick, setPick] = useState(0);
  const [stage, setStage] = useState(0);
  // Auto-play only starts once we know motion is welcome and the panel is on screen.
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const picker = useRef<HTMLDivElement>(null);

  const species = SPECIES_BY_ID[FEATURED[pick]];
  const rarity = RARITIES[species.rarity];

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(true);
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !visible || hovered) return;
    const t = window.setTimeout(() => {
      if (stage < LAST) setStage(stage + 1);
      else {
        setPick((pick + 1) % FEATURED.length);
        setStage(0);
      }
    }, stage === LAST ? STEP_MS * 1.6 : STEP_MS);
    return () => window.clearTimeout(t);
  }, [playing, visible, hovered, stage, pick]);

  // Keep the current species' chip in view in the (scrollable, on phones) picker,
  // without scrolling the page itself.
  useEffect(() => {
    const row = picker.current;
    const chip = row?.children[pick] as HTMLElement | undefined;
    if (!row || !chip) return;
    const left = chip.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + chip.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollTo({ left: left - 8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }, [pick]);

  // Any direct choice hands control to the visitor.
  const chooseSpecies = (i: number) => {
    setPlaying(false);
    setPick(i);
  };
  const chooseStage = (i: number) => {
    setPlaying(false);
    setStage(i);
  };

  return (
    <div
      ref={root}
      className="mt-14 overflow-hidden rounded-[2rem] border border-white/[0.07] bg-gradient-to-b from-white/[0.035] to-white/[0.01]"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* ── species picker ── */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-6">
        <div
          ref={picker}
          role="group"
          aria-label="Choose a species"
          className="sl-scrollbar-none relative -my-1 flex flex-1 gap-2 overflow-x-auto py-1 pr-6 max-lg:[mask-image:linear-gradient(90deg,#000_80%,transparent)]"
        >
          {FEATURED.map((id, i) => {
            const s = SPECIES_BY_ID[id];
            const c = RARITIES[s.rarity].color;
            const on = i === pick;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => chooseSpecies(i)}
                className={`flex shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green/70 ${
                  on ? "border-white/20 bg-white/[0.07] text-bone" : "border-transparent text-mist hover:bg-white/[0.04] hover:text-bone"
                }`}
                style={on ? { boxShadow: `inset 0 0 0 1px ${c}66, inset 0 0 14px -6px ${c}` } : undefined}
              >
                <span className="h-9 w-9 shrink-0" aria-hidden>
                  <CreatureArt species={s} stage={2} animated={false} showAura={false} />
                </span>
                <span className="text-[13px] leading-none">{s.name}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause the evolution tour" : "Play the evolution tour"}
          title={playing ? "Pause" : "Play"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-mist transition hover:border-white/25 hover:text-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green/70"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
            {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l10.5-6.5z" />}
          </svg>
        </button>
      </div>

      {/* ── the forms ── */}
      <div className="relative px-4 pt-8 sm:px-8 sm:pt-10">
        {/* backlight in the species' rarity colours, centred under the current form */}
        <div
          className="pointer-events-none absolute top-10 h-64 w-64 -translate-x-1/2 rounded-full opacity-50 blur-[80px] transition-[left,background-color] duration-700 ease-out max-md:left-1/2"
          style={{ left: `${12.5 + stage * 25}%`, background: rarity.color2 }}
          aria-hidden
        />

        {/* phones and small tablets: the current form, large */}
        <div key={`${species.id}-${stage}`} className="sl-fade-in relative mx-auto aspect-square w-full max-w-[19rem] md:hidden">
          <CreatureArt species={species} stage={stage} />
        </div>

        {/* tablets and up: all four forms in a row, each above its milestone */}
        <div className="relative hidden grid-cols-4 items-end md:grid" aria-hidden>
          {FORMS.map((form, i) => {
            const on = i === stage;
            const reached = i <= stage;
            return (
              <div
                key={`${species.id}-${form}`}
                className="relative mx-auto aspect-square w-full max-w-[15rem] transition-[opacity,filter,transform] duration-700 ease-out"
                style={{
                  opacity: on ? 1 : reached ? 0.62 : 0.28,
                  filter: on ? "none" : reached ? "saturate(0.7)" : "saturate(0.15) brightness(0.7)",
                  transform: on ? "translateY(-6px) scale(1.04)" : "none",
                }}
              >
                <CreatureArt species={species} stage={i} animated={on} showAura={on} />
              </div>
            );
          })}
        </div>
        <div className="mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden />
      </div>

      {/* ── milestone track (the stage control) ── */}
      <div className="px-1.5 pb-8 pt-6 min-[400px]:px-4 sm:px-8">
        <ol className="relative grid grid-cols-4" aria-label={`${species.name}'s forms`}>
          <span className="absolute left-[12.5%] right-[12.5%] top-[10px] h-px bg-white/10" aria-hidden>
            <span
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-sol-purple via-sol-blue to-sol-green transition-[width] duration-700 ease-out"
              style={{ width: `${(stage / LAST) * 100}%` }}
            />
          </span>
          {FORMS.map((form, i) => {
            const on = i === stage;
            const reached = i <= stage;
            return (
              <li key={form} className="relative flex justify-center">
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={`${form}, ${formUnlockText(i, gameConfig).toLowerCase()}`}
                  onClick={() => chooseStage(i)}
                  className="group flex flex-col items-center rounded-xl px-1 pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sol-green/70"
                >
                  <span
                    className={`relative grid h-[21px] w-[21px] place-items-center rounded-full border transition-colors duration-500 ${
                      reached ? "border-sol-green/70 bg-void" : "border-white/15 bg-void group-hover:border-white/35"
                    }`}
                    aria-hidden
                  >
                    <span className={`h-2 w-2 rounded-full transition-all duration-500 ${on ? "scale-100 bg-sol-green shadow-[0_0_12px_#14f195]" : reached ? "scale-75 bg-sol-green/60" : "scale-50 bg-white/20"}`} />
                  </span>
                  <span className={`mt-3 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.14em] transition-colors sm:text-[10px] sm:tracking-[0.3em] ${on ? "text-sol-green" : "text-mist/60"}`}>{whenLabel(i)}</span>
                  <span className={`mt-1 whitespace-nowrap font-display text-[11px] transition-colors min-[360px]:text-[12px] min-[400px]:text-[13px] sm:text-base ${on ? "text-bone" : "text-mist group-hover:text-bone"}`}>{form}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* caption: announced only when the visitor is in control, not on every auto-play step */}
        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm text-mist" aria-live={playing ? "off" : "polite"}>
          <span className="font-display text-bone">{species.name}</span>
          <span className="text-bone/20" aria-hidden>·</span>
          <span>{species.epithet}</span>
          <span className="text-bone/20" aria-hidden>·</span>
          <span className="whitespace-nowrap">
            <span style={{ color: rarity.color }}>{rarity.label}</span> {ELEMENT_GLYPH[species.element]} {species.element}
          </span>
          <span className="sr-only">, shown in its {FORMS[stage]} form</span>
        </p>
      </div>
    </div>
  );
}
