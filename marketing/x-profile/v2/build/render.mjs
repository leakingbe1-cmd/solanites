// node marketing/x-profile/v2/build/render.mjs : renders avatar A/B and banner 1/2 into ../
import { createRequire } from "node:module"; import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const H = dirname(fileURLToPath(import.meta.url)), require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(join(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright")); }
const b = await pw.chromium.launch({ args: ["--allow-file-access-from-files"] });
const jobs = { avA: ["avatar-A-sigil-400x400.png", 400, 400], avB: ["avatar-B-phoenix-400x400.png", 400, 400], bn1: ["banner-1-wingspan-1500x500.png", 1500, 500], bn2: ["banner-2-centred-1500x500.png", 1500, 500] };
for (const [k, [out, w, h]] of Object.entries(jobs)) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(join(H, "profile-v2.html")).href + "?v=" + k);
  await p.waitForSelector("body[data-ready='1']"); await p.locator("#f").screenshot({ path: join(H, "..", out) }); console.log(out); await p.close();
}
await b.close();
