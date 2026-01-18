 

# CRM mit Better Auth - Setup & Verwendung

BetterAuth Verwaltung für Client Garage

## Setup

### 1. Better Auth installieren


```bash
npm install better-auth better-sqlite3
npm install @better-auth/cli
```


### 2. Auth konfigurieren

**`lib/auth.ts`**


```typescript
import { betterAuth } from "better-auth"; 
import { organization } from "better-auth/plugins"; // Alles wichtige importieren
import Database from "better-sqlite3";


// Auth Object initialisieren.
export const auth = betterAuth({
  database: new Database("dev.db"), // Möglicherweise Path ändern wenn du eine andere DB nutzen willst
  emailAndPassword: {
    enabled: true, // Um sich anmelden zu können 
  },
  plugins: [
    organization({
      teams: {
        enabled: true, // Braucht man für die Teams und Organisationen
      },
    }),
  ],
  user: {
    deleteUser: {
      enabled: true // Das man sich halt löschen kann lol
    },
    additionalFields: {
      initialized: {
        type: "boolean",
        required: true, // Benötigt für Tutorial beim ersten mal Dashboard besuchen
        defaultValue: false,
      },
    },
  },
  advanced: {
    database: {
      useNumberId: true, // Damit wir numerische UserIds haben
    },
    cookiePrefix: "client_garage", // Sieht besser aus
  },
});

```

[](https://www.better-auth.com/docs/plugins/organization)

### 3. Client konfigurieren

**`lib/auth-client.ts`**


```typescript
import { createAuthClient } from "better-auth/client"; 
import { organizationClient } from "better-auth/client/plugins"; // Halt wieder diese ganzen BetterAuth Sachen importieren
import { inferAdditionalFields } from "better-auth/client/plugins"; // Damit wir die zusätzlichen Sachen auch anzeigen können und keinen Type Error bekommen 
import { auth } from "./auth"; // Quasi gleiches wie vorher


// Client jetzt erstellen
export const authClient = createAuthClient({
  plugins: [
    organizationClient({
      teams: {
        enabled: true, // Halt wieder dieser Auth Client das man halt weiß was rein muss
      },
    }),
    inferAdditionalFields<typeof auth>(), // Zusätzliche Felder aktivieren
  ],
  baseURL: "http://localhost:3000" // Kann man theoretisch auch weglassen.
});

```

[](https://www.better-auth.com/docs/plugins/organization)

### 4. Next.js API Route

**`app/api/auth/[...all]/route.ts`**


```typescript
import { auth } from "@/lib/auth"; // Halt die Auth Route. Wow.
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);

```

[](https://www.better-auth.com/docs/integrations/next)

## Datenbank Schema

**`lib/db.ts`**


```typescript
import Database from 'better-sqlite3'; // Better Sqlite importieren ums nutzen zu können

const db = new Database('dev.db'); // DB mit Path erstellen

// Better Auth erstellt automatisch: user, session, account, organization, member, team, invitation, also juckt uns nur noch die client und project logik quasi


// Clients, projekte und die deletions erstellen mit den Typen halt die wir benötigen
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    projects INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    responsiblePersonId TEXT, -- Better Auth User ID
    responsibleOrganizationId TEXT, -- Better Auth Organization ID
    type TEXT CHECK(type IN ('person', 'organization')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    clientId INTEGER,
    finished BOOLEAN DEFAULT FALSE,
    organizationId TEXT, -- Better Auth Organization ID
    teamId TEXT, -- Better Auth Team ID
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients (id)
  );

  CREATE TABLE IF NOT EXISTS deletions (
    projectId INTEGER,
    clientId INTEGER,
    status TEXT,
    FOREIGN KEY (projectId) REFERENCES projects (id),
    FOREIGN KEY (clientId) REFERENCES clients (id)
  );
`);

// Die db exportieren
export default db;

```


### Migration ausführen
- Betterauth erstellt damit das DB-Schema für die Authorization etc.

```bash
npx @better-auth/cli migrate 

```


## Server Actions

**`lib/actions.ts`** (Beispiele)

- Quasi wie wir dann mit den Daten handeln können

```typescript
'use server'; // Explizit angeben für Server Datei

import { headers } from 'next/headers'; // Headers und Auth importieren
import { auth } from './auth';


// Organisation Management


export async function createOrganization(name: string, slug: string) { // Org erstellen mit Name und Slug. Wer nd weiß was das is: https://letmegooglethat.com/?q=slug+programmierung
  const data = await auth.api.createOrganization({
    body: { name, slug },
    headers: await headers(),
  });
  return data;
}

export async function setActiveOrganization(organizationId: string) { // In welcher Organisation arbeitet der User gerade?
  const data = await auth.api.setActiveOrganization({
    body: { organizationId },
    headers: await headers(),
  });
  return data;
}

export async function inviteOrganizationMember(email: string, role: "owner" | "admin" | "member") {
  const data = await auth.api.inviteMember({ // Selbsterklärend. Hoffe ich.
    body: { email, role },
    headers: await headers(),
  });
  return data;
}

// Team Management
export async function createTeam(name: string, organizationId?: string) {
  const data = await auth.api.createTeam({ // Erstellt ein Unterteam in der Organisation
    body: { name, organizationId },
    headers: await headers(),
  });
  return data;
}

```

[](https://www.better-auth.com/docs/plugins/organization)

##  Client-seitige Verwendung (aka. wie nutzt du das)



### Organisation erstellen

```typescript
const { data: organization } = await authClient.organization.create({
  name: "Meine Agentur",
  slug: "meine-agentur",
  logo: "https://example.com/logo.png",
});

```

[](https://www.better-auth.com/docs/plugins/organization)

### Aktive Organization setzen


```typescript
const { data } = await authClient.organization.setActive({
  organizationId: "org-id",
});

```

[](https://www.better-auth.com/docs/plugins/organization)

### Mitglieder einladen


```typescript
const { data } = await authClient.organization.inviteMember({
  email: "kollege@example.com",
  role: "member",
  organizationId: "org-id",
  teamId: "team-id", // Optional
});

```

[](https://www.better-auth.com/docs/plugins/organization)

## React Components (wie kannst du dir was anzeigen lassen?)

### Aktive Organization anzeigen


```tsx
function ActiveOrganization() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  
  return (
    <div>
      {activeOrganization ? (
        <p>Aktive Organization: {activeOrganization.name}</p>
      ) : (
        <p>Keine aktive Organization</p>
      )}
    </div>
  );
}

```

[](https://www.better-auth.com/docs/plugins/organization)

### Organisation Liste


```tsx
function OrganizationList() {
  const { data: organizations, isPending } = authClient.useListOrganizations();
  
  if (isPending) return <p>Loading...</p>;
  
  return (
    <div>
      {organizations?.map((org) => (
        <div key={org.id}>
          <h3>{org.name}</h3>
          <button onClick={() => authClient.organization.setActive({
            organizationId: org.id
          })}>
            Als aktiv setzen
          </button>
        </div>
      ))}
    </div>
  );
}

```

[](https://www.better-auth.com/docs/plugins/organization)

### Organization Switcher


```tsx
function OrganizationSwitcher() {
  const { data: organizations } = authClient.useListOrganizations();
  const { data: activeOrg } = authClient.useActiveOrganization();
  
  return (
    <select 
      value={activeOrg?.id || ""} 
      onChange={(e) => authClient.organization.setActive({
        organizationId: e.target.value
      })}
    >
      {organizations?.map(org => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  );
}

```

[](https://www.better-auth.com/docs/plugins/organization)

## Praxsibeispiele

### Client für Organisation erstellen


```typescript
async function createClientForOrganization() {
  const { data: activeOrg } = await authClient.organization.getFullOrganization();
  
  const result = await createClient(
    "Kunde GmbH",
    "kunde@example.com",
    undefined, // keine responsiblePerson
    activeOrg?.id, // responsibleOrganizationId
    "organization"
  );
  
  return result;
}

```


### Team-Projekt erstellen


```typescript
async function createTeamProject() {
  const { data: activeOrg } = await authClient.organization.getFullOrganization();
  const teams = await listTeams(activeOrg?.id);
  
  const result = await createProject(
    "Neues Projekt",
    clientId,
    activeOrg?.id, // organizationId
    teams[0]?.id // teamId
  );
  
  return result;
}

```


### Berechtigungen prüfen


```tsx
function AdminPanel() {
  const { data: memberRole } = authClient.organization.getActiveMemberRole();
  
  if (memberRole?.role === "admin" || memberRole?.role === "owner") {
    return (
      <div>
        <h2>Admin Panel</h2>
        <button onClick={() => /* Mitglied einladen */}>
          Mitglied einladen
        </button>
      </div>
    );
  }
  
  return <p>Keine Admin-Berechtigung</p>;
}

```

[](https://www.better-auth.com/docs/plugins/organization)

## Wichtig:

- **Multi-Organization Support**: Benutzer können Mitglied mehrerer Organizations sein[](https://www.better-auth.com/docs/plugins/organization)
- **Team-Hierarchie**: Organisationen können Teams haben[](https://www.better-auth.com/docs/plugins/organization)
- **Automatisches Einladungssystem**: E-Mail-Einladungen mit Rollen[](https://www.better-auth.com/docs/plugins/organization)
- **Granulare Berechtigungen**: Owner, Admin, Member Rollen[](https://www.better-auth.com/docs/plugins/organization)
- **Aktive Organization**: Workspace-Konzept für bessere UX[](https://www.better-auth.com/docs/plugins/organization)

## Weitere Ressourcen

- [Better Auth Organization Dokumentation](https://www.better-auth.com/docs/plugins/organization)
- [Next.js Integration Guide](https://www.better-auth.com/docs/integrations/next)

---

**