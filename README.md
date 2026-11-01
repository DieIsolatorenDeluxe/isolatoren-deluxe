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
Cache-Version v8 aktualisiert HTML und Rechnerlogik zuerst aus dem Netz, nutzt offline den Cache und lädt alte App-Fenster beim Versionswechsel neu.
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

„App installieren“ startet die unterstützte Installation direkt oder zeigt drei kurze
Schritte für das erkannte Gerät. Unter „Weitere Möglichkeiten“ stehen Browserhinweise,
Linkkopie und Lesezeichen. ZIP-Downloads und manuell anzulegende Verknüpfungen
werden im Installationsablauf nicht angeboten. Chrome bekommt bei Bedarf den
genauen Menüpfad „Streamen, speichern und teilen“ → „Seite als App installieren…“.

## App-Symbol

Das bestehende Logo wird unverzerrt in eigenen PNG-Größen (180, 192, 512 Pixel),
als Android-Maskable-Icon und als ICO mit sechs Größen ausgeliefert.
Neue Dateinamen vermeiden alte zwischengespeicherte Symbole.
Installierte Apps können ihr Symbol je nach Betriebssystem verzögert aktualisieren;
bei Bedarf die alte Verknüpfung entfernen und die Seite erneut hinzufügen.

## QR-Code teilen

Der Knopf „QR-Code“ zeigt einen lokal gespeicherten QR-Code zur öffentlichen Website.
Er kann als PNG gespeichert werden, etwa für Flyer, Ausdrucke oder zum Weitergeben.
Der Code enthält nur die feste Website-Adresse und keine Eingaben oder Trackingparameter.
DDR Zweitakt Gemischrechner &amp; Gemeinschaft
