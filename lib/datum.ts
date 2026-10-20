/**
 * Datumhulpjes die zowel op de server als in de browser gebruikt worden.
 *
 * De kalender toont (net als in deel 1) alleen september 2026. Door dat hier
 * centraal vast te leggen staat "2026-09-" niet meer verspreid door de code.
 */

export const KALENDER = {
    jaar: 2026,
    maand: 9,
    aantalDagen: 29,
} as const;

const ISO_DATUM = /^(\d{4})-(\d{2})-(\d{2})$/;

const datumFormatter = new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
});

/** Dag in de kalendermaand -> ISO-datum, bijv. 12 -> "2026-09-12". */
export function dagNaarIsoDatum(dag: number): string {
    const maand = String(KALENDER.maand).padStart(2, "0");
    const dagString = String(dag).padStart(2, "0");
    return `${KALENDER.jaar}-${maand}-${dagString}`;
}

/** Controleert of een ISO-datum een geldige dag in de kalendermaand is. */
export function isGeldigeAfspraakDatum(datum: string): boolean {
    const match = ISO_DATUM.exec(datum);
    if (!match) {
        return false;
    }

    const [, jaar, maand, dag] = match.map(Number);
    return jaar === KALENDER.jaar
        && maand === KALENDER.maand
        && dag >= 1
        && dag <= KALENDER.aantalDagen;
}

/** ISO-datum -> leesbare datum, bijv. "2026-09-12" -> "12 september". */
export function formatDatum(datum: string): string {
    return datumFormatter.format(new Date(`${datum}T00:00:00Z`));
}

const langeDatumFormatter = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});

/** ISO-datum -> "maandag 14 september 2026". */
export function formatDatumLang(datum: string): string {
    return langeDatumFormatter.format(new Date(`${datum}T00:00:00Z`));
}

/** De datum van vandaag in Nederland als ISO-datum, bijv. "2026-10-20". */
export function vandaagIsoDatum(): string {
    // en-CA formatteert als JJJJ-MM-DD; de tijdzone voorkomt dat de server
    // (vaak in UTC) rond middernacht de verkeerde dag kiest.
    return new Intl.DateTimeFormat("en-CA", {timeZone: "Europe/Amsterdam"}).format(new Date());
}
