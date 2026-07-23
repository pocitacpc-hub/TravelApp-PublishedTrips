# Architektura

## Zdroj pravdy

Lokální TravelApp je zdrojem pravdy pro program. Tento repozitář obsahuje pouze explicitně mapovaný veřejný kontrakt. Původní AI importní JSON ani interní EF entity se nepublikují.

## Tok dat

```text
TravelApp -> lokálně připravený sanitizovaný obsah -> ruční brána v DevCenteru -> GitHub Actions -> GitHub Pages
```

TravelApp zapisuje pouze `content/catalog.json` a odpovídající
`content/trips/<slug>/trip.json`. Commit a push nejsou součástí TravelApp; provádí je
uživatel samostatnou akcí `TravelApp – Published Trip` v DevCenteru.

Statický web nemá backend ani databázi. Katalog je v `content/catalog.json`, každá cesta v `content/trips/<slug>/trip.json`. Vite sestaví společný frontend a `tools/build-site.ts` vytvoří fyzické route a veřejnou kopii dat v `dist/data/`.

## Navigace programu po dnech

Detail cesty generuje nad programem kompaktní přehled z `trip.days`. Model rozdělí seřazené dny do dvou sloupců jako `ceiling(N / 2)` a zbytek; na mobilu se CSS přepne do jednoho sloupce v přirozeném pořadí. Každý řádek je nativní odkaz na stabilní anchor `#day-<publicId>` (s fallbackem na index dne). Anchor je na kartě detailu dne a používá `scroll-margin-top`, proto funguje také sdílení URL s fragmentem a reload stránky.

## Toolchain

Použit je Vite + vanilla TypeScript. Důvody: malý build, standardní ESM, jednoduchý dev server a snadné rozšíření o Web Crypto, IndexedDB a service worker bez velkého UI frameworku.

## Navazující vrstvy

Plánované zobrazení skládá:

```text
základní publikovaný program + publikované patche + lokální patche telefonu
```

Patche, offline vrstva a šifrovaný trezor nejsou součástí prvního checkpointu.
