import "server-only";
import { getRuntime } from "../runtime";
import { createLeaderboard, type LeaderboardService } from "./service";

/** One leaderboard per server instance, shared by /api/leaderboard and /api/leaderboard/standing so they share its cache. */
const holder = globalThis as typeof globalThis & { __solanitesLeaderboard?: Promise<LeaderboardService> | null };

export function leaderboardService(): Promise<LeaderboardService> {
  if (!holder.__solanitesLeaderboard) {
    holder.__solanitesLeaderboard = getRuntime()
      .then((rt) => createLeaderboard({ db: rt.db, tracker: rt.tracker, source: rt.source }))
      .catch((e) => {
        holder.__solanitesLeaderboard = null;
        throw e;
      });
  }
  return holder.__solanitesLeaderboard;
}
