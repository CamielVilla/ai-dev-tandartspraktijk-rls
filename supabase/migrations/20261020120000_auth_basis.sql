-- =============================================================================
-- Inloggen voor artsen: de basis
--
-- Deze migratie krijg je kant-en-klaar. Ze regelt:
--   1. de koppeling tussen een arts en een account in Supabase Auth (user_id);
--   2. een trigger die bij elke registratie automatisch een arts aanmaakt;
--   3. de openbare kant van de site: bezoekers mogen behandelingen lezen en
--      via twee functies vrije tijden opvragen en boeken;
--   4. één voorbeeld-policy: een arts mag zijn eigen gegevens lezen.
--
-- De policies voor beschikbaarheid en reserveringen schrijf je zelf, in de
-- migratie rls_opdracht (opdracht 5).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Arts koppelen aan een gebruiker uit Supabase Auth
-- -----------------------------------------------------------------------------

-- Nullable: de artsen uit de seed hebben (nog) geen account.
alter table public.arts
    add column user_id uuid unique references auth.users (id) on delete cascade;

alter table public.arts
    add constraint arts_type_check check (type in ('tandarts', 'mondhygiënist'));

-- Maakt bij elke registratie automatisch de bijbehorende arts aan, met de
-- naam en functie die de app als metadata meestuurt bij signUp().
-- SECURITY DEFINER: de trigger draait als eigenaar van de functie, want de
-- nieuwe gebruiker zelf mag (via RLS) niets in `arts` schrijven.
create or replace function public.maak_arts_voor_nieuwe_gebruiker()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.arts (user_id, naam, type)
    values (
        new.id,
        coalesce(nullif(trim(new.raw_user_meta_data ->> 'naam'), ''), new.email),
        coalesce(new.raw_user_meta_data ->> 'type', 'tandarts')
    );
    return new;
end;
$$;

create trigger maak_arts_na_registratie
    after insert on auth.users
    for each row execute function public.maak_arts_voor_nieuwe_gebruiker();

-- -----------------------------------------------------------------------------
-- 2. Policies
--
-- RLS staat al aan op alle tabellen (zie de eerste migratie). Zonder policy
-- mag niemand iets; elke policy hieronder zet precies één ding open.
-- -----------------------------------------------------------------------------

-- Behandelingen zijn openbaar: iedereen mag ze lezen.
create policy "Iedereen kan behandelingen lezen"
    on public.behandelingen for select
    to anon, authenticated
    using (true);

-- Voorbeeld voor opdracht 5. Een ingelogde arts ziet alleen zijn eigen rij:
--   to authenticated     alleen voor ingelogde gebruikers
--   for select           alleen lezen
--   using (...)          deze voorwaarde moet waar zijn voor elke rij die je ziet
-- auth.uid() is het id van de ingelogde gebruiker. `(select auth.uid())` in
-- plaats van `auth.uid()`: dan rekent Postgres de waarde één keer per query uit
-- in plaats van per rij (aanbeveling van Supabase).
create policy "Arts leest eigen gegevens"
    on public.arts for select
    to authenticated
    using (user_id = (select auth.uid()));

create index arts_user_id_idx on public.arts (user_id);

-- -----------------------------------------------------------------------------
-- 3. Functies voor bezoekers
--
-- Bezoekers mogen de tabellen beschikbaarheid en reserveringen niet lezen
-- (daar staan namen en e-mailadressen in). De functies draaien daarom als
-- SECURITY DEFINER: ze lezen alles wat nodig is, maar geven alleen vrije
-- tijden terug of maken precies één, volledig gecontroleerde reservering.
-- `set search_path = ''` (al in de vorige migratie) voorkomt dat iemand via
-- een eigen schema een functie of tabel kan onderschuiven.
-- -----------------------------------------------------------------------------

alter function public.beschikbare_tijden(text, date, integer) security definer;
alter function public.boek_afspraak(text, date, time, text, text) security definer;

grant execute on function public.beschikbare_tijden(text, date, integer) to anon, authenticated;
grant execute on function public.boek_afspraak(text, date, time, text, text) to anon, authenticated;

-- De trigger-functie hoeft door niemand rechtstreeks aangeroepen te worden.
revoke execute on function public.maak_arts_voor_nieuwe_gebruiker() from public, anon, authenticated;
