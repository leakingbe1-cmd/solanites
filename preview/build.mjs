// Bundles the whole site into ONE self-contained HTML file (no Next.js server
// needed) for sharing as a Claude Artifact or opening straight from disk.
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const js = await build({
  entryPoints: [path.join(here, "main.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  logLevel: "warning",
  // Component stylesheets (e.g. creature/scenes.css) are inlined below with the site CSS.
  loader: { ".css": "empty" },
  alias: {
    "@": path.join(root, "src"),
    "next/link": path.join(here, "shims/link.tsx"),
    "next/navigation": path.join(here, "shims/navigation.ts"),
  },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_SOLANITES_MINT": '""',
    "process.env.NEXT_PUBLIC_SOLANA_RPC_URL": '""',
    "process.env.NEXT_PUBLIC_INTRO_VIDEO_BASE": '""',
  },
});

// Plain CSS files that components import directly; Next bundles them, here they're appended.
const COMPONENT_CSS = ["src/components/creature/scenes.css"];
const cssSrc = [await readFile(path.join(here, "styles.css"), "utf8"), ...(await Promise.all(COMPONENT_CSS.map((f) => readFile(path.join(root, f), "utf8"))))].join("\n");
const css = await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(cssSrc, { from: path.join(here, "styles.css") });

const fonts =
  "https://fonts.googleapis.com/css2?family=Unbounded:wght@300..900&family=Inter:wght@300..700&family=JetBrains+Mono:wght@400&display=swap";
const script = js.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");
const html = `<title>Solanites</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fonts}">
<style>${css.css}</style>
<div id="root"></div>
<script>${script}</script>
`;
await mkdir(path.join(here, "dist"), { recursive: true });
const out = path.join(here, "dist", "solanites.html");
await writeFile(out, html);
console.log(`wrote ${out} (${(html.length / 1024).toFixed(0)} KB)`);
