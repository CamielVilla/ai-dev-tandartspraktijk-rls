import type {NextRequest} from "next/server";
import {updateSession} from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    // Alleen de routes waar de sessie een rol speelt. De openbare pagina's
    // (home, behandelingen, afspraak maken) hoeven geen sessie te verversen.
    // Let op: dit is géén beveiliging. Elke beveiligde pagina controleert zelf
    // of er iemand is ingelogd (zie lib/auth.ts).
    matcher: ["/mijn-afspraken/:path*", "/inloggen", "/registreren", "/auth/:path*"],
};
