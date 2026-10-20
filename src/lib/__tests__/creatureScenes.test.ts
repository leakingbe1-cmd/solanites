import { existsSync, readdirSync, readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CreatureScene, type SceneSize } from "@/components/creature/CreatureScene";
import { bodyClip, dilate } from "@/components/creature/IdleArt";
import manifest from "@/data/creatureScenes.json";
import { SCENES, SEALED_SCENE, STAGE_FRAMING, sceneAssets, sceneOf, type Anatomy, type BodyMotion, type PartRig } from "@/lib/creatureScenes";
import { CLASSIFIED_SLOTS, SEALED, SPECIES } from "@/lib/species";

/**
 * Creature scenes (docs/creature-scenes.md): every public species has its own biome and an
 * idle profile its anatomy can actually perform, at all four stages; classified species are
 * never named or given a scene here; missing assets and reduced motion degrade quietly.
 */

const html = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const STAGES = [0, 1, 2, 3];
const SIZES: SceneSize[] = ["card", "quiet", "feature", "detail"];

/** Which whole-body motions each way of moving allows ("rock" is the small Egglings' rocking). */
const BODY_FOR: Record<Anatomy["locomotion"], BodyMotion[]> = {
  walks: ["rock", "breathe", "stalk"],
  stands: ["rock", "breathe", "stalk"],
  crawls: ["rock", "breathe"],
  swims: ["rock", "swim", "glide"],
  glides: ["rock", "glide", "hover"],
  drifts: ["rock", "pulse", "hover"],
  hovers: ["rock", "hover"],
  flies: ["rock", "hover", "glide"],
  coils: ["rock", "coil", "hover", "breathe"],
};

/** Which body part a rig may move, by the anatomy that must have it. */
const PART_NEEDS: Record<PartRig["part"], (a: Anatomy) => boolean> = {
  tail: (a) => !!a.tail,
  ribbon: (a) => !!a.tail,
  wing: (a) => !!a.wings,
  fin: (a) => !!a.fins,
  tendrils: (a) => !!a.tendrils,
  ears: (a) => !!a.ears,
  antlers: (a) => !!a.antlers,
  canopy: (a) => !!a.antlers,
  lure: (a) => !!a.lure,
  crest: (a) => !!a.fins || !!a.wings,
};

describe("catalogue coverage", () => {
  it("every public species has a scene, and the scenes name no other species", () => {
    expect(Object.keys(SCENES).sort()).toEqual(SPECIES.map((s) => s.id).sort());
  });

  it("there are 28 species in all: 22 public scenes plus 6 classified slots on the sealed scene", () => {
    expect(SPECIES.length + CLASSIFIED_SLOTS.length).toBe(28);
    for (const slot of CLASSIFIED_SLOTS) expect(sceneOf(`classified-${slot.dex}`)).toBe(SEALED_SCENE);
    expect(sceneOf(SEALED.mythic.id)).toBe(SEALED_SCENE);
    expect(sceneOf(SEALED.secret.id)).toBe(SEALED_SCENE);
  });

  it("every species has its own environment (no two share a biome)", () => {
    const ids = Object.values(SCENES).map((s) => s.biome.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = Object.values(SCENES).map((s) => s.biome.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("all four stages resolve for every species", () => {
    for (const [id, scene] of Object.entries(SCENES)) {
      expect(scene.idle.stages, id).toHaveLength(4);
      for (const stage of STAGES) expect(sceneOf(id).idle.stages[stage], `${id} ${stage}`).toBeDefined();
    }
    expect(STAGE_FRAMING).toHaveLength(4);
  });
});

describe("idle profiles fit the anatomy", () => {
  for (const [id, scene] of Object.entries(SCENES)) {
    it(`${id}: body motions suit how it moves; parts exist on its body`, () => {
      const allowed = BODY_FOR[scene.anatomy.locomotion];
      scene.idle.stages.forEach((st, n) => {
        expect(allowed, `${id} stage ${n + 1}: ${st.body} for a creature that ${scene.anatomy.locomotion}`).toContain(st.body);
        for (const p of st.parts ?? []) {
          expect(PART_NEEDS[p.part](scene.anatomy), `${id} stage ${n + 1}: ${p.part} on a body without one`).toBe(true);
          expect(p.poly.length % 2, `${id}: polygon pairs`).toBe(0);
          expect(p.poly.every((v) => v >= 0 && v <= 100), `${id}: polygon in the canvas`).toBe(true);
        }
        if (st.glow) expect(scene.anatomy.emissive, `${id} stage ${n + 1}: glow without anatomical light`).toBe(true);
      });
    });
  }

  it("no species is given an incompatible movement (wings only on winged bodies, fins only on finned ones)", () => {
    const wingless = Object.entries(SCENES).filter(([, s]) => !s.anatomy.wings);
    for (const [id, s] of wingless) for (const st of s.idle.stages) expect((st.parts ?? []).some((p) => p.part === "wing"), id).toBe(false);
    const finless = Object.entries(SCENES).filter(([, s]) => !s.anatomy.fins);
    for (const [id, s] of finless) for (const st of s.idle.stages) expect((st.parts ?? []).some((p) => p.part === "fin"), id).toBe(false);
  });

  it("motion stays restrained: small amplitude, slow timing, gentle part angles", () => {
    for (const [id, s] of Object.entries(SCENES)) {
      for (const st of s.idle.stages) {
        expect(st.amp, id).toBeLessThanOrEqual(2);
        expect(st.period, id).toBeGreaterThanOrEqual(3.5);
        expect(st.period, id).toBeLessThanOrEqual(15);
        for (const p of st.parts ?? []) {
          expect(Math.abs(p.deg), `${id} ${p.part}`).toBeLessThanOrEqual(5);
          expect(p.period, `${id} ${p.part}`).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });

  it("evolution is intentional: Egglings move simply, Ascended forms are calmer than Evolved", () => {
    for (const [id, s] of Object.entries(SCENES)) {
      const [egg, , evolved, ascended] = s.idle.stages;
      expect(egg.parts ?? [], `${id} Eggling has no independently moving parts`).toHaveLength(0);
      expect(ascended.period, `${id} Ascended is slower`).toBeGreaterThanOrEqual(evolved.period);
      expect(ascended.amp, `${id} Ascended is no bigger`).toBeLessThanOrEqual(evolved.amp);
    }
  });

  it("the stage framing opens the world as the creature grows", () => {
    for (let i = 1; i < 4; i++) {
      expect(STAGE_FRAMING[i].zoom).toBeLessThan(STAGE_FRAMING[i - 1].zoom);
      expect(STAGE_FRAMING[i].light).toBeGreaterThan(STAGE_FRAMING[i - 1].light);
      expect(STAGE_FRAMING[i].blur).toBeLessThan(STAGE_FRAMING[i - 1].blur);
    }
    // canon QA treats a blur of 40 px or more beside artwork as a glow blob; ours stays far below
    expect(Math.max(...STAGE_FRAMING.map((f) => f.blur))).toBeLessThan(10);
  });
});

describe("assets", () => {
  it("every public species has its 1024 plate on disk", () => {
    for (const s of SPECIES) {
      const a = sceneAssets(s.id);
      expect(a?.plate, s.id).toBe(`/scenes/${s.id}/plate.webp`);
      expect(existsSync(`public${a!.plate}`), s.id).toBe(true);
    }
  });

  it("every stage that pulses has its glow map, and no other stage does", () => {
    for (const [id, scene] of Object.entries(SCENES)) {
      const a = sceneAssets(id)!;
      scene.idle.stages.forEach((st, n) => {
        if (st.glow) expect(a.glow[n] && existsSync(`public${a.glow[n]}`), `${id} ${n + 1}`).toBeTruthy();
        else expect(a.glow[n], `${id} ${n + 1}`).toBeNull();
      });
    }
  });

  it("public/scenes and the manifest hold public species only", () => {
    const publicIds = new Set(SPECIES.map((s) => s.id));
    for (const dir of readdirSync("public/scenes")) expect(publicIds.has(dir), dir).toBe(true);
    for (const id of Object.keys((manifest as { species: Record<string, unknown> }).species)) expect(publicIds.has(id), id).toBe(true);
  });

  it("an unknown species or a missing asset falls back quietly to the generic scene and gradient", () => {
    expect(sceneAssets("not-a-species")).toBeNull();
    expect(sceneOf("not-a-species")).toBe(SEALED_SCENE);
    const fake = { ...SPECIES[0], id: "not-a-species" };
    const out = html(createElement(CreatureScene, { species: fake, stage: 2, size: "detail" }));
    expect(out).toMatch(/data-biome="sealed-vault"/);
    expect(out).not.toMatch(/sl-biome-plate/);
    expect(out).not.toMatch(/sl-idle/);
    // a plate that fails to load is hidden and the biome's gradient shows instead
    expect(readFileSync("src/components/creature/scenes.css", "utf8")).toMatch(/\.sl-biome-plate\[data-missing\]\s*\{\s*display: none;/);
  });
});

describe("rendering", () => {
  for (const s of SPECIES) {
    it(`${s.id}: its biome and idle render at every stage and size`, () => {
      for (const stage of STAGES) {
        for (const size of SIZES) {
          const out = html(createElement(CreatureScene, { species: s, stage, size }));
          expect(out).toContain(`data-biome="${SCENES[s.id].biome.id}"`);
          expect(out).toContain(`data-stage="${stage}"`);
          expect(out).toContain(`/scenes/${s.id}/plate`);
          // the creature's own artwork, untouched, at the same path the rest of the site uses
          expect(out).toContain(`/creatures/${s.id}/${stage + 1}-`);
          expect(out).toContain(`data-body="${SCENES[s.id].idle.stages[stage].body}"`);
          // parts and particles only at the larger sizes
          if (size === "card" || size === "quiet") {
            expect(out).not.toMatch(/data-part=/);
            expect(out).not.toMatch(/sl-mote/);
          }
        }
      }
    });
  }

  it("a classified slot and a silhouette show the sealed vault, still, with no species asset", () => {
    for (const slot of CLASSIFIED_SLOTS) {
      const sealedSpecies = { ...SEALED[slot.rarity], id: `classified-${slot.dex}`, dex: slot.dex };
      const out = html(createElement(CreatureScene, { species: sealedSpecies, stage: 2, size: "card", silhouette: true, sealed: true }));
      expect(out).toMatch(/data-biome="sealed-vault"/);
      expect(out).not.toMatch(/\/scenes\//);
      expect(out).not.toMatch(/sl-idle/);
    }
    const locked = html(createElement(CreatureScene, { species: SPECIES[0], stage: 3, size: "detail", silhouette: true }));
    expect(locked).not.toMatch(/sl-idle/);
  });

  it("a still scene keeps its biome but does not move", () => {
    const out = html(createElement(CreatureScene, { species: SPECIES[0], stage: 3, size: "feature", still: true }));
    expect(out).toMatch(/sl-biome-plate/);
    expect(out).not.toMatch(/sl-idle|sl-mote|data-stir/);
  });

  it("draws no ground, contact shadow, halo, rays, sparkles or aura (canon W1–W2)", () => {
    for (const s of SPECIES) {
      const out = html(createElement(CreatureScene, { species: s, stage: 3, size: "detail" }));
      expect(out).not.toMatch(/<ellipse cx="200" cy="376"/);
      expect(out).not.toMatch(/sl-(aura|halo|backlight|glitch-lines|rays|portrait-floor|portrait-cone)/);
    }
  });
});

describe("motion safety", () => {
  const css = readFileSync("src/components/creature/scenes.css", "utf8");

  it("only transforms and opacity are animated", () => {
    const frames = [...css.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)].map((m) => m[1]);
    expect(frames.length).toBeGreaterThan(10);
    for (const f of frames) {
      const props = [...f.matchAll(/([a-z-]+):/g)].map((m) => m[1]);
      for (const p of props) expect(["transform", "opacity", "translate", "animation-timing-function"]).toContain(p);
    }
  });

  it("reduced motion removes idle movement and particles", () => {
    const block = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toMatch(/\.sl-idle-a, \.sl-idle-b, \.sl-idle-seg, \.sl-idle-glow, \.sl-biome-air\) \{\s*animation: none !important;/);
    expect(block).toMatch(/\.sl-mote \{\s*display: none;/);
  });

  it("scenes off screen hold still", () => {
    expect(css).toMatch(/\.sl-scene:not\(\[data-active\]\)[^{]*\{\s*animation-play-state: paused;/);
  });
});

describe("part geometry", () => {
  it("dilate grows a polygon outward, whatever its winding", () => {
    const cw = dilate([10, 10, 20, 10, 20, 20, 10, 20], 1);
    const ccw = dilate([10, 10, 10, 20, 20, 20, 20, 10], 1);
    expect(cw[0]).toBeLessThan(10);
    expect(cw[4]).toBeGreaterThan(20);
    expect(ccw[0]).toBeLessThan(10);
    expect(ccw[4]).toBeGreaterThan(20);
  });

  it("the body keeps the whole canvas except each part's region", () => {
    const clip = bodyClip([{ part: "tail", poly: [60, 40, 90, 40, 90, 70, 60, 70], hinge: [60, 55], motion: "sway", deg: 2, period: 5 }]);
    expect(clip).toMatch(/^polygon\(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 60% 40%/);
  });
});
