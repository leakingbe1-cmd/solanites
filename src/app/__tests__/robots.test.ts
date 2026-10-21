import { describe, expect, it } from "vitest";
import robots from "../robots";

/** Pre-launch robots.txt: everyone out except X's preview bot, which may fetch pages and share cards. */
describe("robots.txt before launch", () => {
  const rules = [robots().rules].flat();
  const rule = (ua: string) => rules.find((r) => r.userAgent === ua)!;

  it("keeps every other crawler out", () => {
    expect(rule("*")).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("lets Twitterbot fetch pages and card images, but not the APIs or the studio", () => {
    const t = rule("Twitterbot");
    expect(t.allow).toEqual(["/", "/api/card/"]);
    expect(t.disallow).toEqual(["/api/", "/studio"]);
  });
});
