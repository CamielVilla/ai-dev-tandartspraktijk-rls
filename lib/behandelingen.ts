import "server-only";
import {cache} from "react";
import {getSupabase} from "./supabase/server";

export type Behandeling = {
    id: number;
    slug: string;  // url-slug, bijv. "bleken"
    type: string;  // weergavenaam, bijv. "Tanden bleken"
    duur: number;  // in minuten
};

/*
 * `cache` voorkomt dubbele queries binnen één request: generateMetadata en de
 * pagina vragen allebei dezelfde behandeling op, maar de database wordt maar
 * één keer aangesproken.
 */

export const getBehandelingen = cache(async (): Promise<Behandeling[]> => {
    const {data, error} = await getSupabase()
        .from("behandelingen")
        .select("id, slug, type, duur")
        .order("id");

    if (error) {
        throw new Error("Behandelingen ophalen mislukt", {cause: error});
    }
    return data;
});

export const getBehandeling = cache(async (slug: string): Promise<Behandeling | null> => {
    const {data, error} = await getSupabase()
        .from("behandelingen")
        .select("id, slug, type, duur")
        .eq("slug", slug)
        .maybeSingle();

    if (error) {
        throw new Error(`Behandeling "${slug}" ophalen mislukt`, {cause: error});
    }
    return data;
});
