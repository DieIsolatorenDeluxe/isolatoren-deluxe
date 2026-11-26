# Suchmaschinen-Pflege · Die Isolatoren Deluxe

Stand: 26.11.2026. Bestehende statische GitHub-Pages-Website, keine neue Website.

## Veröffentlichung

Die Änderungen dieses Stands betreffen `index.html`, `theme.css`, `sw.js`,
`sitemap.xml` und `isolatoren-deluxe-vorschau.jpg`. Gemeinsam veröffentlichen.
Das Original-Logo, die Rechnerlogik, App-Installation, Manifest-ID, Start-URL,
App-Scope und die Google-Verifizierungsdatei bleiben erhalten.

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

Hinweis zum vorhandenen Stand: Ein alter Social-Link-Test erwartet noch 23
Community-Links, obwohl die freigegebene aktuelle Auswahl 14 solcher Links hat.
Dieser Zähltest schlägt bereits vor der SEO-Änderung fehl. Die übrigen 36 Tests
bestanden beim SEO-Durchlauf. Es wurden keine Mitglieder zurückergänzt, um den
veralteten Test künstlich zu erfüllen.

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
