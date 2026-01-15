'use client';
import Image from "next/image";
import { useState } from "react";
import DashboardPage from "@/components/pages/dashboardPage";
import clientPage from "@/components/pages/clientPage";
import ClientPage from "@/components/pages/clientPage";
export default function Home() {
  const [status, setStatus] = useState<string>('dashboard');
  return (
    <div className="flex justify-start flex-col items-center bg-white h-screen">
        <nav className="flex flex-row justify-center gap-4 mt-5">
          <button className={`${status === "dashboard" ? "text-green-500 underline" : 'text-gray-900'} cursor-pointer text-4xl`} onClick={()=>setStatus('dashboard')}>
              General
          </button>
          <button className={`${status === "clients" ? "text-green-500 underline" : 'text-gray-900'} cursor-pointer text-4xl`} onClick={() => setStatus('clients')}>
              Client Übersicht
          </button>
      </nav>
      <main className="mt-10">
        {status == "dashboard" ? <DashboardPage setStatus={setStatus}/> : <ClientPage/>}
      </main>
    </div>
  );
}
