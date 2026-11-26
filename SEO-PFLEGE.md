# Suchmaschinen-Pflege · Die Isolatoren Deluxe

Stand: 26.11.2026. Bestehende statische GitHub-Pages-Website, keine neue Website.

## Veröffentlichung

Die Änderungen dieses Stands betreffen `index.html`, `theme.css`, `sw.js`,
`sitemap.xml` und `isolatoren-deluxe-vorschau.jpg`. Gemeinsam veröffentlichen.
Das Original-Logo, die Rechnerlogik, App-Installation, Manifest-ID, Start-URL,
App-Scope und die Google-Verifizierungsdatei bleiben erhalten. Zusätzlich wurde
ein vorhandener Startfehler in `app.js` behoben: Eine leere Sprungmarke muss zu
`null` statt zu einer leeren Zeichenkette führen. Andernfalls brach die spätere
Service-Worker-Registrierung ab. Cache-Version v20 liefert die Korrektur aus.
Die HTML-Seite lädt die korrigierte App-Datei über eine Versionskennung; dieselbe
Adresse wird für die Offline-Nutzung vorgeladen. So blockiert ein noch frischer
HTTP-Cache nicht die erste Ausführung der Fehlerkorrektur.

## Inhalte und Suchintention

- Name und Gemeinschaft: Hauptseite, Gemeinschaft und bestehende Personenprofile.
- Zweitakt-Gemischrechner: bestehender Rechner, Rückrechner und aufklappbare
  Rechenhilfe mit Formel und Rechenbeispielen. Herstellerangaben beachten;
  keine pauschalen Motorvorgaben aus Suchbegriffen ableiten.
- Partner: bestehende Partnerkarten und korrekte Profilverlinkungen. Eigenständige
  Gemeinschaften werden nicht als eigene Abteilungen ausgezeichnet.
- Treffen: vorhandene Jahresübersicht mit unveränderten Prüfstatusangaben.
- Kronkorken: vorhandener Aktionsbereich, Verein bleibt eigenständig.
- 3D-Druck: erst nach gesonderter Freigabe mit echten Inhalten ergänzen.
  Keine Platzhalterseiten oder Schlagwortlisten veröffentlichen.

## Metadaten und strukturierte Daten

Ein zusammenhängender JSON-LD-Graph im HTML beschreibt WebSite, WebPage,
private Gemeinschaft als Organization, WebApplication und Jan/Steffi als Personen.
Persönliche Instagram-/TikTok-Konten sind bei den jeweiligen Personen verknüpft,
nicht als angebliche Vereinskonten. Sichtbaren Inhalt und Auszeichnung zusammen
pflegen. Keine Bewertungen, Unternehmensdaten oder Shop-Angebote erfinden.

Der Google-Sitename unterstützt keine eigenen Namen auf Unterverzeichnis-Ebene.
`WebSite` beschreibt hier die Website, garantiert aber keinen Google-Sitename.
Canonical und `og:url` bleiben auf der HTTPS-Adresse mit abschließendem Slash.

## Sitemap und robots.txt

Richtige Sitemap:
https://dieisolatorendeluxe.github.io/isolatoren-deluxe/sitemap.xml

Eine Inhaltsseite bedeutet einen Sitemap-Eintrag. Hash-Abschnitte sind keine
eigenständigen Seiten. Testformular (noindex), Verifizierung, Bilder und Downloads
nicht als Inhaltsseiten eintragen. `lastmod` nur bei tatsächlicher Inhaltsänderung
aktualisieren. Bei späteren echten Unterseiten erst deren Canonical, interne
Verlinkung und eigenständigen Inhalt prüfen, dann Sitemap ergänzen.

Eine robots.txt wäre nur unter https://dieisolatorendeluxe.github.io/robots.txt
wirksam. Im Projekt-Unterordner nicht als angebliche Crawling-Steuerung anlegen.
Eine fehlende robots.txt mit HTTP 404 verhindert das Crawling nicht.
Keine neue Domain-/Root-Website nur für diese Datei anlegen.

## Prüfung

`node --test tests/*.test.cjs`

Ein alter Social-Link-Test erwartete noch 23 Community-Links statt der
freigegebenen aktuellen 14. Diese Erwartung wurde berichtigt. Ein zusätzlicher
Regressionstest prüft das Öffnen ohne Sprungmarke und das Leeren der Sprungmarke.
Die Browser-Nachbildung verwendet nun wie echte Browser eine leere Zeichenkette
für `location.hash` statt eines fehlenden Werts. Es wurden keine Mitglieder
zurückergänzt, um einen alten Test zu erfüllen.

Zusätzlich im Browser prüfen: 5 Liter bei 1:50 = 100 ml; 5 Liter bei 1:25 =
200 ml; Rückrechner 100 ml bei 1:50 = 5 Liter; negative Eingaben; freie
Verhältnisse; Ergebnis teilen; Termine suchen; Merch-Bilder öffnen/schließen;
Partnerkarten; Kontaktvorlagen; Installationshilfe und QR-Dialog.

## Nachkontrolle (noch auszuführen)

- 03.12.2026: Sitemap-Abruf, Live-URL, Datum des Google-Crawls und Canonical.
- 10.12.2026: Namenssuche in Google/Bing/Brave/DuckDuckGo, neue Seitentitel.
- 26.12.2026: 28-Tage-Leistung, Marken-/Rechneranfragen, Impressionen und Klicks.
- 25.01.2027: Entwicklung und nächste sinnvolle Korrekturen beurteilen.

Suchsitzung, Region, exakten Begriff und sichtbare Position protokollieren.
Indexierung, Einreichung und tatsächliche Rankings getrennt dokumentieren.
Keine automatischen Prüfungen sind hiermit eingerichtet.

## Offizielle Grundlagen

- [Google: Seitennamen](https://developers.google.com/search/docs/appearance/site-names)
- [Google: Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google: strukturierte Daten](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google: generative Suche](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Bing: Sitemaps](https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed)
- [DuckDuckGo: Ergebnisquellen](https://duckduckgo.com/duckduckgo-help-pages/results/sources)
- [Brave: eigener Index](https://search.brave.com/help/index)

Eine gute technische Grundlage garantiert weder Indexierung noch Platzierung.

## Suchmaschinen ohne zusätzliche Konten benachrichtigen

Seit 26.11.2026 ist die kontofreie IndexNow-Meldung vorbereitet:

```sh
node suchmaschinen-melden.cjs
node suchmaschinen-melden.cjs --submit
```

Der erste Aufruf zeigt nur eine Vorschau. `--submit` sendet nach einer tatsächlichen
Inhaltsänderung genau die öffentliche Hauptseite an den offiziellen gemeinsamen
IndexNow-Endpunkt. Keine Meldung bei jedem Besuch und keine wiederholten Meldungen
ohne Änderungen. Es werden keine Formulareingaben oder Besucherdaten übertragen.

Die öffentliche Text-Prüfdatei liegt bewusst im Projekt-Unterverzeichnis. Der
Parameter `keyLocation` begrenzt die bestätigte Zuständigkeit auf dieses Projekt.
Das Skript prüft vor dem Versand die live erreichbare Prüfdatei, HTTP-Status,
Canonical und Indexierungsfreigabe. Es meldet keine Testformulare, privaten Dateien,
Hash-URLs oder die eigenständige Kronkorken-Demo.

Bing und weitere IndexNow-Teilnehmer tauschen diese Benachrichtigungen untereinander
aus. Google und Brave sind damit nicht direkt benachrichtigt. DuckDuckGo und Yahoo
können über ihre Ergebnisquellen mittelbar profitieren; eine gesonderte Annahme
dieser Anbieter wird damit nicht behauptet.

HTTP 200 bedeutet: Meldung empfangen. HTTP 202 bedeutet: angenommen, Schlüsselprüfung
steht noch aus. Keiner dieser Statuswerte bestätigt Indexierung oder Platzierung.
Nicht angenommene Meldungen müssen anhand des Statuscodes geprüft werden.

Offizielle Grundlagen:
- https://www.indexnow.org/documentation (insbesondere `keyLocation` in Unterverzeichnissen)
- https://www.indexnow.org/faq (gemeinsamer Endpunkt und teilnehmende Suchmaschinen)

Die bereits funktionierende Google-Verifizierung bleibt unverändert. Eine robots.txt
im Projekt-Unterverzeichnis wird nicht als vermeintliche Lösung angelegt.
