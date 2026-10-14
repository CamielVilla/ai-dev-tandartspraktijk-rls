import type {AfspraakResultaat} from "@/app/afspraken/maken/[behandeling]/actions";

type AfspraakFormulierProps = {
    behandeling: string;
    datum: string;
    tijd: string;
    action: (formData: FormData) => void;
    isPending: boolean;
    resultaat: AfspraakResultaat;
    /** Veldfouten horen bij de laatste poging; na een nieuwe selectie verbergen we ze. */
    toonFouten: boolean;
};

export default function AfspraakFormulier({
                                              behandeling,
                                              datum,
                                              tijd,
                                              action,
                                              isPending,
                                              resultaat,
                                              toonFouten,
                                          }: AfspraakFormulierProps) {
    const fout = resultaat.status === "error" ? resultaat : null;
    const naamFout = toonFouten ? fout?.veldFouten?.naam : undefined;
    const emailFout = toonFouten ? fout?.veldFouten?.email : undefined;

    return (
        <form className="appointment-form" action={action} noValidate>
            <input type="hidden" name="behandeling" value={behandeling}/>
            <input type="hidden" name="datum" value={datum}/>
            <input type="hidden" name="tijd" value={tijd}/>

            <label htmlFor="naam">Naam</label>
            <input
                id="naam"
                name="naam"
                type="text"
                autoComplete="name"
                required
                maxLength={100}
                defaultValue={fout?.invoer?.naam}
                aria-invalid={naamFout ? true : undefined}
                aria-describedby={naamFout ? "naam-fout" : undefined}
            />
            {naamFout && <p id="naam-fout" className="form-error">{naamFout}</p>}

            <label htmlFor="email">E-mailadres</label>
            <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                defaultValue={fout?.invoer?.email}
                aria-invalid={emailFout ? true : undefined}
                aria-describedby={emailFout ? "email-fout" : undefined}
            />
            {emailFout && <p id="email-fout" className="form-error">{emailFout}</p>}

            <button type="submit" disabled={isPending}>
                {isPending ? "Bezig met bevestigen…" : "Afspraak bevestigen"}
            </button>
        </form>
    );
}
