'use server';

import { revalidatePath } from 'next/cache';
import { client, project, team, deletion, profile } from './types';
import db from './db';

// ================ CLIENT ACTIONS ================

export async function getClients() {
	const clients = db.prepare('SELECT * FROM clients').all();
	return clients as client[];
}

export async function getClient(id: client["id"]) {
	const client = db.prepare('SELECT * FROM clients WHERE id = (?)').get(id);
	return client as client | undefined;
}

export async function createClient(name: client["name"], email: client["email"], responsible: client["responsiblePerson"] | client["responsibleTeam"], type: "person" | "team") {
	const existing = db.prepare('SELECT * FROM clients WHERE email = (?)').get(email as string);
	if (existing) {
		return { status: 15023, client: null };
	}

	const insert = db.prepare('INSERT INTO clients (name, email, responsiblePerson, responsibleTeam, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
	const now = new Date().toISOString();
	insert.run(name, email, type === "person" ? responsible : null, type === "team" ? responsible : null, type, now, now);

	const newClient = db.prepare('SELECT * FROM clients WHERE email = (?)').get(email as string) as client;
	revalidatePath('/');
	return { status: 200, client: newClient };
}

export async function updateClient(id: client["id"], data: Partial < Omit < client, "id" | "createdAt" | "projects" >> ) {
	const fields = Object.keys(data) as(keyof typeof data)[];
	const setClause = fields.map(field => `${field} = ?`).join(', ');
	const values = fields.map(field => data[field]);

	const stmt = db.prepare(`UPDATE clients SET ${setClause}, updatedAt = ? WHERE id = ?`);
	const now = new Date().toISOString();
	stmt.run(...values, now, id);

	const updatedClient = db.prepare('SELECT * FROM clients WHERE id = (?)').get(id) as client;
	revalidatePath('/');
	return { status: 200, client: updatedClient };
}

export async function deleteClient(id: client["id"]) {
	db.prepare('DELETE FROM projects WHERE clientId = (?)').run(id);
	db.prepare('DELETE FROM clients WHERE id = (?)').run(id);
	revalidatePath('/');
	return { status: 200 };
}

// ================ PROJECT ACTIONS ================

export async function getProjects() {
	const projects = db.prepare('SELECT * FROM projects').all();
	return projects as project[];
}

export async function getProject(id: project["id"]) {
	const project = db.prepare('SELECT * FROM projects WHERE id = (?)').get(id);
	return project as project | undefined;
}

export async function getClientProjects(clientId: client["id"]) {
	const projects = db.prepare('SELECT * FROM projects WHERE clientId = (?)').all(clientId);
	return projects as project[];
}

export async function getTeamProjects(teamId: team["id"]) {
	const projects = db.prepare('SELECT * FROM projects WHERE team = (?)').all(teamId);
	return projects as project[];
}

export async function createProject(title: project["title"], clientId: client["id"], isTeamProject: boolean = false, teamId ? : team["id"], teamMembers ? : number[]) {
	const insert = db.prepare('INSERT INTO projects (title, clientId, finished, isTeamProject, team, teamMembers, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
	const now = new Date().toISOString();
	insert.run(
		title,
		clientId,
		false,
		isTeamProject,
		teamId || null,
		teamMembers ? JSON.stringify(teamMembers) : null,
		now,
		now
	);

	db.prepare('UPDATE clients SET projects = projects + 1 WHERE id = (?)').run(clientId);
	revalidatePath('/');

	const newProject = db.prepare('SELECT * FROM projects WHERE title = (?) AND clientId = (?)').get(title, clientId) as project;
	return { status: 200, project: newProject };
}

export async function updateProject(id: project["id"], data: Partial < Omit < project, "id" | "createdAt" >> ) {
	const fields = Object.keys(data) as(keyof typeof data)[];
	const setClause = fields.map(field => `${field} = ?`).join(', ');
	const values = fields.map(field => {
		if (field === 'teamMembers' && Array.isArray(data[field])) {
			return JSON.stringify(data[field]);
		}
		return data[field];
	});

	const stmt = db.prepare(`UPDATE projects SET ${setClause}, updatedAt = ? WHERE id = ?`);
	const now = new Date().toISOString();
	stmt.run(...values, now, id);

	const updatedProject = db.prepare('SELECT * FROM projects WHERE id = (?)').get(id) as project;
	revalidatePath('/');
	return { status: 200, project: updatedProject };
}

export async function toggleProjectFinished(id: project["id"]) {
	const project = db.prepare('SELECT finished FROM projects WHERE id = (?)').get(id) as { finished: boolean };
	const newStatus = !project.finished;

	const stmt = db.prepare('UPDATE projects SET finished = ?, updatedAt = ? WHERE id = ?');
	const now = new Date().toISOString();
	stmt.run(newStatus, now, id);

	revalidatePath('/');
	return { status: 200, finished: newStatus };
}

export async function deleteProject(id: project["id"]) {
	const row = db.prepare('SELECT clientId FROM projects WHERE id = (?)').get(id) as { clientId: client["id"] } | undefined;
	const clientId: client["id"] | null = row ? row.clientId : null;

	db.prepare('DELETE FROM projects WHERE id = (?)').run(id);

	if (clientId !== null && typeof clientId !== 'undefined') {
		db.prepare('UPDATE clients SET projects = projects - 1 WHERE id = (?)').run(clientId);
	}

	revalidatePath('/');
	return { status: 200 };
}

// ================ TEAM ACTIONS ================

export async function getTeams() {
	const teams = db.prepare('SELECT * FROM teams').all();
	return teams as team[];
}

export async function getTeam(id: team["id"]) {
	const team = db.prepare('SELECT * FROM teams WHERE id = (?)').get(id);
	return team as team | undefined;
}

export async function getUserTeams(userId: number) {
	const teams = db.prepare('SELECT * FROM teams WHERE owner = (?) OR members LIKE (?) OR admins LIKE (?)').all(
		userId,
		`%${userId}%`,
		`%${userId}%`
	);
	return teams as team[];
}

export async function createTeam(name: team["name"], owner: team["owner"], createdBy: team["createdBy"]) {
	const insert = db.prepare('INSERT INTO teams (name, owner, admins, members, projects, createdAt, updatedAt, createdBy) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
	const now = new Date().toISOString();
	insert.run(
		name,
		owner,
		JSON.stringify([owner]), // Owner ist automatisch Admin
		JSON.stringify([]),
		JSON.stringify([]),
		now,
		now,
		createdBy
	);

	const newTeam = db.prepare('SELECT * FROM teams WHERE name = (?) AND owner = (?)').get(name, owner) as team;
	revalidatePath('/');
	return { status: 200, team: newTeam };
}

export async function addTeamMember(teamId: team["id"], userId: number) {
	const team = db.prepare('SELECT members FROM teams WHERE id = (?)').get(teamId) as { members: string };
	const members = JSON.parse(team.members || '[]');

	if (!members.includes(userId)) {
		members.push(userId);
		const stmt = db.prepare('UPDATE teams SET members = ?, updatedAt = ? WHERE id = ?');
		const now = new Date().toISOString();
		stmt.run(JSON.stringify(members), now, teamId);
	}

	revalidatePath('/');
	return { status: 200 };
}

export async function removeTeamMember(teamId: team["id"], userId: number) {
	const team = db.prepare('SELECT members FROM teams WHERE id = (?)').get(teamId) as { members: string };
	const members = JSON.parse(team.members || '[]');

	const updatedMembers = members.filter((id: number) => id !== userId);
	const stmt = db.prepare('UPDATE teams SET members = ?, updatedAt = ? WHERE id = ?');
	const now = new Date().toISOString();
	stmt.run(JSON.stringify(updatedMembers), now, teamId);

	revalidatePath('/');
	return { status: 200 };
}

export async function addTeamAdmin(teamId: team["id"], userId: number) {
	const team = db.prepare('SELECT admins FROM teams WHERE id = (?)').get(teamId) as { admins: string };
	const admins = JSON.parse(team.admins || '[]');

	if (!admins.includes(userId)) {
		admins.push(userId);
		const stmt = db.prepare('UPDATE teams SET admins = ?, updatedAt = ? WHERE id = ?');
		const now = new Date().toISOString();
		stmt.run(JSON.stringify(admins), now, teamId);
	}

	revalidatePath('/');
	return { status: 200 };
}

export async function deleteTeam(id: team["id"]) {
	db.prepare('DELETE FROM teams WHERE id = (?)').run(id);
	revalidatePath('/');
	return { status: 200 };
}

// ================ DELETION ACTIONS ================

export async function getDeletions() {
	const deletions = db.prepare('SELECT * FROM deletions').all();
	return deletions as deletion[];
}

export async function createDeletion(projectId: deletion["projectId"], clientId: deletion["clientId"], status: deletion["status"] = "pending") {
	const insert = db.prepare('INSERT INTO deletions (projectId, clientId, status) VALUES (?, ?, ?)');
	insert.run(projectId, clientId, status);

	const newDeletion = db.prepare('SELECT * FROM deletions WHERE projectId = (?) AND clientId = (?)').get(projectId, clientId) as deletion;
	revalidatePath('/');
	return { status: 200, deletion: newDeletion };
}

export async function updateDeletionStatus(projectId: deletion["projectId"], clientId: deletion["clientId"], status: deletion["status"]) {
	const stmt = db.prepare('UPDATE deletions SET status = ? WHERE projectId = (?) AND clientId = (?)');
	stmt.run(status, projectId, clientId);

	revalidatePath('/');
	return { status: 200 };
}

export async function deleteDeletion(projectId: deletion["projectId"], clientId: deletion["clientId"]) {
	db.prepare('DELETE FROM deletions WHERE projectId = (?) AND clientId = (?)').run(projectId, clientId);
	revalidatePath('/');
	return { status: 200 };
}

// ================ SEARCH & FILTER ACTIONS ================

export async function searchClients(query: string) {
	const clients = db.prepare('SELECT * FROM clients WHERE name LIKE (?) OR email LIKE (?)').all(`%${query}%`, `%${query}%`);
	return clients as client[];
}

export async function searchProjects(query: string) {
	const projects = db.prepare('SELECT * FROM projects WHERE title LIKE (?)').all(`%${query}%`);
	return projects as project[];
}

export async function getClientsByType(type: "person" | "team") {
	const clients = db.prepare('SELECT * FROM clients WHERE type = (?)').all(type);
	return clients as client[];
}

export async function getFinishedProjects() {
	const projects = db.prepare('SELECT * FROM projects WHERE finished = 1').all();
	return projects as project[];
}

export async function getActiveProjects() {
	const projects = db.prepare('SELECT * FROM projects WHERE finished = 0').all();
	return projects as project[];
}