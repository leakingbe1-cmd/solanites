"use client";

import { memo, useEffect, useRef, useState } from "react";
import { CreatureArt } from "@/components/creature/CreatureArt";
import { EggArt } from "@/components/egg/EggArt";
import { gameConfig } from "@/config/gameConfig";
import { RARITIES } from "@/lib/rarity";
import { ELEMENT_GLYPH, SPECIES_BY_ID } from "@/lib/species";

/**
 * Homepage hero showcase: one Solanite's whole lifecycle, on a loop.
 *
 * Egg → hatching → Eggling → Hatchling → Evolved → Ascended, using the
 * project's own artwork: the vector egg (with its real crack stages) and
 * Pyraurum's four drawn forms. The Ascended form is the same phoenix the hero
 * has always shown. Form names come from `gameConfig.evolution`, identity and
 * rarity from the species data. Before hatching the species is not named,
 * matching the game, where it stays sealed until the egg hatches.
 *
 * One timer at a time drives the sequence; it pauses while the showcase is off
 * screen or the tab is hidden. With reduced motion the finished phoenix is
 * shown, still. Without JavaScript the server-rendered egg stays in place.
 */

const SPECIES = SPECIES_BY_ID["pyraurum"];
const RARITY = RARITIES[SPECIES.rarity];
const FORMS = gameConfig.evolution.names;
const LAST_FORM = FORMS.length - 1;

type Phase = { key: string; ms: number; form: number | null; label: string };
const PHASES: Phase[] = [
  { key: "egg", ms: 3000, form: null, label: "Solanite egg" },
  { key: "hatching", ms: 1700, form: null, label: "Hatching" },
  ...FORMS.map((name, i) => ({ key: `form-${i}`, ms: i === LAST_FORM ? 3800 : i === LAST_FORM - 1 ? 2200 : 2000, form: i, label: `${name} form` })),
];
/** Full cycle, for reference: ~14.7 s. */
export const HERO_CYCLE_MS = PHASES.reduce((s, p) => s + p.ms, 0);

const EMBERS = Array.from({ length: 10 }, (_, i) => ({ left: 18 + ((i * 37) % 64), delay: (i * 0.53) % 3.2, size: 2 + (i % 3), dur: 3.2 + (i % 4) * 0.5 }));

export function HeroLifecycle() {
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => setReduced(mq.matches);
    applyMotion();
    mq.addEventListener("change", applyMotion);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.15 });
    if (root.current) io.observe(root.current);
    return () => {
      mq.removeEventListener("change", applyMotion);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
    };
  }, []);

  const running = !reduced && onScreen && tabVisible;

  // One timeout at a time; cleared whenever the phase or running state changes.
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => {
      if (phase === PHASES.length - 1) setCycle((c) => c + 1);
      setPhase((phase + 1) % PHASES.length);
    }, PHASES[phase].ms);
    return () => window.clearTimeout(t);
  }, [phase, running]);

  // Reduced motion: the finished form, still.
  const p = reduced ? PHASES.length - 1 : phase;
  const current = PHASES[p];
  const form = current.form;
  const hatched = form !== null;
  const final = form === LAST_FORM;

  return (
    <div ref={root} className={`mx-auto flex w-full max-w-[min(86vw,540px)] flex-col items-center ${running ? "" : "sl-paused"}`}>
      {/* stage label: above the artwork, never on it */}
      <p
        className="sl-glass flex h-8 items-center gap-2 rounded-full px-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/90"
        data-testid="hero-stage-label"
        data-stage={current.key}
      >
        <span className="h-1.5 w-1.5 rounded-full transition-colors duration-700" style={{ background: final ? RARITY.color : hatched ? "#14f195" : "#9b7bff", boxShadow: `0 0 8px ${final ? RARITY.color : hatched ? "#14f195" : "#9b7bff"}` }} />
        {current.label}
      </p>

      {/* the artwork: fixed square, so nothing shifts between stages */}
      <div
        className="relative mt-3 aspect-square w-full"
        role="img"
        aria-label={
          reduced
            ? `${SPECIES.name}, a ${RARITY.label} ${SPECIES.element} Solanite, in its ${FORMS[LAST_FORM]} form.`
            : `Animation: a Solanite egg hatches and grows through its ${FORMS.join(", ")} forms into ${SPECIES.name}, a ${RARITY.label} phoenix.`
        }
      >
        <Atmosphere final={final} hatching={current.key === "hatching"} />

        {/* egg: the project's vector egg; it cracks fully while hatching */}
        <div
          className={`absolute inset-[11%] transition-[opacity,transform] ease-out ${hatched ? "scale-110 opacity-0 duration-300" : "opacity-100 delay-300 duration-700"}`}
          aria-hidden
        >
          <div className="sl-hero-float h-full w-full">
            <EggPhase hatching={current.key === "hatching"} />
          </div>
        </div>

        {/* the moment it hatches: one brief bloom of light (replays each cycle) */}
        {form === 0 && <div key={cycle} className="sl-hero-flash pointer-events-none absolute inset-[6%] rounded-full" aria-hidden />}

        {/* the four forms, stacked; only the current one is visible */}
        {FORMS.map((name, i) => (
          <div
            key={name}
            className="absolute inset-[2%] transition-[opacity,transform] ease-out"
            // Staggered, not a straight crossfade: the old form is gone before the new one
            // arrives, so two different forms never overlap as a double image.
            style={{
              opacity: form === i ? 1 : 0,
              transform: form === i ? "none" : form !== null && i < form ? "scale(0.96)" : "scale(1.03)",
              transitionDuration: form === i ? "750ms" : "320ms",
              transitionDelay: form === i ? "260ms" : "0ms",
            }}
            aria-hidden
          >
            <div className="sl-hero-float h-full w-full">
              <FormArt stage={i} active={form === i} />
            </div>
          </div>
        ))}
      </div>

      {/* identity: beneath the artwork; the species is only named once it has hatched */}
      <div className="mt-2 flex min-h-[3.25rem] flex-col items-center text-center" data-testid="hero-caption">
        {hatched ? (
          <>
            <p className="font-display text-lg text-white">{SPECIES.name}</p>
            <p className="mt-1 flex flex-wrap items-center justify-center gap-x-2 font-mono text-[11px] text-mist">
              <span>{SPECIES.epithet}</span>
              <span className="text-white/20" aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: RARITY.color }} aria-hidden />
                <span style={{ color: RARITY.color }}>{RARITY.label}</span>
              </span>
              <span className="text-white/20" aria-hidden>·</span>
              <span>
                {ELEMENT_GLYPH[SPECIES.element]} {SPECIES.element}
              </span>
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-lg text-white">A new Solanite</p>
            <p className="mt-1 font-mono text-[11px] text-mist">Species sealed until it hatches</p>
          </>
        )}
      </div>

      {/* lifecycle track: where in the sequence we are (not a control) */}
      <ol className="mt-3 flex items-center gap-1.5 sm:gap-2" aria-label="Lifecycle">
        {["Egg", ...FORMS].map((name, i) => {
          const at = hatched ? (form as number) + 1 : 0;
          return (
            <li key={name} className="flex items-center gap-1.5 sm:gap-2">
              {i > 0 && <span className={`h-px w-3 transition-colors duration-700 sm:w-5 ${i <= at ? "bg-sol-green/60" : "bg-white/10"}`} aria-hidden />}
              <span className={`font-mono text-[9px] uppercase tracking-[0.15em] transition-colors duration-700 sm:text-[10px] sm:tracking-[0.2em] ${i === at ? "text-white" : i < at ? "text-sol-green/70" : "text-white/30"}`}>{name}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* Memoised so the SVGs only re-render when their own props change. */
const FormArt = memo(function FormArt({ stage, active }: { stage: number; active: boolean }) {
  return <CreatureArt species={SPECIES} stage={stage} animated={active} />;
});

const EggPhase = memo(function EggPhase({ hatching }: { hatching: boolean }) {
  return hatching ? <EggArt stage={4} seed={3} inside={SPECIES} /> : <EggArt stage={2} progress={0.4} seed={3} />;
});

/** Light behind the creature: cool while incubating, gold for the final form. */
function Atmosphere({ final, hatching }: { final: boolean; hatching: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <div className="absolute inset-[16%] rounded-full bg-sol-purple/25 blur-[70px] transition-opacity duration-1000" style={{ opacity: final ? 0.25 : 1 }} />
      <div className="absolute inset-[24%] rounded-full bg-sol-blue/20 blur-[60px] transition-opacity duration-1000" style={{ opacity: final ? 0 : hatching ? 1 : 0.7 }} />
      <div className="absolute inset-[14%] rounded-full blur-[80px] transition-opacity duration-1000" style={{ background: `${RARITY.color2}55`, opacity: final ? 1 : 0 }} />
      {/* hatching pulse */}
      <div className={`absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgba(190,170,255,0.55),transparent_65%)] transition-opacity duration-500 ${hatching ? "sl-hero-pulse opacity-100" : "opacity-0"}`} />
      {/* orbit rings, as before */}
      <svg viewBox="0 0 500 500" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="hero-ring" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9945ff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#9945ff" stopOpacity="0.8" />
            <stop offset="1" stopColor="#14f195" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g style={{ transformOrigin: "250px 250px", animation: "sl-spin 40s linear infinite" }}>
          <circle cx="250" cy="250" r="232" fill="none" stroke="url(#hero-ring)" strokeWidth="1" />
          <circle cx="250" cy="18" r="3" fill="#14f195" />
        </g>
        <g style={{ transformOrigin: "250px 250px", animation: "sl-spin 70s linear infinite reverse" }}>
          <circle cx="250" cy="250" r="205" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 10" />
          <circle cx="45" cy="250" r="2" fill="#9945ff" />
        </g>
      </svg>
      {/* golden rays, final form only */}
      <div
        className="sl-hero-rays absolute inset-[4%] rounded-full transition-opacity duration-1000"
        style={{ opacity: final ? 0.55 : 0, background: `repeating-conic-gradient(from 0deg, ${RARITY.color}26 0deg 4deg, transparent 4deg 22deg)`, maskImage: "radial-gradient(circle, #000 18%, transparent 68%)", WebkitMaskImage: "radial-gradient(circle, #000 18%, transparent 68%)" }}
      />
      {/* embers: while hatching and around the final form */}
      <div className="absolute inset-[10%] transition-opacity duration-700" style={{ opacity: final ? 1 : hatching ? 0.7 : 0 }}>
        {EMBERS.map((e, i) => (
          <span
            key={i}
            className="sl-hero-ember absolute bottom-[12%] rounded-full"
            style={{ left: `${e.left}%`, width: e.size, height: e.size, background: final ? RARITY.color : "#c9b8ff", boxShadow: `0 0 6px ${final ? RARITY.color : "#9b7bff"}`, animationDelay: `${e.delay}s`, animationDuration: `${e.dur}s` }}
          />
        ))}
      </div>
    </div>
  );
}
