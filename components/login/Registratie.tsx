"use client";

import {type ReactNode, useActionState} from "react";
import {type RegistratieResultaat, registreer} from "@/app/registreren/actions";
import {ARTS_TYPES} from "@/lib/arts";

const INITIEEL_RESULTAAT: RegistratieResultaat = {status: "idle"};

export default function Registratie() {
    const [resultaat, formAction, isPending] = useActionState(registreer, INITIEEL_RESULTAAT);

    if (resultaat.status === "bevestig-email") {
        return (
            <div className="login-bevestiging" role="status">
                <h2>Check je mail</h2>
                <p>
                    We hebben een bevestigingslink gestuurd naar <strong>{resultaat.email}</strong>.
                    Klik op de link om je account te activeren; daarna ben je direct ingelogd.
                </p>
            </div>
        );
    }

    const fouten = resultaat.status === "error" ? resultaat.veldFouten : {};
    const invoer = resultaat.status === "error" ? resultaat.invoer : undefined;

    return (
        <form action={formAction} className="login-form" noValidate>
            <FormGroep id="naam" label="Naam" fout={fouten.naam}>
                <input
                    id="naam"
                    name="naam"
                    type="text"
                    placeholder="Dr. J. de Vries"
                    autoComplete="name"
                    required
                    maxLength={100}
                    defaultValue={invoer?.naam}
                    {...foutAttributen("naam", fouten.naam)}
                />
            </FormGroep>

            <FormGroep id="type" label="Functie" fout={fouten.type}>
                <select
                    // React neemt bij een <select> alleen de eerste defaultValue over. Na een
                    // fout reset het formulier; met een nieuwe key blijft de keuze staan.
                    key={invoer?.type ?? ""}
                    id="type"
                    name="type"
                    required
                    defaultValue={invoer?.type ?? ""}
                    {...foutAttributen("type", fouten.type)}
                >
                    <option value="" disabled>Kies je functie</option>
                    {ARTS_TYPES.map((type) => (
                        <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>
                    ))}
                </select>
            </FormGroep>

            <FormGroep id="email" label="E-mailadres" fout={fouten.email}>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="naam@voorbeeld.nl"
                    autoComplete="email"
                    required
                    defaultValue={invoer?.email}
                    {...foutAttributen("email", fouten.email)}
                />
            </FormGroep>

            <FormGroep id="wachtwoord" label="Wachtwoord" fout={fouten.wachtwoord} hint="Minimaal 8 tekens.">
                <input
                    id="wachtwoord"
                    name="wachtwoord"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={72}
                    {...foutAttributen("wachtwoord", fouten.wachtwoord, "wachtwoord-hint")}
                />
            </FormGroep>

            <FormGroep id="wachtwoordHerhaling" label="Herhaal wachtwoord" fout={fouten.wachtwoordHerhaling}>
                <input
                    id="wachtwoordHerhaling"
                    name="wachtwoordHerhaling"
                    type="password"
                    autoComplete="new-password"
                    required
                    {...foutAttributen("wachtwoordHerhaling", fouten.wachtwoordHerhaling)}
                />
            </FormGroep>

            <div role="alert">
                {resultaat.status === "error" && resultaat.melding && (
                    <p className="form-error">{resultaat.melding}</p>
                )}
            </div>

            <button type="submit" disabled={isPending}>
                {isPending ? "Bezig met registreren…" : "Registreren"}
            </button>
        </form>
    );
}

type FormGroepProps = {
    id: string;
    label: string;
    fout?: string;
    hint?: string;
    children: ReactNode;
};

function FormGroep({id, label, fout, hint, children}: FormGroepProps) {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            {children}
            {hint && !fout && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
            {fout && <p id={`${id}-fout`} className="form-error">{fout}</p>}
        </div>
    );
}

/** Koppelt een foutmelding (of hint) aan het invoerveld voor schermlezers. */
function foutAttributen(id: string, fout: string | undefined, hintId?: string) {
    return {
        "aria-invalid": fout ? true : undefined,
        "aria-describedby": fout ? `${id}-fout` : hintId,
    };
}
