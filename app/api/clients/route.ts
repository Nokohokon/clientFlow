import { NextResponse } from "next/server";
import { getUserClients, createClient, deleteClient, updateClient, getClient } from "@/lib/actions";
import { Client } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";



export async function GET (request: Request) {

    const session = await auth.api.getSession({
        headers: await headers(), // Get the auth sessions
    });

    if (!session) {
        return NextResponse.json({status: 401})
    } else { 
        const data = getUserClients(session.user.id);
        return NextResponse.json({status: 200, clients: data})
    }
}

export async function POST (request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(), // Get the auth sessions
    });

    if (!session) {
        return NextResponse.json({status: 401})
    } else { 
        const body = await request.json();
        const {name, email, responsiblePerson, responsibleTeam } = body;

        // HAKT STOP KEINE TEAM CLIENTS HIER
        if (responsibleTeam != null) {
            return NextResponse.json({ status: 403 });
        }

        // Ja dings nur aktuelle session darf halt dings responsiblePerson sein
        if (responsiblePerson != null && responsiblePerson !== session.user.id) {
            return NextResponse.json({ status: 403 });
        }

        // Wenn keine responsible person: automatisch session.user.id
        const ownerId = responsiblePerson ?? session.user.id;
        const resp = await createClient(name, email, ownerId);

        if (resp.status == 200 ) {
            return NextResponse.json({status: 200, client: resp.client});
        } else {
            return NextResponse.json({status: 15023, client: resp.client});
        }
    }
}

export async function DELETE (request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(), // Get the auth sessions
    });

    if (!session) {
        return NextResponse.json({status: 401})
    } else { 
        const body = await request.json();
        const {id} = body;

        // nur wenn client von user löschen
        const client = await getClient(id);
        if (!client) return NextResponse.json({ status: 404 });
        if (!client.responsiblePersonId) return NextResponse.json({ status: 403 });
        if (client.responsiblePersonId !== session.user.id) return NextResponse.json({ status: 403 });

        const response = await deleteClient(id);
        return NextResponse.json({status: response.status});
    }
}

export async function PUT (request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(), // Get the auth sessions
    });

    if (!session) {
        return NextResponse.json({status: 401})
    } else { 
        const body = await request.json();
        const { id } = body;

        // Ownership check: nur wenn client is der vom user verwaltet wird.
        const client = await getClient(id);
        if (!client) return NextResponse.json({ status: 404 });
        if (!client.responsiblePersonId) return NextResponse.json({ status: 403 });
        if (client.responsiblePersonId !== session.user.id) return NextResponse.json({ status: 403 });

        const response = await updateClient(id, body); 
        return NextResponse.json({status: response.status, client: response.client});   
    }
}
