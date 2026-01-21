'use client'

import { useState, useEffect, use } from "react"
import { Client, Project } from "@/lib/types"
import { Loading } from "@/components/design/system/Loading"
import { Heading3 } from "@/components/design/headings/heading-3"
import { Heading4 } from "@/components/design/headings/heading-4"
import ClientCard from "@/components/design/cards/ClientCard"
import { Calendar, BookmarkCheck, HandCoins, Bookmark, NotebookPen, ClockArrowDown, Trash, Phone, MailCheck   } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useMemo } from "react"
import { createProject, deleteProject } from "@/lib/actions"
import { showToast } from "nextjs-toast-notify"



type filter = 'name' | 'finished' | 'createdAt' | 'updatedAt';

type filterMode = 'asc' | 'desc'



interface filterOptions {
    label: string,
    value: filter
}

export default function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const [clientData, setClientData] = useState<Client & { createdAt: Date; updatedAt: Date } | undefined>()
  const [clientProjects, setClientProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<number[]>([]); // Quasi eif nur useStates um sachen anzuzeigen
  

    const [filterMode, setFilterMode] = useState<filterMode>('asc')

    const [filter, setFilter] = useState<filter>('name'); // Filter für clients
    const { data: session } = authClient.useSession(); // Auth session

    const filterOptions: filterOptions[] = [
        {label: 'Name', value: 'name'}, {label: 'Fertiggestellt', value: 'finished'}, {label: 'Erstellungsdatum', value: 'createdAt'}, {label: 'Aktualisierungsdatum', value: 'updatedAt'}
    ]


    const sortedClients = useMemo(() => {
        if (!clientProjects || clientProjects.length === 0) return clientProjects;
        const sorted = [...clientProjects];
        switch (filter) {
            case 'name':
                filterMode == 'asc' ? sorted.sort((a, b) => a.title.localeCompare(b.title)) : sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'finished':
                filterMode == 'asc' ? sorted.sort((a, b) => Number(a.finished) - Number(b.finished)) : sorted.sort((a, b) => Number(b.finished) - Number(a.finished));
                break;
            case 'createdAt':
                filterMode == 'asc' ? sorted.sort((a, b) => (new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())) : sorted.sort((a, b) => (new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()));
                break;
            case 'updatedAt':
                filterMode == 'asc' ? sorted.sort((a, b) => (new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime())) : sorted.sort((a, b) => (new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()));
                break;
        }
        return sorted;
    }, [clientProjects, filter, filterMode]);

    useEffect(() => {
        async function load_data() { // Dashboard Data von API fetchen
            try {
                const response = await fetch(`/api/clients/${id}`);
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const data = await response.json();
                console.log('Loaded dashboard data:', data);
                const createdAt = new Date(data.client.createdAt);
                const updatedAt = new Date(data.client.updatedAt);
                setClientData({ ...data.client, createdAt, updatedAt });
                setClientProjects(data.projects);
                setLoading(false)
            } catch (err) {
                console.error('Error loading clients', err);
                setLoading(false)
            }
        }
        load_data(); // Dashboard Data setzen
    },[])

    async function handleCreate (title: string) { // user erstellen
        setIsCreating(true);
        
        console.log(title, Number(session?.user.id))
        const resp = await createProject( 
            title, clientData!.id
        )
        setIsCreating(false)
        if (resp.status == 200) {
            setClientProjects([...clientProjects, resp.project!])
            setClientData(prev => prev
                ? { ...prev, projects: (typeof prev.projects === 'number' ? prev.projects : 0) + 1 }
                : prev)
            showToast.success('Projekt erfolgreich erstellt!', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            })
        } else {
            showToast.error('Projekt konnte nicht erstellt werden.', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
        }
    }

    async function handleDelete (id: number) { // user löschen
        setIsDeleting([...isDeleting, id]);
        const resp = await deleteProject(id);
        setIsDeleting(prev => prev.filter(dId => dId != id));
        if (resp.status == 200) {
            setClientProjects(prev => prev.filter(project => project.id != id))
            showToast.success('Projekt erfolgreich gelöscht!', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            })
            setClientData(prev => prev
                ? { ...prev, projects: (typeof prev.projects === 'number' ? prev.projects : 1) - 1 }
                : prev)
        } else {
            showToast.error('Klient konnte nicht gelöscht werden.', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
        }
    }

    if (loading) {
        return (
            <Loading/>
        )
    }



    return (
        <div className="flex flex-col ">
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Neues Projekt erstellen</h2> {/* Halt Erstellungsformular */ }
                        <form onSubmit={async (e) => {
                            e.preventDefault();}} className="flex flex-col gap-4">
                            <div className="mb-4">
                                <label className="block mb-1 font-medium" htmlFor="title">Name</label>
                                <input type="text" id="title" name="title" className="w-full border px-3 py-2 rounded" placeholder="Mustergmbh Musterhausen Website" required />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer">Abbrechen</button>
                                <button type="submit" onClick={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget.closest('form')!;
                                    const formData = new FormData(form);
                                    const title = formData.get('title') as string;
                                    await handleCreate(title);
                                    setShowCreateModal(false);
                                }} disabled={isCreating} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
                                    {isCreating ? 'Erstellen...' : 'Erstellen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <section className="flex flex-row justify-between items-start mt-5">
                <Heading3>
                    {clientData?.name} - {clientData?.email}
                </Heading3>
                <Heading3 className="pb-10">
                    Projekte: {clientData?.projects}
                </Heading3>
            </section>
            <section id="cards" className="grid grid-cols-2 gap-5 my-5">

                <ClientCard className="flex flex-col items-start bg-orange-300">
                    <div className="flex gap-4 items-center justify-between w-full"><p className="flex items-center"><Calendar /> Erstellt am:</p> {clientData?.createdAt.toDateString().slice(4)}</div>
                    <div className="flex gap-4 items-center justify-between w-full"><p className="flex items-center"><Calendar /> Aktualisiert am:</p> {clientData?.updatedAt.toDateString().slice(4)}</div>
                </ClientCard>
                <ClientCard className="flex flex-col items-start bg-green-300">
                    <div className="flex items-center gap-4">
                        <HandCoins/> ... € in Projekten
                    </div>
                    <div className="flex items-center gap-4">
                        <NotebookPen/> ... offene Rechnungen
                    </div>
                </ClientCard>
                <ClientCard className="flex flex-col items-start bg-blue-300">
                    <div className="flex items-center gap-4">
                        <Bookmark/> {clientProjects.length} Projekte insgesamt
                    </div>
                    <div className="flex items-center gap-4">
                        <BookmarkCheck/> {clientProjects.filter((project) => project.finished == true).length} Projekte abgeschlossen
                    </div>
                </ClientCard>
                <ClientCard className="flex flex-col items-start bg-amber-300">
                    <div className="flex items-center gap-4">
                        <Phone/> {clientProjects.length} Telefonnummer
                    </div>
                    <div className="flex items-center gap-4">
                        <MailCheck/> {clientProjects.length} Email
                    </div>
                </ClientCard>

            </section>
            <section id="projects" className="mt-10 flex flex-col">
            <div className="flex justify-between items-center mb-4"> {/* Quasi ne fette Tabelle mit allen Clients. */}
                <Heading3>Projekte</Heading3>
                <div className="justify-center items-center flex ">
                    <button onClick={() => setShowCreateModal(!showCreateModal)} className="p-4 rounded-sm border border-black text-black cursor-pointer hover:scale-105 transition-transform">Projekt erstellen</button>
                </div>
                <div className="flex items-center  gap-4">
                    <div className="flex items-center flex-col gap-2 items-end ">
                        <select
                            id="client-filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as filter)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            {filterOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select
                            id="filter-mode"
                            value={filterMode}
                            onChange={(e) => setFilterMode(e.target.value as filterMode)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option key='asc' value={'asc'}>Aufsteigend</option>
                            <option key='desc' value={'desc'}>Absteigend</option>
                        </select>
                    </div>
                </div>
            </div>
                <div className="grid grid-cols-3 gap-4">
                    {clientProjects.map((project: Project) => (
                        <ClientCard key={project.id} className="flex flex-col items-start bg-purple-300">
                            <div className="text-lg flex justify-between w-full"><Heading4>{project.title}</Heading4> <button className="cursor-pointer hover:text-red-500" onClick={() => handleDelete(project.id)}><Trash /></button></div>
                            <hr className="w-full border-t border-black/30 my-2"/>
                            <div className=" text-lg italic flex items-center gap-4">{project.finished ? <BookmarkCheck /> : <ClockArrowDown />} Status: {project.finished ? "Abgeschlossen" : "Laufend"}</div>

                        </ClientCard>
                    ))}
                </div>
            </section>
        </div>
    )
}