/* eslint-disable @typescript-eslint/no-unused-vars -- startpunt: deze import gebruik je in opdracht 3. Haal deze regel weg als je klaar bent. */
import "server-only";
import {cache} from "react";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "./supabase/server";

export type Arts = {
    id: number;
    naam: string;
    type: string;
};

/**
 * Geeft de ingelogde arts terug, of `null` als er niemand is ingelogd.
 *
 * `cache` zorgt dat dit per request maar één keer gebeurt, ook als meerdere
 * onderdelen van een pagina het vragen.
 */
export const getIngelogdeArts = cache(async (): Promise<Arts | null> => {
    // TODO opdracht 3: zoek uit wie er is ingelogd.
    //  - Maak een client met createSupabaseServerClient().
    //  - Vraag de gebruiker op uit het token van de sessie. Er zijn meerdere
    //    functies in supabase.auth die iets over de sessie teruggeven. Kies er
    //    één die het token écht controleert. Waarom mag je op de server
    //    getSession() níet vertrouwen?
    //  - Is er niemand ingelogd? Geef dan null terug.
    //  - Zoek in de tabel `arts` de rij waarvan user_id gelijk is aan het id van
    //    de gebruiker, en geef die terug (id, naam, type).
    return null;
});

/** Voor pagina's achter de login: stuurt door naar /inloggen als er niemand is ingelogd. */
export async function vereisIngelogdeArts(): Promise<Arts> {
    const arts = await getIngelogdeArts();
    if (!arts) {
        redirect("/inloggen");
    }
    return arts;
}

/** Voor /inloggen en /registreren: wie al is ingelogd, gaat direct naar zijn afspraken. */
export async function stuurIngelogdeArtsDoor(): Promise<void> {
    if (await getIngelogdeArts()) {
        redirect("/mijn-afspraken");
    }
}
