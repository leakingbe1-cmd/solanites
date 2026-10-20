import "server-only";
import { Fragment, isValidElement, type ReactNode } from "react";

/**
 * Serialises a tree of plain SVG elements and pure function components (the creature
 * renderers and their kit) to markup, the same string react-dom/server would produce
 * (checked in src/server/__tests__/classified.test.ts). React Server Components may not
 * import react-dom/server, and the classified art has to be finished on the server so its
 * drawing code never ships to the browser.
 *
 * Deliberately small: no hooks, context, state or event handlers; any of those is an error.
 */
export function svgMarkup(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string") return escape(node);
  if (typeof node === "number" || typeof node === "bigint") return String(node);
  if (Array.isArray(node)) return node.map(svgMarkup).join("");
  if (!isValidElement(node)) throw new Error(`svgMarkup: unsupported node ${String(node)}`);
  const { type } = node;
  const props = node.props as Record<string, unknown> & { children?: ReactNode };
  if (type === Fragment) return svgMarkup(props.children);
  if (typeof type === "function") return svgMarkup((type as (p: unknown) => ReactNode)(props));
  if (typeof type !== "string") throw new Error("svgMarkup: unsupported element type");
  let attrs = "";
  let inner: string | null = null;
  for (const [k, v] of Object.entries(props)) {
    if (k === "children" || k === "key" || k === "ref" || v === null || v === undefined || typeof v === "boolean" || typeof v === "function") continue;
    if (k === "dangerouslySetInnerHTML") {
      inner = String((v as { __html: unknown }).__html ?? "");
      continue;
    }
    const value = k === "style" ? styleText(v as Record<string, unknown>) : String(v);
    if (k === "style" && !value) continue;
    attrs += ` ${attrName(k)}="${escape(value)}"`;
  }
  return `<${type}${attrs}>${inner ?? svgMarkup(props.children)}</${type}>`;
}

/** SVG presentation attributes React writes hyphenated (the rest keep their case, e.g. viewBox). */
const HYPHENATED = new Set(
  "alignmentBaseline baselineShift clipPath clipRule colorInterpolation colorInterpolationFilters dominantBaseline enableBackground fillOpacity fillRule floodColor floodOpacity fontFamily fontSize fontSizeAdjust fontStretch fontStyle fontVariant fontWeight imageRendering letterSpacing lightingColor markerEnd markerMid markerStart paintOrder pointerEvents shapeRendering stopColor stopOpacity strokeDasharray strokeDashoffset strokeLinecap strokeLinejoin strokeMiterlimit strokeOpacity strokeWidth textAnchor textDecoration textRendering transformOrigin unicodeBidi vectorEffect wordSpacing writingMode".split(" "),
);
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

function attrName(k: string): string {
  if (k === "className") return "class";
  if (k === "htmlFor") return "for";
  if (k === "xlinkHref") return "xlink:href";
  if (k === "xmlSpace") return "xml:space";
  return HYPHENATED.has(k) ? kebab(k) : k;
}

/** CSS properties React leaves without a px unit when given a number. */
const UNITLESS = new Set(["opacity", "zIndex", "flex", "flexGrow", "flexShrink", "fontWeight", "lineHeight", "order", "scale", "zoom", "fillOpacity", "floodOpacity", "stopOpacity", "strokeDasharray", "strokeDashoffset", "strokeMiterlimit", "strokeOpacity", "strokeWidth", "animationIterationCount"]);

function styleText(style: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(style)) {
    if (v === null || v === undefined || typeof v === "boolean" || v === "") continue;
    const name = k.startsWith("--") ? k : kebab(k);
    const value = typeof v === "number" && v !== 0 && !UNITLESS.has(k) && !k.startsWith("--") ? `${v}px` : String(v).trim();
    parts.push(`${name}:${value}`);
  }
  return parts.join(";");
}

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" })[c]!);
}
