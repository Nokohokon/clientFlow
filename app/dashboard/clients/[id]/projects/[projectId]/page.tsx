'use client'

import { Project } from "@/lib/types"
import { useState, useEffect, use } from "react"
import { Loading } from "@/components/design/system/Loading"
import { Heading3 } from "@/components/design/headings/heading-3"
import { Heading4 } from "@/components/design/headings/heading-4"
import { User, Pencil, Calendar, BookmarkCheck, ClockArrowDown } from "lucide-react"
import ClientCard from "@/components/design/cards/ClientCard"
import Link from "next/link"

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
        <div className="flex flex-col">
            <div className={`p-2 rounded-lg border mt-5 border-gray-900 ${projectData?.finished ? 'bg-green-500' : 'bg-red-500'}`}>
                {projectData?.finished ? <p className="flex items-center"><BookmarkCheck/> Abgeschlossen</p> : <p className="flex items-center"><ClockArrowDown/> In Bearbeitung</p> }
            </div>

            <div className="flex flex-row justify-between items-start mt-5">
                <Heading3 className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <div>{projectData?.title}</div>
                        <div className="text-sm text-gray-600">{clientData?.name} • {clientData?.email}</div>
                    </div>
                    <div className="flex gap-2">
                        <button className="text-sm cursor-pointer hover:text-orange-500"><Pencil/></button>
                    </div>
                </Heading3>
                <Heading3 className="pb-10 hover:underline cursor-pointer">
                    <Link href={`#details`}>Details</Link>
                </Heading3>
            </div>

            <section className="grid grid-cols-2 gap-5 my-5" id="details">
                <ClientCard className="flex flex-col items-start bg-orange-300">
                    <div className="flex gap-4 items-center justify-between w-full"><p className="flex items-center gap-4"><Calendar /> Erstellt am:</p> {new Date(projectData?.createdAt ?? '').toDateString().slice(4)}</div>
                    <div className="flex gap-4 items-center justify-between w-full"><p className="flex items-center gap-4"><Calendar /> Aktualisiert am:</p> {new Date(projectData?.updatedAt ?? '').toDateString().slice(4)}</div>
                </ClientCard>

                <ClientCard className="flex flex-col items-start bg-blue-300">
                    <div className="flex items-center gap-4 justify-between w-full">
                        <p className="flex items-center gap-4"><User/> Kunde</p>
                        <div className="text-sm">{clientData?.name}</div>
                    </div>
                    <div className="flex items-center gap-4 justify-between w-full">
                        <p className="flex items-center gap-4">Status</p>
                        <div className="text-sm">{projectData?.finished ? 'Fertiggestellt' : 'Laufend'}</div>
                    </div>
                </ClientCard>
            </section>

            <section className="mt-6">
                <Heading4>Beschreibung</Heading4>
                <p className="mt-2 text-gray-700">{projectData?.description ?? 'Keine Beschreibung vorhanden.'}</p>
            </section>

        </div>
    )
}