# Provoz

## Lokální ověření

```powershell
npm ci
npm run check
```

## Nasazení

1. V GitHub nastavení zvol Pages source `GitHub Actions`.
2. Pushni ověřenou změnu na `main`.
3. Zkontroluj workflow `Validate content` a `Deploy GitHub Pages`.
4. Ověř hlavní URL i přímou URL ukázkové cesty.

Deploy workflow používá jen `contents: read`, `pages: write` a `id-token: write`. Nepoužívá `gh-pages` větev.

## Rollback

Obnov předchozí bezpečný obsah novým reverzním commitem. Nepoužívej force push. GitHub Pages build může po commitu několik minut dobíhat.

