'use client'

import { useState, useEffect, use } from "react"
import { Client, Project } from "@/lib/types"
import { Loading } from "@/components/design/system/Loading"
import { Heading3 } from "@/components/design/headings/heading-3"
import { Heading4 } from "@/components/design/headings/heading-4"
import ClientCard from "@/components/design/cards/ClientCard"
import { Calendar, BookmarkCheck, HandCoins, Bookmark, NotebookPen, ClockArrowDown, Trash, Phone, MailCheck, Pencil, ChartColumnIncreasing, Receipt, CirclePlus, X, Check, Cross } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useMemo } from "react"
import { createProject, deleteProject, updateClient, deleteClient } from "@/lib/actions"
import { showToast } from "nextjs-toast-notify"
import Link from "next/link"



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
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editProps, setEditProps] = useState<{name: string, email: string}>({name: '', email: ''});
  const [showConfirming, setShowConfirming] = useState<boolean>(false);
  

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
                const projects = data.projects.map((project: Project) => ({
                    ...project,
                    createdAt: new Date(project.createdAt),
                    updatedAt: new Date(project.updatedAt),
                }));
                setClientProjects(projects);
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

    async function handleDeleteClient () {
        setShowConfirming(true);
        const resp = await deleteClient(clientData!.id);
        setShowConfirming(false);
        if (resp.status == 200) {
            showToast.success('Klient erfolgreich gelöscht!', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
            window.location.href = '/dashboard/clients';
        } else {
            showToast.error('Klient konnte nicht gelöscht werden.', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
        }
    }


    async function handleEdit (name: string, email: string) {
        const resp = await updateClient(clientData!.id, {name: name, email: email});
        if (resp.status == 200) {
            setClientData(prev => prev ? { ...prev, name, email } : prev);
            showToast.success('Klient erfolgreich aktualisiert!', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
        } else {
            showToast.error('Klient konnte nicht aktualisiert werden.', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
        }
    }

    async function handleCompletion () {
        const resp = await updateClient(clientData!.id, {completed: !clientData!.completed == true ? 1 : 0});
        if (resp.status == 200) {
            setClientData(prev => prev ? { ...prev, completed: !prev.completed } : prev);
            showToast.success('Klient erfolgreich aktualisiert!', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
        } else {
            showToast.error('Klient konnte nicht aktualisiert werden.', {
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
            {showConfirming && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Klient löschen</h2> {/* Halt Bestätigungsformular */ }
                        <p className="mb-4">Bist du sicher, dass du diesen Klienten löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
                        <div className="flex justify-end gap-4">
                            <button type="button" onClick={() => setShowConfirming(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer">Abbrechen</button>
                            <button type="submit" onClick={async (e) => {
                                e.preventDefault();
                                await handleDeleteClient();
                                setShowConfirming(false);   
                            }} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">
                                Klient löschen
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
            {showEditModal && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Klient bearbeiten</h2> {/* Halt Bearbeitungsformular */ }
                        <form onSubmit={async (e) => {
                            e.preventDefault();}} className="flex flex-col gap-4">
                            <div className="mb-4">
                                <label className="block mb-1 font-medium" htmlFor="name">Name</label>
                                <input type="text" id="name" name="name" className="w-full border px-3 py-2 rounded" placeholder="Max Mustermann" required value={editProps.name} onChange={(e) => setEditProps(prev => ({...prev, name: e.target.value}))} />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 font-medium" htmlFor="email">E-Mail</label>
                                <input type="email" id="email" name="email" className="w-full border px-3 py-2 rounded" placeholder="max.mustermann@gmail.com" required value={editProps.email} onChange={(e) => setEditProps(prev => ({...prev, email: e.target.value}))} />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer">Abbrechen</button>
                                <button type="submit" onClick={async (e) => {
                                    e.preventDefault();
                                    await handleEdit(editProps.name, editProps.email);
                                    setShowEditModal(false);
                                }} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
                                    Speichern
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <section className="flex flex-col">
                <div className={`p-2 rounded-lg border mt-5 border-gray-900 ${clientData?.completed ? 'bg-green-500' : 'bg-red-500'}`}>
                    {clientData?.completed ? <p className="flex items-center"><Check/> Abgeschlossen</p> : <p className="flex items-center"><X/> In Bearbeitung</p> }
                </div>
                <div className="flex flex-row justify-between items-start mt-5">
                    <Heading3 className="flex items-center gap-4">
                        <div className="flex flex-col">
                        <div>{clientData?.name}</div> <div>{clientData?.email}</div>
                        </div>
                        <div className="flex flex-col gap-4">
                        <button onClick={() => {
                            setEditProps({name: clientData?.name || '', email: clientData?.email || ''});
                            setShowEditModal(true);
                        }} className="text-sm cursor-pointer hover:text-orange-500"><Pencil /></button>
                        <button onClick={() => {setShowConfirming(!showConfirming)}} className="text-sm cursor-pointer hover:text-red-500"><Trash /></button>
                        </div>
                    </Heading3>
                    <Heading3 className="pb-10 hover:underline cursor-pointer">
                        <Link href={"#projects"}>
                            Projekte: {clientData?.projects}
                        </Link>
                    </Heading3>
                </div>

            </section>
            <section id="cards" className="grid grid-cols-2 gap-5 my-5">

                <ClientCard className="flex flex-col items-start bg-orange-300">
                    <div className="flex gap-4 items-center justify-between w-full"><p className="flex items-center gap-4"><Calendar /> Erstellt am:</p> {clientData?.createdAt.toDateString().slice(4)}</div>
                    <div className="flex gap-4 items-center justify-between w-full"><p className="flex items-center gap-4"><Calendar /> Aktualisiert am:</p> {clientData?.updatedAt.toDateString().slice(4)}</div>
                </ClientCard>
                <ClientCard className="flex flex-col items-start bg-green-300">
                    <div className="flex items-center gap-4 justify-between w-full">
                        <p className="flex items-center gap-4"><HandCoins/> Für Projekte ausgegeben</p > ... €
                    </div>
                    <div className="flex items-center gap-4 justify-between w-full">
                        <p className="flex items-center gap-4"><NotebookPen/> offene Rechnungen:</p > ... 
                    </div>
                </ClientCard>
                <ClientCard className="flex flex-col items-start bg-blue-300">
                    <div className="flex items-center gap-4 justify-between w-full">
                        <p className="flex items-center gap-4"><Bookmark/> Projekte insgesamt</p> {clientProjects.length}
                    </div>
                    <div className="flex items-center gap-4 justify-between w-full">
                        <p className="flex items-center gap-4"><BookmarkCheck/>Projekte abgeschlossen</p> {clientProjects.filter((project) => project.finished == true).length} 
                    </div>
                </ClientCard>
                <ClientCard className="flex flex-col items-start bg-amber-300">
                    <div className="flex items-center gap-4 justify-between w-full">
                        <p className="flex items-center gap-4"><Phone/> Telefon</p> {clientProjects.length} 
                    </div>
                    <div className="flex items-center gap-4 justify-between w-full">
                        <p className="flex items-center gap-4"><MailCheck/> E-Mail</p> {clientData?.email} 
                    </div>
                </ClientCard>

            </section>
            <section className="flex flex-col gap-5 my-5" id="actions">
                <Heading3 className="col-span-2 mb-4">Aktionen</Heading3>
                <div className="flex flex-row justify-around">
                    <Link href={`/dashboard/clients/${clientData?.id}/invoices`} className="flex items-center justify-between p-4 bg-purple-300 rounded-lg hover:bg-purple-400 transition-colors">
                        <div className="flex items-center gap-4">
                            <Receipt />
                            <p>Rechnungen</p>
                        </div>
                    </Link>
                    <Link href={`/dashboard/clients/${clientData?.id}/payments`} className="flex items-center justify-between p-4 bg-purple-300 rounded-lg hover:bg-purple-400 transition-colors">
                        <div className="flex items-center gap-4">
                            <HandCoins />
                            <p>Zahlungen</p>
                        </div>
                    </Link>
                    <button className="cursor-pointer flex items-center justify-between p-4 bg-purple-300 rounded-lg hover:bg-purple-400 transition-colors" onClick={() => handleCompletion()}>
                        <div className="flex items-center gap-4">    
                        {clientData?.completed ? <X /> : <Check />} 
                        <p>{clientData?.completed ? "Nicht abgeschlossen" : "Abgeschlossen"}</p>
                        </div>
                    </button>
                    <Link href={`/dashboard/clients/${clientData?.id}/contacts`} className="flex items-center justify-between p-4 bg-purple-300 rounded-lg hover:bg-purple-400 transition-colors">
                        <div className="flex items-center gap-4">
                            <Phone />
                            <p>Kontakt</p>
                        </div>
                    </Link>
                    <Link href={`/dashboard/clients/${clientData?.id}/statistics`} className="flex items-center justify-between p-4 bg-purple-300 rounded-lg hover:bg-purple-400 transition-colors">
                        <div className="flex items-center gap-4">
                            <ChartColumnIncreasing />
                            <p>Statistiken</p>
                        </div>
                    </Link>

                </div>

            </section>
            <section id="projects" className="mt-10 flex flex-col">
            <div className="flex justify-between items-center mb-4"> {/* Quasi ne fette Tabelle mit allen Clients. */}
                <div className="justify-center items-center flex ">
                <Heading3>Projekte</Heading3>
                        <button onClick={() => setShowCreateModal(!showCreateModal)} className={`p-4 transition-transform cursor-pointer ${clientProjects.length % 4 === 0 ? 'hover:text-orange-700' : clientProjects.length % 4 === 1 ? 'hover:text-green-700' :  clientProjects.length % 4 === 2 ? 'hover:text-blue-700' : 'hover:text-amber-700' }`}><CirclePlus /></button>
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
                <div className="grid grid-cols-2 gap-4 pb-10">
                    {clientProjects.map((project: Project, idx) => (
                        <ClientCard key={project.id} className={`flex flex-col items-start ${idx % 4 === 0 ? 'bg-orange-300' : idx % 3 === 1 ? 'bg-green-300' :  idx % 3 === 2 ? 'bg-blue-300' : 'bg-amber-300' }`}>
                            <div className="text-lg flex justify-between w-full">
                            <Heading4>
                                <Link 
                                href={`/dashboard/clients/${id}/projects/${project.id}`} 
                                className="group relative text-gray-900 hover:text-gray-700 transition-colors duration-300"
                                >
                                {project.title}
                                {/* Die animierte Linie */}
                                <span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-center scale-x-0 bg-gray-700 transition-transform duration-300 ease-out group-hover:scale-x-100"></span>
                                </Link>
                            </Heading4> 
                            
                            <button className="cursor-pointer hover:text-red-500 transition-colors" onClick={() => handleDelete(project.id)}>
                                <Trash />
                            </button>
                            </div>
                            <hr className="w-full border-t border-black/30 my-2"/>
                            <div className="flex gap-4 items-center justify-between w-full text-lg"><p className="flex items-center gap-4">{project.finished ? <BookmarkCheck /> : <ClockArrowDown />} Status: </p>{project.finished ? "Abgeschlossen" : "Laufend"}</div>
                            <div className="flex gap-4 items-center justify-between w-full text-lg"><p className="flex items-center gap-4"><Calendar /> Erstellt am:</p> {new Date(project.createdAt ?? '').toDateString().slice(4)}</div>
                            <div className="flex gap-4 items-center justify-between w-full text-lg"><p className="flex items-center gap-4"><Calendar /> Aktualisiert am:</p> {new Date(project.updatedAt ?? '').toDateString().slice(4)}</div>
                        </ClientCard>
                    ))}
                </div>
            </section>
        </div>
    )
}