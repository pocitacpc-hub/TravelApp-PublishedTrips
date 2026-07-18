# Bezpečnost

## Veřejnost

Repozitář je veřejný. Veřejné jsou zdrojové soubory, názvy souborů, Git historie i výsledný web. Slug není heslo, skrytí z katalogu není ochrana a `robots.txt` není ochrana.

Nikdy necommituj plaintext rezervačních kódů, PNR, čísel letenek, boarding passů, QR payloadů vstupenek, čísel dokladů, citlivých kontaktů, hesel, GitHub tokenů nebo soukromých poznámek.

## Automatická pojistka

`npm run security-lint` kontroluje zakázané veřejné JSON klíče, známé prefixy GitHub tokenů, `.env` soubory a nešifrované přílohy v adresáři `attachments`. Kontrola je doplněk ručního posouzení, ne náhrada.

## Trezor

Klientsky šifrovaný trezor je plánovaná fáze. Použije standardní Web Crypto, náhodnou sůl a nonce a autentizované šifrování. Heslo nebude uložené v repozitáři ani PWA. Slabý PIN zůstává rizikem kvůli offline zkoušení.

Do dokončení trezoru se citlivé přílohy nepublikují.

## Incident

Pouhé smazání souboru v novém commitu neodstraní data z Git historie. Při nechtěném zveřejnění:

1. okamžitě zneplatni kompromitovaný kód, doklad nebo token,
2. dočasně vypni Pages nebo odeber aktuální soubor,
3. přepiš historii nástrojem určeným pro odstranění citlivých dat,
4. vynuť nový clone všem spolupracovníkům,
5. ověř cache a Pages artifact,
6. zdokumentuj incident bez opakování citlivé hodnoty.

