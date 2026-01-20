'use client'
import Link from "next/link";
import { useState, useEffect, useRef, useMemo } from "react";
import { Client } from "@/lib/types";
import { Trash } from "lucide-react";
import { Heading3 } from "@/components/design/headings/heading-3"; // Custom headings
import { createClient, deleteClient } from "@/lib/actions"; // Um clients zu verwalten
import { authClient } from "@/lib/auth-client";
import { showToast } from "nextjs-toast-notify"; // Lets use toasts lol. 
import { Loading } from "@/components/design/system/Loading"; // You spin me right round. oder auch nd fuuuck


interface userCreate {
    name: string,
    email: string, // Quasi was man beim user eingeben muss zum erstellen
}


type filter = 'name' | 'email' | 'projects' | 'createdAt' | 'updatedAt';

type filterMode = 'asc' | 'desc'

interface filterOptions {
    label: string,
    value: filter
}

export default function ClientPage () {
    const [clients, setClients] = useState<Client[]>([]); // CLient liste
    const [page, setPage] = useState<number>(1); // Aktuelle gerenderte Seite für Paginator
    const [maxPage, setMaxPage] = useState<number>(1);  // Wohin kann man höchstens?
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false); // Erstellt der bro gerade nen client?
    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<Client["id"][]>([]); // Quasi eif nur useStates um sachen anzuzeigen 
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [filterMode, setFilterMode] = useState<filterMode>('asc')

    const [filter, setFilter] = useState<filter>('name'); // Filter für clients
    const { data: session } = authClient.useSession(); // Auth session

    const filterOptions: filterOptions[] = [
        {label: 'Name', value: 'name'}, {label: 'E-Mail', value: 'email'}, {label: 'Projektanzahl', value: 'projects'}, {label: 'Erstellungsdatum', value: 'createdAt'}, {label: 'Aktualisierungsdatum', value: 'updatedAt'}
    ]


    const sortedClients = useMemo(() => {
        if (!clients || clients.length === 0) return clients;
        const sorted = [...clients];
        switch (filter) {
            case 'name':
                filterMode == 'asc' ? sorted.sort((a, b) => a.name.localeCompare(b.name)) : sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'email':
                filterMode == 'asc' ? sorted.sort((a, b) => a.email.localeCompare(b.email)) : sorted.sort((a, b) => b.email.localeCompare(a.email));
                break;
            case 'createdAt':
                filterMode == 'asc' ? sorted.sort((a, b) => (new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime())) : sorted.sort((a, b) => (new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()));
                break;
            case 'updatedAt':
                filterMode == 'asc' ? sorted.sort((a, b) => (new Date(a.updatedAt ?? 0).getTime() - new Date(b.updatedAt ?? 0).getTime())) : sorted.sort((a, b) => (new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()));
                break;
            case 'projects':
                filterMode == 'asc' ? sorted.sort((a, b) => (a.projects ?? 0) - (b.projects ?? 0)) : sorted.sort((a, b) => (b.projects ?? 0) - (a.projects ?? 0));
                break;
        }
        return sorted;
    }, [clients, filter, filterMode]);

    useEffect(() => {
        async function load_data() { // Daten von api holen
            try {
                const response = await fetch('/api/clients');
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const data = await response.json();
                console.log('Loaded clients data:', data);
                setClients(data.clients ?? []);
                console.log('Clients set to:', data.clients ?? []);
                setMaxPage(Math.max(1, Math.ceil((data.clients ?? []).length / 10)));
            } catch (err) {
                console.error('Error loading clients', err);
                setClients([]);
                setMaxPage(1);
            }
            setIsLoading(false)
        }
        load_data();
    },[])


    async function handleCreate (user: userCreate ) { // user erstellen
        setIsCreating(true);
        const resp = await createClient( 
            user.name, user.email, session?.user.id, 'person'
        )
        setIsCreating(false)
        if (resp.status == 200) {
            setClients([...clients, resp.client!])
            showToast.success('Klient erfolgreich erstellt!', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            })
        } else {
            showToast.error('Klient konnte nicht erstellt werden.', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
        }
    }

    async function handleDelete (id: number) { // user löschen
        setIsDeleting([...isDeleting, id]);
        const resp = await deleteClient(id);
        setIsDeleting(prev => prev.filter(dId => dId != id));
        if (resp.status == 200) {
            setClients(prev => prev.filter(client => client.id != id))
            showToast.success('Klient erfolgreich gelöscht!', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            })
        } else {
            showToast.error('Klient konnte nicht gelöscht werden.', {
                duration: 4000,
                position: 'top-right',
                transition: 'bounceIn',
                progress: true
            });
        }
    }

    if (isLoading) { // Wenn noch geladen wird, wird laden angezeigt. 
        return (
            <Loading/>
        )
    }

    return ( 
        <div className="flex flex-col">
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-bold mb-4">Neuen Klienten erstellen</h2> {/* Halt Erstellungsformular */ }
                        <form onSubmit={async (e) => {
                            e.preventDefault();}} className="flex flex-col gap-4">
                            <div className="mb-4">
                                <label className="block mb-1 font-medium" htmlFor="name">Name</label>
                                <input type="text" id="name" name="name" className="w-full border px-3 py-2 rounded" placeholder="Mustergmbh Musterhausen" required />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-1 font-medium" htmlFor="email">Email</label>
                                <input type="email" id="email" name="email" className="w-full border px-3 py-2 rounded" placeholder="max.mustermann@musterdomain.com" required />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 cursor-pointer">Abbrechen</button>
                                <button type="submit" onClick={async (e) => {
                                    e.preventDefault();
                                    const form = e.currentTarget.closest('form')!;
                                    const formData = new FormData(form);
                                    const name = formData.get('name') as string;
                                    const email = formData.get('email') as string;
                                    await handleCreate({name, email});
                                    setShowCreateModal(false);
                                }} disabled={isCreating} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer">
                                    {isCreating ? 'Erstellen...' : 'Erstellen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-4"> {/* Quasi ne fette Tabelle mit allen Clients. */}
                <Heading3>Clients</Heading3>
                <div className="justify-center items-center flex ">
                    <button onClick={() => setShowCreateModal(!showCreateModal)} className="p-4 rounded-sm bg-green-500 hover:bg-green-700 text-black cursor-pointer hover:text-white">Kunden erstellen</button>
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
            <table className="min-w-full border ">
                <thead>
                    <tr>
                        <th className="text-left px-2 py-1">Name</th>
                        <th className="text-left px-2 py-1">Email</th>
                        <th className="text-left px-2 py-1">Projektanzahl</th>
                        <th className="text-left px-2 py-1">Erstellt am</th>
                        <th className="text-left px-2 py-1">Bearbeitet am</th>
                        <th className="text-left px-2 py-1">Aktion</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan={6} className="text-center p-4">{'--'.repeat(50)}</td>
                    </tr>
                {(sortedClients ?? clients).slice((page-1)*10,page*10).map((client:Client, idx) => {
                    const key = client.id ?? client.email ?? idx;
                    const created = client.createdAt ? new Date(client.createdAt).toLocaleString() : '-';
                    const updated = client.updatedAt ? new Date(client.updatedAt).toLocaleString() : '-'; { /* Das hier is alles Render logik, also sachen werden errechnet und dann halt angezeigt. */ }
                    return (
                        <tr key={key} className="border-t">
                            <td className="px-2 py-1"><Link href={`/dashboard/clients/${client.id}`}>{client.name}</Link></td>
                            <td className="px-2 py-1"><Link href={`/dashboard/clients/${client.id}/email`}>{client.email}</Link></td>
                            <td className="px-2 py-1"><Link href={`/dashboard/clients/${client.id}/projects`}>{client.projects ?? 0}</Link></td>
                            <td className="px-2 py-1">{created}</td>
                            <td className="px-2 py-1">{updated}</td>
                            <td className="px-2 py-1">
                                <button onClick={() => handleDelete(client.id)
                                } className={`cursor-pointer  ${isDeleting.includes(client.id) ? 'disabled' : ''}`}> {/* Wenn gerade schon gelöscht wird soll man nd löschen können. */}
                                    <Trash className={` cursor-pointer hover:text-red-600`}/>
                                </button>
                            </td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>
            <div className="flex flex-row justify-between items-center">
                {
                    (() => {
                        const perPage = 10;
                        const total = clients.length;
                        const start = total === 0 ? 0 : (page - 1) * perPage + 1; { /* Das is jetzt quasi alles für das "Ergebnisse: 1-2 von 2" etc. also die Logik um das zu berechnen. Hat abgefuckt */}
                        const end = Math.min(total, page * perPage);
                        return (
                            <p>Ergebnisse: {start} bis {end} von {total}</p>
                        );
                    })()
                }
                <div className="flex justify-start items-center gap-2">
                    {
                        (() => {
                            const perPage = 10;
                            const total = clients.length;
                            const prevRangeStart = Math.max(1, (page - 2) * perPage + 1);
                            const prevRangeEnd = Math.max(0, (page - 1) * perPage);
                            const nextRangeStart = page * perPage + 1;
                            const nextRangeEnd = (page + 1) * perPage;
                            const prevLabel = prevRangeEnd >= prevRangeStart && page > 1 ? `${prevRangeStart}-${Math.min(prevRangeEnd, total)}` : '—';
                            const nextLabel = nextRangeStart <= total && page < maxPage ? `${nextRangeStart}-${Math.min(nextRangeEnd, total)}` : '—';
                            return (
                                <>
                                    <button disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>{prevLabel}</button>
                                    <input type="number" className="w-14 text-center" value={page} onChange={(e) => {
                                        const v = Number(e.target.value);
                                        setPage(Number.isNaN(v) ? 1 : Math.max(1, Math.floor(v)));
                                    }} />
                                    <button disabled={page >= maxPage} onClick={() => setPage(Math.min(maxPage, page + 1))}>{nextLabel}</button>
                                </>
                            );
                        })()
                    }
                </div>
            </div> 

        </div>
    )
}