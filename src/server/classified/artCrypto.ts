import "server-only";
import { createDecipheriv } from "node:crypto";
import type { StageAsset } from "@/lib/creatureAssets";

/**
 * Classified painted stages are committed only as AES-256-GCM ciphertext (the repository is
 * public), written by `npm run art:build` with CLASSIFIED_ART_KEY. The key lives only in the
 * server environment; without it, or with the wrong one, no painted stage is disclosed and
 * the species keeps its vector art.
 */
export interface SealedStage {
  v: 1;
  /** 12-byte IV, base64. */
  iv: string;
  /** 16-byte GCM tag, base64. */
  tag: string;
  /** Encrypted WebP bytes, base64. */
  data: string;
  alpha: boolean;
}

export function artKey(env: Record<string, string | undefined> = process.env): Buffer | null {
  const raw = env.CLASSIFIED_ART_KEY?.trim();
  if (!raw) return null;
  const key = Buffer.from(raw, "base64");
  return key.length === 32 ? key : null;
}

/** The decrypted stage as an inline image, or null when it can't be opened with this key. */
export function openStage(sealed: SealedStage | null, key: Buffer | null): StageAsset | null {
  if (!sealed || !key || sealed.v !== 1) return null;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(sealed.iv, "base64"));
    decipher.setAuthTag(Buffer.from(sealed.tag, "base64"));
    const webp = Buffer.concat([decipher.update(Buffer.from(sealed.data, "base64")), decipher.final()]);
    const src = `data:image/webp;base64,${webp.toString("base64")}`;
    return { src, thumb: src, alpha: sealed.alpha };
  } catch {
    return null;
  }
}
