'use client'
import { usePathname } from "next/navigation" // PAthname importieren weil wir den zerstückeln wollen
import Link from "next/link" // Wollen ja auch verlinken

export default function Breadcrumb() {  // Halt komponente erstellen
    const pathname = usePathname(); // pathname hook initialisieren
    
    return (
        <p className=" text-left text-base text-gray-600 "> 
            <Link href="/dashboard" className=" hover:underline ">Dashboard</Link> {/* Quasi halt immer als erstes dashboard anzeigen weil is ja erst ab /dashboard das es genutzt wird */}
            {pathname?.split('/').slice(2).map((segment, index, arr) => { {/* Pathname splitten so dass quasi jeder eigene "crumb" einzeln is und jetzt halt mappen das quasi jedes gerendet wird*/}
                const path = '/dashboard/' + arr.slice(0, index + 1).join('/');
                return (
                    <span key={path}>
                        {' > '}
                        <Link href={path} className=" hover:underline ">
                            {segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')} {/* Einstellen, dass quasi immer Großbuchstaben sind weil sind ja Nomen. Deutsche Rechtschreibung on top */}
                        </Link>
                    </span>
                )
            })}
        </p>
    )
}