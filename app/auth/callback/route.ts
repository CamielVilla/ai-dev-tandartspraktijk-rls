import {type NextRequest, NextResponse} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";

/**
 * Hier komt de arts uit na het klikken op de link in de bevestigingsmail.
 *
 * Supabase stuurt een eenmalige `code` mee. Die wisselen we in voor een
 * sessie (PKCE-flow); de cookies worden dan in de response gezet en de arts
 * is ingelogd.
 */
export async function GET(request: NextRequest) {
    const {searchParams, origin} = request.nextUrl;
    const code = searchParams.get("code");
    const next = veiligeRedirect(searchParams.get("next"));

    if (code) {
        const supabase = await createSupabaseServerClient();
        const {error} = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/inloggen?fout=bevestiging`);
}

/**
 * Alleen paden binnen deze site. Anders kan iemand een link maken die na het
 * inloggen doorstuurt naar een nep-site (open redirect).
 */
function veiligeRedirect(pad: string | null): string {
    if (pad && pad.startsWith("/") && !pad.startsWith("//") && !pad.startsWith("/\\")) {
        return pad;
    }
    return "/mijn-afspraken";
}
