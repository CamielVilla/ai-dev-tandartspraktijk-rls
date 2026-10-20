import type {NextRequest} from "next/server";
import {getBeschikbareTijden} from "@/lib/afspraken";
import {getBehandeling} from "@/lib/behandelingen";
import {isGeldigeAfspraakDatum} from "@/lib/datum";

/*
 * Caching: beschikbare tijden veranderen bij elke boeking. Deze route mag dus
 * nooit gecachet worden, niet door Next.js en niet door de browser of een CDN.
 * `force-dynamic` maakt die keuze expliciet; de `Cache-Control`-header
 * hieronder geldt voor alles tussen server en browser.
 */
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {

    const behandeling = request.nextUrl.searchParams.get("behandeling");
    const datum = request.nextUrl.searchParams.get("datum");


    if (!behandeling || !datum) {
        return Response.json({error: "behandeling en datum zijn verplicht."}, {status: 400});
    }

    if (!isGeldigeAfspraakDatum(datum)) {
        return Response.json({error: "Ongeldige datum."}, {status: 400});
    }

    if (!(await getBehandeling(behandeling))) {
        return Response.json({error: "Onbekende behandeling."}, {status: 404});
    }


    return Response.json(
        {tijden: await getBeschikbareTijden(behandeling, datum)},
        {headers: {"Cache-Control": "no-store"}}
    );
}
