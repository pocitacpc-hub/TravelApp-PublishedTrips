# Architektura

## Zdroj pravdy

Lokální TravelApp je zdrojem pravdy pro program. Tento repozitář obsahuje pouze explicitně mapovaný veřejný kontrakt. Původní AI importní JSON ani interní EF entity se nepublikují.

## Tok dat

```text
TravelApp -> sanitizovaný publikační balíček -> tento repozitář -> GitHub Actions -> GitHub Pages
```

Statický web nemá backend ani databázi. Katalog je v `content/catalog.json`, každá cesta v `content/trips/<slug>/trip.json`. Vite sestaví společný frontend a `tools/build-site.ts` vytvoří fyzické route a veřejnou kopii dat v `dist/data/`.

## Toolchain

Použit je Vite + vanilla TypeScript. Důvody: malý build, standardní ESM, jednoduchý dev server a snadné rozšíření o Web Crypto, IndexedDB a service worker bez velkého UI frameworku.

## Navazující vrstvy

Plánované zobrazení skládá:

```text
základní publikovaný program + publikované patche + lokální patche telefonu
```

Patche, offline vrstva a šifrovaný trezor nejsou součástí prvního checkpointu.

