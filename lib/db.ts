import Database from 'better-sqlite3';

const db = new Database('dev.db');


// Better Auth erstellt automatisch: user, session, account, organization, member, team, invitation

// Erstellung von clients Tabelle, projects und deletions tabelle. Benötigt für ./actions.ts und ./types.ts ig?
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    projects INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    responsiblePersonId INTEGER, -- Better Auth User ID (string)
    responsibleOrganizationId TEXT, -- Better Auth Organization ID (string)
    type TEXT CHECK(type IN ('person', 'organization')) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    phone TEXT,
    address TEXT
  
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

export default db;