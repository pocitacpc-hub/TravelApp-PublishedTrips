import "./styles/main.css";
import { createTripSections } from "./app/render-model";
import { parseCatalog, parseTrip } from "./data/parse";
import type { CatalogTrip, PublishedDay, PublishedItem, PublishedTrip } from "./data/types";

const appElement = document.querySelector<HTMLElement>("#app");
if (!appElement) {
  throw new Error("Chybí kořen aplikace.");
}
const app: HTMLElement = appElement;

const basePath = "/TravelApp-PublishedTrips/";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character] ?? character);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long", year: "numeric" })
    .format(new Date(`${value}T12:00:00Z`));
}

function formatDateRange(from: string, to: string): string {
  return `${formatDate(from)} – ${formatDate(to)}`;
}

function flag(countryCode: string): string {
  return countryCode.toUpperCase().replace(/./g, (character) =>
    String.fromCodePoint(127397 + character.charCodeAt(0)));
}

function tripCard(trip: CatalogTrip): string {
  const vault = trip.vaultAvailable ? '<span class="badge">Trezor</span>' : "";
  return `
    <article class="trip-card">
      <div class="trip-card__flag" aria-hidden="true">${flag(trip.countryCode)}</div>
      <div class="trip-card__content">
        <div class="eyebrow">${escapeHtml(trip.subtitle ?? "Rodinná cesta")}</div>
        <h3>${escapeHtml(trip.title)}</h3>
        <p>${formatDateRange(trip.dateFrom, trip.dateTo)}</p>
        <div class="badges"><span class="badge badge--status">${statusText(trip.status)}</span>${vault}</div>
      </div>
      <a class="button" href="${basePath}trips/${encodeURIComponent(trip.slug)}/">Otevřít program</a>
    </article>`;
}

function statusText(status: CatalogTrip["status"]): string {
  return ({ active: "Probíhá", upcoming: "Nadcházející", completed: "Ukončená", archived: "Archiv" })[status];
}

function renderCatalog(catalog: ReturnType<typeof parseCatalog>): void {
  const sections = createTripSections(catalog);
  document.title = "Rodinné cesty";
  app.innerHTML = `
    <header class="hero">
      <div class="shell">
        <div class="brand"><span class="brand__mark" aria-hidden="true">T</span><span>TravelApp</span></div>
        <p class="eyebrow">Programy na cesty</p>
        <h1>Všechny plány po ruce.</h1>
        <p class="hero__lead">Přehledný rodinný program pro telefon, připravený i pro pozdější offline použití.</p>
      </div>
    </header>
    <main id="main" class="shell content">
      ${sections.length === 0 ? '<div class="empty-state">Zatím není publikována žádná cesta.</div>' : sections.map((section) => `
        <section class="trip-section" aria-labelledby="section-${section.status}">
          <div class="section-heading"><h2 id="section-${section.status}">${section.title}</h2><span>${section.trips.length}</span></div>
          <div class="trip-grid">${section.trips.map(tripCard).join("")}</div>
        </section>`).join("")}
    </main>
    <footer class="shell footer">Veřejná verze obsahuje pouze publikovatelná data.</footer>`;
}

function itemCard(item: PublishedItem, placeNames: Map<string, string>): string {
  const place = item.placePublicId ? placeNames.get(item.placePublicId) : null;
  const time = item.startTime ?? "Plán";
  const verification = item.needsVerification ? '<span class="notice">Ověřit</span>' : "";
  const maps = [
    item.mapLinks.googleMapsUrl ? `<a href="${escapeHtml(item.mapLinks.googleMapsUrl)}" target="_blank" rel="noopener noreferrer">Google Maps</a>` : "",
    item.mapLinks.mapyUrl ? `<a href="${escapeHtml(item.mapLinks.mapyUrl)}" target="_blank" rel="noopener noreferrer">Mapy.com</a>` : ""
  ].filter(Boolean).join("");
  return `<li class="activity">
    <div class="activity__time">${escapeHtml(time)}</div>
    <div class="activity__body">
      <div class="activity__title"><h4>${escapeHtml(item.title)}</h4>${verification}</div>
      ${place ? `<p class="activity__place">${escapeHtml(place)}</p>` : ""}
      ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
      ${maps ? `<div class="link-row">${maps}</div>` : ""}
    </div>
  </li>`;
}

function dayCard(day: PublishedDay, trip: PublishedTrip): string {
  const placeNames = new Map(trip.places.map((place) => [place.publicId, place.name]));
  const alternatives = Object.values(day.alternatives).filter((value) => value !== null);
  return `<article class="day-card" id="${escapeHtml(day.publicId)}">
    <div class="day-card__heading">
      <div><span class="eyebrow">Den ${day.dayIndex} · ${formatDate(day.date)}</span><h3>${escapeHtml(day.title)}</h3></div>
      <span class="day-index">${day.dayIndex}</span>
    </div>
    ${day.summary ? `<p class="day-summary">${escapeHtml(day.summary)}</p>` : ""}
    ${day.weatherNote ? `<p class="weather-note">☀ ${escapeHtml(day.weatherNote)}</p>` : ""}
    <ol class="activities">${day.items.map((item) => itemCard(item, placeNames)).join("")}</ol>
    ${alternatives.length ? `<details><summary>Alternativní plán</summary>${alternatives.map((alternative) => `<p><strong>${escapeHtml(alternative!.title)}:</strong> ${escapeHtml(alternative!.text)}</p>`).join("")}</details>` : ""}
  </article>`;
}

function renderTrip(trip: PublishedTrip): void {
  document.title = `${trip.title} · Rodinné cesty`;
  app.innerHTML = `
    <header class="trip-hero">
      <div class="shell">
        <a class="back-link" href="${basePath}">← Všechny cesty</a>
        <div class="trip-hero__title"><span class="trip-hero__flag" aria-hidden="true">${flag(trip.countryCode)}</span><div><p class="eyebrow">${escapeHtml(trip.subtitle ?? "Rodinný program")}</p><h1>${escapeHtml(trip.title)}</h1></div></div>
        <p class="trip-hero__date">${formatDateRange(trip.dateFrom, trip.dateTo)}</p>
        ${trip.summary ? `<p class="hero__lead">${escapeHtml(trip.summary)}</p>` : ""}
        <div class="badges"><span class="badge badge--status">${statusText(trip.status)}</span><span class="badge">Revize ${trip.revision}</span></div>
      </div>
    </header>
    <main id="main" class="shell content trip-content">
      <nav class="quick-nav" aria-label="Rychlé odkazy">
        <a href="#program">Program</a>
        <a href="#prakticke">Prakticky</a>
      </nav>
      <section id="program" class="days" aria-labelledby="program-title">
        <div class="section-heading"><h2 id="program-title">Program po dnech</h2><span>${trip.days.length}</span></div>
        ${trip.days.map((day) => dayCard(day, trip)).join("")}
      </section>
      <section id="prakticke" class="info-panel">
        <h2>Praktické informace</h2>
        <p>Místní čas: <strong>${escapeHtml(trip.timezone)}</strong></p>
        <p>Poslední publikace: ${new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(trip.publishedAt))}</p>
        ${trip.quality.warnings.map((warning) => `<p class="weather-note">${escapeHtml(warning)}</p>`).join("")}
      </section>
    </main>
    <footer class="shell footer">Veřejná verze neobsahuje rezervační kódy ani vstupenky.</footer>`;
}

async function loadJson(path: string): Promise<unknown> {
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Data se nepodařilo načíst (${response.status}).`);
  }
  return response.json();
}

function requestedSlug(pathname: string): string | null {
  const normalized = pathname.replace(basePath, "/");
  const match = normalized.match(/^\/trips\/([^/]+)\/?$/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

async function start(): Promise<void> {
  try {
    const slug = requestedSlug(window.location.pathname);
    if (slug) {
      renderTrip(parseTrip(await loadJson(`${basePath}data/trips/${encodeURIComponent(slug)}/trip.json`)));
      return;
    }
    renderCatalog(parseCatalog(await loadJson(`${basePath}data/catalog.json`)));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznámá chyba.";
    app.innerHTML = `<main class="shell content"><div class="empty-state"><h1>Stránku se nepodařilo načíst</h1><p>${escapeHtml(message)}</p><a class="button" href="${basePath}">Zpět na přehled</a></div></main>`;
  }
}

void start();
