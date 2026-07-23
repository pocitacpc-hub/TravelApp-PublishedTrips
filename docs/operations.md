# Provoz

## Lokální ověření

```powershell
npm ci
npm run check
```

## Nasazení

1. V TravelApp připrav veřejnou revizi; aplikace ji zapíše do tohoto lokálního repa a spustí `npm run check`.
2. V DevCenteru vyber `TravelApp – Published Trip` a spusť Publish.
3. Skript povolí pouze veřejné JSON soubory, znovu je ověří, vytvoří commit a pushne `main`.
4. Při dostupném `gh` skript počká na `Deploy GitHub Pages`; jinak stav zkontroluj v GitHub Actions.
5. Ověř hlavní URL i přímou URL změněné cesty.

Deploy workflow používá jen `contents: read`, `pages: write` a `id-token: write`. Nepoužívá `gh-pages` větev.

Publish se zastaví, pokud je větev před/za `origin/main`, pokud chybí připravená
změna nebo pokud jsou změněné soubory mimo `content/catalog.json` a
`content/trips/*/trip.json`.

## Rollback

Obnov předchozí bezpečný obsah novým reverzním commitem. Nepoužívej force push. GitHub Pages build může po commitu několik minut dobíhat.
