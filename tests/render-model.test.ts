import { describe, expect, it } from "vitest";
import { createDayOverviewColumns, createTripSections, dayAnchorId, formatCompactDayDate } from "../src/app/render-model";
import { renderTripDayOverview } from "../src/app/trip-day-overview";
import type { PublishedCatalog, PublishedDay } from "../src/data/types";

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

describe("model přehledu dní", () => {
  const day = (dayIndex: number, publicId = `day-${dayIndex}`): PublishedDay => ({
    publicId,
    dayIndex,
    date: `2026-07-${String(dayIndex).padStart(2, "0")}`,
    title: `Den ${dayIndex}`,
    summary: null,
    dayType: "normal",
    weatherNote: null,
    alternatives: {},
    items: []
  });

  it.each([
    [1, 1, 0],
    [5, 3, 2],
    [8, 4, 4],
    [9, 5, 4]
  ])("rozdělí %i dní jako %i + %i", (count, firstExpected, secondExpected) => {
    const [first, second] = createDayOverviewColumns(Array.from({ length: count }, (_, index) => day(index + 1)));
    expect(first.map((value) => value.dayIndex)).toEqual(Array.from({ length: firstExpected }, (_, index) => index + 1));
    expect(second.map((value) => value.dayIndex)).toEqual(Array.from({ length: secondExpected }, (_, index) => index + firstExpected + 1));
  });

  it("vytvoří stabilní anchor s bezpečným fallbackem", () => {
    expect(dayAnchorId(day(4, "c9d3"))).toBe("day-c9d3");
    expect(dayAnchorId(day(4, ""))).toBe("day-4");
  });

  it("formátuje kompaktní české datum", () => {
    expect(formatCompactDayDate("2026-07-27")).toBe("27. 7. (po)");
  });

  it("vykreslí odkaz s anchor a přístupným popiskem", () => {
    const output = renderTripDayOverview([day(4, "day-public-id")]);
    expect(output).toContain('href="#day-day-public-id"');
    expect(output).toContain('aria-label="Přejít na den 4: Den 4"');
  });
});
