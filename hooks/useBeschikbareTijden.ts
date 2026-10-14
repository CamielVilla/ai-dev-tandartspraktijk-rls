"use client";

import {useCallback, useEffect, useRef, useState} from "react";

type TijdenState =
    | { status: "idle"; tijden: string[] }
    | { status: "loading"; tijden: string[] }
    | { status: "success"; tijden: string[] }
    | { status: "error"; tijden: string[] };

/**
 * Haalt de vrije tijden voor een behandeling en datum op bij `/api/tijden`.
 *
 * Elke nieuwe aanvraag annuleert de vorige (AbortController). Klikt iemand snel
 * op meerdere datums, dan kan een trage oude response anders nog binnenkomen
 * na een snellere nieuwe, waardoor de tijden van de verkeerde dag zichtbaar zijn.
 */
export function useBeschikbareTijden(behandeling: string) {
    const [state, setState] = useState<TijdenState>({status: "idle", tijden: []});
    const lopendeAanvraag = useRef<AbortController | null>(null);

    const laadTijden = useCallback(async (datum: string) => {
        lopendeAanvraag.current?.abort();
        const controller = new AbortController();
        lopendeAanvraag.current = controller;

        setState({status: "loading", tijden: []});

        try {
            const params = new URLSearchParams({behandeling, datum});
            // no-store: de beschikbaarheid verandert bij elke boeking, dus de
            // browser mag nooit een eerder antwoord hergebruiken.
            const response = await fetch(`/api/tijden?${params}`, {
                cache: "no-store",
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`GET /api/tijden gaf status ${response.status}`);
            }

            const data: { tijden: string[] } = await response.json();
            setState({status: "success", tijden: data.tijden});
        } catch (error) {
            if (controller.signal.aborted) {
                return; // vervangen door een nieuwere aanvraag
            }
            console.error(error);
            setState({status: "error", tijden: []});
        }
    }, [behandeling]);

    // Lopende aanvraag annuleren als de component verdwijnt.
    useEffect(() => () => lopendeAanvraag.current?.abort(), []);

    return {...state, laadTijden};
}
