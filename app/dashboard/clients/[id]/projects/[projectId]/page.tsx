'use client'

import { Project, Client } from "@/lib/types"
import { useState, useEffect, use } from "react"
import { Loading } from "@/components/design/system/Loading"

interface person {
    name: string,
    email: string
}

export default function ClientPage({
  params,
}: {
  params: Promise<{ projectId: string, id: string }>
}) {
    const { projectId } = use(params);
    const { id} = use(params);
    const [projectData, setProjectData] = useState<Project>()
    const [loading, setLoading] = useState<boolean>(true)
    const [clientData, setClientData] = useState<person>()

    useEffect(() => {
        async function load_data() { // Dashboard Data von API fetchen
            try {
                const response = await fetch(`/api/clients/${id}/projects/${projectId}`);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const data = await response.json();
                console.log('Loaded dashboard data:', data);
                const createdAt = new Date(data.project.createdAt);
                const updatedAt = new Date(data.project.updatedAt);
                setProjectData({...data.project, createdAt,updatedAt})
                setClientData(data.person);
                setLoading(false)
            } catch (err) {
                console.error('Error loading clients', err);
                setLoading(false)
            }
        }
        load_data(); // Dashboard Data setzen
    },[])


    if (loading) {
        return (
            <Loading/>
        )
    }

    return (
        <div>
            <h1>Projekt: {projectData?.title} von {clientData?.name} ({clientData?.email})</h1>
            <p>Erstellt am: {projectData?.createdAt.toString()}</p>
            <p>Aktualisiert am: {projectData?.updatedAt.toString()}</p>
            <p>Status: {projectData?.finished ? "Fertiggestellt" : "Laufend"}</p>
        </div>
    )
}