'use client';


import { useState, useEffect } from "react";
import { Heading1 } from "@/components/design/headings/heading-1";
import { HeroHeading } from "@/components/design/headings/HeroHeading";
import DashboardCards from "@/components/design/cards/DashboardInfoCards";
import { Users, FolderKanban, ChartArea, Contact } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

interface dashboardData {
    clientNumber: number,
    runningProjects: number,
    organisations: number,
    organisationProjects: number,
    teamNumbers: number
}

export default function DashboardPage() {
    const { data: session } = authClient.useSession();
    const [dashboardData, setDashboardData] = useState<dashboardData>();

  return (
        <div className=" w-150 grid grid-cols-3 gap-4 h-full ">
            <DashboardCards className="border-blue-500 ">
                <Link href={"/dashboard/clients"}>
                    <Users className="inline-block align-middle h-5 w-5 mr-2" />{dashboardData?.clientNumber} Clients
                </Link>
            </DashboardCards>
            <DashboardCards className="border-blue-700 col-span-2">
                <Link href={"/dashboard/projects"}>
                    <FolderKanban className="inline-block align-middle h-5 w-5 mr-2" />{dashboardData?.runningProjects} Laufende Projekte
                </Link>
            </DashboardCards>
            <DashboardCards className="border-green-700 col-span-2">
                <p>
                    <Contact className="inline-block align-middle h-5 w-5 mr-2" />
                    <Link href={"/dashboard/teams/projects"} className="font-medium">{dashboardData?.organisationProjects} Projekte</Link> aus <Link href={"/teams"} className="font-medium">{dashboardData?.organisations} Organisationen</Link>, bei denen du in {dashboardData?.teamNumbers} Teams bist.
                </p>
            </DashboardCards>
            <DashboardCards className="border-green-500">
                <Link href={'/dashboard/statistics'}>
                    <ChartArea className="inline-block align-middle h-5 w-5 mr-2" />Graph
                </Link>
            </DashboardCards>
        </div>
  );
}
