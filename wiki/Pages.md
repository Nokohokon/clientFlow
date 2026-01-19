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


## Seiten

`app/page.tsx`
- Startseite. Hier kannste dich einloggen / registrieren.

`app/dashboard/page.tsx`
- Hier bekommst du einen groben Überblick über dein Dashboard. Also Statistiken und du kannst halt hin und her navigieren. Eif die Startseite quasi für eingeloggte User.

`app/dashboard/clients/page.tsx`
- Hier siehst du eine Liste mit deinen Clients und den wichtigsten Infos, kannst einen Neuen anlegen, Bestehende löschen und auf Clients klicken um sie extended zu verwalten.


