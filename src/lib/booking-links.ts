/** Maps every legacy service id used across the site to the unified /booking/nursing wizard. */
export const NURSING_SERVICE_IDS = [
  "dressing",
  "injection",
  "suturing",
  "nebulizer",
  "saline",
  "vitals",
  "postop",
  "elderly",
  "physio",
] as const;

export type NursingServiceId = (typeof NURSING_SERVICE_IDS)[number];

const ALIASES: Record<string, NursingServiceId> = {
  injection: "injection",
  cannula: "injection",
  dressing: "dressing",
  suturing: "suturing",
  stitch: "suturing",
  nebulizer: "nebulizer",
  saline: "saline",
  vitals: "vitals",
  "post-surgery": "postop",
  postop: "postop",
  caregiving: "elderly",
  elderly: "elderly",
  physio: "physio",
  physiotherapy: "physio",
};

/** Normalises any legacy id; unknown ids fall back to the featured nursing service. */
export function toNursingService(id: string | undefined): NursingServiceId {
  return (id && ALIASES[id]) || "injection";
}
