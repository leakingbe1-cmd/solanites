import { describe, expect, it } from "vitest";

describe("GET /api/leaderboard when tracking is not configured", () => {
  it("answers 503 NOT_CONFIGURED, uncached, with no rows", async () => {
    delete process.env.SOLANITES_FIXTURES;
    delete process.env.DATABASE_URL;
    const { GET } = await import("@/app/api/leaderboard/route");
    const res = await GET();
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body.error.code).toBe("NOT_CONFIGURED");
    expect(body.categories).toBeUndefined();
  });
});
