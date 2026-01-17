'use client'

import Dashboard from "@/app/dashboard/page"
import { usePathname } from "next/navigation"

export default function Sidebar () {
    const pathname = usePathname()
    return (
        <div className="border border-orange-800 text-black text-center p-4 justify-center rounded-3xl h-full flex flex-col justify-center">
            <ul>
                
                <li className={`${pathname === "/dashboard" ? 'text-blue-500 hover:text-black hover:bg-blue-500 ' : ''} hover:bg-blue-300 my-2 p-2 rounded cursor-pointer`} >Dashboard</li>
                <li className={`${pathname === "/clients" ? 'text-blue-500 hover:text-black hover:bg-blue-500 ' : ''} hover:bg-blue-300 my-2 p-2 rounded cursor-pointer`} >Clients</li>
        
                <li className={`${pathname === "/projects" ? 'text-blue-500 hover:text-black hover:bg-blue-500 ' : ''} hover:bg-blue-300 my-2 p-2 rounded cursor-pointer`} >Projekte</li>
                
                <hr></hr>
                <li className={`${pathname === "/teams" ? 'text-green-500 hover:text-black hover:bg-green-500 ' : ''} hover:bg-green-300 my-2 p-2 rounded cursor-pointer`} >Teams</li>
                <li className={`${pathname === "/teams/projects" ? 'text-green-500 hover:text-black hover:bg-green-500 ' : ''} hover:bg-green-300 my-2 p-2 rounded cursor-pointer`} >Teamprojekte</li>
                
                <hr></hr>
                <li className={`${pathname === "/statistics" ? 'text-orange-500 hover:text-black hover:bg-orange-500 ' : ''} hover:bg-orange-300 my-2 p-2 rounded cursor-pointer`} >Statistiken</li>
                <li className={`${pathname === "/settings" ? 'text-orange-500 hover:text-black hover:bg-orange-500 ' : ''} hover:bg-orange-300 my-2 p-2 rounded cursor-pointer`} >Settings</li>
                
            </ul>
        </div>
    )
}