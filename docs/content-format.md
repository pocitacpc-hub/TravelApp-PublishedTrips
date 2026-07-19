# Veřejný datový formát

Aktuální kontrakt má `schemaVersion: "1.0"` a dva hlavní dokumenty:

- `content/catalog.json` podle `schemas/published-catalog.schema.json`,
- `content/trips/<slug>/trip.json` podle `schemas/published-trip.schema.json`.

Editovatelné entity mají stabilní UUID v `publicId`. Veřejné dokumenty nepoužívají interní databázová ID. Datum je ISO `YYYY-MM-DD`, čas `HH:mm`, časová zóna je IANA název a URL jsou čisté absolutní URL.

Katalog a cesta musí mít shodné `publicId`, `slug` a `revision`. `isListed: false` skryje kartu z přehledu, ale přímá URL zůstává veřejná. Archivované cesty se na hlavní stránce nezobrazují.

Validace probíhá příkazem:

```powershell
npm run validate-content
```
# Kontrakt 1.1

Nově publikované `trip.json` používá `schemaVersion: "1.1"`. Čtečka zůstává kompatibilní s 1.0 a doplní chybějící detailová pole bezpečnými výchozími hodnotami.

Kontrakt 1.1 rozlišuje:

- kartu místa a navigaci pro Google Maps i Mapy.com,
- samostatnou navigaci na parkoviště,
- detail rezervace, otevírací doby, cen, hodnocení a vzdáleností,
- `distanceKm`, `whyHere`, `bookingNote` a `parkingNote` na položce programu.

Klikací detail místa lze otevřít přímo přes `/trips/<slug>/?item=<public-id>`.

