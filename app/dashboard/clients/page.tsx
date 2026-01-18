'use client'
import Link from "next/link";
import { useState, useEffect } from "react";
import { Client } from "@/lib/types";
import { Trash } from "lucide-react";
import { Heading3 } from "@/components/design/headings/heading-3";


export default function ClientPage () {
    const [clients, setClients] = useState<Client[]>([]);
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(1);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);



    useEffect(() => {
        async function load_data() {
            try {
                const response = await fetch('/api/clients');
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const data = await response.json();
                setClients(data.clientsData ?? []);
                setMaxPage(Math.max(1, Math.ceil((data.clientsData ?? []).length / 10)));
            } catch (err) {
                console.error('Error loading clients', err);
                setClients([]);
                setMaxPage(1);
            }
        }
        load_data();
    },[])

    return ( 
        <div className="flex flex-col">
            <div className="flex justify-between items-center">
                <Heading3>Clients</Heading3>
                <p>dropdown</p>
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
                {clients.slice((page-1)*10,page*10).map((client:Client, idx) => {
                    const key = client.id ?? client.email ?? idx;
                    const created = client.createdAt ? new Date(client.createdAt).toLocaleString() : '-';
                    const updated = client.updatedAt ? new Date(client.updatedAt).toLocaleString() : '-';
                    return (
                        <tr key={key} className="border-t">
                            <td className="px-2 py-1">{client.name}</td>
                            <td className="px-2 py-1">{client.email}</td>
                            <td className="px-2 py-1">{client.projects ?? 0}</td>
                            <td className="px-2 py-1">{created}</td>
                            <td className="px-2 py-1">{updated}</td>
                            <td className="px-2 py-1">
                                <Trash className=" cursor-pointer hover:text-red-600 "/>
                            </td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>
            <div className="flex flex-row justify-between items-center">
                <p >Ergebnisse: {((page-1)*10)-1} bis {page*10-1}</p>
                <div className="flex justify-start items-center gap-2">
                    <button onClick={() => setPage(Math.max(1, page-1))}>{page-1}</button>
                    <input type="number" className="w-10" value={page} onChange={(e) => {
                        const v = Number(e.target.value);
                        setPage(Number.isNaN(v) ? 1 : Math.max(1, Math.floor(v)));
                    }} />
                    <button onClick={() => setPage(Math.min(maxPage, page+1))}>{page+1}</button>
                </div>
            </div>
        </div>
    )
}