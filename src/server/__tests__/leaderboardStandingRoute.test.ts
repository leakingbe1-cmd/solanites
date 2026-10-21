import { describe, expect, it } from "vitest";

const req = (q: string) => new Request(`http://localhost/api/leaderboard/standing${q}`);

describe("GET /api/leaderboard/standing", () => {
  it("rejects a missing or malformed address with 400, uncached", async () => {
    const { GET } = await import("@/app/api/leaderboard/standing/route");
    for (const q of ["", "?address=", "?address=not-an-address", "?address=0OIl0OIl0OIl0OIl0OIl0OIl0OIl0OIl"]) {
      const res = await GET(req(q));
      expect(res.status, q).toBe(400);
      expect(res.headers.get("cache-control")).toBe("no-store");
      expect((await res.json()).error.code).toBe("INVALID_ADDRESS");
    }
  });

  it("answers 503 NOT_CONFIGURED when tracking isn't configured, with no standing", async () => {
    delete process.env.SOLANITES_FIXTURES;
    delete process.env.DATABASE_URL;
    const { GET } = await import("@/app/api/leaderboard/standing/route");
    const res = await GET(req("?address=5ynCKp91fYufur9VHzDWN2Dd26Kdo8enx2m1Q59oG1N1"));
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = await res.json();
    expect(body.error.code).toBe("NOT_CONFIGURED");
    expect(body.categories).toBeUndefined();
  });
});
