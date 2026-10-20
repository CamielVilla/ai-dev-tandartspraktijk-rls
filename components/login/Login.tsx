"use client";

import {useActionState} from "react";
import {login, type LoginResultaat} from "@/app/inloggen/actions";

const INITIEEL_RESULTAAT: LoginResultaat = {status: "idle"};

export default function Login() {
    const [resultaat, formAction, isPending] = useActionState(login, INITIEEL_RESULTAAT);
    const fout = resultaat.status === "error" ? resultaat : null;

    return (
        <form action={formAction} className="login-form">
            <div className="form-group">
                <label htmlFor="email">E-mailadres</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="naam@voorbeeld.nl"
                    autoComplete="email"
                    required
                    defaultValue={fout?.email}
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Wachtwoord</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Voer je wachtwoord in"
                    autoComplete="current-password"
                    required
                />
            </div>

            <div role="alert">
                {fout && <p className="form-error">{fout.melding}</p>}
            </div>

            <button type="submit" disabled={isPending}>
                {isPending ? "Bezig met inloggen…" : "Inloggen"}
            </button>
        </form>
    );
}
