'use server';

import { revalidatePath } from 'next/cache';
import { client, project } from './types';

import db from './db';

export async function getClients() {
  const clients = db.prepare('SELECT * FROM clients').all();
  console.log(clients);
  return clients;
}

export async function getClientProjects(id: client["id"]) {
    const projects = db.prepare(`SELECT * FROM projects WHERE clientId = (?)`).all(id);
    console.log(projects);
    return projects;
}

export async function createProject(name: client["name"], clientId: client["id"]) {
    console.log('test')
    const insert = db.prepare('INSERT INTO projects (title, clientId) VALUES (?, ?)');
    insert.run(name, clientId);
    db.prepare('UPDATE clients SET projects = projects + 1 WHERE id = (?)').run(clientId);
    revalidatePath('/');
}

export async function deleteProject(id: project["id"]) {
  const row = db.prepare('SELECT clientId FROM projects WHERE id = (?)').get(id) as { clientId: client["id"] } | undefined;
  const clientId: client["id"] | null = row ? row.clientId : null;
  db.prepare('DELETE FROM projects WHERE id = (?)').run(id);
  if (clientId !== null && typeof clientId !== 'undefined') {
    db.prepare('UPDATE clients SET projects = projects - 1 WHERE id = (?)').run(clientId);
  }
  revalidatePath('/');
}

export async function deleteClient(id: client["id"]) {
  db.prepare('DELETE FROM projects WHERE clientId = (?)').run(id);
  db.prepare('DELETE FROM clients WHERE id = (?)').run(id);
  revalidatePath('/');
}

export async function createClient(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  console.log("Test")
  const existing = db.prepare('SELECT * FROM clients WHERE email = (?)').get(email as string);
  if (existing) {
    console.log("Client existiert bereits")
    return false
  }

  const insert = db.prepare('INSERT INTO clients (name, email) VALUES (?, ?)');
  insert.run(name, email);

  revalidatePath('/');
}