// User Interface (dein ehemaliges "profile") - Better Auth managed
export interface User {
	id: string, // Better Auth nutzt string IDs
	name: string,
	email: string,
	initialized: boolean,
	// Teams werden über Better Auth Organization verwaltet
}

// Client bleibt größtenteils gleich
export interface Client {
	id: number,
	name: string,
	email: string,
	projects: number,
	createdAt: string,
	updatedAt: string,
	responsiblePersonId ? : string, // Better Auth User ID
	responsibleOrganizationId ? : string, // Better Auth Organization ID
	type: "person" | "organization",
}

// Project mit Better Auth Organization/Team Referenzen
export interface Project {
	id: number,
	title: string,
	clientId: number,
	finished: boolean,
	organizationId ? : string, // Better Auth Organization
	teamId ? : string, // Better Auth Team
	createdAt: string,
	updatedAt: string,
}

// Deletion bleibt gleich
export interface Deletion {
	projectId: number,
	clientId: number,
	status: string,
}

// Team Interface entfällt - wird durch Better Auth Organization ersetzt