import { describe, expect, it } from "vitest";
import { createTripSections } from "../src/app/render-model";
import type { PublishedCatalog } from "../src/data/types";

describe("model přehledu cest", () => {
  it("skryje archivované a neveřejné karty", () => {
    const base = {
      publicId: "34712d42-f27b-4b45-9fd9-bf8e72d47f23",
      title: "Cesta",
      subtitle: null,
      dateFrom: "2026-07-18",
      dateTo: "2026-07-20",
      countryCode: "CZ",
      coverImageUrl: null,
      revision: 1,
      updatedAt: "2026-07-18T00:00:00Z",
      vaultAvailable: false
    } as const;
    const catalog: PublishedCatalog = {
      schemaVersion: "1.0",
      generatedAt: "2026-07-18T00:00:00Z",
      trips: [
        { ...base, slug: "active", status: "active", isListed: true },
        { ...base, slug: "hidden", status: "upcoming", isListed: false },
        { ...base, slug: "archive", status: "archived", isListed: true }
      ]
    };

    const sections = createTripSections(catalog);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.trips.map((trip) => trip.slug)).toEqual(["active"]);
  });
});

