import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CollectionPlate } from "@/components/creature/CollectionPlate";
import { SPECIES_BY_ID } from "@/lib/species";

/** Demo discoveries on the Collection are marked Demo, never "Discovered" or "Your best". */
const render = (demo: boolean) =>
  renderToStaticMarkup(createElement(CollectionPlate, { species: SPECIES_BY_ID.driftfin, discovery: "owned", stage: 2, bestLabel: "Evolved", demo, onOpen: () => {} })).replace(/<[^>]+>/g, " ");

describe("Collection plate", () => {
  it("demo: 'Demo' and 'Demo best'", () => {
    const text = render(true);
    expect(text).toContain("● Demo");
    expect(text).toContain("Demo best: Evolved");
    expect(text).not.toContain("Discovered");
    expect(text).not.toContain("Your best");
  });

  it("real (watched address): 'Discovered' and 'Your best'", () => {
    const text = render(false);
    expect(text).toContain("● Discovered");
    expect(text).toContain("Your best: Evolved");
  });
});
