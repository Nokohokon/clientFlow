'use client'
import Link from "next/link";
import { useState, useEffect } from "react";
import { client } from "@/lib/types";
import { Trash } from "lucide-react";


export default function ClientPage () {
    const [clients, setClients] = useState<client[]>([]);
    const [page, setPage] = useState<number>(1);
    const [maxPage, setMaxPage] = useState<number>(1);
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);



    useEffect(() => {
        async function load_data() {
            const response = await fetch('api/clients');
            const data = await response.json();
            setClients(data.clientsData);
            setMaxPage(Math.ceil(data.clientsData.length / 10));
        }
        load_data();
    },[])

    return ( 
        <div className="flex flex-col">
            <div className="flex justify-between items-center">
                <h1 className=" text-3xl font-bold mb-4 ">Clients</h1>
                <p>dropdown</p>
            </div>
            <table>
                <tr>    
                    <th>Name</th>
                    <th>Email</th>
                    <th>Projektanzahl</th>
                    <th>Erstellt am</th>
                    <th>Bearbeitet am</th>
                    <th>Aktion</th>
                </tr>
                {clients.slice((page-1)*10,page*10).map((client:client, idx) => {
                    return (
                        <tr key={client.id ?? client.email ?? idx}>
                            <td>{client.name}</td>
                            <td>{client.email}</td>
                            <td>{client.projects}</td>
                            <td>{client.createdAt}</td>
                            <td>{client.updatedAt}</td>
                            <td>
                                <Trash className=" cursor-pointer hover:text-red-600 "/>
                            </td>
                        </tr>
                        )
                    })}
            </table>
            <div className="flex flex-row justify-between items-center">
                <p >Ergebnisse: {((page-1)*10)-1} bis {page*10-1}</p>
                <div className="flex">
                    <button onClick={() => setPage(Math.max(1, page-1))}>{page-1}</button>
                    <input type="number" value={page} onChange={(e) => {
                        const v = Number(e.target.value);
                        setPage(Number.isNaN(v) ? 1 : Math.max(1, Math.floor(v)));
                    }} />
                    <button onClick={() => setPage(Math.min(maxPage, page+1))}>{page+1}</button>
                </div>
            </div>
        </div>
    )
}