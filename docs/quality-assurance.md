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
