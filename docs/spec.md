# Cardmarket Totalen — spec

- Werkt op `/*/*/Orders/Sales/*` en `/*/*/Orders/Purchases/*` via een content script.
- Totaalregel onder `#StatusTable`: gekloonde datarij zodat kolommen uitlijnen;
  label ("Deze pagina · 30 zendingen" / "Totaal · …"), som Qty, som Total.
- Bedragen in centen; notatie (decimaalteken, valutapositie) overgenomen van de pagina.
- Meerdere pagina's (hoogste `site=` in paginatielinks): knop "Alle N pagina's optellen"
  haalt de overige pagina's op met dezelfde URL + `site=N`, 1 s tussen verzoeken,
  voortgang, Stop, bij fout deeltotaal + Opnieuw.
- Buiten scope: artikellijsten, voorraad, winkelwagen, totalen onthouden.
