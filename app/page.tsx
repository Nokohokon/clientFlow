'use client';
import { useState } from "react";
import { Heading1 } from "@/components/design/headings/heading-1";
import { HeroHeading } from "@/components/design/headings/HeroHeading";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { auth } from "@/lib/auth";

export default function Home() {


  async function handleSignUp (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const name =fd.get('name') as string;
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const callbackURL = "/dashboard"
    await authClient.signUp.email({
      name, email, password, callbackURL
    })
  }


  return (
    <div className="flex justify-start flex-col items-center bg-white h-screen">
      <main>
        <section className="py-20 lg:py-32">
          <HeroHeading className="flex items-center gap-4">
            <Image src="/client_garage.png" height={100} alt="Logo" width={100}/>
            Client Garage - Dashboard
          </HeroHeading>
        </section>
        <section id="auth">
          <form onSubmit={handleSignUp} className="flex flex-col gap-4 max-w-md mx-auto">
            <input name="name" placeholder="Name" className="px-3 py-2 border rounded" />
            <input name="email" type="email" placeholder="Email" className="px-3 py-2 border rounded" />
            <input name="password" type="password" placeholder="Password" className="px-3 py-2 border rounded" />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Sign up</button>
          </form>
        </section>
      </main>
    </div>
  );
}
