'use client'

import Link from "next/link" // Importiere Link um halt zu verlinken. lol
import { usePathname } from "next/navigation" // Um hervorzuheben (Ästhetisch :D )

export default function Sidebar () { // Funktion erstellen

    const pathname = usePathname() // Pathname initialisieren
    return ( // Quasi immer checken ob der aktuelle Path ist, wenn ja wird ästhetissch hervorgehoben. Mit Verlinken zuden anderen Teilen. 
        <div className="self-start sticky top-28">
            <div className="border border-orange-800 text-black text-center p-4 justify-center rounded-3xl h-full flex flex-col justify-center">
                <div className="flex flex-col h-full justify-center items-center">                
                    <Link href="/dashboard" className={`${pathname === "/dashboard" ? 'text-blue-500 hover:text-black hover:bg-blue-500 ' : ''} hover:bg-blue-300 my-2 p-2 rounded cursor-pointer`} >Dashboard</Link>
                    <Link href="/dashboard/clients" className={`${pathname === "/dashboard/clients" ? 'text-blue-500 hover:text-black hover:bg-blue-500 ' : ''} hover:bg-blue-300 my-2 p-2 rounded cursor-pointer`} >Clients</Link>
            
                    <Link href="/dashboard/projects" className={`${pathname === "/dashboard/projects" ? 'text-blue-500 hover:text-black hover:bg-blue-500 ' : ''} hover:bg-blue-300 my-2 p-2 rounded cursor-pointer`} >Projekte</Link>
                    
                    <li className="w-full my-2 list-none"><hr className="border-t border-orange-800" /></li>
                    <Link href="/dashboard/teams" className={`${pathname === "/dashboard/teams" ? 'text-green-500 hover:text-black hover:bg-green-500 ' : ''} hover:bg-green-300 my-2 p-2 rounded cursor-pointer`} >Teams</Link>
                    <Link href="/dashboard/teams/clients" className={`${pathname === "/dashboard/teams/clients" ? 'text-green-500 hover:text-black hover:bg-green-500 ' : ''} hover:bg-green-300 my-2 p-2 rounded cursor-pointer`} >Teamprojekte</Link>
                    
                    <li className="w-full my-2 list-none"><hr className="border-t border-orange-800" /></li>
                    <Link href="/dashboard/statistics" className={`${pathname === "/dashboard/statistics" ? 'text-orange-500 hover:text-black hover:bg-orange-500 ' : ''} hover:bg-orange-300 my-2 p-2 rounded cursor-pointer`} >Statistiken</Link>
                    <Link href="/dashboard/settings" className={`${pathname === "/dashboard/settings" ? 'text-orange-500 hover:text-black hover:bg-orange-500 ' : ''} hover:bg-orange-300 my-2 p-2 rounded cursor-pointer`} >Settings</Link>
                </div>
            </div>
        </div>
    )
}