'use client';
import { useState } from "react";
import { Heading1 } from "@/components/design/headings/heading-1";
import { HeroHeading } from "@/components/design/headings/HeroHeading";
import DashboardPage from "@/components/pages/dashboardPage";
import Head from "next/head";
import Image from "next/image";

export default function Home() {

  return (
    <div className="flex justify-start flex-col items-center bg-white h-screen">
      <main>
        <section className="py-20 lg:py-32">
          <HeroHeading className="flex items-center gap-4">
            <Image src="/client_garage.png" height={100} alt="Logo" width={100}/>
            Client Garage - Dashboard
          </HeroHeading>
        </section>
        <section>

        </section>
      </main>
    </div>
  );
}
