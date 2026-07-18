import type { PublishedCatalog, PublishedTrip } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseCatalog(value: unknown): PublishedCatalog {
  if (!isRecord(value) || value.schemaVersion !== "1.0" || !Array.isArray(value.trips)) {
    throw new Error("Katalog cest nemá podporovaný formát.");
  }

  return value as unknown as PublishedCatalog;
}

export function parseTrip(value: unknown): PublishedTrip {
  if (
    !isRecord(value) ||
    value.schemaVersion !== "1.0" ||
    value.documentType !== "published_trip" ||
    typeof value.slug !== "string" ||
    !Array.isArray(value.days)
  ) {
    throw new Error("Publikovaná cesta nemá podporovaný formát.");
  }

  return value as unknown as PublishedTrip;
}

