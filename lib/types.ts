export interface client {
    id:  number,
    name: string,
    email: string,
    projects: number,
}

export interface project {
    id: number,
    title: string,
    clientId: number,
}

export interface deletion {
    projectId: number,
    clientId: number
    status: string,
}