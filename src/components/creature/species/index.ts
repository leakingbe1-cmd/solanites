import type { Renderer } from "../kit";
import { driftfin, frostkit, glimmeray, mossling, pallow, sproutwyrm } from "./common";
import { cryovant, duskwing, emberlisk, stormquill, vael } from "./rare";
import { aurorath, neonyx, prismara, zephrax } from "./epic";
import { aurelion, aurelith, pyraurum, solvanth } from "./legendary";
import { astravex, eventide, orbelith } from "./mythic";
import { genesis, nullborn } from "./secret";

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
  aurelion,
  solvanth,
  pyraurum,
  aurelith,
  astravex,
  orbelith,
  eventide,
  genesis,
  nullborn,
};
