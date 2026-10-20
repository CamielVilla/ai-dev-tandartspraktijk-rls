import type {Metadata} from "next";
import {notFound} from "next/navigation";
import AfspraakPlanner from "@/components/afspraak/AfspraakPlanner";
import {getBehandeling, getBehandelingen} from "@/lib/behandelingen";

/*
 * De behandelingen komen direct uit Supabase (via lib/behandelingen) en niet
 * via `fetch("/api/behandelingen")`. De Next.js-docs raden af om vanuit een
 * Server Component je eigen Route Handler aan te roepen: dat kost een extra
 * HTTP-round-trip en faalt tijdens `next build`, omdat er dan geen server draait.
 */

// De bekende behandelingen worden tijdens de build gegenereerd en elk uur
// ververst. Een nieuwe behandeling in de database werkt direct (dynamicParams
// staat standaard aan); een onbekende slug geeft een 404 via notFound().
export const revalidate = 3600;

export async function generateStaticParams() {
    const behandelingen = await getBehandelingen();
    return behandelingen.map((behandeling) => ({behandeling: behandeling.slug}));
}

export async function generateMetadata({params}: PageProps<"/afspraken/maken/[behandeling]">): Promise<Metadata> {
    const {behandeling: slug} = await params;
    const behandeling = await getBehandeling(slug);

    return {title: behandeling ? `Afspraak maken: ${behandeling.type} | De Tandenborstel` : undefined};
}

export default async function AfspraakMakenPagina({params}: PageProps<"/afspraken/maken/[behandeling]">) {
    const {behandeling: slug} = await params;
    const behandeling = await getBehandeling(slug);

    if (!behandeling) {
        notFound();
    }

    return (
        <main className="page-container">
            <h1>Afspraak maken</h1>
            <section className="intro">
                <h2>Behandeling: {behandeling.type}</h2>
                <p>
                    U wilt een afspraak maken voor de behandeling <strong>{behandeling.type}</strong>
                    {" "}({behandeling.duur} minuten).
                </p>
            </section>
            <AfspraakPlanner behandeling={behandeling.slug}/>
        </main>
    );
}
