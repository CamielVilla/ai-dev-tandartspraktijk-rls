import "server-only";
import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import type {Database} from "./database.types";
import {supabasePublishableKey, supabaseUrl} from "./env";

/**
 * Supabase-client zónder sessie: je bent altijd een anonieme bezoeker.
 *
 * Voor openbare data (behandelingen, vrije tijden, boeken door patiënten).
 * Omdat deze client geen cookies leest, werkt hij ook tijdens `next build`
 * (generateStaticParams) en blijven die pagina's statisch.
 */

let client: SupabaseClient<Database> | undefined;

export function getSupabasePublic(): SupabaseClient<Database> {
    client ??= createClient<Database>(supabaseUrl(), supabasePublishableKey(), {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });
    return client;
}
