import {createServerClient} from "@supabase/ssr";
import {type NextRequest, NextResponse} from "next/server";
import type {Database} from "./database.types";
import {supabasePublishableKey, supabaseUrl} from "./env";

/**
 * Ververst de sessie van de bezoeker en schrijft de nieuwe cookies terug.
 *
 * Een access token verloopt na een uur. Server Components kunnen zelf geen
 * cookies zetten, dus moet dit gebeuren voordat de pagina rendert: in proxy.ts.
 */
export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({request});

    const supabase = createServerClient<Database>(supabaseUrl(), supabasePublishableKey(), {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet, headers) {
                // Op het request zetten, zodat de pagina de nieuwe sessie ziet...
                cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
                response = NextResponse.next({request});
                // ...en op de response, zodat de browser hem opslaat.
                cookiesToSet.forEach(({name, value, options}) => response.cookies.set(name, value, options));
                // Antwoorden met sessie-cookies mogen nooit gecachet worden.
                Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
            },
        },
    });

    // Niets tussen createServerClient en deze aanroep zetten: dit is het moment
    // waarop een verlopen token wordt ververst.
    await supabase.auth.getClaims();

    return response;
}
