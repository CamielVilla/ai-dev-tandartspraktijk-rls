-- =============================================================================
-- Opdracht 5: Row Level Security voor artsen
--
-- Een ingelogde arts moet zijn eigen beschikbaarheid en reserveringen kunnen
-- lezen, en die van collega's NIET. Bezoekers (anon) mogen geen van beide lezen;
-- zij gebruiken de functies beschikbare_tijden() en boek_afspraak().
--
-- Kijk voor de opbouw naar de policy "Arts leest eigen gegevens" in de
-- migratie auth_basis.
--
-- Let op: in beschikbaarheid en reserveringen staat geen user_id, maar een
-- arts_id. Hoe kom je van de ingelogde gebruiker naar zijn arts_id?
--
-- Testen:
--   1. Registreer twee artsen.
--   2. Koppel er één aan "Dr. S. Jansen" (zie de README) en maak als bezoeker
--      een afspraak bij hem.
--   3. De ene arts ziet de afspraak op /mijn-afspraken, de andere niet.
--   4. Probeer het ook rechtstreeks in de SQL Editor, met "Role: authenticated"
--      en een gekozen gebruiker (rechtsboven in de editor).
--
-- Reflectie: waarom is het niet genoeg om in de code alleen te filteren op
-- .eq("arts_id", artsId)?
-- =============================================================================

-- TODO: policy waarmee een arts zijn eigen beschikbaarheid kan lezen.


-- TODO: policy waarmee een arts zijn eigen reserveringen kan lezen.

