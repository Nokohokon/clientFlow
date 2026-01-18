'use client';


import { useState } from "react";
import { Heading1 } from "@/components/design/headings/heading-1";
import { HeroHeading } from "@/components/design/headings/HeroHeading";
import DashboardCards from "@/components/design/cards/DashboardInfoCards";
import { Users, FolderKanban, ChartArea, Contact } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {

  return (
        <div className=" w-150 grid grid-cols-3 gap-4 h-full ">
            <DashboardCards className="border-blue-500 ">
                <Link href={"/dashboard/clients"} className="flex justify-content gap-4 items-center">
                    <Users/> ... Clients
                </Link>
            </DashboardCards>
            <DashboardCards className="border-blue-700 col-span-2">
                <Link href={"/dashboard/projects"} className="flex justify-content gap-4 items-center">
                    <FolderKanban/> ... Laufende Projekte
                </Link>
            </DashboardCards>
            <DashboardCards className="border-green-700 col-span-2 gap-4">
                <Contact/> <Link href={"/dashboard/teams/projects"}> ... Projekte</Link> aus <Link href={"/teams"}>... Teams</Link>
            </DashboardCards>
            <DashboardCards className="border-green-500">
                <Link href={'/dashboard/statistics'} className="flex justify-content gap-4 items-center">                    
                    <ChartArea/> Graph
                </Link>
            </DashboardCards>
        </div>
  );
}
