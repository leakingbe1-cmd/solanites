import "server-only";
import { CLAIMS_OPEN_AFTER_MS } from "@/config/launch";
import { REQUIRED_DECISIONS } from "@/server/claims/policy";
import { readClaimsConfig } from "@/server/claims/service";
import { ConfigError } from "@/server/config";
import { launchIsPublic, publicClaimsStatus } from "@/server/disclosure";
import { failFromError, noStore } from "@/server/http";
import { getRuntime } from "@/server/runtime";
import type { ClaimsStatus } from "@/shared/claims";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/claims/status — when launch-fee claims open (server clock) and whether they are configured.
 * The launch and opening times are withheld until the launch is public (src/server/disclosure.ts).
 */
export async function GET() {
  try {
    return Response.json(publicClaimsStatus((await getRuntime()).claims.status(), launchIsPublic()), { headers: noStore });
  } catch (e) {
    if (!(e instanceof ConfigError)) return failFromError(e, "claims-status");
    // Not set up yet: still a normal answer, with claims closed.
    const cfg = readClaimsConfig();
    const status: ClaimsStatus = {
      serverNow: Date.now(),
      serviceReady: false,
      launchAt: cfg.launchAtMs,
      opensAt: cfg.launchAtMs === null ? null : cfg.launchAtMs + CLAIMS_OPEN_AFTER_MS,
      open: false,
      signInReady: false,
      policyConfigured: false,
      requiredDecisions: [...REQUIRED_DECISIONS],
      closesAt: null,
    };
    return Response.json(publicClaimsStatus(status, launchIsPublic()), { headers: noStore });
  }
}
