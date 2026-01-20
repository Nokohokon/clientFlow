"use client";
import { useState, useEffect } from "react";
import { Heading2 } from "@/components/design/headings/heading-2";
import { HeroHeading } from "@/components/design/headings/HeroHeading"; // Die ganzen Imports. Sollten selbsterklärend sein.
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

type modus = 'signUp' | 'signIn'; // Für das Form unten.



export default function Home() {

  const [mode, setMode] = useState<modus>('signUp') // Usestate fürs form
  const { data: session } = authClient.useSession(); // Einloggen und so
  const router = useRouter(); // für weiterleitung

  useEffect(() => {
    // Wenn bereits eine Session vorhanden ist, direkt ins Dashboard weiterleiten
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);


  async function handleSignUp (e: React.FormEvent<HTMLFormElement>) { // Registrieren. mit nem form, aus dem die sachen extrahier werden
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const callbackURL = "/dashboard"
    await authClient.signUp.email({ // halt das signup von better auth
      name, email, password, callbackURL, initialized: false 
    })
  }

    async function handleSignIn (e: React.FormEvent<HTMLFormElement>) { //quasi das gleihce nur mit login
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email') as string;
    const password = fd.get('password') as string;
    const callbackURL = "/dashboard"
    await authClient.signIn.email({
      email:  email,
      password: password,
      callbackURL: callbackURL
    })
  }



  return (
    <div className="flex justify-start flex-col items-center bg-white h-screen">
      <main>
        <section className="py-20 lg:py-32">
          <HeroHeading className="flex items-center gap-4">
            <Image src="/client_garage.png" height={100} alt="Logo" width={100}/>
            Client Garage - Dashboard {session?.user.name}
          </HeroHeading>
        </section>
        <div className="flex flex-col gap-4 justify-center items-center w-full">
          <div className="w-full max-w-md mx-auto p-4">
            <div className="text-center pb-8">
              <Heading2>
                {mode === 'signIn' ? 'Anmelden' : 'Registrieren'} { /* Überschrift - Anmelden oder registrieren, je nachdem was ausgewählt ist. */ }
              </Heading2>
            </div>
            <section id="auth" className="flex flex-col gap-4 w-full">
              <div className="flex gap-4 justify-center"> {/* Menü zum switchen */}
                <button onClick={() => setMode('signUp')} className={`${mode === 'signIn' ? 'hover:orange-bg-300' : 'bg-orange-500'} flex-1 p-4 cursor-pointer rounded-sm text-center`}>Registrieren</button>
                <button onClick={()=> setMode('signIn')} className={`${mode === 'signIn' ? 'bg-orange-500' : 'hover:bg-orange-300'} flex-1 p-4 rounded-sm cursor-pointer text-center`}>Einloggen</button>
              </div>

              {mode === 'signIn' ?  
                <form onSubmit={handleSignIn} className="flex flex-col gap-4 w-full">  {/* Form für einloggen */}
                  <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
                  <input name="password" type="password" placeholder="Password" className="w-full px-3 py-2 border rounded" />
                  <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Einloggen</button>
                </form>
                : 
                <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-full"> {/* Form für registrieren */}
                  <input name="name" placeholder="Name" className="w-full px-3 py-2 border rounded" />
                  <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2 border rounded" />
                  <input name="password" type="password" placeholder="Password" className="w-full px-3 py-2 border rounded" />
                  <button type="submit" className="w-full px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Registrieren</button>
                </form>
              }
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
