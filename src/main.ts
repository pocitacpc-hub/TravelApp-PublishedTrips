import "./styles/main.css";
import { createTripSections, dayAnchorId } from "./app/render-model";
import { renderTripDayOverview } from "./app/trip-day-overview";
import { parseCatalog, parseTrip } from "./data/parse";
import type { CatalogTrip, PublishedDay, PublishedItem, PublishedPlace, PublishedTrip } from "./data/types";

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

function mapButton(label: string, url: string | null): string {
  return url ? `<a class="button button--small" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>` : "";
}

function itemCard(item: PublishedItem, places: Map<string, PublishedPlace>): string {
  const place = item.placePublicId ? places.get(item.placePublicId) : null;
  const time = item.startTime ?? "Plán";
  const verification = item.needsVerification ? '<span class="notice">Ověřit</span>' : "";
  const maps = [mapButton("Google · místo", item.mapLinks.googleMapsUrl), mapButton("Google · navigovat", item.mapLinks.googleNavigationUrl),
    mapButton("Mapy.com · místo", item.mapLinks.mapyUrl), mapButton("Mapy.com · navigovat", item.mapLinks.mapyNavigationUrl)].filter(Boolean).join("");
  return `<li class="activity">
    <div class="activity__time">${escapeHtml(time)}</div>
    <div class="activity__body">
      <div class="activity__title"><h4>${place ? `<button class="place-link" type="button" data-place-id="${escapeHtml(place.publicId)}">${escapeHtml(item.title)}</button>` : escapeHtml(item.title)}</h4>${verification}</div>
      ${place ? `<p class="activity__place">${escapeHtml(place.name)}</p>` : ""}
      ${item.whyHere ? `<p>${escapeHtml(item.whyHere)}</p>` : ""}
      ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
      ${maps ? `<div class="link-row">${maps}</div>` : ""}
    </div>
  </li>`;
}

function dayCard(day: PublishedDay, trip: PublishedTrip): string {
  const places = new Map(trip.places.map((place) => [place.publicId, place]));
  const alternatives = Object.values(day.alternatives).filter((value) => value !== null);
  return `<article class="day-card" id="${escapeHtml(dayAnchorId(day))}">
    <div class="day-card__heading">
      <div><span class="eyebrow">Den ${day.dayIndex} · ${formatDate(day.date)}</span><h3>${escapeHtml(day.title)}</h3></div>
      <span class="day-index">${day.dayIndex}</span>
    </div>
    ${day.summary ? `<p class="day-summary">${escapeHtml(day.summary)}</p>` : ""}
    ${day.weatherNote ? `<p class="weather-note">☀ ${escapeHtml(day.weatherNote)}</p>` : ""}
    <ol class="activities">${day.items.map((item) => itemCard(item, places)).join("")}</ol>
    ${alternatives.length ? `<details><summary>Alternativní plán</summary>${alternatives.map((alternative) => `<p><strong>${escapeHtml(alternative!.title)}:</strong> ${escapeHtml(alternative!.text)}</p>`).join("")}</details>` : ""}
  </article>`;
}

function placeDetail(place: PublishedPlace): string {
  const opening = place.openingHours.map((row) => `<li>${escapeHtml(row.date ?? row.dayOfWeek ?? "Termín")}: ${row.isClosed ? "zavřeno" : `${escapeHtml(row.openTime ?? "?")}–${escapeHtml(row.closeTime ?? "?")}`} ${escapeHtml(row.note ?? "")}</li>`).join("");
  const prices = place.prices.map((row) => `<li>${escapeHtml(row.priceType)}: ${row.adultPrice ?? row.familyPrice ?? "?"} ${escapeHtml(row.currency ?? "")} ${escapeHtml(row.note ?? "")}</li>`).join("");
  const reviews = place.reviewMetrics.map((row) => `<li>${escapeHtml(row.sourceName)}: ${row.rating ?? "?"}/${row.ratingMax ?? "?"} (${row.reviewCount ?? "?"} recenzí)</li>`).join("");
  const parkingLinks = [mapButton("Google · parkoviště", place.parking.mapLinks.googleMapsUrl), mapButton("Google · navigovat na parkoviště", place.parking.mapLinks.googleNavigationUrl),
    mapButton("Mapy.com · parkoviště", place.parking.mapLinks.mapyUrl), mapButton("Mapy.com · navigovat na parkoviště", place.parking.mapLinks.mapyNavigationUrl)].join("");
  return `<div class="place-dialog__backdrop" data-close-detail></div><article class="place-dialog" role="dialog" aria-modal="true" aria-labelledby="place-title">
    <button class="place-dialog__close" type="button" aria-label="Zavřít detail" data-close-detail>×</button>
    <p class="eyebrow">${escapeHtml(place.category)}</p><h2 id="place-title">${escapeHtml(place.name)}</h2>
    ${place.addressText ? `<p>${escapeHtml(place.addressText)}</p>` : ""}
    <div class="link-row">${mapButton("Google · místo", place.mapLinks.googleMapsUrl)}${mapButton("Google · navigovat", place.mapLinks.googleNavigationUrl)}${mapButton("Mapy.com · místo", place.mapLinks.mapyUrl)}${mapButton("Mapy.com · navigovat", place.mapLinks.mapyNavigationUrl)}${mapButton("Oficiální web", place.officialUrl)}${mapButton("Rezervace", place.reservationUrl)}</div>
    ${place.description ? `<h3>Popis</h3><p>${escapeHtml(place.description)}</p>` : ""}
    ${place.whyVisit ? `<h3>Proč sem</h3><p>${escapeHtml(place.whyVisit)}</p>` : ""}
    ${place.travelerTips ? `<h3>Tipy</h3><p>${escapeHtml(place.travelerTips)}</p>` : ""}
    ${place.warnings ? `<h3>Upozornění</h3><p>${escapeHtml(place.warnings)}</p>` : ""}
    ${(place.booking.required || place.booking.note) ? `<h3>Rezervace</h3><p>${escapeHtml(place.booking.note ?? "Rezervace je nutná.")} ${escapeHtml(place.booking.recommendedAdvance ?? "")}</p>` : ""}
    ${(place.parking.name || place.parking.note) ? `<h3>Parkování</h3><p><strong>${escapeHtml(place.parking.name ?? "")}</strong> ${escapeHtml(place.parking.note ?? "")} ${escapeHtml(place.parking.priceNote ?? "")}</p><div class="link-row">${parkingLinks}</div>` : ""}
    ${opening ? `<h3>Otevírací doba</h3><ul>${opening}</ul>` : ""}${prices ? `<h3>Ceny</h3><ul>${prices}</ul>` : ""}${reviews ? `<h3>Hodnocení</h3><ul>${reviews}</ul>` : ""}
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
        <a href="#overview">Přehled dní</a>
        <a href="#program">Program</a>
        <a href="#prakticke">Prakticky</a>
      </nav>
      ${renderTripDayOverview(trip.days)}
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
      <div id="place-detail"></div>
    </main>
    <footer class="shell footer">Veřejná verze neobsahuje rezervační kódy ani vstupenky.</footer>`;

  const detailRoot = document.querySelector<HTMLElement>("#place-detail");
  const openPlace = (publicId: string, pushState: boolean) => {
    const place = trip.places.find((value) => value.publicId === publicId);
    if (!place || !detailRoot) return;
    detailRoot.innerHTML = placeDetail(place);
    document.body.classList.add("dialog-open");
    if (pushState) {
      const url = new URL(window.location.href); url.searchParams.set("item", publicId); history.pushState({}, "", url);
    }
    detailRoot.querySelectorAll<HTMLElement>("[data-close-detail]").forEach((button) => button.addEventListener("click", () => closePlace(true)));
  };
  const closePlace = (pushState: boolean) => {
    if (detailRoot) detailRoot.innerHTML = "";
    document.body.classList.remove("dialog-open");
    if (pushState) { const url = new URL(window.location.href); url.searchParams.delete("item"); history.pushState({}, "", url); }
  };
  document.querySelectorAll<HTMLElement>("[data-place-id]").forEach((button) => button.addEventListener("click", () => openPlace(button.dataset.placeId ?? "", true)));
  const requestedItem = new URL(window.location.href).searchParams.get("item");
  if (requestedItem) openPlace(requestedItem, false);
  window.addEventListener("popstate", () => { const id = new URL(window.location.href).searchParams.get("item"); if (id) openPlace(id, false); else closePlace(false); });
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
