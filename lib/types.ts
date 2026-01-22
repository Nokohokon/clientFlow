// User Interface, du als User quasi.
export interface User {
	id: string, // Better Auth User ID.
	name: string,
	email: string,
	initialized: boolean,
	// Teams werden über Better Auth Organization verwaltet
}

// CLient Interface mit Better Auth Referenzen
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
	completed: boolean | number,
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

// Deletion - für den Fall, dass ich das iwann brauche.
export interface Deletion {
	projectId: number,
	clientId: number,
	status: string,
}
