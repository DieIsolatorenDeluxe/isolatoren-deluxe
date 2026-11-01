# isolatoren-deluxe

Statische Website mit Zweitakt-Mischrechner und Rückrechner. Kein Build notwendig.

## Tests

Mit Node.js aus dem Projektordner:

```sh
node --test tests/calculator.test.cjs
```

Die Tests führen die produktive Rechnerlogik mit einem kleinen DOM-Adapter aus.
Browserprüfungen für Darstellung, Dialoge und Tastaturbedienung kommen ergänzend hinzu.

## Veröffentlichung der Korrektur

`index.html`, `calculator.js` und `sw.js` gemeinsam im Stammordner des Repositorys
aktualisieren. Die vorhandenen Bilder und die Manifest-Datei bleiben erforderlich.
GitHub Pages veröffentlicht nach dem Push über die vorhandene Projektkonfiguration.
Die Cache-Version v2 enthält auch die neue JavaScript-Datei für den Offline-Betrieb.
DDR Zweitakt Gemischrechner &amp; Gemeinschaft
