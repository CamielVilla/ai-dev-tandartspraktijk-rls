/** Gedeeld tussen server en browser: de functies die een arts kan hebben (kolom `arts.type`). */
export const ARTS_TYPES = ["tandarts", "mondhygiënist"] as const;

export type ArtsType = (typeof ARTS_TYPES)[number];

export function isArtsType(waarde: string): waarde is ArtsType {
    return (ARTS_TYPES as readonly string[]).includes(waarde);
}
