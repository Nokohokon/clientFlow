import { NextResponse } from "next/server";
import { getUserDashboardData} from "@/lib/actions";
import { Client } from "@/lib/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";



export async function GET (request: Request) {
    const session = await auth.api.getSession({
        headers: await headers(), // Get the auth sessions
    });
    if (!session) {
        return NextResponse.json({status: 401}) // Wenn nd eingeloggt, dann hasta la vista
    }

    const clientsData = await getUserDashboardData(session.user.id); // gette die daten und gebe zurück.
    return NextResponse.json(clientsData)

}
