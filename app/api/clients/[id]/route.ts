import { getClient, getClientProjects } from "@/lib/actions"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Client, Project } from "@/lib/types"
import { NextResponse } from "next/server"

export async function generateStaticParams() {
  const posts: { id: number }[] = await fetch(
    'https://api.vercel.app/blog'
  ).then((res) => res.json())
 
  return posts.map((post) => ({
    id: `${post.id}`,
  }))
}
 
export async function GET(
  request: Request,
  { params }: RouteContext<'/api/clients/[id]'>
) {
  const { id } = await params

    const session = await auth.api.getSession({
        headers: await headers(), // Get the auth sessions
    });

    const client = await getClient(Number(id)) as Client
    if (client.responsiblePersonId == session?.user.id) {
        const projects = await getClientProjects(Number(id)) as Project[]
        const resp = {
            status: 200,
            client: client,
            projects: projects
        }
        return NextResponse.json(resp)
    } else {
        const resp = {
            status: 401
        }
        return NextResponse.json(resp)
    }
}