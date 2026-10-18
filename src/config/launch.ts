/**
 * Launch-fee claim timing. Claims open this long after the launch time,
 * which is set on the server (SOLANITES_LAUNCH_AT), never by the browser.
 *
 * This only controls when fee claims open. Egg tracking runs continuously
 * before, during and after this window and never needs a wallet connection.
 */
export const CLAIMS_OPEN_AFTER_MS = 6 * 60 * 60 * 1000;

/**
 * Planned holder distribution (from the developer supply): intended to begin
 * this long after the confirmed launch time. Copy only for now: no trigger,
 * snapshot or payout is implemented, and the allocation, eligibility rules and
 * calculation method are still to be confirmed (see docs/holder-tracking.md).
 */
export const HOLDER_DISTRIBUTION_AFTER_LAUNCH_MS = 2 * 60 * 60 * 1000;
