import {getBehandelingen} from "@/lib/behandelingen";

/*
 * Caching: de behandelingen veranderen zelden. De response wordt daarom
 * statisch gegenereerd en hooguit eens per uur opnieuw uit Supabase gehaald
 * (ISR). Een GET Route Handler is in Next.js 15+ standaard dynamisch, dus
 * deze keuze moet je expliciet maken.
 */
export const revalidate = 3600;

export async function GET() {
    return Response.json({treatments: await getBehandelingen()});
}
