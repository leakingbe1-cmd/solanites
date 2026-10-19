/**
 * The Content Studio is an internal tool. It is never linked from the public
 * navigation, is marked noindex, and in production it 404s unless the
 * deployment opts in with SOLANITES_STUDIO=1 (server-side env, never sent to
 * the browser).
 */
export function studioEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.NODE_ENV !== "production" || env.SOLANITES_STUDIO === "1";
}
