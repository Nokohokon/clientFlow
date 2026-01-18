import Database from 'better-sqlite3';

const db = new Database('dev.db');

// Deine bestehenden Tabellen
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    projects INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    responsiblePerson INTEGER,
    responsibleTeam INTEGER,
    type TEXT CHECK(type IN ('person', 'team')) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    clientId INTEGER,
    finished BOOLEAN DEFAULT FALSE,
    isTeamProject BOOLEAN DEFAULT FALSE,
    team INTEGER,
    teamMembers TEXT, -- JSON string für Array
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clientId) REFERENCES clients (id)
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner INTEGER,
    admins TEXT, -- JSON string für Array
    members TEXT, -- JSON string für Array
    projects TEXT, -- JSON string für Array
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    createdBy INTEGER
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