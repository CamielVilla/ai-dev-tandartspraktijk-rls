import "server-only";
import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";
import type {Database} from "./database.types";
import {supabasePublishableKey, supabaseUrl} from "./env";

/**
 * Supabase-client mét de sessie van de bezoeker (uit de cookies).
 *
 * Gebruik deze voor alles wat met inloggen te maken heeft en voor data van
 * de ingelogde arts: RLS bepaalt dan wat deze gebruiker mag zien.
 * Maak per request een nieuwe client aan; deel hem nooit tussen requests.
 */
export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({name, value, options}) => cookieStore.set(name, value, options));
                } catch {
                    // Aangeroepen vanuit een Server Component: die mag geen cookies
                    // zetten. Geen probleem, want proxy.ts ververst de sessie al.
                }
            },
        },
    });
}
