'use client';

import { useEffect, useState } from 'react';
import { getClients, getClientProjects, createProject, deleteProject } from '@/lib/actions';
import { client, project, deletion } from '@/lib/types';
import { Trash } from 'lucide-react';


interface dashboardProps {
    setStatus: React.Dispatch<React.SetStateAction<string>>;
}


export default function DashboardPage({setStatus}: dashboardProps) {
    const [clients, setClients] = useState<client[]>([]);
    const [userExpanded, setUserExpanded] = useState<client["id"][]>([])
    const [clientProjects, setClientProjects] = useState<project[]>([])
    const [isCreating, setIsCreating] = useState<client["id"][]>([]);
    const [deletionStatus,setDeletionStatus] = useState<deletion[]>([])

    useEffect(() => {
        async function load() {
            const clientsData = await getClients() as client[];
            setClients(clientsData);

            const projectsArrays = await Promise.all(
                clientsData.map(async (c) => {
                    const res = await getClientProjects(c.id);
                    console.log(res, "test");
                    return (res as unknown) as project[]; // await first, then cast via unknown
                })
            );
            setClientProjects(projectsArrays.flat());
        }
        load().catch(console.error);
    }, []);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, clientId: number) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const name = (fd.get('name') as string) || '';
        createProject(name, clientId)
        setIsCreating(isCreating.filter(id => id !== clientId))
        setClientProjects(prev => prev.filter(p => p.id !== projectId));
        setClients(prev => prev.map(c => c.id === clientId ? {...c, projects: (c.projects || 1) -1 } :c ))
    };

    const handleDelete = async (projectId: number, clientId: number) => {
        await deleteProject(projectId);
        // Projekte lokal filtern
        setClientProjects(prev => prev.filter(p => p.id !== projectId));
        // Optional: Den Project-Counter beim Client im State senken
        setClients(prev => prev.map(c => 
            c.id === clientId ? { ...c, projects: (c.projects || 1) - 1 } : c
        ));
    };

    useEffect(()=> {
        async function handleDeletion() {
            deletionStatus.map( (del)=>  {
                if (del.status === "confirmed") {
                    handleDelete(del.projectId, del.clientId);
                }
            })
        }
        handleDeletion().catch(console.error)
    }, [deletionStatus])




    
    return (
        <div>
            {deletionStatus && <div className='absolute text-align justify-center'>
                {deletionStatus.map((del) => {
                    return (
                        <div key={`${del.projectId}-${del.clientId}`} className="p-2">
                            <p>Willst du das Projekt wirklich löschen?</p>
                            <button onClick={() => setDeletionStatus(prev => prev.filter(d => d.projectId === del.projectId ? {...d, status: 'confirmed'} : d))} className='text-red-500' >Ja</button>
                        </div>
                    )
                })}
            </div> }
            { clients.length != 0 ? clients.map((client: client) => (
                <div key={client.id}  className='flex flex-col justify-center items-center border p-4 rounded-md border-black'>
                <button  className='text-gray-700 cursor-pointer hover:text-gray-500 text-2xl' onClick={() =>  userExpanded.includes(client.id) ? setUserExpanded(userExpanded.filter(id => id !== client.id)) : setUserExpanded([...userExpanded, client.id])}>{client.name} - {client.email} {client.projects} Projekte</button>
                {userExpanded.includes(client.id) && <div className='ml-5'>
                    <h2 className='text-xl text-gray-600 my-5'>Projekte</h2>
                    {clientProjects.map((project) => (
                        <div className='flex gap-5 my-2 border border-amber-500 rounded-md justify-around p-1' key={project.id}>
                            <p className='text-lg text-gray-500 text-xl p-2'>
                                {(project.clientId == client.id) ? project.title : ""}
                            </p>
                            <button className="text-red-500 cursor-pointer hover:bg-red-300 rounded-md p-2" onClick={()=> setDeletionStatus([...deletionStatus, { projectId: project.id, clientId: client.id, status: "confirmed" }])}><Trash className='text-red-500 '/></button>
                        </div>
                    ))}
                    {isCreating.includes(client.id) ? (
                        <div className='my-5 flex flex-col justify-center items-center'>
                            <h2 className='text-2xl font-bold mb-4 text-blue-500'>Neues Projekt erstellen</h2>
                            <form onSubmit={(e) => handleSubmit(e, client.id)} className='flex flex-col items-center'>
                                <input name="name" type="text" placeholder='Name' className='border border-gray-300 rounded-md text-gray-500 px-4 py-2 mb-3 w-64' required />
                                <button type="submit" className='bg-green-500 text-white rounded-md px-4 py-2 mb-3 w-64 cursor-pointer'>Erstellen</button>
                            </form>
                            <button onClick={() => setIsCreating(isCreating.filter(id => id !== client.id))} className='text-red-500 text-xl cursor-pointer'>Abbrechen</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsCreating([...isCreating, client.id])} className='text-blue-500 text-underline text-xl cursor-pointer text-center border border-blue-500 rounded-md px-4 py-2'>Neues Projekt erstellen</button>
                    )}
                    </div>
                }
                </div>
                
            )) : <div className='text-center'><h3 className='text-red-500 text-2xl text-center'>Keine Clients vorhanden.</h3><button onClick={() => setStatus('clients')} className='text-blue-500 text-underline text-xl cursor-pointer text-center border border-blue-500 rounded-md px-4 py-2'>Client erstellen</button></div>}
        </div>
    );
}