import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";

export function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try { return require("playwright"); } catch {
    const root = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    return require(join(root, "playwright"));
  }
}
