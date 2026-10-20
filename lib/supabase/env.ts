/**
 * Supabase-configuratie uit de omgevingsvariabelen.
 *
 * Beide waarden zijn publiek (NEXT_PUBLIC_): de publishable key geeft alleen
 * toegang tot wat de RLS-policies toestaan. Een secret key is niet meer nodig.
 */

export function supabaseUrl(): string {
    return verplicht("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function supabasePublishableKey(): string {
    return verplicht("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

// process.env.X moet letterlijk uitgeschreven worden: Next.js vervangt alleen
// die vorm door de waarde. Daarom wordt de waarde hier als argument meegegeven.
function verplicht(naam: string, waarde: string | undefined): string {
    if (!waarde) {
        throw new Error(`Omgevingsvariabele ${naam} ontbreekt. Zie .env.example.`);
    }
    return waarde;
}
