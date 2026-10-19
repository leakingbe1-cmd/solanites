// Print a composition's audio cues (plus its duration) as JSON for audio.py.
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const comp = await import(pathToFileURL(resolve(process.argv[2])).href);
console.log(JSON.stringify({ duration: comp.DURATION, ...comp.CUES }));
