/** Official accounts. Prelaunch: the contract address stays unpublished until the owner releases it. */
export const X_HANDLE = "@Solanites_";
export const X_URL = "https://x.com/Solanites_";
export const CONTRACT_LABEL = "Contract: coming soon";
/** The community channel (e.g. Telegram or Discord). Null until the owner opens one; nothing is linked until then. */
export const COMMUNITY: { label: string; url: string } | null = null;

/**
 * The public $SLNT contract (mint) address, set by the owner on launch day by copying it from the
 * deploy transaction, never typed or guessed. While null, every contract display reads "coming soon".
 */
export const CONTRACT_ADDRESS: string | null = null;

const BASE58_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
export const isContractAddress = (a: string | null | undefined): a is string => typeof a === "string" && BASE58_ADDRESS.test(a);
export const solscanTokenUrl = (address: string) => `https://solscan.io/token/${address}`;
