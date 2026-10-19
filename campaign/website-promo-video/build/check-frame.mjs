// Fails if any visible text runs outside the frame, or two visible text blocks overlap, at sampled times.
import { createRequire } from "node:module"; import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path"; import { fileURLToPath, pathToFileURL } from "node:url";
const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
let pw; try { pw = require("playwright"); } catch { pw = require(join(execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright")); }
const b = await pw.chromium.launch({ args: ["--allow-file-access-from-files"] });
const problems = [];
for (const [ratio, w, h] of [["16x9", 1920, 1080], ["9x16", 1080, 1920], ["1x1", 1080, 1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(join(HERE, "promo.html")).href + `?ratio=${ratio}`);
  await p.waitForSelector("body[data-ready='1']", { timeout: 60000 });
  for (let t = 0; t < 27; t += 0.25) {
    await p.evaluate(t => window.render(t), t);
    const r = await p.evaluate(([W, H]) => {
      const op = e => { let o = 1; for (let n = e; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === "none" || cs.visibility === "hidden") return 0; o *= +cs.opacity; } return o; };
      const els = [...document.querySelectorAll(".h, .kicker, .label, .name, .sub, .tag")].filter(e => e.textContent.trim() && op(e) > .35);
      const out = [];
      const rects = els.map(e => { const rg = document.createRange(); rg.selectNodeContents(e); return [e, [...rg.getClientRects()].filter(x => x.width > 2)]; });
      for (const [e, rs] of rects) for (const x of rs) if (x.left < -1 || x.right > W + 1 || x.top < -1 || x.bottom > H + 1) out.push(`outside frame: "${e.textContent.trim().slice(0, 30)}"`);
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
        if (rects[i][0].contains(rects[j][0]) || rects[j][0].contains(rects[i][0])) continue;
        for (const a of rects[i][1]) for (const c of rects[j][1]) if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) out.push(`overlap: "${rects[i][0].textContent.trim().slice(0, 24)}" / "${rects[j][0].textContent.trim().slice(0, 24)}"`);
      }
      return [...new Set(out)];
    }, [w, h]);
    r.forEach(x => problems.push(`${ratio} @${t.toFixed(2)}s ${x}`));
  }
  await p.close();
}
await b.close();
if (problems.length) { console.error([...new Set(problems)].join("\n")); process.exit(1); }
console.log("text layout: nothing outside the frame, no overlapping text (sampled every 0.25 s, all ratios)");
