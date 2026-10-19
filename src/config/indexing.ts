/**
 * Search indexing. Before launch the site asks crawlers not to index it (robots.txt and a
 * noindex tag). That is a courtesy, not access control. Set SOLANITES_INDEXING=1 at launch.
 */
export const INDEXING_ENABLED = process.env.SOLANITES_INDEXING === "1";
