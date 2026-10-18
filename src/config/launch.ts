/**
 * Launch-fee claim timing. Claims open this long after the launch time,
 * which is set on the server (SOLANITES_LAUNCH_AT), never by the browser.
 *
 * This only controls when fee claims open. Egg tracking runs continuously
 * before, during and after this window and never needs a wallet connection.
 */
export const CLAIMS_OPEN_AFTER_MS = 6 * 60 * 60 * 1000;
