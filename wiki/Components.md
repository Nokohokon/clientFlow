# Genutzte Komponenten

Vorab: Ich werde definitiv vergessen
- , dass diese Datei existiert
- diese Datei zu erweitern
- die Datei zu aktualisieren wenn sich etwas bei Komponenten ändert.

Deshalb:
Gerne ein Issue erstellen / eine Discord MSG an `konnija` schreiben um mich zu erinnern.

Jetzt geht's los:

## Allgemeine Struktur

### Design

Hier befinden sich alle Komponenten, die wiederverwendet werden. 
Diese sind separiert in:

- Cards
    - Hier gibt's quasi alle möglichen Cards, von den Dashboard cards bis zu was weiß ich. Du weißt was ich meine.
- Headings
    - Ja, hier gibts vorgefertigte Heading Components so dass ich die nicht immer neu formatieren muss. Lol. Sogar ne HeroHeading Hihi


### Layout

Hier gibts quasi alle Komponenten die dann unter `/app/[]/page.tsx` verwendet werden. 
Unterteilung in:

-Dashboard 
    - Hier sind quasi die ganzen Sachen die allgemein in den Dashboard Pages genutzt werden
- BreadCrumb.tsx
    - Allgemeine BreadCrumb Komponente, wird in `dashboard/layout.tsx` genutzt.
- Sidebar.tsx
    - Allgemeine Sidebar Komponente, wird ebenfalls in `dashboard/layout.tsx` genutzt.