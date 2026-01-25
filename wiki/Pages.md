# Genutzte Pages

Vorab: Ich werde definitiv vergessen
- , dass diese Datei existiert
- diese Datei zu erweitern
- die Datei zu aktualisieren wenn sich etwas bei den Unterseiten ändert.

Deshalb:
Gerne ein Issue erstellen / eine Discord MSG an `konnija` schreiben um mich zu erinnern, wenn etwas nicht aktuell ist.

Jetzt geht's los:

## Allgemeine Struktur

- Unterteilt in `app/.../page.tsx` und `app/api/.../route.ts` (App router halt von next js) 
- Für team/Orga Clients und normale User Clients jeweils GETRENNT. Für die ORDNUNG!!!

## API 

`api/auth/[...all]/route.ts` 
- API Route von Betterauth halt.

`api/clients/route.ts` 
- API Route für CRUD-Operationen quasi von den Clients.

`api/dashboard/route.ts`
- Gibt quasi alle Informationen für `app/dashboard/page.tsx` weiter.

`api/clients/[id]/route.ts`
- API Route für CRUD-Operationen für bestimmte Clients. Oder sowas.

`api/clients/[id]/projects/[projectId]/route.ts`
- CRUD Operationen für bestimmte Projekte eines Clients.


## Seiten

`app/page.tsx`
- Startseite. Hier kannste dich einloggen / registrieren.

`app/dashboard/page.tsx`
- Hier bekommst du einen groben Überblick über dein Dashboard. Also Statistiken und du kannst halt hin und her navigieren. Eif die Startseite quasi für eingeloggte User. Du siehst auch eine Liste deiner letzten Aktionen.

`app/dashboard/clients/page.tsx`
- Hier siehst du eine Liste mit deinen Clients und den wichtigsten Infos, kannst einen Neuen anlegen, Bestehende löschen und auf Clients klicken um sie extended zu verwalten.

`app/dashboard/clients/[id]/page.tsx`
- Hier werden Informationen über einen bestimmten Kunden angezeigt. Du bekommst Zugriff auf Aktionen um den User zu verwalten und kommst an seine Projekte heran.

`app/dashboard/clients/[id]/projects/[projectId]/page.tsx`
- Hier werden die Informationen über das jeweilige Client Projekt veranschaulicht und du kannst es bearbeiten.
