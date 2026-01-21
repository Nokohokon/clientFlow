import { getClient, getProject } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Client, Project } from "@/lib/types"
import { NextResponse } from "next/server"

export async function generateStaticParams() {
  const clientId: { id: number }[] = await fetch(
    'https://api.vercel.app/blog'
  ).then((res) => res.json())
 
  return clientId.map((client) => ({
    id: `${client.id}`,
  }))
}
 
export async function GET(
  request: Request,
  { params }: RouteContext<'/api/clients/[id]/projects/[projectId]'>
) {
  const { id, projectId } = await params

    const session = await auth.api.getSession({
        headers: await headers(), // Get the auth sessions
    });

    const client = await getClient(Number(id)) as Client
    if (client.responsiblePersonId == session?.user.id) {
      const project = await getProject(Number(projectId)) as Project | undefined
      if (!project) return NextResponse.json({ status: 404 })
      if (project.clientId !== Number(id)) return NextResponse.json({ status: 403 })

      const resp = {
        status: 200,
        project: project,
        person: {
          name: session?.user.name,
          email: session?.user.email,
        }
      }
      return NextResponse.json(resp)
    } else {
        const resp = {
            status: 401
        }
        return NextResponse.json(resp)
    }
}