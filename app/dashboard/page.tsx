'use client';
{/*'use client';

 import { useEffect, useState } from 'react';
import { getClients, getClientProjects, createProject, deleteProject, createClient, deleteClient } from '@/lib/actions';
import { client, project, deletion } from '@/lib/types';
import { Trash } from 'lucide-react';





export default function DashboardPage() {
    const [clients, setClients] = useState<client[]>([]);
    const [userExpanded, setUserExpanded] = useState<client["id"][]>([])
    const [clientProjects, setClientProjects] = useState<project[]>([])
    const [isCreating, setIsCreating] = useState<client["id"][]>([]);
    const [deletionStatus,setDeletionStatus] = useState<deletion[]>([])
    const [creating, setCreating] = useState<boolean>(false);


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


    async function handleClientSubmit(formData: FormData) {
        const resp = await createClient(formData);
        if (resp === false) {
            alert('Erstellen fehlgeschlagen')
            setCreating(false)
        } else {
        const updatedClients = await getClients() as client[];
        setClients(updatedClients);
        setCreating(false);
        }
    }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, clientId: number) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const name = (fd.get('name') as string) || '';
        createProject(name, clientId)
        setIsCreating(isCreating.filter(id => id !== clientId));
        setClients(prev => prev.map(c => c.id === clientId ? {...c, projects: (c.projects || 0) + 1 } : c ))
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

    const handleDeleteClient = async (clientId: number) => {
        await deleteClient(clientId);
        // Entferne Client aus State
        setClients(prev => prev.filter(c => c.id !== clientId));
        // Entferne zugehörige Projekte aus State
        setClientProjects(prev => prev.filter(p => p.clientId !== clientId));
    };

    useEffect(()=> {
        async function handleDeletion() {
            for (const del of deletionStatus) {
                if (del.status === "confirmed") {
                    try {
                        if (del.projectId === 0) {
                            await handleDeleteClient(del.clientId);
                        } else {
                            await handleDelete(del.projectId, del.clientId);
                        }
                        setDeletionStatus(prev => prev.filter(d => !(d.projectId === del.projectId && d.clientId === del.clientId)));
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        }   
        handleDeletion().catch(console.error)
    }, [deletionStatus])




    
    return (
        <div>
            {deletionStatus && <div className='absolute text-align justify-center'>
                {deletionStatus.map((del) => {
                    const isClient = del.projectId === 0;
                    return (
                        <div key={`${del.projectId}-${del.clientId}`} className="p-2 bg-white border rounded shadow">
                            <p>{isClient ? 'Willst du den Client (inkl. aller Projekte) wirklich löschen?' : 'Willst du das Projekt wirklich löschen?'}</p>
                            <div className='flex gap-4 mt-2'>
                                <button onClick={() => setDeletionStatus(prev => prev.map(d => d.projectId === del.projectId && d.clientId === del.clientId ? {...d, status: 'confirmed'} : d))} className='text-red-500' >Ja</button>
                                <button onClick={() => setDeletionStatus(prev => prev.filter(d => !(d.projectId === del.projectId && d.clientId === del.clientId)))} className='text-gray-700'>Nein</button>
                            </div>
                        </div>
                    )
                })}
            </div> }
            { clients.length != 0 ? clients.map((client: client) => (
                <div key={client.id}  className='flex flex-col justify-center items-center border p-4 rounded-md border-black'>
                <button  className='text-gray-700 cursor-pointer hover:text-gray-500 text-2xl' onClick={() =>  userExpanded.includes(client.id) ? setUserExpanded(userExpanded.filter(id => id !== client.id)) : setUserExpanded([...userExpanded, client.id])}>{client.name} - {client.email} {client.projects} Projekte</button>
                {userExpanded.includes(client.id) && <div className='ml-5'>
                        <div className='flex p-2 my-5 gap-5'>
                        <h2 className='text-xl text-gray-600 p-2'>Projekte</h2>
                        <button onClick={() => setDeletionStatus([...deletionStatus, { projectId: 0, clientId: client.id, status: "pending" }])} className='text-red-500 cursor-pointer flex hover:bg-red-300 rounded-md p-2'>Client löschen <Trash className='text-red-500 '/></button>
                    </div>
                    {clientProjects.map((project) => (
                        <div className='flex gap-5 my-2 border border-amber-500 rounded-md justify-around p-1' key={project.id}>
                            <p className='text-lg text-gray-500 text-xl p-2'>
                                {(project.clientId == client.id) ? project.title : ""}
                            </p>
                            <button className="text-red-500 cursor-pointer hover:bg-red-300 rounded-md p-2" onClick={()=> setDeletionStatus([...deletionStatus, { projectId: project.id, clientId: client.id, status: "pending" }])}><Trash className='text-red-500 '/></button>
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
                    <br/>
                    </div>
                }
                </div>
                
            )) : <div className='text-center'><h3 className='text-red-500 text-2xl text-center'>Keine Clients vorhanden.</h3><button onClick={() => setCreating(true)} className='text-blue-500 text-underline text-xl cursor-pointer text-center border border-blue-500 rounded-md px-4 py-2'>Client erstellen</button></div>}
            <div className='mt-5 flex justify-center'>
            {creating ? (
                <div className='my-5 flex flex-col justify-center items-center'>
                    <h2 className='text-2xl font-bold mb-4 text-blue-500'>Neuen Client erstellen</h2>
                    <form action={handleClientSubmit} className='flex flex-col items-center'>
                        <input name="name" type="text" placeholder='Name' className='border border-gray-300 rounded-md text-gray-500 px-4 py-2 mb-3 w-64' required />
                        <input name="email" type="email" placeholder='Email' className='border border-gray-300 rounded-md px-4 py-2 text-gray-500 mb-3 w-64' required />
                        <button type="submit" className='bg-green-500 text-white rounded-md px-4 py-2 mb-3 w-64 cursor-pointer'>Erstellen</button>
                    </form>
                    <button onClick={() => setCreating(false)} className='text-red-500 text-xl cursor-pointer'>Abbrechen</button>
                </div>
            ) : (
                <button onClick={() => setCreating(true)} className='text-blue-500 text-underline text-xl cursor-pointer text-center border border-blue-500 rounded-md px-4 py-2'>Neuen Client erstellen</button>
            )}
            </div>
        </div>
    );
}
*/}

import { useState } from "react";
import { Heading1 } from "@/components/design/headings/heading-1";
import { HeroHeading } from "@/components/design/headings/HeroHeading";
import Head from "next/head";
import Image from "next/image";
import Sidebar from "@/components/layout/sidebar";
import DashboardCards from "@/components/design/cards/DashboardInfoCards";
import { Users, FolderKanban, ChartArea, Contact } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {

  return (
    <div className="flex justify-start flex-col items-center bg-white h-screen">
      <main>
        <section className="pt-16 lg:pt-26 pb-10">
          <HeroHeading className="flex items-center justify-center gap-4">
            <Image src="/client_garage.png" height={100} alt="Logo" width={100}/>
            Client Garage - Dashboard
          </HeroHeading>
          <p className="mt-4 text-left text-base text-gray-600 px-10">
            <Link href={"/"} className="hover:text-gray-800">Home</Link> &gt; <Link href={"/dashboard"} className="hover:text-gray-800">Dashboard</Link>
          </p>
        </section>
        <section className="flex flex-row justify-between gap-14 w-full h-[350px] px-10">
            <Sidebar/>
            <div className="mx-2 w-150 grid grid-cols-3 gap-4 h-full ">
                <DashboardCards className="border-blue-500 ">
                    <Link href={"/clients"} className="flex justify-content gap-4 items-center">
                        <Users/> ... Clients
                    </Link>
                </DashboardCards>
                <DashboardCards className="border-blue-700 col-span-2">
                    <Link href={"/projects"} className="flex justify-content gap-4 items-center">
                        <FolderKanban/> ... Laufende Projekte
                    </Link>
                </DashboardCards>
                <DashboardCards className="border-green-700 col-span-2 gap-4">
                    <Contact/> <Link href={"/teams/projects"}> ... Projekte</Link> aus <Link href={"/teams"}>... Teams</Link>
                </DashboardCards>
                <DashboardCards className="border-green-500">
                    <Link href={'/statistics'} className="flex justify-content gap-4 items-center">                    
                        <ChartArea/> Graph
                    </Link>
                </DashboardCards>
            </div>
        </section>
      </main>
    </div>
  );
}
