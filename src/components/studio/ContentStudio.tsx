"use client";

import { useEffect, useMemo, useState } from "react";
import { CONTENT_PACK, packMarkdown } from "@/studio/contentPack";
import { CAMPAIGNS, CAMPAIGN_IDS, PLATFORMS, checkContent, defaultInput, generate, type CampaignId, type GeneratedContent, type PlatformId, type StudioInput } from "@/studio/copy";
import { FEATURES, FEATURE_IDS, displayUrl, type FeatureId } from "@/studio/facts";
import { CANVAS_FORMATS, STILLS, type CanvasFormatId, type CreativeCopy, type Graphic } from "@/studio/render/draw";
import { StudioPreview, type PreviewSpec } from "./StudioPreview";
import { CopyButton, Label, Panel, XCount, downloadText, inputCls } from "./studioUi";

type Tab = "create" | "pack" | "assets";

const STILL_OPTIONS: { value: number; label: string }[] = [
  { value: STILLS.wingsRaised, label: "Wings raised (1.7 s)" },
  { value: STILLS.emerging, label: "Emerging (0.5 s)" },
  { value: STILLS.vortex, label: "Fire vortex (4.6 s)" },
  { value: STILLS.wingspan, label: "Full wingspan (8.6 s)" },
];
const GRAPHICS: { value: Graphic | "endcard"; label: string }[] = [
  { value: "phoenix", label: "Phoenix + headline" },
  { value: "stats", label: "Key figures" },
  { value: "species", label: "Species & elements" },
  { value: "rarity", label: "Rarity tiers" },
  { value: "stages", label: "Incubation stages" },
  { value: "cta", label: "Feature list + CTA" },
  { value: "question", label: "Question" },
  { value: "endcard", label: "End card" },
];
const AUDIENCES = ["Crypto gamers", "Digital collectors", "Solana holders", "People new to Solanites"];

export function ContentStudio() {
  const [tab, setTab] = useState<Tab>("create");
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
      <header className="flex flex-col gap-4 border-b border-white/5 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-amber-300/80">Internal · not linked from the site · noindex</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Content Studio</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-mist">Build Phoenix campaign creatives and X drafts from verified project data. Nothing is posted anywhere: copy what you want and post it yourself.</p>
        </div>
        <nav className="flex gap-1 rounded-full border border-white/10 p-1" aria-label="Studio sections">
          {([
            ["create", "Create"],
            ["pack", "X content pack"],
            ["assets", "Campaign assets"],
          ] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-xs tracking-wider transition ${tab === id ? "bg-white/10 text-white" : "text-mist hover:text-white"}`}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <div className="mt-8">{tab === "create" ? <Create /> : tab === "pack" ? <Pack /> : <Assets />}</div>
    </div>
  );
}

// ── Create ──────────────────────────────────────────────────────────────────

function Create() {
  const [input, setInput] = useState<StudioInput>(() => defaultInput("intro", "x-video"));
  const [draft, setDraft] = useState<GeneratedContent>(() => generate(defaultInput("intro", "x-video")));
  const platform = PLATFORMS[input.platform];
  const [format, setFormat] = useState<CanvasFormatId>(platform.formats[0]);
  const [still, setStill] = useState<number>(draft.still);
  const [graphic, setGraphic] = useState<Graphic | "endcard">(draft.graphic);

  const set = <K extends keyof StudioInput>(k: K, v: StudioInput[K]) => setInput((i) => ({ ...i, [k]: v }));
  const run = (next: StudioInput) => {
    const g = generate(next);
    setDraft(g);
    setStill(g.still);
    setGraphic(g.graphic);
  };

  const pickCampaign = (campaign: CampaignId) => {
    const t = CAMPAIGNS[campaign];
    const next = { ...input, campaign, features: [...t.features], cta: t.cta, variant: 0 };
    setInput(next);
    run(next);
  };
  const pickPlatform = (p: PlatformId) => {
    const next = { ...input, platform: p };
    setInput(next);
    setFormat(PLATFORMS[p].formats[0]);
    run(next);
  };
  const toggleFeature = (id: FeatureId) => set("features", input.features.includes(id) ? input.features.filter((f) => f !== id) : [...input.features, id]);

  const setCreative = <K extends keyof CreativeCopy>(k: K, v: CreativeCopy[K]) => setDraft((d) => ({ ...d, creative: { ...d.creative, [k]: v } }));
  const warnings = useMemo(() => checkContent(draft), [draft]);

  const kind: PreviewSpec["kind"] = platform.kind === "video" ? "video" : graphic === "endcard" ? "endcard" : "static";
  const spec = useMemo<PreviewSpec>(
    () => ({ kind, format, graphic: graphic === "endcard" ? "stats" : graphic, still, copy: draft.creative, fileStem: `solanites-${input.campaign}-${format}` }),
    [kind, format, graphic, still, draft.creative, input.campaign],
  );

  const markdown = () =>
    [
      `# ${CAMPAIGNS[input.campaign].label} · ${platform.label}`,
      "",
      `**Headline:** ${draft.headline}`,
      "",
      `**Supporting copy:** ${draft.support}`,
      "",
      `**Feature callouts:** ${draft.callouts.join(" · ")}`,
      "",
      "## X caption",
      "",
      "```text",
      draft.caption,
      "```",
      "",
      "## Thread",
      "",
      ...draft.thread.flatMap((p, i) => [`${i + 1}.`, "", "```text", p, "```", ""]),
      `**CTA:** ${draft.cta}`,
      "",
      `**Hashtags:** ${draft.hashtags.join(" ")}`,
      "",
    ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      {/* controls */}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
        }}
      >
        <Panel title="Campaign">
          <div className="space-y-3">
            <label className="block">
              <Label>Campaign type</Label>
              <select className={inputCls} value={input.campaign} onChange={(e) => pickCampaign(e.target.value as CampaignId)}>
                {CAMPAIGN_IDS.map((id) => (
                  <option key={id} value={id}>{CAMPAIGNS[id].label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <Label>Platform & format</Label>
              <select className={inputCls} value={input.platform} onChange={(e) => pickPlatform(e.target.value as PlatformId)}>
                {Object.values(PLATFORMS).map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </label>
            {platform.formats.length > 1 && (
              <label className="block">
                <Label>Size</Label>
                <select className={inputCls} value={format} onChange={(e) => setFormat(e.target.value as CanvasFormatId)}>
                  {platform.formats.map((f) => (
                    <option key={f} value={f}>{CANVAS_FORMATS[f].label}</option>
                  ))}
                </select>
              </label>
            )}
            {platform.kind === "static" && (
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <Label>Layout</Label>
                  <select className={inputCls} value={graphic} onChange={(e) => setGraphic(e.target.value as Graphic | "endcard")}>
                    {GRAPHICS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <Label>Phoenix frame</Label>
                  <select className={inputCls} value={still} onChange={(e) => setStill(Number(e.target.value))}>
                    {STILL_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Content">
          <div className="space-y-3">
            <label className="block">
              <Label hint="optional · replaces the headline">Main message</Label>
              <input className={inputCls} value={input.message} onChange={(e) => set("message", e.target.value)} placeholder={CAMPAIGNS[input.campaign].headlines[0].replace(/\*/g, "")} />
            </label>
            <label className="block">
              <Label hint="optional">Target audience</Label>
              <input className={inputCls} list="sl-audiences" value={input.audience} onChange={(e) => set("audience", e.target.value)} placeholder="e.g. Digital collectors" />
              <datalist id="sl-audiences">{AUDIENCES.map((a) => <option key={a} value={a} />)}</datalist>
            </label>
            <fieldset>
              <Label hint="the first 3 become callouts">Features to highlight</Label>
              <div className="flex flex-wrap gap-1.5">
                {FEATURE_IDS.map((id) => {
                  const on = input.features.includes(id);
                  const i = input.features.indexOf(id);
                  return (
                    <button key={id} type="button" onClick={() => toggleFeature(id)} title={`${FEATURES[id].line}\nVerified in ${FEATURES[id].source}`} className={`rounded-full border px-2.5 py-1 text-[11px] transition ${on ? "border-amber-300/50 bg-amber-300/10 text-white" : "border-white/10 text-mist hover:text-white"}`}>
                      {on && <span className="mr-1 font-mono text-amber-300">{i + 1}</span>}
                      {FEATURES[id].label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-mist/60">Only features verified in the codebase are offered (hover for the source). The leaderboard, fee claims and payouts are left out on purpose.</p>
            </fieldset>
            <label className="block">
              <Label>Call to action</Label>
              <input className={inputCls} value={input.cta} onChange={(e) => set("cta", e.target.value)} />
            </label>
            <label className="block">
              <Label hint="optional · off for the teaser">Website URL</Label>
              <input className={inputCls} value={input.url} onChange={(e) => set("url", e.target.value)} placeholder="Add once the domain is final" inputMode="url" />
            </label>
            <label className="block">
              <Label hint="optional · used as written">Campaign details</Label>
              <textarea className={`${inputCls} min-h-[72px]`} value={input.details} onChange={(e) => set("details", e.target.value)} placeholder={CAMPAIGNS[input.campaign].note ?? "Dates, events, anything confirmed"} />
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="sl-btn-primary flex-1 rounded-full px-5 py-3 font-display text-[11px] font-semibold tracking-[0.2em] text-white">GENERATE</button>
            <button
              type="button"
              onClick={() => {
                const next = { ...input, variant: input.variant + 1 };
                setInput(next);
                run(next);
              }}
              className="rounded-full border border-white/15 px-4 py-3 text-xs text-mist transition hover:text-white"
            >
              Other wording
            </button>
          </div>
        </Panel>

        <div className="rounded-2xl border border-white/5 p-4 text-[11px] leading-relaxed text-mist/70">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">How copy is generated</p>
          <p className="mt-2">Templates plus verified facts, entirely in the browser. No external API, no cost, no data sent anywhere. AI drafting (for example the Claude API) could be added later; it would need a server-side API key and is billed per token, so it is deliberately not enabled.</p>
        </div>
      </form>

      {/* preview and outputs */}
      <div className="min-w-0 space-y-6">
        <Panel title={`Preview · ${CANVAS_FORMATS[format].label}`}>
          <StudioPreview spec={spec} />
        </Panel>

        <Panel title="Creative text" actions={<span className="text-[11px] text-mist/60">*word* renders in gold</span>}>
          <div className="grid gap-3 sm:grid-cols-2">
            {kind === "video" ? (
              <>
                <TextField label="Opening hook (0–2 s)" value={draft.creative.hook} onChange={(v) => setCreative("hook", v)} />
                <TextField label="End screen line" value={draft.creative.tagline} onChange={(v) => setCreative("tagline", v)} />
                {[0, 1, 2].map((i) => (
                  <TextField key={i} label={`Callout ${i + 1}`} value={draft.creative.callouts[i] ?? ""} onChange={(v) => setCreative("callouts", [0, 1, 2].map((j) => (j === i ? v : draft.creative.callouts[j] ?? "")))} />
                ))}
              </>
            ) : (
              <>
                <TextField label="Eyebrow" value={draft.creative.eyebrow} onChange={(v) => setCreative("eyebrow", v)} />
                <TextField label="Headline" value={draft.creative.headline} onChange={(v) => setCreative("headline", v)} />
                <TextField label="Supporting line" value={draft.creative.sub} onChange={(v) => setCreative("sub", v)} />
                {kind === "endcard" && <TextField label="End card line" value={draft.creative.tagline} onChange={(v) => setCreative("tagline", v)} />}
              </>
            )}
            <TextField label="Button" value={draft.creative.cta} onChange={(v) => setCreative("cta", v)} />
            <TextField label="URL shown" value={draft.creative.url} onChange={(v) => setCreative("url", displayUrl(v))} placeholder="none" />
          </div>
        </Panel>

        {(warnings.length > 0 || draft.notes.length > 0) && (
          <div className="space-y-2">
            {warnings.map((w) => (
              <p key={w.match + w.reason} className="rounded-xl border border-rose-400/30 bg-rose-400/5 px-4 py-3 text-xs leading-relaxed text-rose-200">
                <span className="font-semibold">“{w.match}”</span>: {w.reason}
              </p>
            ))}
            {draft.notes.map((n) => (
              <p key={n} className="rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-xs leading-relaxed text-amber-100/80">{n}</p>
            ))}
          </div>
        )}

        <Panel title="Copy" actions={<button type="button" onClick={() => downloadText(markdown(), `solanites-${input.campaign}-${input.platform}.md`)} className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-white">Download .md</button>}>
          <div className="space-y-4">
            <Row label="Headline" text={draft.headline} />
            <Row label="Supporting copy" text={draft.support} />
            <Row label="Feature callouts" text={draft.callouts.join("\n")} />
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Label>X caption</Label>
                <div className="flex items-center gap-2">
                  <XCount text={draft.caption} />
                  <CopyButton text={draft.caption} />
                </div>
              </div>
              <textarea className={`${inputCls} min-h-[150px] font-sans leading-relaxed`} value={draft.caption} onChange={(e) => setDraft((d) => ({ ...d, caption: e.target.value }))} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Label>Thread · {draft.thread.length} posts</Label>
                <CopyButton text={draft.thread.join("\n\n---\n\n")} label="Copy all" />
              </div>
              <ol className="space-y-2">
                {draft.thread.map((p, i) => (
                  <li key={i} className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] text-mist/60">{i + 1}/{draft.thread.length}</span>
                      <div className="flex items-center gap-2">
                        <XCount text={p} />
                        <CopyButton text={p} />
                      </div>
                    </div>
                    <textarea className="w-full resize-y bg-transparent text-sm leading-relaxed text-white focus:outline-none" rows={Math.min(8, p.split("\n").length + 1)} value={p} onChange={(e) => setDraft((d) => ({ ...d, thread: d.thread.map((x, j) => (j === i ? e.target.value : x)) }))} />
                  </li>
                ))}
              </ol>
            </div>
            <Row label="Final call to action" text={draft.cta} />
            <Row label="Hashtags" text={draft.hashtags.join(" ")} />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Row({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <CopyButton text={text} />
      </div>
      <p className="whitespace-pre-line rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-sm text-white">{text || <span className="text-mist/50">none</span>}</p>
    </div>
  );
}

// ── Manifest of rendered files ──────────────────────────────────────────────

interface Manifest {
  generatedAt: string;
  videos: { file: string; format: CanvasFormatId; width: number; height: number; duration: number; audio: boolean; bytes: number }[];
  stills: { file: string; format: CanvasFormatId; kind: string; width: number; height: number; bytes: number }[];
}

function useManifest() {
  const [m, setM] = useState<Manifest | null | "missing">(null);
  useEffect(() => {
    fetch("/campaign/manifest.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : "missing"))
      .then(setM)
      .catch(() => setM("missing"));
  }, []);
  return m;
}
const mb = (b: number) => `${(b / 1e6).toFixed(1)} MB`;

// ── Content pack ────────────────────────────────────────────────────────────

function Pack() {
  const m = useManifest();
  const has = (file: string) => m && m !== "missing" && [...m.videos, ...m.stills].some((x) => x.file === file);
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-sm leading-relaxed text-mist">Eight drafts for the Phoenix teaser, in posting order. Every figure is read from the game config. No links are included while the domain is changing; add one in a reply or the profile when it's final.</p>
        <button type="button" onClick={() => downloadText(packMarkdown(), "solanites-x-content-pack.md")} className="rounded-full border border-white/15 px-4 py-2 text-xs tracking-wider text-white hover:border-white/35">
          Download pack (.md)
        </button>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {CONTENT_PACK.map((p) => {
          const src = `/campaign/${p.asset.file}`;
          const ready = has(p.asset.file);
          return (
            <article key={p.id} className="sl-glass flex flex-col overflow-hidden rounded-2xl">
              <div className="relative aspect-video bg-black">
                {ready ? (
                  p.asset.kind === "video" ? (
                    <video src={src} controls playsInline preload="metadata" className="h-full w-full object-contain" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={p.asset.description} className="h-full w-full object-cover" loading="lazy" />
                  )
                ) : (
                  <div className="grid h-full place-items-center px-6 text-center font-mono text-[11px] text-mist">{m === null ? "Loading…" : "Not rendered yet: run npm run campaign:render"}</div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-display text-base font-semibold text-white">
                    <span className="mr-2 font-mono text-xs text-amber-300/80">{String(p.n).padStart(2, "0")}</span>
                    {p.title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist/60">{p.slot}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-mist"><span className="text-white/70">Objective:</span> {p.objective}</p>
                <p className="mt-1 text-xs leading-relaxed text-mist"><span className="text-white/70">Creative:</span> {p.asset.description}</p>
                <p className="mt-1 text-xs text-mist"><span className="text-white/70">CTA:</span> {p.cta}</p>
                <pre className="mt-3 flex-1 whitespace-pre-wrap rounded-xl border border-white/8 bg-white/[0.02] p-3 font-sans text-sm leading-relaxed text-white">{p.caption}</pre>
                {p.poll && <p className="mt-2 text-xs text-mist"><span className="text-white/70">Optional poll:</span> {p.poll.join(" · ")}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CopyButton text={p.caption} label="Copy caption" />
                  {p.thread && <CopyButton text={p.thread.join("\n\n---\n\n")} label={`Copy thread (${p.thread.length})`} />}
                  {ready && (
                    <a href={src} download className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-white">
                      Download asset
                    </a>
                  )}
                  <span className="ml-auto"><XCount text={p.caption} /></span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ── Assets ──────────────────────────────────────────────────────────────────

function Assets() {
  const m = useManifest();
  if (m === null) return <p className="text-sm text-mist">Loading…</p>;
  if (m === "missing")
    return (
      <p className="text-sm text-mist">
        No rendered campaign yet. Run <code className="font-mono text-white">npm run campaign:render</code> to create the adverts and stills in <code className="font-mono">public/campaign/</code>.
      </p>
    );
  return (
    <div className="space-y-10">
      <p className="text-xs text-mist/70">Rendered {new Date(m.generatedAt).toLocaleString()} from the Runway Phoenix clip with the master campaign copy. Every file below was checked with ffprobe after rendering.</p>
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Video adverts</h2>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {m.videos.map((v) => (
            <figure key={v.file} className="sl-glass rounded-2xl p-3">
              <div className="grid place-items-center overflow-hidden rounded-xl bg-black" style={{ aspectRatio: "9 / 12" }}>
                <video src={`/campaign/${v.file}`} controls playsInline preload="metadata" className="max-h-full max-w-full" style={{ aspectRatio: `${v.width} / ${v.height}` }} />
              </div>
              <figcaption className="mt-3 flex items-center justify-between gap-2 text-xs">
                <span className="text-white">{CANVAS_FORMATS[v.format].label.split(" · ")[0]} <span className="text-mist">· {v.duration.toFixed(1)} s · {mb(v.bytes)}{v.audio ? "" : " · no audio"}</span></span>
                <a href={`/campaign/${v.file}`} download className="rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-white">MP4</a>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-white">Stills, end cards and poster</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {m.stills.map((s) => (
            <figure key={s.file} className="sl-glass rounded-2xl p-2.5">
              <a href={`/campaign/${s.file}`} target="_blank" rel="noreferrer" className="grid place-items-center overflow-hidden rounded-lg bg-black" style={{ aspectRatio: "1 / 1" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/campaign/${s.file}`} alt={s.file} loading="lazy" className="max-h-full max-w-full" />
              </a>
              <figcaption className="mt-2 flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate text-mist" title={s.file}>{s.file.replace("stills/", "")}</span>
                <a href={`/campaign/${s.file}`} download className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-white">↓ {s.width}×{s.height}</a>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
      <p className="text-xs text-mist/60">Source: <a className="underline" href="/campaign/phoenix-source.mp4" download>phoenix-source.mp4</a> (Runway, 1280×720, 10.1 s). Not regenerated: every asset is composed from this clip.</p>
    </div>
  );
}
