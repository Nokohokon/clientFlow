'use client';

import { useEffect, useState } from 'react';
import { getClients, createClient } from '@/lib/actions';
import { client } from '@/lib/types';


export default function ClientPage() {
    const [clients, setClients] = useState<client[]>([]);
    const [creating, setCreating] = useState<boolean>(false);


    useEffect(() => {
        async function load () {
            const clients = await getClients() as client[];
            setClients(clients);
        }
        load().catch(console.error)
    }, [])

    async function handleSubmit(formData: FormData) {
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

    return (
        <div>

            { clients.length != 0 ? clients.map((client: client) => (
                <p className="text-gray-700" key={client.id}>{client.name}</p>
            )) : <div className='text-center'>
                    <h3 className='text-red-500 text-2xl text-center'>
                        Keine Clients vorhanden.
                    </h3>
                </div>}
            {creating ? (
                <div className='my-5 flex flex-col justify-center items-center'>
                    <h2 className='text-2xl font-bold mb-4 text-blue-500'>Neuen Client erstellen</h2>
                    <form action={handleSubmit} className='flex flex-col items-center'>
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
    );
}