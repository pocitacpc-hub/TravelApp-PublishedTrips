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

