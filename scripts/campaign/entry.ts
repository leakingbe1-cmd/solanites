// Browser-side half of `npm run campaign:render`: the Studio's renderer, driven frame by frame.
import { CONTENT_PACK, packMarkdown } from "@/studio/contentPack";
import { MASTER_CREATIVE, generate, defaultInput, graphicData } from "@/studio/copy";
import { AD_DURATION, AD_FPS, CANVAS_FORMATS, FONT_LOADS, SOURCE_DURATION, STILLS, VIDEO_FORMAT_IDS, drawAdFrame, drawEndCard, drawStatic, type CanvasFormatId, type CreativeCopy, type FrameSource, type Graphic } from "@/studio/render/draw";

export interface StillJob {
  file: string;
  kind: "static" | "endcard";
  format: CanvasFormatId;
  graphic: Graphic;
  still: number;
  copy: CreativeCopy;
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

async function frameFrom(src: string): Promise<FrameSource> {
  const img = new Image();
  img.src = src;
  await img.decode();
  return { image: img, width: img.naturalWidth, height: img.naturalHeight };
}

function size(id: CanvasFormatId) {
  const f = CANVAS_FORMATS[id];
  canvas.width = f.w;
  canvas.height = f.h;
}

const intro = generate(defaultInput("intro", "static")).creative;
const stills: StillJob[] = [
  ...CONTENT_PACK.filter((p) => p.asset.kind === "static").map((p) => ({
    file: p.asset.file,
    kind: "static" as const,
    format: p.asset.format,
    graphic: p.asset.graphic ?? "phoenix",
    still: p.asset.still ?? STILLS.wingsRaised,
    copy: { ...MASTER_CREATIVE, ...p.asset.copy },
  })),
  ...(["landscape", "vertical", "square", "portrait"] as const).map((format) => ({
    file: `stills/endcard-${{ landscape: "16x9", vertical: "9x16", square: "1x1", portrait: "4x5" }[format]}.jpg`,
    kind: "endcard" as const,
    format,
    graphic: "stats" as const,
    still: STILLS.wingspan,
    copy: MASTER_CREATIVE,
  })),
  { file: "stills/poster.jpg", kind: "static", format: "poster", graphic: "stats", still: STILLS.wingsRaised, copy: { ...intro, headline: "NOT JUST\nANOTHER *EGG.*", sub: "Hold $SLNT. Earn eggs. Hatch creatures that keep evolving." } },
  { file: "stills/square-1x1.jpg", kind: "static", format: "square", graphic: "stats", still: STILLS.wingspan, copy: { ...intro, headline: "YOUR *SOLANITE*\nIS WAITING.", eyebrow: "" } },
  { file: "stills/portrait-4x5.jpg", kind: "static", format: "portrait", graphic: "rarity", still: STILLS.wingspan, copy: { ...generate(defaultInput("rarity", "static")).creative, url: MASTER_CREATIVE.url } },
  { file: "stills/vertical-9x16.jpg", kind: "static", format: "vertical", graphic: "stages", still: STILLS.wingspan, copy: { ...generate(defaultInput("hatching", "static")).creative, url: MASTER_CREATIVE.url } },
];

const SL = {
  async ready() {
    await Promise.all(FONT_LOADS.map((f) => document.fonts.load(f)));
    return FONT_LOADS.filter((f) => !document.fonts.check(f));
  },
  plan() {
    return { videoFormats: VIDEO_FORMAT_IDS, fps: AD_FPS, duration: AD_DURATION, sourceDuration: SOURCE_DURATION, stills: stills.map(({ copy: _c, ...s }) => s), formats: CANVAS_FORMATS };
  },
  async ad(format: CanvasFormatId, t: number, src: string, type = "image/png") {
    size(format);
    drawAdFrame(ctx, format, t, await frameFrom(src), MASTER_CREATIVE);
    return canvas.toDataURL(type, 0.95);
  },
  async still(i: number, src: string) {
    const job = stills[i];
    size(job.format);
    const frame = await frameFrom(src);
    if (job.kind === "endcard") drawEndCard(ctx, job.format, frame, job.copy);
    else drawStatic(ctx, job.format, job.graphic, frame, job.copy, graphicData());
    return canvas.toDataURL("image/jpeg", 0.93);
  },
  packMarkdown,
};

(window as unknown as { SL: typeof SL }).SL = SL;
