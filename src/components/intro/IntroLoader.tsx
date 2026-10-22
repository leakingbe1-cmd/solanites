"use client";

import dynamic from "next/dynamic";

/**
 * Loads the first-visit intro on demand. The intro pulls in every creature renderer, so it is
 * split out on the client: while the intro is off (src/config/intro.ts) none of that code ships.
 */
export const IntroLoader = dynamic(() => import("./FirstVisitIntro").then((m) => m.FirstVisitIntro), { ssr: false });
