import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { gameConfig } from "@/config/gameConfig";
import { stageAsset } from "@/lib/creatureAssets";
import { shortAddress } from "@/lib/format";
import { RARITIES } from "@/lib/rarity";
import { SPECIES_BY_ID } from "@/lib/species";

export const CARD_SIZE = { width: 1200, height: 630 };

/**
 * The stage art as a PNG data URL (the 384 px thumbnail from /public), or null when none is supplied.
 * The image renderer can't decode WebP, so sharp converts it.
 */
async function artDataUrl(speciesId: string, stage: number): Promise<string | null> {
  const asset = stageAsset(speciesId, stage);
  if (!asset) return null;
  try {
    const file = path.join(process.cwd(), "public", asset.thumb.replace(/^\//, ""));
    const png = await sharp(await readFile(file)).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * A 1200×630 share card: the creature's art, name, rarity and form, the keeper's short address
 * (real cards) or a DEMO stamp (demo cards), and $SLNT. Inputs are checked by the caller.
 */
export async function renderCard({ speciesId, stage, keeper, demo }: { speciesId: string; stage: number; keeper?: string; demo: boolean }): Promise<ImageResponse> {
  const s = SPECIES_BY_ID[speciesId];
  const rarity = RARITIES[s.rarity];
  const art = await artDataUrl(speciesId, stage);
  const form = gameConfig.evolution.names[stage];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #07070d 0%, #11111c 60%, #07070d 100%)", color: "#efe9dc", fontFamily: "sans-serif", position: "relative" }}>
        <div style={{ display: "flex", width: 630, height: 630, alignItems: "center", justifyContent: "center", position: "relative" }}>
          <div style={{ position: "absolute", width: 460, height: 460, borderRadius: 460, background: `radial-gradient(circle, ${rarity.color}55 0%, transparent 70%)`, display: "flex" }} />
          {art ? <img src={art} width={460} height={460} style={{ objectFit: "contain" }} alt="" /> : <div style={{ display: "flex", fontSize: 40, color: "#8b8a99" }}>{s.name}</div>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px 0 8px", width: 570 }}>
          <div style={{ display: "flex", fontSize: 22, letterSpacing: 6, color: rarity.color, textTransform: "uppercase" }}>{rarity.label}</div>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 600, marginTop: 10, lineHeight: 1 }}>{s.name}</div>
          <div style={{ display: "flex", fontSize: 30, marginTop: 16, color: "#b9b6c6" }}>{form} form</div>
          <div style={{ display: "flex", fontSize: 24, marginTop: 40, color: "#8b8a99" }}>{demo ? "Hatched in the Solanites demo" : `Kept by ${shortAddress(keeper ?? "")}`}</div>
          <div style={{ display: "flex", fontSize: 26, marginTop: 36, color: "#efe9dc" }}>Solanites · hold {gameConfig.token.symbol} on Solana</div>
        </div>
        {demo && (
          <div style={{ position: "absolute", top: 32, right: 40, display: "flex", padding: "8px 22px", border: "2px solid #fcd34d", borderRadius: 999, color: "#fcd34d", fontSize: 24, letterSpacing: 6 }}>DEMO · SIMULATED</div>
        )}
      </div>
    ),
    CARD_SIZE,
  );
}
