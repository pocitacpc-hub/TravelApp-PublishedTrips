import type { CatalogTrip, PublishedCatalog, PublishedDay, TripStatus } from "../data/types";

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

export function dayAnchorId(day: Pick<PublishedDay, "publicId" | "dayIndex">): string {
  const publicId = day.publicId?.trim();
  return publicId ? `day-${publicId}` : `day-${day.dayIndex}`;
}

export function createDayOverviewColumns(days: PublishedDay[]): [PublishedDay[], PublishedDay[]] {
  const ordered = [...days].sort((left, right) => left.dayIndex - right.dayIndex);
  const splitIndex = Math.ceil(ordered.length / 2);
  return [ordered.slice(0, splitIndex), ordered.slice(splitIndex)];
}

export function formatCompactDayDate(value: string): string {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;

  const weekdays = ["ne", "po", "út", "st", "čt", "pá", "so"];
  return `${date.getUTCDate()}. ${date.getUTCMonth() + 1}. (${weekdays[date.getUTCDay()]})`;
}
