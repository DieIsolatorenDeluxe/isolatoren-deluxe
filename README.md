# isolatoren-deluxe

Statische Website mit Zweitakt-Mischrechner und Rückrechner. Kein Build notwendig.

## Tests

Mit Node.js aus dem Projektordner:

```sh
node --test tests/*.test.cjs
```

Die Tests führen die produktive Rechnerlogik mit einem kleinen DOM-Adapter aus.
Browserprüfungen für Darstellung, Dialoge und Tastaturbedienung kommen ergänzend hinzu.

## Veröffentlichung der Korrektur

`index.html`, `calculator.js` und `sw.js` gemeinsam im Stammordner des Repositorys
aktualisieren. Die vorhandenen Bilder und die Manifest-Datei bleiben erforderlich.
GitHub Pages veröffentlicht nach dem Push über die vorhandene Projektkonfiguration.
Cache-Version v6 aktualisiert HTML und Rechnerlogik zuerst aus dem Netz, nutzt offline den Cache und lädt alte App-Fenster beim Versionswechsel neu.
Sie speichert auch die kompakten WebP-Bilder, Social-Icons und App-Icons.

## Android und iPhone

Der Knopf „App installieren“ nutzt den Installationsdialog des Browsers, wenn verfügbar.
Andernfalls erscheint eine Anleitung. Auf iPhone/iPad führt sie über das Teilen-Menü
unterstützender Browser; Safari dient als Ausweichweg, wenn eine Option fehlt.
Android-Anleitungen berücksichtigen Chrome, Edge, Firefox und Samsung Internet.
Für integrierte Browser in Social-Apps gibt es Hinweise und einen Knopf zum Kopieren
des Links. Bei falscher Geräteerkennung lassen sich alle Anleitungen anzeigen.
In der gestarteten Web-App wird der Installationsknopf ausgeblendet.
„Seite teilen“ nutzt die native Teilen-Funktion oder kopiert den öffentlichen Link.

Die Social-Links öffnen die bereits hinterlegten HTTPS-Adressen in einem neuen Fenster.
Ob die installierte Social-App übernimmt, hängt von Gerät und Plattform ab.
Social-Media-Profile benötigen Internet. Echtes Installieren auf Android/iOS sollte
zusätzlich auf den jeweiligen Geräten geprüft werden.

## Desktop speichern

„Am PC speichern“ erklärt die App-Installation in Chrome/Edge, „Zum Dock hinzufügen“
in Safari und das Anlegen eines Lesezeichens. Zusätzlich stehen normale URL-Verknüpfungen
für Windows (`gemischrechner.url`) und Mac (`gemischrechner.webloc`) in `desktop-verknuepfungen.zip` zum Download bereit.
Diese öffnen die veröffentlichte Website, sie enthalten keine ausführbaren Programme.
DDR Zweitakt Gemischrechner &amp; Gemeinschaft
