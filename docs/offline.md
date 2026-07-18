# Offline režim

První checkpoint obsahuje manifest a základ aplikace, ale zatím negarantuje plný offline režim.

Navazující fáze přidá service worker s oddělenou strategií:

- app shell: cache-first s verzováním,
- katalog: network-first se známou poslední verzí,
- otevřená cesta: uložení pro offline použití na vyžádání,
- počasí: network-first s viditelným stářím dat,
- ciphertext příloh: pouze po výslovném uložení,
- dešifrovaná data: nikdy do cache.

