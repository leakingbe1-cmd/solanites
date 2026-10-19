// Render the 4:5 poster (1440×1800) to export/solanites-promo-poster-4x5.jpg
import { createRequire } from "node:module"; import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(join(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright")); }
const b = await pw.chromium.launch({ args: ["--allow-file-access-from-files"] });
const p = await b.newPage({ viewport: { width: 1440, height: 1800 } });
await p.goto(pathToFileURL(join(HERE, "poster.html")).href);
await p.waitForSelector("body[data-ready='1']");
const out = join(HERE, "..", "export", "solanites-promo-poster-4x5-1440x1800.jpg");
await p.locator("#stage").screenshot({ path: out, type: "jpeg", quality: 94 });
await b.close();
console.log("wrote", out);
