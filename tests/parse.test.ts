import { describe, expect, it } from "vitest";
import { parseCatalog, parseTrip } from "../src/data/parse";

describe("publikační parser", () => {
  it("přijme katalog verze 1.0", () => {
    const catalog = parseCatalog({ schemaVersion: "1.0", generatedAt: "2026-07-18T00:00:00Z", trips: [] });
    expect(catalog.trips).toHaveLength(0);
  });

  it("odmítne původní AI program JSON", () => {
    expect(() => parseTrip({ schemaVersion: "1.0", documentType: "program", days: [] })).toThrow();
  });
});

