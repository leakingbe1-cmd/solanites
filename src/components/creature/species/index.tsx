import type { Renderer } from "../kit";
import { sealed } from "./sealed";
import { astravex } from "./astravex";
import { aurelion } from "./aurelion";
import { aurelith } from "./aurelith";
import { aurorath } from "./aurorath";
import { cryovant } from "./cryovant";
import { driftfin } from "./driftfin";
import { duskwing } from "./duskwing";
import { emberlisk } from "./emberlisk";
import { eventide } from "./eventide";
import { frostkit } from "./frostkit";
import { genesis } from "./genesis";
import { glimmeray } from "./glimmeray";
import { helivane } from "./helivane";
import { mossling } from "./mossling";
import { neonyx } from "./neonyx";
import { nullborn } from "./nullborn";
import { nyxara } from "./nyxara";
import { orbelith } from "./orbelith";
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

/** One renderer per species id — every Solanite has its own body plan. */
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
  astravex,
  orbelith,
  eventide,
  helivane,
  genesis,
  nullborn,
};

/** The renderer for an id, or the plain seal-stone for an id with none (never a crash). */
export function rendererFor(id: string): Renderer {
  return Object.hasOwn(RENDERERS, id) ? RENDERERS[id] : sealed;
}
