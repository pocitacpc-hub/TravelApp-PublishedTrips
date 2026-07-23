import { createDayOverviewColumns, dayAnchorId, formatCompactDayDate } from "./render-model";
import type { PublishedDay } from "../data/types";

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character] ?? character);
}

function renderColumn(days: PublishedDay[]): string {
  if (days.length === 0) return "";

  return `<div class="day-overview__column">${days.map((day) => {
    const anchor = dayAnchorId(day);
    return `<a class="day-overview__link" href="#${escapeHtml(anchor)}" aria-label="Přejít na den ${day.dayIndex}: ${escapeHtml(day.title)}">
      <span class="day-overview__badge" aria-hidden="true">${day.dayIndex}</span>
      <span class="day-overview__date">${escapeHtml(formatCompactDayDate(day.date))}</span>
      <span class="day-overview__title">${escapeHtml(day.title)}</span>
    </a>`;
  }).join("")}</div>`;
}

export function renderTripDayOverview(days: PublishedDay[]): string {
  const [firstColumn, secondColumn] = createDayOverviewColumns(days);
  if (firstColumn.length === 0) return "";

  return `<section id="overview" class="day-overview" aria-labelledby="day-overview-title">
    <h2 id="day-overview-title">Přehled dní</h2>
    <div class="day-overview__columns">
      ${renderColumn(firstColumn)}
      ${renderColumn(secondColumn)}
    </div>
  </section>`;
}
