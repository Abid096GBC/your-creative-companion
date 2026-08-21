export type InjectionItem = {
  brand: string;
  company: string;
  generic: string;
  strength: string;
  price: number;
};

function build(
  generic: string,
  rows: [company: string, brand: string, variants: [string, number][]][],
): InjectionItem[] {
  return rows.flatMap(([company, brand, variants]) =>
    variants.map(([strength, price]) => ({ brand, company, generic, strength, price })),
  );
}

export const INJECTIONS: InjectionItem[] = [
  ...build("Ceftriaxone", [
    ["Square", "Ceftron", [["250mg", 90], ["500mg", 140], ["1g", 280], ["2g", 480]]],
    ["Incepta", "Rocipex", [["250mg", 85], ["500mg", 130], ["1g", 200], ["2g", 380]]],
    ["Beximco", "Tricef", [["500mg", 140], ["1g", 250]]],
    ["Renata", "Axentri", [["500mg", 135], ["1g", 240]]],
    ["Healthcare", "Cefaxon", [["500mg", 130], ["1g", 230]]],
    ["Aristopharma", "Axon", [["250mg", 80], ["500mg", 120], ["1g", 200], ["2g", 380]]],
    ["ACI", "Acipex", [["500mg", 125], ["1g", 220]]],
    ["Opsonin", "Trixone", [["500mg", 120], ["1g", 200], ["2g", 360]]],
    ["SK+F", "Trex", [["500mg", 130], ["1g", 230]]],
    ["Acme", "Acitrex", [["500mg", 120], ["1g", 210]]],
    ["Popular", "Popcef", [["500mg", 125], ["1g", 220]]],
    ["Drug International", "Intracef", [["500mg", 110], ["1g", 200]]],
    ["Beacon", "Beacef", [["500mg", 120], ["1g", 210]]],
    ["General", "Genef", [["500mg", 110], ["1g", 190]]],
    ["Radiant", "Radicef", [["1g", 300]]],
  ]),
  ...build("Meropenem", [
    ["Square", "Meropen", [["500mg", 700], ["1g", 1200]]],
    ["Incepta", "Meropect", [["500mg", 650], ["1g", 1100]]],
    ["Beximco", "Meronem", [["500mg", 700], ["1g", 1200]]],
    ["Renata", "Merobac", [["500mg", 680], ["1g", 1150]]],
    ["Healthcare", "Merocaf", [["500mg", 670], ["1g", 1150]]],
    ["Aristopharma", "Merogen", [["500mg", 600], ["1g", 1000]]],
    ["ACI", "Acipenem", [["500mg", 650], ["1g", 1100]]],
    ["Opsonin", "Opso-Meropenem", [["500mg", 640], ["1g", 1050]]],
    ["SK+F", "Penem", [["500mg", 700], ["1g", 1200]]],
    ["Acme", "Acmopenem", [["500mg", 630], ["1g", 1080]]],
    ["Popular", "Mero-Popular", [["500mg", 650], ["1g", 1100]]],
    ["Drug International", "Meron", [["500mg", 580], ["1g", 980]]],
    ["Beacon", "Beacon Meropenem", [["500mg", 650], ["1g", 1100]]],
    ["General", "Genopenem", [["500mg", 600], ["1g", 1000]]],
    ["Globe", "Glo-Meropenem", [["500mg", 580], ["1g", 950]]],
  ]),
  ...build("Pantoprazole", [["Incepta", "Pantonix IV", [["40mg", 100]]]]),
  ...build("Omeprazole", [["Square", "Seclo IV", [["40mg", 95]]]]),
  ...build("Ketorolac", [["Square", "Torax IV/IM", [["30mg", 60]]]]),
];

export function searchInjections(query: string, limit = 8): InjectionItem[] {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  const scored = INJECTIONS.map((i) => {
    const brand = i.brand.toLowerCase();
    const generic = i.generic.toLowerCase();
    const label = `${brand} ${i.strength.toLowerCase()} ${generic} ${i.company.toLowerCase()}`;
    let score = -1;
    if (brand.startsWith(q)) score = 0;
    else if (generic.startsWith(q)) score = 1;
    else if (label.includes(q)) score = 2;
    return { i, score };
  })
    .filter((x) => x.score >= 0)
    .sort((a, b) => a.score - b.score || a.i.price - b.i.price);
  return scored.slice(0, limit).map((x) => x.i);
}

export function injectionLabel(i: InjectionItem) {
  return `${i.brand} ${i.strength} (${i.generic}, ${i.company}) — ৳${i.price}`;
}
