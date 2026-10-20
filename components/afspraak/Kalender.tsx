import {KALENDER} from "@/lib/datum";

const WEEKDAGEN = ["Ma", "Di", "Wo", "Do", "Vr"];
const DAGEN = Array.from({length: KALENDER.aantalDagen}, (_, index) => index + 1);

type KalenderProps = {
    geselecteerdeDag: number | null;
    onKiesDag: (dag: number) => void;
};

export default function Kalender({geselecteerdeDag, onKiesDag}: KalenderProps) {
    return (
        <article className="card">
            <h2>Kies een datum</h2>
            <div className="calendar-grid">
                {WEEKDAGEN.map((weekdag) => <span key={weekdag}>{weekdag}</span>)}

                {DAGEN.map((dag) => (
                    <span
                        key={dag}
                        className={dag === geselecteerdeDag ? "selected" : undefined}
                        onClick={() => onKiesDag(dag)}
                    >
                        {dag}
                    </span>
                ))}
            </div>
        </article>
    );
}
