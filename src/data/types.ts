export type TripStatus = "upcoming" | "active" | "completed" | "archived";

export interface CatalogTrip {
  publicId: string;
  slug: string;
  title: string;
  subtitle: string | null;
  dateFrom: string;
  dateTo: string;
  countryCode: string;
  coverImageUrl: string | null;
  status: TripStatus;
  isListed: boolean;
  revision: number;
  updatedAt: string;
  vaultAvailable: boolean;
}

export interface PublishedCatalog {
  schemaVersion: "1.0";
  generatedAt: string;
  trips: CatalogTrip[];
}

export interface MapLinks {
  googleMapsUrl: string | null;
  mapyUrl: string | null;
}

export interface PublishedPlace {
  publicId: string;
  name: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  whyVisit: string | null;
  travelerTips: string | null;
  officialUrl: string | null;
  sourceUrl: string | null;
  reservationUrl: string | null;
  mapLinks: MapLinks;
  needsVerification: boolean;
}

export interface PublishedItem {
  publicId: string;
  type: string;
  title: string;
  startTime: string | null;
  endTime: string | null;
  durationMinutes: number | null;
  status: "planned" | "optional" | "cancelled";
  placePublicId: string | null;
  transportMode: string | null;
  cost: { amount: number | null; currency: string | null; text: string | null } | null;
  notes: string | null;
  needsVerification: boolean;
  sourceUrl: string | null;
  mapLinks: MapLinks;
  tags: string[];
}

export interface PublishedDay {
  publicId: string;
  date: string;
  dayIndex: number;
  title: string;
  summary: string | null;
  dayType: string;
  weatherNote: string | null;
  alternatives: Record<string, { title: string; text: string } | null>;
  items: PublishedItem[];
}

export interface PublishedTrip {
  schemaVersion: "1.0";
  documentType: "published_trip";
  publicId: string;
  slug: string;
  revision: number;
  title: string;
  subtitle: string | null;
  summary: string | null;
  dateFrom: string;
  dateTo: string;
  timezone: string;
  countryCode: string;
  locale: string;
  currency: string;
  status: TripStatus;
  isListed: boolean;
  generatedAt: string;
  publishedAt: string;
  location: {
    name: string;
    region: string | null;
    latitude: number | null;
    longitude: number | null;
    publicAccommodationArea: string | null;
    exactAccommodationInVault: boolean;
  };
  weather: { enabled: boolean; latitude: number; longitude: number; timezone: string } | null;
  days: PublishedDay[];
  places: PublishedPlace[];
  generalTips: string[];
  publicDocuments: unknown[];
  vault: { available: boolean; manifestUrl: string | null };
  sources: Array<{ title: string; url: string }>;
  quality: { warnings: string[]; needsVerificationCount: number };
}

