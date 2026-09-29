# Cardmarket Totalen

Chrome-extensie die onder de order-overzichten van Cardmarket (Verkopen en
Aankopen: Unpaid, Paid, Sent, Arrived, Not Arrived, Cancelled) een totaalregel
toont: aantal zendingen, aantal artikelen en totaalbedrag.

Heeft een overzicht meerdere pagina's, dan telt de regel eerst de huidige pagina.
Met **Alle N pagina's optellen** worden de andere pagina's op de achtergrond
opgehaald (1 per seconde, met **Stop**). Zoekfilters tellen mee.

## Installeren

1. `chrome://extensions` → **Ontwikkelaarsmodus** aan.
2. **Uitgepakte extensie laden** → kies deze map.

Er is geen knop in de werkbalk; de regel verschijnt vanzelf op de overzichten.

## Ontwikkelen

- `npm test` test het inlezen en formatteren van bedragen.
- De tabel-logica hangt af van Cardmarket's classes: `#StatusTable`,
  `.table-body > .row`, `.col-price` (bedrag) en de tweede `.col-smallNumber`
  (aantal). Pagina's via `?site=N`. Zie `src/table.js`.
