import { sealed } from "./sealed";
import type { Renderer } from "../kit";
import { aurelion } from "./aurelion";
import { aurelith } from "./aurelith";
import { aurorath } from "./aurorath";
import { cryovant } from "./cryovant";
import { driftfin } from "./driftfin";
import { duskwing } from "./duskwing";
import { emberlisk } from "./emberlisk";
import { frostkit } from "./frostkit";
import { glimmeray } from "./glimmeray";
import { mossling } from "./mossling";
import { neonyx } from "./neonyx";
import { nyxara } from "./nyxara";
import { pallow } from "./pallow";
import { prismara } from "./prismara";
import { pyraurum } from "./pyraurum";
import { solvanth } from "./solvanth";
import { sproutwyrm } from "./sproutwyrm";
import { stormquill } from "./stormquill";
import { thalor } from "./thalor";
import { vael } from "./vael";
import { velynx } from "./velynx";
import { zephrax } from "./zephrax";

/**
 * One renderer per public species id — every Solanite has its own body plan. Classified
 * (Mythic and Secret) renderers are server only (src/server/classified/renderers); their
 * art reaches the browser as finished markup, and only for a viewer entitled to it
 * (registerClassifiedArt). Anything else falls back to the generic sealed form.
 */
export const RENDERERS: Record<string, Renderer> = {
  mossling,
  driftfin,
  pallow,
  glimmeray,
  sproutwyrm,
  frostkit,
  "abyssal-vael": vael,
  stormquill,
  duskwing,
  cryovant,
  emberlisk,
  neonyx,
  aurorath,
  zephrax,
  prismara,
  nyxara,
  aurelion,
  solvanth,
  pyraurum,
  aurelith,
  velynx,
  thalor,
};

/** Server-rendered art for a classified species, sent only to a viewer entitled to it. */
export interface ClassifiedArt {
  /** Body markup per stage (0..3); every gradient reference uses ART_ID_TOKEN in place of the instance id. */
  stages: [string, string, string, string];
  floating?: boolean;
  fit?: number;
  stageFit?: [number, number, number, number];
  shadow?: number;
  halo?: [number, number, number];
}

/** Stands in for the per-instance SVG id inside server-rendered classified art. */
export const ART_ID_TOKEN = "__SLID__";

/** Makes a classified species drawable in this browser, from art the server sent. */
export function registerClassifiedArt(id: string, art: ClassifiedArt): void {
  const { stages, ...shape } = art;
  RENDERERS[id] = {
    ...shape,
    render: (c) => <g dangerouslySetInnerHTML={{ __html: stages[c.evo].split(ART_ID_TOKEN).join(c.id) }} />,
  };
}

/** The renderer for an id: its own, or the generic sealed form for anything classified. */
export function rendererFor(id: string): Renderer {
  return RENDERERS[id] ?? sealed;
}
