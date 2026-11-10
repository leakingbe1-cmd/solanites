// Finds a Playwright install for the manager scripts without forcing every repo to add it.
// Order: the current repo (node_modules or qa/node_modules), this skill's scripts folder, northcut-hq tools/manager,
// then MANAGER_PLAYWRIGHT (a folder whose node_modules has playwright). Prints how to fix it when none is found.
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export function loadPlaywright() {
  const candidates = [
    process.cwd(),
    join(process.cwd(), 'qa'),
    here,
    resolve(here, '../../../../tools/manager'),            // northcut-hq, when the skill lives in .claude/skills/manager
    process.env.MANAGER_PLAYWRIGHT || '',
    'C:/Users/billb/Documents/northcut-hq/tools/manager', // owner's PC
    'C:/Users/billb/Documents/launch-kit/tools/manager',
  ].filter(Boolean);
  for (const dir of candidates) {
    if (!existsSync(join(dir, 'node_modules', 'playwright'))) continue;
    try { return createRequire(join(dir, 'noop.js'))('playwright'); } catch { /* try the next one */ }
  }
  console.error('playwright not found. Run once:  npm install --prefix tools/manager  (in northcut-hq)  or  npm i -D playwright  in this repo,\n'
    + 'then once per PC: npx playwright install chromium webkit firefox. Or set MANAGER_PLAYWRIGHT=<folder with node_modules/playwright>.');
  process.exit(2);
}

/** Launch options the owner's Windows 10 PC needs (Firefox content sandbox crashes tabs there). */
export function launchOptions(name) {
  return name === 'firefox' && process.platform === 'win32' ? { env: { ...process.env, MOZ_DISABLE_CONTENT_SANDBOX: '1' } } : {};
}
