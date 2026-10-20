import Header from "@/components/Header";
import Link from "next/link";

export default function Afspraak() {
    return (
        <main className="page-container">
            <Header icon="/logo.svg" title="Afspraken"/>

            <section className="intro">
                <h2>Een afspraak maken</h2>
                <p>
                    Wilt u een controle plannen, heeft u een klacht of wilt u meer
                    informatie over een behandeling? Neem dan contact met ons op. Bij ernstige pijn, een afgebroken tand
                    of een ongeval kunt u het beste direct telefonisch contact met ons opnemen.
                </p>
            </section>

            <section className="card-container">
                <article className="card">
                    <h3>Telefonisch</h3>
                    <p>U kunt ons tijdens openingstijden telefonisch bereiken.</p>
                    <strong>030 - 123 45 67</strong>
                </article>

                <article className="card">
                    <h3>Openingstijden</h3>
                    <p>Maandag t/m vrijdag</p>
                    <p>08:00 - 17:00 uur</p>
                </article>

                <article className="card">
                    <h3>Online afspraken</h3>
                    <p>Wilt u een controle plannen of heeft u een klacht? U kunt eenvoudig een afspraak maken.</p>
                    <Link href="/afspraken/maken" className="link-button"> Maak een afspraak </Link>
                </article>
            </section>
        </main>
    );
}

