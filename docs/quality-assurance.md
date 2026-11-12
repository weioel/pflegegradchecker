# Qualitätssicherung – 11.11.2026

## Erfolgreich ausgeführte Prüfungen

- 36 Berechnungstests, darunter jede Zelle aller sechs gesetzlichen Umrechnungstabellen und Grenzwerte unmittelbar unter/auf/über 12,5; 27; 47,5; 70; 90.
- Alle 34 × 66 Rohpunktekombinationen von Modul 2 und 3 werden über tatsächliche Antwortbelegungen geprüft. Es zählt der höhere gewichtete Wert.
- Alle 64 Kriterien, Quellenbezüge, unterschiedlichen Antwortskalen und Inkontinenzvoraussetzungen geprüft.
- Modul 5: Gruppen A/B/C/D, Frequenzperioden, Faktoren, vierstellige Rundung, Nullwerte und unbekannte Angaben; Validierung negativer, gebrochener und mehrdeutiger Eingaben.
- Dokumentiertes integriertes Beispiel: 38,75 Punkte = Pflegegrad 2.
- Fünf DOM-Integrationstests mit JSDOM: alle Inhaltsseiten, Abschnittsnavigation, Sprunglink, Erwachsenen-/Dauerprüfung, kompletter Durchlauf über alle 64 Fragen, Nullergebnis, nachträgliche Änderung von Essen zu 9 Rohpunkten → 20 Gesamtpunkte / Pflegegrad 1, Inkontinenz ohne unbeabsichtigte Vorauswahl, Eingabefehler, Frequenzbearbeitung, Unsicherheitsbereich und Reset.
- Axe-Prüfungen für WCAG A/AA einschließlich 2.1/2.2 auf Start, Einstieg, Frage, unvollständigem Ergebnis und Ratgeber: keine festgestellten strukturellen Verstöße. Farbkontrastprüfung deaktiviert, da JSDOM keinen visuellen Browser ersetzt.
- Sechs PDF-Tests: tatsächlich valide PDF-Struktur und Byte-Offsets, Umlaute und Unicode-Zuordnung, alle Kriterien, offene Bereiche auch bei zusammenfallenden Grenzen, inkonsistente Resultate, Download-Blob und Freigabe der Objekt-URL.
- PDF-Sichtprüfung: neunseitiger synthetischer Beispielbericht mit 43,75–48,75 Punkten, gerendert mit PyMuPDF; alle neun Seiten visuell geprüft. Keine Überläufe; Text und Umlaute mit pypdf verifiziert.
- Lokaler HTTP-Server antwortet mit 200, sämtliche JavaScript-Dateien syntaktisch geprüft.
- Selbst gehostete Inter-Schrift, keine externen Anfragen durch Rechnercode; CSP mit `connect-src 'none'`, keine Gesundheitsantworten in URL oder Web Storage.

## Grenzen

Die Website konnte in dieser Sitzung nicht visuell in einem Browser abgenommen werden: Der Browser-Zugriffshost war nicht verfügbar; der native Chrome-Zugriff wurde vom Computer-Use-Werkzeug als nicht genehmigt zurückgewiesen. Deshalb sind reale Darstellung bei 320/390/768/1440 Pixeln, 200–400 % Zoom, konkrete Browser-Druckansicht und Screenreader-Bedienung noch nicht manuell verifiziert. Das responsive CSS, semantische Formulare, große Bedienelemente, sichtbare Fokuszustände und `prefers-reduced-motion` sind umgesetzt. Die automatisierten Prüfungen sind keine vollständige WCAG-Konformitätszertifizierung.

Die Berechnung wurde anhand amtlicher Quellen umgesetzt und mit dokumentierten Beispielen getestet. Die alltagsnahen Erläuterungen ersetzen nicht die pflegefachliche Einordnung einzelner Situationen.

Für öffentlichen Betrieb fehlen noch Betreiber- und verbindliche Hostingangaben. Bis dahin wird ausschließlich die private Projektvorschau verwendet.

## Redesign-Nachprüfung vom 12.11.2026

59 Tests erfolgreich. Fachliche Dateien und PDF-Implementierung per SHA-256 unverändert. Die neuen Interaktionen und der Erhalt aller redaktionellen Absätze, Tabellenzellen sowie Quellenlinks sind geprüft. Zusätzliche Ergebnisse und die fortbestehende Einschränkung der visuellen Browserprüfung: siehe `design-audit.md`.

## Vereinfachung und Leistungsübersicht, 12.11.2026

- `npm run check`: alle bisherigen und drei neuen JS-Module syntaktisch geprüft.
- `npm test`: 73 Tests erfolgreich. Darunter unabhängige Referenzwerte für acht Leistungsarten in allen fünf Pflegegraden, Anspruchsausschluss PG1, Zeiteinheiten, Quellen, Auswahl/Fokus und Pflegeortwechsel, Ergebnisverknüpfung ohne Gesundheitsdaten in URLs, Kopieren/Download des Musterantrags sowie zusätzliche axe-Prüfungen der Leistungsansichten.
- Vollständiger 64-Fragen-Durchlauf, Unsicherheiten, Bearbeiten, Zurücksetzen, Modulsonderregeln, Grenzen und PDF-Regressionsprüfungen weiterhin erfolgreich.
- `data.js`, `calculator.js`, `pdf.js` byteidentisch zum vorherigen Stand. Ursprüngliche Ratgeber-/Rechtsabsätze und Primärquellen vollständig in der neuen Darstellung erhalten.
- Kein neuer Laufzeitdienst, keine externe Schrift, kein Analytics, keine zusätzliche Speicherung. Auswahlgrade nur im Arbeitsspeicher.
- Aktuelle Leistungsquellen und Reformtrennung: `docs/benefits-research.md`.
- Erneuter Browserinventar-Aufruf meldet „The browser access host is unavailable“. Deshalb sind echte Browserdarstellung, mobile Layouts, Zoom und Farbkontraste nicht im Browser verifiziert. axe in JSDOM prüft strukturelle WCAG-Regeln, keine Layout-/Kontrastberechnung.

## Reformvergleich und Leistungsstatus, 12.11.2026

- 95 automatisierte Tests erfolgreich: 18 zusätzliche Vergleichstests (alle gültigen Rohpunkte beider Tabellenstände und deren Grenzen, beide Pflegegradgrenzen mit Nachbarwerten, unveränderte Module, 100-%-Gewichtung, Validierung und Provenienz); drei weitere UI-Tests und ein Leistungsstatus-Test.
- Regler, Zahleneingabe, Fehlerzustände, Modulwechsel, Fokus, Gewichtungsauswahl, Sprungnavigation und Isolation vom beantworteten Selbstcheck geprüft. Beide Vergleichsregler haben eine beschriftete Zahleneingabe als Alternative.
- Fünf Pflegegradkarten ohne Eurobeträge, sieben verständlich benannte Statuszeilen, PG1-Ausschlüsse und gemeinsame Finanzierung geprüft. Sechs Hauptleistungskarten mit getrennten Auszahlungs-/Erstattungsformen bleiben vorhanden; kein Anspruch wird durch eine Null-Euro-Kachel vorgetäuscht.
- Strukturprüfung mit axe um den Reformbereich und den gemeinsamen Modul-2/3-Anteil erweitert: keine gefundenen Verstöße. Dynamische Ergebnisänderungen werden über die bestehende Live-Region angekündigt.
- Rechnerdaten, Algorithmus und PDF per SHA-256 unverändert. Alle bestehenden 64-Fragen-/PDF- und Guide-Tests weiterhin erfolgreich.
- Browserinventar und Öffnen der Vorschau scheiterten erneut mit „The browser access host is unavailable“. Native Chrome-Steuerung wurde nicht erneut umgangen. Daher keine behauptete mobile Sichtprüfung, Layout-/Zoom- oder Browser-Kontrastabnahme. Responsive Regeln bis 320 px, Tastaturbedienung und reduzierte Bewegung sind implementiert, aber visuell noch nicht im echten Browser bestätigt.
- Footer enthält nur notwendige Navigationslinks. Betreiber-/Datenschutzhinweise bleiben in den jeweiligen Seiten; Zugriff bleibt owner-private.

## IGES und Reihenfolge, 12.11.2026

Neue Prüfungen: Originalfallzahlen/gerundete relative Änderungen/Summen; gleiche lineare Skalierung aller zwölf Balken; Modellhinweise und Ausschlüsse; Reihenfolge; alle sechs Kategorien antippbar mit Fokus und persistierter Auswahl. Bestehende Regler, Gewichtungen, Rechner und PDF unverändert. Browserinventar meldet weiterhin „The browser access host is unavailable“; daher keine echte mobile Sichtprüfung. Strukturprüfung mit axe erfasst den erweiterten Reformbereich weiterhin.
