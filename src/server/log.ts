/**
 * Structured JSON logs for Vercel's log viewer. One line per event:
 * {"level":"info","event":"sync.finished",...}. Values that look like
 * credentials (URLs with keys, bearer tokens, secrets) are redacted, and
 * callers never pass RPC URLs, database URLs, signatures or session tokens.
 */
type Fields = Record<string, unknown>;

const SECRETISH = /(api[-_]?key|secret|token|password|authorization|signature|session)/i;

function clean(fields: Fields): Fields {
  const out: Fields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (SECRETISH.test(k)) out[k] = "[redacted]";
    else if (typeof v === "string") out[k] = v.replace(/(api-key=|api_key=|apikey=|apikey\s+|:\/\/[^:/@\s]+:)[^@&\s"]+/gi, "$1[redacted]").slice(0, 500);
    else if (typeof v === "bigint") out[k] = v.toString();
    else out[k] = v;
  }
  return out;
}

function emit(level: "info" | "warn" | "error", event: string, fields: Fields = {}) {
  const line = JSON.stringify({ level, event, at: new Date().toISOString(), ...clean(fields) });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const log = {
  info: (event: string, fields?: Fields) => emit("info", event, fields),
  warn: (event: string, fields?: Fields) => emit("warn", event, fields),
  error: (event: string, fields?: Fields) => emit("error", event, fields),
};
