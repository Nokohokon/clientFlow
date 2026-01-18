'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from './auth';
import { Client, Project, Deletion } from './types';
import db from './db';

// ================ ORGANIZATION ACTIONS (ersetzt Team Actions) ================

export async function getOrganizations() {
	const data = await auth.api.listOrganizations({
		headers: await headers(),
	});
	return data;
}

export async function createOrganization(name: string, slug: string) {
	const data = await auth.api.createOrganization({
		body: {
			name,
			slug,
		},
		headers: await headers(),
	});
	revalidatePath('/');
	return data;
}

export async function setActiveOrganization(organizationId: string) {
	const data = await auth.api.setActiveOrganization({
		body: {
			organizationId,
		},
		headers: await headers(),
	});
	revalidatePath('/');
	return data;
}

export async function getActiveOrganization() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	return session?.session?.activeOrganizationId;
}

export async function inviteOrganizationMember(email: string, role: "admin" | "member" | "owner") {
	const data = await auth.api.createInvitation({
		body: {
			email,
			role,
		},
		headers: await headers(),
	});
	revalidatePath('/');
	return data;
}

// ================ TEAM ACTIONS (innerhalb Organization) ================

export async function createTeam(name: string, organizationId ? : string) {
	const data = await auth.api.createTeam({
		body: {
			name,
			organizationId,
		},
		headers: await headers(),
	});
	revalidatePath('/');
	return data;
}

export async function listTeams(organizationId ? : string) {
	const data = await auth.api.listOrganizationTeams({
		query: {
			organizationId,
		},
		headers: await headers(),
	});
	return data;
}

export async function addTeamMember(teamId: string, userId: string) {
	const data = await auth.api.addTeamMember({
		body: {
			teamId,
			userId,
		},
		headers: await headers(),
	});
	revalidatePath('/');
	return data;
}

export async function removeTeamMember(teamId: string, userId: string) {
	const data = await auth.api.removeTeamMember({
		body: {
			teamId,
			userId,
		},
		headers: await headers(),
	});
	revalidatePath('/');
	return data;
}

export async function setActiveTeam(teamId: string) {
	const data = await auth.api.setActiveTeam({
		body: {
			teamId,
		},
		headers: await headers(),
	});
	revalidatePath('/');
	return data;
}

// ================ CLIENT ACTIONS ================

export async function getClients() {
	const clients = db.prepare('SELECT * FROM clients').all();
	return clients as Client[];
}

export async function getClient(id: Client["id"]) {
	const client = db.prepare('SELECT * FROM clients WHERE id = (?)').get(id);
	return client as Client | undefined;
}

export async function createClient(
	name: Client["name"],
	email: Client["email"],
	responsiblePersonId ? : string,
	responsibleOrganizationId ? : string,
	type: "person" | "organization" = "person"
) {
	const existing = db.prepare('SELECT * FROM clients WHERE email = (?)').get(email as string);
	if (existing) {
		return { status: 15023, client: null };
	}

	const insert = db.prepare(`
    INSERT INTO clients (name, email, responsiblePersonId, responsibleOrganizationId, type, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
	const now = new Date().toISOString();
	insert.run(name, email, responsiblePersonId || null, responsibleOrganizationId || null, type, now, now);

	const newClient = db.prepare('SELECT * FROM clients WHERE email = (?)').get(email as string) as Client;
	revalidatePath('/');
	return { status: 200, client: newClient };
}

export async function updateClient(id: Client["id"], data: Partial < Omit < Client, "id" | "createdAt" | "projects" >> ) {
	const fields = Object.keys(data) as(keyof typeof data)[];
	const setClause = fields.map(field => `${field} = ?`).join(', ');
	const values = fields.map(field => data[field]);

	const stmt = db.prepare(`UPDATE clients SET ${setClause}, updatedAt = ? WHERE id = ?`);
	const now = new Date().toISOString();
	stmt.run(...values, now, id);

	const updatedClient = db.prepare('SELECT * FROM clients WHERE id = (?)').get(id) as Client;
	revalidatePath('/');
	return { status: 200, client: updatedClient };
}

export async function deleteClient(id: Client["id"]) {
	db.prepare('DELETE FROM projects WHERE clientId = (?)').run(id);
	db.prepare('DELETE FROM clients WHERE id = (?)').run(id);
	revalidatePath('/');
	return { status: 200 };
}

// ================ PROJECT ACTIONS ================

export async function getProjects() {
	const projects = db.prepare('SELECT * FROM projects').all();
	return projects as Project[];
}

export async function getProject(id: Project["id"]) {
	const project = db.prepare('SELECT * FROM projects WHERE id = (?)').get(id);
	return project as Project | undefined;
}

export async function getClientProjects(clientId: Client["id"]) {
	const projects = db.prepare('SELECT * FROM projects WHERE clientId = (?)').all(clientId);
	return projects as Project[];
}

export async function getOrganizationProjects(organizationId: string) {
	const projects = db.prepare('SELECT * FROM projects WHERE organizationId = (?)').all(organizationId);
	return projects as Project[];
}

export async function getTeamProjects(teamId: string) {
	const projects = db.prepare('SELECT * FROM projects WHERE teamId = (?)').all(teamId);
	return projects as Project[];
}

export async function createProject(
	title: Project["title"],
	clientId: Client["id"],
	organizationId ? : string,
	teamId ? : string
) {
	const insert = db.prepare(`
    INSERT INTO projects (title, clientId, finished, organizationId, teamId, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
	const now = new Date().toISOString();
	insert.run(title, clientId, false, organizationId || null, teamId || null, now, now);

	db.prepare('UPDATE clients SET projects = projects + 1 WHERE id = (?)').run(clientId);
	revalidatePath('/');

	const newProject = db.prepare('SELECT * FROM projects WHERE title = (?) AND clientId = (?)').get(title, clientId) as Project;
	return { status: 200, project: newProject };
}

export async function updateProject(id: Project["id"], data: Partial < Omit < Project, "id" | "createdAt" >> ) {
	const fields = Object.keys(data) as(keyof typeof data)[];
	const setClause = fields.map(field => `${field} = ?`).join(', ');
	const values = fields.map(field => data[field]);

	const stmt = db.prepare(`UPDATE projects SET ${setClause}, updatedAt = ? WHERE id = ?`);
	const now = new Date().toISOString();
	stmt.run(...values, now, id);

	const updatedProject = db.prepare('SELECT * FROM projects WHERE id = (?)').get(id) as Project;
	revalidatePath('/');
	return { status: 200, project: updatedProject };
}

export async function toggleProjectFinished(id: Project["id"]) {
	const project = db.prepare('SELECT finished FROM projects WHERE id = (?)').get(id) as { finished: boolean };
	const newStatus = !project.finished;

	const stmt = db.prepare('UPDATE projects SET finished = ?, updatedAt = ? WHERE id = ?');
	const now = new Date().toISOString();
	stmt.run(newStatus, now, id);

	revalidatePath('/');
	return { status: 200, finished: newStatus };
}

export async function deleteProject(id: Project["id"]) {
	const row = db.prepare('SELECT clientId FROM projects WHERE id = (?)').get(id) as { clientId: Client["id"] } | undefined;
	const clientId: Client["id"] | null = row ? row.clientId : null;

	db.prepare('DELETE FROM projects WHERE id = (?)').run(id);

	if (clientId !== null && typeof clientId !== 'undefined') {
		db.prepare('UPDATE clients SET projects = projects - 1 WHERE id = (?)').run(clientId);
	}

	revalidatePath('/');
	return { status: 200 };
}

// ================ DELETION ACTIONS ================

export async function getDeletions() {
	const deletions = db.prepare('SELECT * FROM deletions').all();
	return deletions as Deletion[];
}

export async function createDeletion(projectId: Deletion["projectId"], clientId: Deletion["clientId"], status: Deletion["status"] = "pending") {
	const insert = db.prepare('INSERT INTO deletions (projectId, clientId, status) VALUES (?, ?, ?)');
	insert.run(projectId, clientId, status);

	const newDeletion = db.prepare('SELECT * FROM deletions WHERE projectId = (?) AND clientId = (?)').get(projectId, clientId) as Deletion;
	revalidatePath('/');
	return { status: 200, deletion: newDeletion };
}

export async function updateDeletionStatus(projectId: Deletion["projectId"], clientId: Deletion["clientId"], status: Deletion["status"]) {
	const stmt = db.prepare('UPDATE deletions SET status = ? WHERE projectId = (?) AND clientId = (?)');
	stmt.run(status, projectId, clientId);

	revalidatePath('/');
	return { status: 200 };
}

export async function deleteDeletion(projectId: Deletion["projectId"], clientId: Deletion["clientId"]) {
	db.prepare('DELETE FROM deletions WHERE projectId = (?) AND clientId = (?)').run(projectId, clientId);
	revalidatePath('/');
	return { status: 200 };
}

// ================ SEARCH & FILTER ACTIONS ================

export async function searchClients(query: string) {
	const clients = db.prepare('SELECT * FROM clients WHERE name LIKE (?) OR email LIKE (?)').all(`%${query}%`, `%${query}%`);
	return clients as Client[];
}

export async function searchProjects(query: string) {
	const projects = db.prepare('SELECT * FROM projects WHERE title LIKE (?)').all(`%${query}%`);
	return projects as Project[];
}

export async function getClientsByType(type: "person" | "organization") {
	const clients = db.prepare('SELECT * FROM clients WHERE type = (?)').all(type);
	return clients as Client[];
}

export async function getFinishedProjects() {
	const projects = db.prepare('SELECT * FROM projects WHERE finished = 1').all();
	return projects as Project[];
}

export async function getActiveProjects() {
	const projects = db.prepare('SELECT * FROM projects WHERE finished = 0').all();
	return projects as Project[];
}