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
  alias: {
    "@": path.join(root, "src"),
    "next/link": path.join(here, "shims/link.tsx"),
    "next/navigation": path.join(here, "shims/navigation.ts"),
  },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_SOLANITES_MINT": '""',
    "process.env.NEXT_PUBLIC_SOLANA_RPC_URL": '""',
  },
});

const cssSrc = await readFile(path.join(here, "styles.css"), "utf8");
const css = await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(cssSrc, { from: path.join(here, "styles.css") });

const fonts =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Inter:wght@300..700&family=JetBrains+Mono:wght@400&display=swap";
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
