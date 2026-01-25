'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from './auth';
import { Client, Project, Deletion, User } from './types';
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
	await insertAction('createOrganization', `Created organization ${name}`);
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
	await insertAction('inviteOrganizationMember', `Invited ${email} as ${role}`);
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
	await insertAction('createTeam', `Created team ${name}`);
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
	await insertAction('addTeamMember', `Added user ${userId} to team ${teamId}`);
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
	await insertAction('removeTeamMember', `Removed user ${userId} from team ${teamId}`);
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

export async function getUserClients(id: User["id"]) {
	const clients = db.prepare('SELECT * FROM clients WHERE responsiblePersonId = (?)').all(id);
	console.log('getUserClients for userId:', id, clients);
	return clients as Client[];
}

export async function getClient(id: Client["id"]) {
	const client = db.prepare('SELECT * FROM clients WHERE id = (?)').get(id);
	return client as Client | undefined;
}

interface dashboardData {
	clientNumber: number,
	runningProjects: number,
	organisations: number,
	organisationProjects: number,
	teamNumbers: number
}

export async function getUserDashboardData(userId: string) {
	// Zahl der Clients, für die der Nutzer verantwortlich ist
	const clients = db.prepare('SELECT id FROM clients WHERE responsiblePersonId = (?)').all(userId) as { id: number }[];
	const clientNumber = clients.length;

	let runningProjects = 0;
	let organisationProjects = 0;
	let organisations = 0;
	let teamNumbers = 0;

	if (clientNumber > 0) {
		const clientIds = clients.map(c => c.id);
		const placeholders = clientIds.map(() => '?').join(',');

		const rpStmt = db.prepare(`SELECT COUNT(*) as count FROM projects WHERE finished = 0 AND clientId IN (${placeholders})`);
		const rpRow = rpStmt.get(...clientIds) as { count: number } | undefined;
		runningProjects = rpRow ? Number(rpRow.count) : 0;

		const tnStmt = db.prepare(`SELECT COUNT(DISTINCT teamId) as count FROM projects WHERE clientId IN (${placeholders}) AND teamId IS NOT NULL`);
		const tnRow = tnStmt.get(...clientIds) as { count: number } | undefined;
		teamNumbers = tnRow ? Number(tnRow.count) : 0;
	}

	// Anzahl unterschiedlicher Organisationen, die in den Clients des Nutzers referenziert werden
	const orgsCountRow = db.prepare('SELECT COUNT(DISTINCT responsibleOrganizationId) as count FROM clients WHERE responsiblePersonId = (?) AND responsibleOrganizationId IS NOT NULL').get(userId) as { count: number } | undefined;
	organisations = orgsCountRow ? Number(orgsCountRow.count) : 0;

	if (organisations > 0) {
		const orgRows = db.prepare('SELECT DISTINCT responsibleOrganizationId as orgId FROM clients WHERE responsiblePersonId = (?) AND responsibleOrganizationId IS NOT NULL').all(userId) as { orgId: string }[];
		const orgIds = orgRows.map(r => r.orgId);
		const placeholdersOrg = orgIds.map(() => '?').join(',');
		const opStmt = db.prepare(`SELECT COUNT(*) as count FROM projects WHERE organizationId IN (${placeholdersOrg})`);
		const opRow = opStmt.get(...orgIds) as { count: number } | undefined;
		organisationProjects = opRow ? Number(opRow.count) : 0;
	}

	const latestActions = db.prepare('SELECT * FROM actions ORDER BY timestamp DESC LIMIT 5').all();

	return {
		clientNumber,
		runningProjects,
		organisations,
		organisationProjects,
		teamNumbers,
		latestActions
	} as dashboardData;
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
	await insertAction('createClient', `Created client ${name} with email ${email}`);
	revalidatePath('/');
	return { status: 200, client: newClient };
}


export async function updateClient(id: Client["id"], data: Partial < Omit < Client, "id" | "createdAt" | "projects" >> ) {
	// If an email is provided, ensure it's not already used by another client
	if (data.email) {
		const existing = db.prepare('SELECT id FROM clients WHERE email = (?)').get(data.email as string) as { id: Client["id"] } | undefined;
		if (existing && String(existing.id) !== String(id)) {
			return { status: 15023, client: null };
		}
	}

	const fields = Object.keys(data) as (keyof typeof data)[];
	if (fields.length === 0) {
		return { status: 400, error: 'No fields to update', client: null };
	}

	const setClause = fields.map(field => `${field} = ?`).join(', ');
	const values = fields.map(field => data[field]);

	const stmt = db.prepare(`UPDATE clients SET ${setClause}, updatedAt = ? WHERE id = ?`);
	const now = new Date().toISOString();
	stmt.run(...values, now, id);

	const updatedClient = db.prepare('SELECT * FROM clients WHERE id = (?)').get(id) as Client;
	await insertAction('updateClient', `Updated client ${updatedClient.name} (ID: ${id})`);
	revalidatePath('/');
	return { status: 200, client: updatedClient };
}

export async function deleteClient(id: Client["id"]) {
	db.prepare('DELETE FROM projects WHERE clientId = (?)').run(id);
	db.prepare('DELETE FROM clients WHERE id = (?)').run(id);
	await insertAction('deleteClient', `Deleted client with ID ${id}`);
	revalidatePath('/');
	return { status: 200 };
}

export async function insertAction(actionType: string, description: string) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});
	const userId = session?.user.id || 'unknown';
	const insert = db.prepare('INSERT INTO actions (userId, actionType, description, timestamp) VALUES (?, ?, ?)');
	const now = new Date().toISOString();
	insert.run(userId, actionType, description, now);
	revalidatePath('/');
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
	// ensure client exists to avoid foreign key constraint errors
	const clientRow = db.prepare('SELECT id FROM clients WHERE id = (?)').get(clientId);
	if (!clientRow) {
		return { status: 404, error: 'Client not found', project: null };
	}

	const insert = db.prepare(`
	INSERT INTO projects (title, clientId, finished, organizationId, teamId, createdAt, updatedAt) 
	VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
	const now = new Date().toISOString();
	console.log(title,clientId,0, organizationId || null, teamId || null, now, now)
	console.log(typeof(clientId))

	try {
		insert.run(title, clientId, 0, organizationId || null, teamId || null, now, now);
		db.prepare('UPDATE clients SET projects = projects + 1 WHERE id = (?)').run(clientId);
	} catch (err: any) {
		// return a clearer error instead of crashing the server
		if (err && err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
			return { status: 400, error: 'Foreign key constraint failed', detail: err.message };
		}
		return { status: 500, error: 'Database error', detail: err?.message };
	}

	await insertAction('createProject', `Created project ${title} for client ID ${clientId}`);

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
	await insertAction('updateProject', `Updated project ${updatedProject.title} (ID: ${id})`);
	revalidatePath('/');
	return { status: 200, project: updatedProject };
}

export async function toggleProjectFinished(id: Project["id"]) {
	const project = db.prepare('SELECT finished FROM projects WHERE id = (?)').get(id) as { finished: boolean };
	const newStatus = !project.finished;

	const stmt = db.prepare('UPDATE projects SET finished = ?, updatedAt = ? WHERE id = ?');
	const now = new Date().toISOString();
	stmt.run(newStatus ? 1 : 0, now, id);
	await insertAction('toggleProjectFinished', `Set project ID ${id} finished status to ${newStatus}`);

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
	await insertAction('deleteProject', `Deleted project with ID ${id}`);

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
	await insertAction('createDeletion', `Created deletion for project ID ${projectId} and client ID ${clientId}`);
	revalidatePath('/');
	return { status: 200, deletion: newDeletion };
}

export async function updateDeletionStatus(projectId: Deletion["projectId"], clientId: Deletion["clientId"], status: Deletion["status"]) {
	const stmt = db.prepare('UPDATE deletions SET status = ? WHERE projectId = (?) AND clientId = (?)');
	stmt.run(status, projectId, clientId);
	await insertAction('updateDeletionStatus', `Updated deletion status for project ID ${projectId} and client ID ${clientId} to ${status}`);
	revalidatePath('/');
	return { status: 200 };
}

export async function deleteDeletion(projectId: Deletion["projectId"], clientId: Deletion["clientId"]) {
	db.prepare('DELETE FROM deletions WHERE projectId = (?) AND clientId = (?)').run(projectId, clientId);
	await insertAction('deleteDeletion', `Deleted deletion for project ID ${projectId} and client ID ${clientId}`);
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