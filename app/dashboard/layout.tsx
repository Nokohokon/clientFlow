import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { HeroHeading } from "@/components/design/headings/HeroHeading";
import Image from "next/image";
import Sidebar from "@/components/layout/sidebar";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Welcome from "@/components/layout/dashboard/Welcome";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Client Garage",
  description: "CRM made by TCUB (Konja Rehm's 3-parted project)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main>
            <div className="flex justify-start flex-col items-center bg-white h-screen">
                <section className="pt-16 lg:pt-26 pb-10">
                  <HeroHeading className="flex items-center justify-center gap-4">
                    <Image src="/client_garage.png" height={100} alt="Logo" width={100}/> {/* Quasi das fette Client Garage - Dashboard mit Willkommen, User */}
                    <div className="flex flex-col gap-2">
                      Client Garage - Dashboard
                      <Welcome/>
                    </div>
                  </HeroHeading>
                  
                </section>
                <section className="flex flex-row justify-center gap-14 w-full h-[425px] px-10 w-full">
                    <Sidebar/> {/* Sidebar halt */}
                    <div className="flex flex-col">
                        <Breadcrumb/> {/* Breadcrumb mein löwe mein bär */}
                        {children} { /* Jeweiliger Page content, gerendet als flex column da unter breadcrumb */ }
                    </div>
                </section>
            </div>
        </main>
      </body>
    </html>
  );
}
