# Opdrachtbeschrijving

## Antwoorden op opdracht 7
De gemaakte afspraken zijn verdwenen als de development-server wordt herstart, omdat de data tijdelijk draait en nergens opgeslagen wordt.

Je zou niet willen dat data zoals getAfspraken() client-side staat, omdat dit een beveiligingsrisico vormt. 
Je wil niet dat iemand via de browser de afspraken/gegevens van anderen kan zien.
Ook wil je niet het risico lopen dat iemand ongewenste wijzigingen aan zou brengen.

Er zou een database moeten zijn waarin nieuwe afspraken worden opgeslagen en eerdere afspraken opgehaald kunnen worden.

## Les: inloggen, registreren, uitloggen en RLS

In deze les krijgen artsen een eigen account. Een arts registreert zich, logt in, ziet op `/mijn-afspraken` alleen zijn eigen afspraken en kan weer uitloggen. De database zorgt ervoor dat een arts nooit bij de afspraken van een collega kan, ook niet als er een fout in de app zit.

De formulieren, de pagina's en de Supabase-clients staan al klaar. Jij schrijft de aanroepen naar Supabase Auth en de RLS-policies. Zoek in de code naar `TODO opdracht` om te zien waar je moet beginnen.

### Voorbereiding
1. Maak een project aan op [supabase.com](https://supabase.com).
2. Voer in de **SQL Editor** uit, in deze volgorde:
   1. `supabase/migrations/20261014120000_afspraken_schema.sql`
   2. `supabase/migrations/20261020120000_auth_basis.sql`
   3. `supabase/seed.sql`

   De migratie `20261020130000_rls_opdracht.sql` bewaar je voor opdracht 5.
3. Zet onder **Authentication > URL Configuration** de *Site URL* op `http://localhost:3000` en voeg `http://localhost:3000/**` toe aan de *Redirect URLs*.
4. Zet onder **Authentication > Sign In / Providers > Email** de optie *Confirm email* uit. Dan ben je na registreren direct ingelogd en hoef je tijdens het ontwikkelen niet op mails te wachten.
5. Kopieer `.env.example` naar `.env.local` en vul de project-URL en de **publishable key** in (Project Settings > API Keys).
6. `npm install` en `npm run dev`. Het maken van een afspraak via `/afspraken` werkt nu al. `/inloggen` en `/registreren` geven nog een melding dat ze niet gebouwd zijn.

Lees de [Supabase-documentatie over Auth met Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) en de [documentatie over Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) voordat je begint.

> Wat is het verschil tussen *authenticatie* en *autorisatie*? Welke van de twee regelt Supabase Auth, en welke regelt RLS?

### Opdracht 1: Registreren
`app/registreren/actions.ts`

Maak een account aan via Supabase Auth. Stuur de naam en functie van de arts mee; de database maakt daarmee automatisch een rij in `arts` aan (zie de trigger in de migratie `auth_basis`).

Klaar als: na registreren staat de nieuwe gebruiker onder **Authentication > Users** en staat er een bijbehorende rij in de tabel `arts`.

> Waarom geeft Supabase geen foutmelding als je registreert met een e-mailadres dat al bestaat en *Confirm email* aan staat?

### Opdracht 2: Inloggen
`app/inloggen/actions.ts`

Log de arts in met e-mailadres en wachtwoord en handel de fouten netjes af.

Klaar als: met een fout wachtwoord zie je "E-mailadres of wachtwoord klopt niet." In de developer tools van je browser zie je na inloggen cookies die beginnen met `sb-`.

### Opdracht 3: Wie is er ingelogd?
`lib/auth.ts`

Zoek uit welke gebruiker er bij de huidige request hoort, en welke arts daarbij hoort.

Klaar als: je na inloggen op `/mijn-afspraken` terechtkomt met "Welkom, <jouw naam>", en `/inloggen` je doorstuurt zolang je bent ingelogd.

> Waarom mag je op de server niet vertrouwen op `getSession()`?

### Opdracht 4: Uitloggen
`app/inloggen/actions.ts`

Klaar als: na uitloggen `/mijn-afspraken` je weer naar `/inloggen` stuurt.

### Opdracht 5: Row Level Security
`supabase/migrations/20261020130000_rls_opdracht.sql`

Koppel je account aan een arts uit de seed (zie hieronder) en maak als bezoeker een afspraak bij hem. Je zult zien dat `/mijn-afspraken` toch leeg blijft. Schrijf de policies die ervoor zorgen dat een arts zijn eigen beschikbaarheid en reserveringen kan lezen, en die van collega's niet.

| Wie | Mag |
|---|---|
| Bezoeker (niet ingelogd) | Behandelingen lezen, vrije tijden opvragen en boeken (alleen via de functies `beschikbare_tijden()` en `boek_afspraak()`) |
| Ingelogde arts | Eigen gegevens, eigen beschikbaarheid en eigen reserveringen lezen |
| Niemand | Rechtstreeks schrijven in de tabellen |

Klaar als: twee ingelogde artsen elk alleen hun eigen afspraken zien.

> De pagina filtert in de code al op `arts_id`. Waarom heb je RLS dan toch nodig? Wat kan iemand met de publishable key uit je JavaScript-bundle?

### Een account koppelen aan een arts uit de seed
Bij registratie maakt de database een nieuwe, lege arts aan. Wil je inloggen als een arts uit de seed (met beschikbaarheid)? Registreer dan eerst en voer daarna in de SQL Editor uit:

```sql
begin;
delete from public.arts
where user_id = (select id from auth.users where email = 'jouw@email.nl');

update public.arts
set user_id = (select id from auth.users where email = 'jouw@email.nl')
where naam = 'Dr. S. Jansen';
commit;
```

### Datamodel
Het schema volgt het ERD: `arts`, `behandelingen`, `beschikbaarheid` en `reserveringen`. Afwijkingen:
- `clienten` ontbreekt nog. Patiënten hoeven niet in te loggen, dus `naam` en `email` staan direct in `reserveringen`.
- `behandelingen` heeft een extra kolom `slug` voor de url (`/afspraken/maken/bleken`).
- `arts` heeft een extra kolom `user_id`: de koppeling met het account in Supabase Auth.

### Structuur
| Bestand | Verantwoordelijkheid |
|---|---|
| `supabase/migrations/*.sql` | Tabellen, functies, de registratie-trigger en de policies |
| `supabase/seed.sql` | Testdata: twee artsen, drie behandelingen, beschikbaarheid in september 2026 |
| `proxy.ts` + `lib/supabase/proxy.ts` | Ververst de sessie-cookies voordat een pagina rendert |
| `lib/supabase/server.ts` | Client mét de sessie van de bezoeker (voor inloggen en data van de arts) |
| `lib/supabase/public.ts` | Client zonder sessie (voor openbare data, ook tijdens `next build`) |
| `lib/auth.ts` | Wie is er ingelogd? `vereisIngelogdeArts()` voor beveiligde pagina's |
| `app/inloggen`, `app/registreren` | Formulieren en Server Actions voor inloggen, uitloggen en registreren |
| `app/auth/callback/route.ts` | Verwerkt de link uit de bevestigingsmail |
| `app/mijn-afspraken/page.tsx` | Overzicht van de afspraken van de ingelogde arts |
| `lib/behandelingen.ts`, `lib/afspraken.ts` | Data ophalen en afspraken boeken |

## Inleiding
In deze opdracht ga je een bestaande Next.js-applicatie met Typescript verder uitbouwen voor Tandartspraktijk de
Tandenborstel. Die herken je misschien nog wel! Je gaat onder andere werken met routing, nested routes, dynamic routes en Client Components.

De basis van het project is al voor je klaargezet. De styling en het logo zijn al aanwezig. Het is aan jou om de structuur en functionaliteit van de applicatie met Next.js op te bouwen.

> **Belangrijk:** probeer tijdens deze opdracht zo min mogelijk direct naar ChatGPT te grijpen. Zoek eerst zelf naar antwoorden in de officiële Next.js-documentatie. Je leert hierdoor niet alleen wat je moet doen, maar ook hoe je documentatie kunt lezen en interpreteren.

![screenshot-dentist-home.png](docs/screenshots/screenshot-dentist-home.png)

## Applicatie starten

Als je het project gecloned hebt naar jouw locale machine, installeer je eerst de node_modules door het volgende
commando in de terminal te runnen

```bash
npm install
```

Wanneer dit klaar is, kun je de applicatie starten met behulp van:

```bash
npm run dev
```

... of gebruik de WebStorm knop (npm run dev). Open http://localhost:3000 om de pagina in de browser te bekijken. Begin
met het maken van wijzigingen in `src/page.tsx`.

## Opdrachtbeschrijving

Begin met het lezen van de officiële [Next.js-documentatie](https://nextjs.org/docs). Je hoeft nog niet alles te begrijpen. Probeer vooral een globaal beeld te krijgen van:

* hoe een Next.js-project is opgebouwd;
* wat de `app`-map doet;
* hoe pagina's worden gemaakt;
* hoe routing werkt;
* wat Server Components en Client Components zijn.

> "Wat is volgens jou het belangrijkste verschil tussen een traditioneel React-project en een Next.js-project?"

### 1. Pas de metadata aan
Zorg ervoor dat de naam van de tandartspraktijk in het browsertabblad wordt weergegeven. En nu we daar toch zijn: in de `public`-map zit een SVG-bestand met het logo van de tandartspraktijk. Vervang het standaard Next.js-logo met het bedrijfslogo.

### 2. Navigatie

De website moet op iedere pagina dezelfde navigatie bevatten. Maak hiervoor een herbruikbaar Navigation-component en onderzoek in de documentatie wat de juiste manier is om zo'n component te gebruiken op de pagina. De navigatie moet minimaal de volgende links bevatten:
* `/`
* `gaatjes`
* `bleken`
* `afspraken`

Gebruik voor de links de Next.js-manier van navigeren.

![screenshot-dentist-nav.png](docs/screenshots/screenshot-dentist-nav.png)

Voor de styling is het belangrijk dat je deze structuur aanhoudt:

```html
<nav>
    <div className="navigation-container">
				...
		</div>
</nav>
```
Daarbinnen kun je de volgende CSS-classes op de elementen gebruiken:

* `.navigation-company-name`
* `.navigation-links`
* `.navigation-button` (Let op: de button linkt naar een andere pagina, dus dat is geen echt `<button>`-element)

### 3. Routing

Maak voor iedere route een pagina en zet de routingstructuur op. De inhoud van deze pagina's mag in eerste instantie heel eenvoudig zijn. Geef iedere pagina bijvoorbeeld een eigen `<h1>` met de naam van de pagina. Controleer vervolgens of je via de navigatie daadwerkelijk op iedere pagina kunt komen.

Echter, niet iedere URL die een gebruiker intypt zal bestaan. Maak daarom ook een 404-pagina die wordt weergegeven wanneer een gebruiker naar een route gaat die niet bestaat. Test dit door een random URL te bezoeken, zoals `/fietsen`.

### 5. Content

Nu de routing werkt, kunnen de pagina's worden gevuld met de HTML/JSX die voor deze opdracht is aangeleverd. Gebruik hiervoor de voorbeelden hieronder. Let bij het overnemen van de voorbeelden op dat je HTML omzet naar geldige JSX wanneer dat nodig is. Zorg er daarnaast voor dat links naar andere pagina's gebruikmaken van de Next.js-manier van navigeren.


```html
<!-- Bleken pagina -->
<main className="page-container">
    <Header icon="/logo.svg" title="Bleken" />

    <section className="intro">
        <h2>Een stralend witte glimlach</h2>
        <p>
            Wilt u uw tanden een paar tinten lichter maken? Met professioneel
            tanden bleken kunt u op een veilige manier een stralendere glimlach
            krijgen. Op deze pagina leest u hoe het proces in zijn werk gaat.
        </p>
    </section>

    <section className="card-container">
        <article className="card">
            <h3>1. Intake</h3>
            <p>
                Tijdens een eerste afspraak bekijken we uw gebit en bespreken we
                uw wensen. We bepalen samen of tanden bleken geschikt voor u is.
            </p>
        </article>

        <article className="card">
            <h3>2. Behandeling</h3>
            <p>
                Onze tandarts geeft uitleg over de behandeling en zorgt ervoor
                dat het bleken op een professionele en verantwoorde manier
                gebeurt.
            </p>
        </article>

        <article className="card">
            <h3>3. Resultaat</h3>
            <p>
                Na de behandeling zijn uw tanden zichtbaar lichter. Hoeveel het
                resultaat verschilt, hangt onder andere af van de oorspronkelijke
                kleur van uw tanden.
            </p>
        </article>
    </section>

    <section className="box warning-box">
        <h3>Goed om te weten</h3>
        <p>
            Niet iedereen kan zijn tanden laten bleken. Laat uw gebit daarom
            altijd eerst controleren door één van onze tandartsen.
        </p>
    </section>
</main>
```

```html
<!-- Gaatjes pagina-->
<main className="page-container">
    <Header icon="/logo.svg" title="Gaatjes" />

    <section className="intro">
        <h2>Heeft u last van een gaatje?</h2>
        <p>
            Een gaatje ontstaat wanneer bacteriën in tandplak zuren produceren
            die het tandglazuur aantasten. Gelukkig kan een gaatje meestal goed
            worden behandeld wanneer het op tijd wordt ontdekt.
        </p>

        <a href="#" className="link-button">Maak direct uw afspraak</a>
    </section>

    <section className="card-container">
        <article className="card">
            <h3>Hoe herken ik een gaatje?</h3>
            <p>
                Een gaatje kan gevoeligheid veroorzaken bij het eten of drinken
                van iets kouds, warms of zoets. Soms is er helemaal geen pijn en
                wordt een gaatje tijdens een controle ontdekt.
            </p>
            <p>
                Daarom is het belangrijk om regelmatig naar de tandarts te gaan,
                ook wanneer u geen klachten heeft.
            </p>
        </article>

        <article className="card">
            <h3>Hoe wordt het behandeld?</h3>
            <p>
                De tandarts verwijdert het aangetaste gedeelte van de tand en
                vult de ontstane ruimte met een vulling. De behandeling voorkomt
                dat het gaatje verder groter wordt.
            </p>
            <p>
                Hoe eerder een gaatje wordt ontdekt, hoe eenvoudiger de
                behandeling meestal is.
            </p>
        </article>
    </section>

    <section className="card">
        <h3>Voorkomen is beter dan genezen</h3>
        <p>
            Poets minimaal twee keer per dag met fluoridehoudende tandpasta en
            maak dagelijks de ruimtes tussen uw tanden schoon.
        </p>
    </section>
</main>
```

```html
<!--Afspraken pagina-->
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
            <a href="#" className="link-button"> Maak een afspraak </a>
        </article>
    </section>
</main>
```

### 4. Nested route

Een gebruiker moet vanuit de afsprakenpagina kunnen doorklikken naar de plek waarop de afspraak daadwerkelijk kan worden gepland. De URL daarvoor moet worden:

`/afspraken/maken`

Dit is een **nested route**. Nested routes zie je vooral wanneer een pagina onderdeel is van een grotere structuur, zoals webshops met productcategorieën. Pas je mappenstructuur zo aan dat deze URL automatisch door Next.js wordt herkend. Geef de nieuwe pagina eerst een eenvoudige titel om te controleren of de routing werkt. 

Daarna kun je deze vullen met de volgende HTML:

```html
<main className="page-container">
    <Header icon="/logo.svg" title="Afspraak maken" />

    <section className="intro">
        <h2>Plan uw afspraak</h2>
        <p>
            Fijn dat u een afspraak wilt maken bij Tandartspraktijk de
            Tandenborstel. Kies hieronder waarvoor u een afspraak wilt maken.
        </p>
    </section>

    <section className="card-container">
        <article className="card">
            <h3>Periodieke controle</h3>
            <p>
                Tijdens een controle bekijkt de tandarts uw tanden en
                tandvlees. We controleren of er gaatjes of andere problemen
                zijn.
            </p>
            <a href="#" className="link-button">
            Plan periodieke controle
            </a>
        </article>

        <article className="card">
            <h3>Tanden bleken</h3>
            <p>
                Wilt u meer informatie of een afspraak maken voor het bleken
                van uw tanden?
            </p>
            <a href="#" className="link-button">
            Maak bleekafspraak
            </a>
        </article>
    </section>

    <section className="card-container">
        <article className="card">
            <h3>Pijn of klacht</h3>
            <p>
                Staat uw behandeling er niet tussen? Heeft u pijn of andere klachten die beoordeeld moeten worden? Neem dan contact met ons op. We helpen u graag verder.
            </p>
            <a href="#" className="link-button">
            Neem contact op
            </a>
        </article>
    </section>

    <section className="box info-box">
        <h3>Wat gebeurt er daarna?</h3>
        <p>
            Nadat u uw behandeling heeft gekozen, kunt u een geschikt moment
            selecteren. In deze oefening is het vervolg nog niet uitgewerkt.
        </p>
    </section>
</main>
```

### 6. Dynamic route
De tandartspraktijk biedt verschillende behandelingen aan waarvoor een afspraak gemaakt kan worden. Op dit moment zijn er bijvoorbeeld:
* een periodieke controle;
* tanden bleken;
* een klacht, zoals pijn of een uitgevallen kies.

In de toekomst kunnen daar nieuwe behandelingen bij komen. In plaats van voor iedere behandeling een aparte pagina te maken, gaan we daarom gebruikmaken van een dynamic route, waarbij de pagina zich aanpast op basis van de url.

![screenshot-to-appointment-widget.png](docs/screenshots/screenshot-to-appointment-widget.png)

De URL's moeten bijvoorbeeld worden:
* `/afspraken/maken/controle`
* `/afspraken/maken/bleken`
* `/afspraken/maken/klacht`

Maak hiervoor een dynamic route met bijbehorende pagina. Wanneer een gebruiker bijvoorbeeld naar: `/afspraken/maken/bleken` gaat, moet op de pagina de naam van de behandeling worden weergegeven (_"Tanden bleken"_). Gebruik onderstaande array om op de pagina te bepalen welke behandelingen bij welke url hoort:

```js
const treatments = [
{ url: "controle", name: "Periodieke controle" },
{ url: "bleken", name: "Tanden bleken" },
{ url: "klacht", name: "Pijn of klacht" },
];
```

Wat gebeurt er nu als iemand `/afspraken/maken/fietsen` intypt? Dat is natuurlijk niet de bedoeling! Zorg ervoor dat een gebruiker in dat geval wordt doorgestuurd naar de 404-pagina.

> Wat is het verschil tussen een URL waarvoor helemaal geen route bestaat en een URL die wel bij een dynamic route past, maar waarvan de slug geen geldige behandeling is?

### 7. Afspraak maken
De pagina voor een specifieke behandeling bevat een eenvoudige kalender en een lijst met beschikbare tijden. Op dit moment zijn deze elementen nog statisch: de gebruiker kan niets selecteren. Gebruik de volgende HTML en controleer of de naam van de behandeling op de juiste plaats wordt weergegeven.

```html
<main className="page-container">
    <h1>Afspraak maken</h1>
    <section className="intro">
        <h2>Behandeling: ...</h2>
        <p> U wilt een afspraak maken voor de behandeling <strong> ... </strong>.</p>
    </section>
    <section className="card-container">
        <article className="card">
            <h2>Kies een datum</h2>
            <div className="calendar-grid">
                <span>Ma</span>
                <span>Di</span>
                <span>Wo</span>
                <span>Do</span>
                <span>Vr</span>
								
								{Array.from({length: 29}, (item, index) => ( <span key={index}>{index + 1}</span> ))}
            </div>
        </article>
        <article className="card calendar">
						<h2>Kies een tijd</h2>
            <div className="time-list">
                <button>09:00</button>
                <button>09:30</button>
                <button>10:30</button>
                <button>11:00</button>
                <button>11:30</button>
                <button>13:30</button>
                <button>14:30</button>
                <button>15:00</button>
                <button>15:30</button>
            </div>
        </article>
    </section>
</main>
```

Het hardcoded declareren van de tijden in de HTML is natuurlijk een beetje suf. Gebruik deze array om dit efficiënter weer te geven in de HTML:

```js
const times = [ "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
```

> Waarom is het in dit geval handiger om de times-array _buiten_ de functie te declareren in plaats van binnen de functie?

Zet de HTML voor de kalender en de tijd-selectie nu in een **apart component**. Geef de `times`-array vanaf deze pagina door als property aan dit component.

> Om de kalender interactief te maken hebben we state nodig. Wat moet je in Next.js doen om gebruik te kunnen maken van state?

In ons component willen we met behulp van state bijhouden welke datum de gebruiker heeft geselecteerd. Houd op dezelfde manier bij welke tijd de gebruiker heeft geselecteerd wanneer de gebruiker op een waarde klikt. Om dit visueel te maken kun je de class `selected` op een actief span-element zetten.

Wanneer zowel een datum als een tijd zijn gekozen, toon je de gemaakte keuze boven de tijden. Voor nu gaan we er even vanuit dat alle voorgestelde datums in september zijn. Bijvoorbeeld: "U heeft gekozen voor 12 september om 10:30."

![screenshot-appointment-widget.png](docs/screenshots/screenshot-appointment-widget.png)
