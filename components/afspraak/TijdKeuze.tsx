import type {ReactNode} from "react";

type TijdKeuzeProps = {
    status: "idle" | "loading" | "success" | "error";
    tijden: string[];
    geselecteerdeTijd: string | null;
    onKiesTijd: (tijd: string) => void;
    children?: ReactNode;
};

export default function TijdKeuze({status, tijden, geselecteerdeTijd, onKiesTijd, children}: TijdKeuzeProps) {
    return (
        <article className="card calendar" aria-busy={status === "loading"}>
            <h2>Kies een tijd</h2>
            {children}
            {renderInhoud()}
        </article>
    );

    function renderInhoud() {
        switch (status) {
            case "idle":
                return <p>Kies eerst een datum.</p>;
            case "loading":
                return <p>Tijdstippen worden geladen…</p>;
            case "error":
                return <p className="form-error">De tijden konden niet worden geladen. Probeer het opnieuw.</p>;
            case "success":
                if (tijden.length === 0) {
                    return <p>Er zijn op deze dag geen tijden beschikbaar.</p>;
                }
                return (
                    <div className="time-list">
                        {tijden.map((tijd) => (
                            <button
                                key={tijd}
                                type="button"
                                className={tijd === geselecteerdeTijd ? "selected" : undefined}
                                aria-pressed={tijd === geselecteerdeTijd}
                                onClick={() => onKiesTijd(tijd)}
                            >
                                {tijd}
                            </button>
                        ))}
                    </div>
                );
        }
    }
}
