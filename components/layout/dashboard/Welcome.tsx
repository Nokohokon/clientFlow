'use client' // Quasi nur erstellt weil layout.tsx lieber nd client is
import { authClient } from "@/lib/auth-client";
import { Heading3 } from "@/components/design/headings/heading-3";


export default function Welcome() {
    const { data: session} = authClient.useSession();

    return (
        <Heading3>
            Willkommen, <span className="text-blue-500">{session?.user.name}</span>! {/* Gibt halt zurück "Willkommen, Freund!" Und das schön farbig c:  */}
        </Heading3>
    )
}