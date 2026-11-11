# Berechnung und Quellenzuordnung

Regelsatz `de-sgbxi-adults-2026-11-11-v1`, Version 1.0.0. Recherche am 11.11.2026. Ausschließlich Erwachsene ab 18 Jahren. Keine Regeln eines PNOG-Entwurfs werden verwendet.

## Primärquellen

- [§ 14 SGB XI](https://www.gesetze-im-internet.de/sgb_11/__14.html): gesundheitlich bedingte Beeinträchtigungen, personeller Hilfebedarf, voraussichtliche Dauer mindestens sechs Monate. Die Bewertung ist keine rein medizinische Diagnoseliste.
- [§ 15 SGB XI](https://www.gesetze-im-internet.de/sgb_11/__15.html): sechs Module, Gewichtung, Kombination M2/M3, Pflegegradgrenzen, besondere Bedarfskonstellationen und Kinderregelungen.
- [Anlage 1 zu § 15 SGB XI](https://www.gesetze-im-internet.de/sgb_11/anlage_1.html): sämtliche Einzelkriterien, Antwortkategorien, Punktwerte und Berechnung innerhalb von Modul 5.
- [Anlage 2 zu § 15 SGB XI](https://www.gesetze-im-internet.de/sgb_11/anlage_2.html): sämtliche Modulumrechnungen. Der direkte Seitenabruf schlug bei der Recherche mehrfach fehl. Der vollständige amtliche Text war über die indizierte Seite verfügbar und wurde mit der Tabelle auf Seite 97 der aktuellen BRi abgeglichen.
- [Begutachtungs-Richtlinien des MD Bund vom 26.08.2026](https://www.medizinischerdienst.de/fileadmin/MD-zentraler-Ordner/Downloads/01_Pflegebegutachtung/261016_MDB_48_002_RICHTLINIE_PFLEGE_2026_16.pdf): genehmigt am 28.09.2026, in Kraft seit 01.10.2026. Ersetzen die Fassung vom 21.08.2024. Erwachsene: Kapitel 5, Kriterien Seiten 55–95, Berechnung Seiten 96–111 (gedruckte Seitenzahlen, PDF-Seitenindex jeweils minus eins). Die 2026 präzisierten Abstufungen für 6.1 und 6.4 sind berücksichtigt.

Jedes Kriterium in `dist/data.js` hat `sourceIds` und eine `sourceSection`. Die Rechtsquellen stehen in `SOURCES`, die versionierten Tabellen in `RULESET`. Fragetexte und Alltagsbeispiele sind eigenständig formulierte Verständnishilfen; gesetzliche Kategorien und Werte bleiben erhalten. Die Hinweise ersetzen nicht die vollständige fachliche Beurteilung des Einzelfalls.

## Eingabevertrag

Die 64 offiziellen Kriterien verteilen sich auf 5/11/13/13/16/6 Fragen. `QUESTIONS` ist eine flache Liste, `MODULES` enthält die Fragen je Modul.

- Normale Kriterien: tatsächlicher Optionspunktwert als Zahl. Kein nullbasierter Antwortindex.
- 4.11/4.12: `{ eligible: false }` oder `{ eligible: true, value: 0|1|2|3 }`. Voraussetzung: überwiegend/vollständig inkontinent oder künstliche Ableitung. Ein unbekannter Status kann mit `eligible: null` angegeben werden.
- 5.1–5.11: eine nichtnegative ganze Häufigkeit pro Kriterium, etwa `{ day: 3 }`, `{ week: 2 }` oder `{ month: 15 }`. Felder mit 0 dürfen ergänzt werden. Mehr als eine positive Zeiteinheit wird abgelehnt.
- 5.12: `{ daily: true }` bei täglicher zeit- UND technikintensiver Maßnahme, sonst `{ week: n }` oder `{ month: n }`.
- 5.13–5.15: ganze Anzahl pro Woche oder Monat.
- Entfällt/selbstständig bei Häufigkeitsfragen: `{ day: 0 }` bzw. `{ week: 0 }` für Fragen ohne Tageseinheit.
- Unsicher/unbeantwortet: `null` oder fehlender Schlüssel. Unzulässige Optionen, negative Werte, Dezimalhäufigkeiten, mehrdeutige Zeiteinheiten und Nichtzahlen werden abgelehnt.

BRi S.83 schreibt für jedes Häufigkeitskriterium einen Eintrag in vollen Zahlen vor. Mischfrequenzen werden vorher in einer Einheit zusammengefasst: jeden zweiten Tag = 15/Monat; zwei tägliche plus zwei zusätzliche wöchentliche Injektionen = 16/Woche. Wenn bei der Eingabe innerhalb eines Kriteriums eine Wochenhäufigkeit auf einen Monat umgerechnet werden muss, gilt dort ×4. Das unterscheidet sich bewusst von den gesetzlich vorgegebenen Faktoren 4,3 bzw. 8,6 bei der späteren Bewertung der Besuche.

## Einzelpunkte und besondere Regeln

| Modul | Einzelkriterien | Werte |
|---|---:|---|
| 1 Mobilität | 5 | jeweils 0/1/2/3 |
| 2 Kognition/Kommunikation | 11 | jeweils 0/1/2/3 |
| 3 Verhalten/Psyche | 13 | jeweils 0/1/3/5 nach Häufigkeit des Unterstützungsbedarfs |
| 4 Selbstversorgung | 13 | 4.1–7 und 4.11–12: 0/1/2/3; Essen: 0/3/6/9; Trinken und Toilette: 0/2/4/6; Sonde: 0/6/3 |
| 5 Krankheit/Therapie | 16 | vier berechnete Gruppen, zusammen 0–15 |
| 6 Alltag/Kontakte | 6 | jeweils 0/1/2/3 |

M3: Nie/sehr selten = 0; ein- bis dreimal in zwei Wochen = 1; zweimal bis mehrmals wöchentlich, nicht täglich = 3; täglich = 5. Dasselbe Unterstützungsereignis bei mehreren zusammen auftretenden Verhaltensweisen wird nur einem Kriterium zugeordnet. Die Benutzerhinweise fordern dies ausdrücklich; der Rechner kann reale Ereignisse ohne deren Erhebung nicht selbst deduplizieren.

M4: 4.11 und 4.12 zählen nur bei erfüllter Inkontinenz-/Ableitungsvoraussetzung. Seltene Verluste werden nicht als überwiegende Inkontinenz ausgelegt. 4.13 ergibt 6 Punkte bei täglicher unterstützter zusätzlicher Sonden-/parenteraler Ernährung und 3 bei ausschließlicher/nahezu ausschließlicher solcher Ernährung. Selbstständig, nicht täglich oder nicht dauerhaft = 0. Essen und Trinken werden auch bei vollständiger Sondenernährung gesondert bewertet; Schluckunfähigkeit ist unselbstständig. Der Rechner überschreibt diese Antworten nicht.

## Modul 5 im Detail

Nur ärztlich angeordnete, krankheitsbezogene und voraussichtlich mindestens sechs Monate notwendige Maßnahmen mit personellem Hilfebedarf erfassen. Die berufliche Qualifikation der helfenden Person ist grundsätzlich unerheblich. Ärztliche oder therapeutische Behandlung selbst, etwa ein Therapie-Hausbesuch, zählt nicht einfach als unterstützte Eigenmaßnahme.

### Gruppe A: 5.1–5.7

Tages-, Wochen- und Monatshäufigkeiten getrennt summieren. Tagesdurchschnitt = Tagessumme + Wochensumme/7 + Monatssumme/30. Gemäß BRi S.108 Fußnote 13 bei jedem Rechenschritt auf vier Nachkommastellen runden. Punkte:

| Durchschnitt pro Tag | Gruppenpunkte |
|---|---:|
| unter 1 | 0 |
| 1 bis einschließlich 3 | 1 |
| über 3 bis einschließlich 8 | 2 |
| über 8 | 3 |

Beim Geben von Medikamenten wird das Richten nicht zusätzlich gezählt. Die Anzahl der Tabletten ist keine Anzahl von Maßnahmen. Verabreichungsort und Häufigkeit sind maßgeblich. Paarige Hilfsmittel zählen bei einem gemeinsamen An- oder Ablegen zusammen als eine Maßnahme. Hilfe beim Aufsetzen einer Brille zählt, ihre alleinige Reinigung nicht. Parenterale Ernährung wird in 4.13 erfasst, nicht doppelt als venöser Zugang in 5.3.

### Gruppe B: 5.8–5.11

Gleiche Tagesumrechnung. Punkte:

| Durchschnitt | Gruppenpunkte |
|---|---:|
| seltener als einmal wöchentlich | 0 |
| mindestens einmal wöchentlich und unter einmal täglich | 1 |
| mindestens einmal und unter dreimal täglich | 2 |
| mindestens dreimal täglich | 3 |

Einmal/Woche entspricht nach Rundung 0,1429/Tag. Die Vergleichsschwelle verwendet deshalb ebenfalls 0,1429. Viermal/Monat = 0,1333/Tag ergibt 0, fünfmal/Monat = 0,1667/Tag ergibt 1. Einfache Beutelversorgung gehört zu M4, Stomapflege/Basisplattenwechsel zu 5.9. Reine Gabe von Abführmitteln gehört zu 5.1.

### Gruppe C: 5.12–5.15

| Kriterium | wöchentlich × | monatlich × | täglich |
|---|---:|---:|---:|
| 5.12 zeit- und technikintensiv | 8,6 | 2 | fest 60 |
| 5.13 Arztbesuche | 4,3 | 1 | nicht vorgesehen |
| 5.14 andere Einrichtungen bis 3 Stunden | 4,3 | 1 | nicht vorgesehen |
| 5.15 Besuche über 3 Stunden | 8,6 | 2 | nicht vorgesehen |

Die erhaltenen Häufigkeitspunkte addieren und in Gruppenpunkte umrechnen: unter 4,3 → 0; 4,3 bis unter 8,6 → 1; 8,6 bis unter 12,9 → 2; 12,9 bis unter 60 → 3; ab 60 → 6. Bei Besuchen zählt notwendige personelle Unterstützung einschließlich Wegzeit. Arzt-Hausbesuche werden nicht erfasst. Ausgedehnte Besuche über drei Stunden einschließlich Wegen werden ausschließlich unter 5.15 erfasst.

### Gruppe D: 5.16

0/1/2/3 nach Selbstständigkeit beim Einhalten der angeordneten Vorschriften. Das Bereitstellen einer Diät allein ist keine Einschränkung in diesem Kriterium. Zusätzliches Eingreifen: höchstens einmal täglich = 1, mehrmals täglich = 2, fast durchgehend = 3. Selbstbestimmte Ablehnung bei erhaltenen mentalen Fähigkeiten ist nicht mit Unselbstständigkeit gleichzusetzen.

Modul-5-Einzelpunkte = A+B+C+D. Maximum = 3+3+6+3 = 15. Keine pauschalen Einzelpunkte je Medikament oder Besuch.

## Umrechnung in gewichtete Punkte

| Modul | Einzelpunktsummen in den fünf Stufen | Gewichtete Punkte |
|---|---|---|
| 1 | 0–1 / 2–3 / 4–5 / 6–9 / 10–15 | 0 / 2,5 / 5 / 7,5 / 10 |
| 2 | 0–1 / 2–5 / 6–10 / 11–16 / 17–33 | 0 / 3,75 / 7,5 / 11,25 / 15 |
| 3 | 0 / 1–2 / 3–4 / 5–6 / 7–65 | 0 / 3,75 / 7,5 / 11,25 / 15 |
| 4 | 0–2 / 3–7 / 8–18 / 19–36 / 37–54 | 0 / 10 / 20 / 30 / 40 |
| 5 | 0 / 1 / 2–3 / 4–5 / 6–15 | 0 / 5 / 10 / 15 / 20 |
| 6 | 0 / 1–3 / 4–6 / 7–11 / 12–18 | 0 / 3,75 / 7,5 / 11,25 / 15 |

Gesamt = M1 + max(M2, M3) + M4 + M5 + M6, jeweils **nach** Umrechnung. Maximal 100. Die Maximalfunktion darf nicht auf die ungewichteten Einzelpunktsummen angewendet werden.

Pflegegrade: unter 12,5 → 0; 12,5 bis unter 27 → 1; 27 bis unter 47,5 → 2; 47,5 bis unter 70 → 3; 70 bis unter 90 → 4; 90 bis 100 → 5. Die abstrakte Schwelle 27 wird getestet, auch wenn nicht jede Dezimalzahl durch die diskreten Module erreichbar ist.

§ 15 Abs.4 ermöglicht bei besonderer Bedarfskonstellation Pflegegrad 5 auch unter 90. BRi S.58–59 konkretisiert die Gebrauchsunfähigkeit beider Arme und Beine. Der Rechner weist auf fachliche Prüfung hin und vergibt diese Ausnahme nicht selbst.

## Unbekannte Angaben

Für jede fehlende Antwort werden der kleinste und größte zulässige Wert betrachtet. Bei 4.13 ist das Maximum 6, obwohl die letzte Antwort nur 3 Punkte trägt. Bei unbekannter Anwendbarkeit von 4.11/12 ist die Untergrenze 0. In M5 wird für jede nicht vollständig bekannte Gruppe der erreichbare obere Gruppenwert angesetzt; bekannte Maßnahmen bleiben in der Untergrenze enthalten. Dann werden beide Grenzen durch die monotonen Modultabellen und die Maximalfunktion M2/M3 geführt.

Dies sind konservative mathematische Grenzen für die erfassten Antworten, keine Wahrscheinlichkeiten oder klinisch zugesicherten Szenarien. Eine fehlende Antwort bleibt auch dann als fehlend markiert (`complete: false`), wenn beide gewichteten Grenzen gleich sind. Die Oberfläche darf daraus keine vollständig beantwortete, scheinbar exakte Bewertung machen.

## Dokumentierte Beispiele und Tests

1. Alle Kriterien selbstständig/entfällt → 0 Punkte, kein rechnerischer Pflegegrad.
2. Alle Kriterien mit maximalem gesetzlichen Wert → Rohsummen 15/33/65/54/15/18, gewichtet 10 + max(15,15) + 40 + 20 + 15 = 100, rechnerisch Pflegegrad 5.
3. Beispiel M5 aus BRi S.109: 3 tägliche Medikamentengaben + 3 monatliche Injektionen + 2 wöchentliche Wärmeanwendungen = 3 + 0,1 + 0,2857 = 3,3857/Tag → 2 Gruppenpunkte. Im Richtlinientext wird der Durchschnitt erläuternd auf eine Dezimalstelle als 3,4 dargestellt; der Algorithmus folgt der Vierstellenregel.
4. M5 Gruppe B aus BRi S.109: täglich eine Einmalkatheterisierung plus zweimal monatlich Abführmethoden werden innerhalb desselben Kriteriums als 32/Monat eingegeben; dazu zweimal wöchentlich Verbandswechsel. 32/30 + 2/7, nach Rechenschritten gerundet = 1,3524/Tag → 2 Punkte.
5. M5 Gruppe C aus BRi S.110: ein wöchentlicher Arztbesuch + ein monatlicher ausgedehnter Besuch = 4,3 + 2 = 6,3 → 1 Gruppenpunkt.
6. Integriertes synthetisches Beispiel: Rohsummen M1=2, M2=2, M3=0, M4=8, M5=1, M6=4 → 2,5 + 3,75 + 20 + 5 + 7,5 = **38,75**, rechnerisch Pflegegrad 2. Vollständige Antwortbelegung im Test.

`node --test tests/calculator.test.js` prüft alle gesetzlichen Tabellenzellen, Grenzen unmittelbar darunter/darauf/darüber, sämtliche möglichen Kombinationen der M2/M3-Rohsummen durch echte Antworten, alle Sonderpunkteskalen, Inkontinenzvoraussetzungen, Sondenernährung, M5-Gruppen/Umrechnungen/Rundung, sämtliche Häufigkeitskriterien, ungültige Eingaben, unbekannte Antworten und dokumentierte Beispiele. Keine Netzwerkzugriffe oder KI-Schätzung in der Berechnung.
