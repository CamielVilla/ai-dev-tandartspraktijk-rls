import type {Metadata} from "next";
import Link from "next/link";
import Registratie from "@/components/login/Registratie";
import {stuurIngelogdeArtsDoor} from "@/lib/auth";

export const metadata: Metadata = {
    title: "Registreren | De Tandenborstel",
};

export default async function Registreren() {
    await stuurIngelogdeArtsDoor();

    return (
        <main className="page-container">
            <section className="login-container">
                <h1>Welkom dokter!</h1>
                <p>Maak een account aan om je afspraken te beheren.</p>
                <Registratie/>
                <p className="login-wissel">
                    Heb je al een account? <Link href="/inloggen">Inloggen</Link>
                </p>
            </section>
        </main>
    );
}
