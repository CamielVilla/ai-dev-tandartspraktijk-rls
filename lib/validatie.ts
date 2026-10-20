/** Validatieregels die op meerdere plekken (Server Actions) gebruikt worden. */

export const EMAIL_MAX_LENGTE = 254;
const EMAIL_PATROON = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isGeldigEmail(email: string): boolean {
    return email.length <= EMAIL_MAX_LENGTE && EMAIL_PATROON.test(email);
}

/** Leest een tekstveld uit FormData; geeft "" als het veld ontbreekt of geen tekst is. */
export function leesTekst(formData: FormData, veld: string): string {
    const waarde = formData.get(veld);
    return typeof waarde === "string" ? waarde : "";
}
