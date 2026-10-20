import "server-only";
import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import type {Database} from "./database.types";

/**
 * Supabase-client voor gebruik op de server (Server Components, Route
 * Handlers en Server Actions).
 *
 * Voorlopig met de secret key: die omzeilt RLS en mag daarom nooit in de
 * browser komen (`server-only` + geen NEXT_PUBLIC_-prefix). Zodra inloggen
 * er is, maken we per request een client met de sessie van de gebruiker
 * (@supabase/ssr) en bepalen RLS-policies wie wat mag.
 */

let client: SupabaseClient<Database> | undefined;

export function getSupabase(): SupabaseClient<Database> {
    client ??= createClient<Database>(
        leesEnv("NEXT_PUBLIC_SUPABASE_URL"),
        leesEnv("SUPABASE_SECRET_KEY"),
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        }
    );
    return client;
}

function leesEnv(naam: string): string {
    const waarde = process.env[naam];
    if (!waarde) {
        throw new Error(`Omgevingsvariabele ${naam} ontbreekt. Zie .env.example.`);
    }
    return waarde;
}
