export interface client {
    id:  number,
    name: string,
    email: string,
    projects: number,
    createdAt: string,
    updatedAt: string,

}

export interface project {
    id: number,
    title: string,
    clientId: number,
    finished: boolean,
    isTeamProject: boolean,
    team?: number,
    teamMembers?: number[],
    createdAt: string,
    updatedAt: string,
}

export interface deletion {
    projectId: number,
    clientId: number
    status: string,
}

export interface team {
    id: number,
    name: string,
    owner: number,
    admins: number[],
    members: number[],
    projects: project[],
    createdAt: string,
    updatedAt: string,
    createdBy: number,
}