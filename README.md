# TravelApp Published Trips

Veřejná statická aplikace pro zobrazení sanitizovaných rodinných harmonogramů vytvořených v lokální TravelApp. Cílový web je `https://pocitacpc-hub.github.io/TravelApp-PublishedTrips/`.

## Bezpečnostní hranice

Repozitář, jeho Git historie a GitHub Pages jsou veřejné. Do `content/` patří pouze data určená ke zveřejnění. Slug ani `robots.txt` nejsou ochrana. Rezervační kódy, PNR, boarding passy, vstupenky, osobní údaje, hesla a tokeny se nesmějí commitnout v otevřené podobě.

Šifrovaný rodinný trezor a přílohy jsou navazující fáze. Do jejich dokončení se citlivé soubory nepřidávají vůbec.

## Toolchain

- Node.js 22+
- TypeScript + Vite
- vanilla DOM a vlastní CSS
- AJV pro JSON Schema
- Vitest
- GitHub Actions + GitHub Pages

Volba udržuje malý frontend bez Reactu, Vue nebo Angularu. Build generuje fyzický `index.html` pro každou cestu, takže přímé otevření `/trips/<slug>/` funguje i na GitHub Pages.

## Lokální vývoj

```powershell
npm ci
npm run dev
```

Dev server kvůli Vite style injection lokálně odstraňuje CSP meta tag. Produkční build jej vždy zachová; bezpečnostní smoke se proto dělá nad `dist/` přes `npm run build` a `npm exec vite preview`.

Kompletní kontrola:

```powershell
npm run lint
npm run validate-content
npm run security-lint
npm run test
npm run build
```

Výstup je v `dist/` a necommitne se.

## Přidání sanitizované cesty

1. Vytvoř `content/trips/<slug>/trip.json` podle `schemas/published-trip.schema.json`.
2. Přidej odpovídající položku do `content/catalog.json`.
3. Zachovej shodné `publicId`, `slug` a `revision` v katalogu i cestě.
4. Spusť `npm run check`.
5. Před commitem ručně potvrď, že data jsou skutečně veřejná.

TravelApp nyní připravuje změny přímo v tomto lokálním repozitáři. Ruční publikační
brána je v DevCenteru vedena jako `TravelApp – Published Trip`. Její akce Publikovat:

1. povolí změny pouze v `content/catalog.json` a `content/trips/*/trip.json`,
2. spustí `npm run check`,
3. ověří synchronizaci větve `main`,
4. vytvoří commit a pushne jej,
5. při dostupném GitHub CLI počká na výsledek GitHub Pages workflow.

Samostatná kontrola bez commitu a pushnutí:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\publish-prepared-content.ps1 -ValidateOnly
```

Ukázka v `content/trips/sample-trip-2026-07-k4m7/` je záměrně smyšlená a sanitizovaná.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` validuje obsah, spustí security lint a testy, sestaví `dist/`, nahraje Pages artifact a nasadí jej do prostředí `github-pages`.

V nastavení repozitáře musí vlastník ručně zvolit Pages source `GitHub Actions`. První nasazení je možné až po commitu a pushi na `main`.

## Dokumentace

- `CODEX-DEV-RUNBOOK.md`
- `docs/architecture.md`
- `docs/content-format.md`
- `docs/security.md`
- `docs/offline.md`
- `docs/patches.md`
- `docs/operations.md`
- `docs/troubleshooting.md`
