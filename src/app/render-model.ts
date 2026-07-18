import type { CatalogTrip, PublishedCatalog, TripStatus } from "../data/types";

export interface TripSection {
  status: TripStatus;
  title: string;
  trips: CatalogTrip[];
}

const sectionTitles: Record<Exclude<TripStatus, "archived">, string> = {
  active: "Právě probíhá",
  upcoming: "Nadcházející cesty",
  completed: "Minulé cesty"
};

export function createTripSections(catalog: PublishedCatalog): TripSection[] {
  return (["active", "upcoming", "completed"] as const)
    .map((status) => ({
      status,
      title: sectionTitles[status],
      trips: catalog.trips
        .filter((trip) => trip.isListed && trip.status === status)
        .sort((left, right) => left.dateFrom.localeCompare(right.dateFrom))
    }))
    .filter((section) => section.trips.length > 0);
}

