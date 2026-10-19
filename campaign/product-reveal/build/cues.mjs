// Print a composition's audio cues (plus its duration) as JSON for audio.py.
//   node cues.mjs main.js [variant]
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const comp = await import(pathToFileURL(resolve(process.argv[2])).href);
const cues = typeof comp.cuesFor === "function" ? comp.cuesFor(process.argv[3]) : { duration: comp.DURATION, ...comp.CUES };
console.log(JSON.stringify(cues));
