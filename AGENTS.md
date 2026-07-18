# AGENTS.md – TravelApp Published Trips

Tento repozitář je veřejný statický publikační web pro sanitizované harmonogramy z TravelApp.

## Bezpečnost

- Všechny soubory a historie Gitu jsou veřejné.
- Necommituj rezervační kódy, PNR, vstupenky, osobní údaje, hesla, tokeny ani lokální cesty.
- Citlivé přílohy smějí být přidány až v podporovaném šifrovaném formátu.
- Slug, skrytí z katalogu ani `robots.txt` nejsou zabezpečení.

## Pracovní postup

Před změnou čti `README.md`, `docs/architecture.md`, `docs/content-format.md` a `docs/security.md`.

Po změně spusť:

```powershell
npm run lint
npm run validate-content
npm run security-lint
npm run test
npm run build
```

Preferuj vanilla TypeScript, malé moduly, čisté CSS a fyzické route `trips/<slug>/index.html`. Nepřidávej backend ani velký UI framework bez nového architektonického rozhodnutí.

