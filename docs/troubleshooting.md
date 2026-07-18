# Řešení potíží

## `npm ci` selže

Ověř Node.js 22+ a přítomnost aktuálního `package-lock.json`. Závislosti se nemají instalovat bez lockfile v CI.

## Přímá URL vrací 404

Spusť `npm run build` a ověř `dist/trips/<slug>/index.html`. Slug musí být v `content/catalog.json` a odpovídat adresáři cesty.

## Cesta se nezobrazí

Spusť `npm run validate-content`. Karta se nezobrazuje pro `isListed: false` ani `status: archived`.

## Security lint selže

Výstup uvádí soubor a zakázané pole nebo pattern. Citlivou hodnotu neobcházej přejmenováním; odstraň ji z veřejných dat nebo ji v navazující fázi vlož do podporovaného šifrovaného trezoru.

## Pages se nenasadí

Ověř, že v nastavení repozitáře je Pages source `GitHub Actions` a workflow má oprávnění `pages: write` a `id-token: write`.
