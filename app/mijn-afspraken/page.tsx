import type {Metadata} from "next";
import AfsprakenLijst from "@/components/afspraak/AfsprakenLijst";
import Header from "@/components/Header";
import {uitloggen} from "@/app/inloggen/actions";
import {getAfsprakenVanArts} from "@/lib/afspraken";
import {vereisIngelogdeArts} from "@/lib/auth";
import {vandaagIsoDatum} from "@/lib/datum";

export const metadata: Metadata = {
    title: "Mijn afspraken | De Tandenborstel",
    robots: {index: false, follow: false},
};

export default async function MijnAfsprakenPagina() {
    // Eerst controleren wie er is ingelogd, pas daarna data ophalen.
    const arts = await vereisIngelogdeArts();
    const afspraken = await getAfsprakenVanArts(arts.id);

    const vandaag = vandaagIsoDatum();
    const komend = afspraken.filter((afspraak) => afspraak.datum >= vandaag);
    const eerder = afspraken.filter((afspraak) => afspraak.datum < vandaag);

    return (
        <main className="page-container">
            <Header icon="/logo.svg" title="Mijn afspraken"/>

            <section className="intro">
                <h2>Welkom, {arts.naam}</h2>
                <p>Hier zie je alle afspraken die bij jou zijn ingepland.</p>
                <form action={uitloggen}>
                    <button type="submit" className="uitlog-knop">Uitloggen</button>
                </form>
            </section>

            <AfsprakenLijst
                titel="Komende afspraken"
                afspraken={komend}
                leegTekst="Je hebt geen komende afspraken."
            />
            <AfsprakenLijst
                titel="Eerdere afspraken"
                afspraken={eerder}
                leegTekst="Je hebt nog geen eerdere afspraken."
                nieuwsteEerst
            />
        </main>
    );
}
