'use client';


import { useState, useEffect } from "react";
import DashboardCards from "@/components/design/cards/DashboardInfoCards"; // Dashboard Cards
import { Users, FolderKanban, ChartArea, Contact } from "lucide-react"; // Icons
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Loading } from "@/components/design/system/Loading"; // Loading Komponente

interface dashboardData { // Was quasi von API übermittelt werdenb soll.
    clientNumber: number,
    runningProjects: number,
    organisations: number,
    organisationProjects: number,
    teamNumbers: number
}

export default function DashboardPage() { // Dashboard Page Komponente
    const { data: session } = authClient.useSession();
    const [dashboardData, setDashboardData] = useState<dashboardData>();
    const [isLoading, setIsLoading] = useState<boolean>(true);



    useEffect(() => {
        async function load_data() { // Dashboard Data von API fetchen
            try {

                const response = await fetch('/api/dashboard');
                if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
                const data = await response.json();
                console.log('Loaded dashboard data:', data);
                setDashboardData(data.dashboardData);
                setIsLoading(false)
            } catch (err) {
                console.error('Error loading clients', err);
                setIsLoading(false)
            }
        }
        load_data(); // Dashboard Data setzen
    },[])

    if (isLoading) {
        return (
            <Loading/> // Loading Komponent falls noch nd geladen hat
        )
    }
  return (
        <div className=" w-150 grid grid-cols-3 gap-4 h-full ">
            <DashboardCards className="bg-blue-300 hover:bg-blue-400"> {/* die Dashboard Sachen halt */}
                <Link href={"/dashboard/clients"}>
                    <Users className="inline-block align-middle h-5 w-5 mr-2" />{dashboardData?.clientNumber} Clients
                </Link>
            </DashboardCards>
            <DashboardCards className="bg-blue-300 hover:bg-blue-400 col-span-2">
                <Link href={"/dashboard/projects"}>
                    <FolderKanban className="inline-block align-middle h-5 w-5 mr-2" />{dashboardData?.runningProjects} Laufende Projekte
                </Link>
            </DashboardCards>
            <DashboardCards className="bg-green-300 hover:bg-green-400 col-span-2">
                <p>
                    <Contact className="inline-block align-middle h-5 w-5 mr-2" />
                    <Link href={"/dashboard/teams/projects"} className="font-medium">{dashboardData?.organisationProjects} Projekte</Link> aus <Link href={"/teams"} className="font-medium">{dashboardData?.organisations} Organisationen</Link>, bei denen du in {dashboardData?.teamNumbers} Teams bist.
                </p>
            </DashboardCards>
            <DashboardCards className="bg-green-300 hover:bg-green-400">
                <Link href={'/dashboard/statistics'}>
                    <ChartArea className="inline-block align-middle h-5 w-5 mr-2" />Graph {/* Weiß noch nd genau was in dne Graph kommt aber wollte einen da haben lol */}
                </Link>
            </DashboardCards>
        </div>
  );
}
