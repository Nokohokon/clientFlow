import { NextResponse } from "next/server";
import { getClients, createClient, deleteClient, updateClient } from "@/lib/actions";
import { client } from "@/lib/types";


export async function GET (request: Request) {
    const clientsData = await getClients() as client[];
    return NextResponse.json({clientsData})

}

export async function POST (request: Request) {
    const body = await request.json();
    const {name, email, responsiblePerson, responsibleTeam } = body;
    const resp = (responsiblePerson == null ? await createClient(name, email, responsibleTeam, "team") : await createClient(name, email, responsiblePerson, "person"));

    if (resp.status == 200 ) {
        return NextResponse.json({status: 200, client: resp.newClient});
    } else {
        return NextResponse.json({status: 15023, client: resp.newClient});
    }
}

export async function DELETE (request: Request) {
    const body = await request.json();
    const {id} = body;
    const response = await deleteClient(id);
    return NextResponse.json({status: response.status});
}

export async function PUT (request: Request) {
    const body = await request.json();
    const { id } = body;

    const response = await updateClient(id, body); 
    return NextResponse.json({status: response.status, client: response.client});   
}
