import "server-only";
import {getSupabase} from "./supabase/server";

/**
 * Data-laag voor afspraken.
 *
 * De logica voor beschikbaarheid en boeken zit in Postgres-functies
 * (zie supabase/migrations). Daardoor gebeurt "is dit tijdstip vrij?" en
 * "sla de reservering op" in één transactie, en weigert de database zelf
 * dubbele boekingen, ook bij gelijktijdige requests.
 */

export type NieuweAfspraak = {
    behandeling: string; // slug
    datum: string;       // ISO-datum, bijv. "2026-09-12"
    tijd: string;        // "HH:MM"
    naam: string;
    email: string;
};

export type GeboekteAfspraak = {
    id: number;
    datum: string;
    tijd: string;
};

/** Het tijdstip is niet (meer) vrij. */
export class TijdNietBeschikbaarError extends Error {
    constructor() {
        super("Dit tijdstip is niet beschikbaar.");
        this.name = "TijdNietBeschikbaarError";
    }
}

/** De behandeling bestaat niet. */
export class OnbekendeBehandelingError extends Error {
    constructor(slug: string) {
        super(`Onbekende behandeling: ${slug}`);
        this.name = "OnbekendeBehandelingError";
    }
}

// Postgres-foutcodes uit boek_afspraak()
const PG_EXCLUSION_VIOLATION = "23P01";
const PG_NO_DATA_FOUND = "P0002";

export async function getBeschikbareTijden(behandeling: string, datum: string): Promise<string[]> {
    const {data, error} = await getSupabase().rpc("beschikbare_tijden", {
        p_behandeling: behandeling,
        p_datum: datum,
    });

    if (error) {
        throw new Error("Beschikbare tijden ophalen mislukt", {cause: error});
    }
    return data.map((rij) => naarUrenEnMinuten(rij.starttijd));
}

/**
 * @throws {TijdNietBeschikbaarError} als het tijdstip inmiddels bezet is.
 * @throws {OnbekendeBehandelingError} als de behandeling niet bestaat.
 */
export async function boekAfspraak(afspraak: NieuweAfspraak): Promise<GeboekteAfspraak> {
    const {data, error} = await getSupabase().rpc("boek_afspraak", {
        p_behandeling: afspraak.behandeling,
        p_datum: afspraak.datum,
        p_starttijd: afspraak.tijd,
        p_naam: afspraak.naam,
        p_email: afspraak.email,
    });

    if (error) {
        if (error.code === PG_EXCLUSION_VIOLATION) {
            throw new TijdNietBeschikbaarError();
        }
        if (error.code === PG_NO_DATA_FOUND) {
            throw new OnbekendeBehandelingError(afspraak.behandeling);
        }
        throw new Error("Afspraak boeken mislukt", {cause: error});
    }

    return {id: data.id, datum: data.datum, tijd: naarUrenEnMinuten(data.starttijd)};
}

/** Postgres geeft "09:30:00" terug; de app werkt met "09:30". */
function naarUrenEnMinuten(tijd: string): string {
    return tijd.slice(0, 5);
}
