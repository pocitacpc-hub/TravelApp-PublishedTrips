# CODEX-DEV-RUNBOOK.md – TravelApp Published Trips

## Základní informace

```text
Repo: pocitacpc-hub/TravelApp-PublishedTrips
Lokální cesta: C:\Dev\TravelApp-PublishedTrips
Veřejná URL: https://pocitacpc-hub.github.io/TravelApp-PublishedTrips/
```

Jde o statický veřejný web bez backendu, databáze a lokálního stable IIS.

## Kontrola a build

```powershell
Set-Location -LiteralPath "C:\Dev\TravelApp-PublishedTrips"
npm ci
npm run check
```

Samostatný build:

```powershell
npm run build
```

Výstup `dist/` je odvozený a necommitne se.

## Publikační workflow

1. TravelApp připraví změny pouze v `content/catalog.json` a
   `content/trips/<slug>/trip.json`.
2. V DevCenteru vyber `TravelApp – Published Trip`.
3. Zkontroluj Git změny a spusť Publish.
4. Skript znovu provede `npm run check`, commit, push a při dostupném `gh` počká
   na GitHub Pages.

Přímá kontrola skriptu bez commitu a pushnutí:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\publish-prepared-content.ps1 -ValidateOnly
```

## Bezpečnost

- Vše v repozitáři i Git historii je veřejné.
- Nikdy nepřidávej tokeny, rezervační kódy, PNR, doklady ani osobní údaje.
- Publish skript záměrně odmítne změny mimo povolené veřejné JSON soubory.
- Nepoužívej force push. Při rozchodu `main` a `origin/main` nejprve stav ručně
  zkontroluj a bezpečně synchronizuj.
