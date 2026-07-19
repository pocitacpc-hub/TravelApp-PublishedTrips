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
    (value.schemaVersion !== "1.0" && value.schemaVersion !== "1.1") ||
    value.documentType !== "published_trip" ||
    typeof value.slug !== "string" ||
    !Array.isArray(value.days)
  ) {
    throw new Error("Publikovaná cesta nemá podporovaný formát.");
  }

  const trip = value as unknown as PublishedTrip;
  const emptyLinks = () => ({ googleMapsUrl: null, mapyUrl: null, googleNavigationUrl: null, mapyNavigationUrl: null });
  trip.places = trip.places.map((place) => ({
    ...place,
    addressText: place.addressText ?? null,
    warnings: place.warnings ?? null,
    mapLinks: { ...emptyLinks(), ...(place.mapLinks ?? {}) },
    parking: place.parking ?? { name: null, addressText: null, latitude: null, longitude: null, note: null, priceNote: null, heightLimitMeters: null, mapLinks: emptyLinks(), needsVerification: false },
    booking: place.booking ?? { required: false, recommendedAdvance: null, note: null, needsVerification: false },
    openingHours: place.openingHours ?? [],
    prices: place.prices ?? [],
    reviewMetrics: place.reviewMetrics ?? [],
    distances: place.distances ?? [],
    alternativesJson: place.alternativesJson ?? "[]"
  }));
  trip.days = trip.days.map((day) => ({ ...day, items: day.items.map((item) => ({
    ...item,
    distanceKm: item.distanceKm ?? null,
    whyHere: item.whyHere ?? null,
    bookingNote: item.bookingNote ?? null,
    parkingNote: item.parkingNote ?? null,
    mapLinks: { ...emptyLinks(), ...(item.mapLinks ?? {}) }
  })) }));
  return trip;
}
