import { useSyncExternalStore } from "react";

/**
 * In-memory router for the single-file preview build. The current page is
 * mirrored to a bare `#hatchery`-style anchor so links can deep-link.
 */
const ROUTES = ["/", "/hatchery", "/collection", "/how-it-works", "/leaderboard"];

function fromHash(): string {
  try {
    const h = location.hash.replace(/^#/, "");
    return ROUTES.includes(`/${h}`) ? `/${h}` : "/";
  } catch {
    return "/";
  }
}

let current = typeof window === "undefined" ? "/" : fromHash();
const listeners = new Set<() => void>();

export function navigate(href: string) {
  const [path, anchor] = href.split("#");
  const target = path || current;
  if (target !== current) {
    current = target;
    listeners.forEach((l) => l());
    try {
      history.replaceState(null, "", target === "/" ? location.pathname + location.search : `#${target.slice(1)}`);
    } catch {
      /* ignore */
    }
  }
  requestAnimationFrame(() => {
    const el = anchor ? document.getElementById(anchor) : null;
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else if (path) window.scrollTo(0, 0);
  });
}

export function usePath() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current,
    () => "/",
  );
}
