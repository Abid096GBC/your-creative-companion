// ============= Full file contents =============
/**
 * Central pricing calculator for the nursing booking wizard.
 * Accepts the (already discount-applied) injection medicine unit price and
 * returns every line plus the grand total after visit charge, cannula kit,
 * Shushrusha Cash redemption and promo discount.
 */

export type PricingService = { id: string; title: string; en: string; price: number };

export type PricingLine = {
  id: string;
  title: string;
  en: string;
  /** Per-unit charge (service + medicine for injection lines). */
  unitPrice: number;
  /** Multiplicity — dose/push count for injection, 1 otherwise. */
  qty: number;
  total: number;
};

export type PricingInput = {
  services: PricingService[];
  /** Discounted per-push medicine price (0 when the patient brings their own). */
  medPrice?: number;
  /** Injection push / dose count (1 when no injection). */
  doseCount?: number;
  /** Cannula kit fee when the toggle is on. */
  cannulaFee?: number;
  /** Base visit / delivery charge — always added exactly once. */
  visitFee?: number;
  /** Applied promo discount (৳). */
  promoDiscount?: number;
  /** Shushrusha Cash available for redemption (৳). */
  walletCash?: number;
};

export type PricingResult = {
  lines: PricingLine[];
  /** Services + cannula, before visit charge. */
  serviceTotal: number;
  /** serviceTotal + visit charge. */
  gross: number;
  /** How much Shushrusha Cash is actually used. */
  walletDiscount: number;
  /** Grand total payable. */
  total: number;
};

export function calculatePricing(input: PricingInput): PricingResult {
  const doseCount = Math.max(1, Math.round(input.doseCount ?? 1));
  const medPrice = Math.max(0, input.medPrice ?? 0);
  const lines: PricingLine[] = input.services.map((s) => {
    const unitPrice = s.id === "injection" ? s.price + medPrice : s.price;
    const qty = s.id === "injection" ? doseCount : 1;
    return { id: s.id, title: s.title, en: s.en, unitPrice, qty, total: unitPrice * qty };
  });

  const serviceTotal =
    lines.reduce((n, l) => n + l.total, 0) + Math.max(0, input.cannulaFee ?? 0);
  // Visit / delivery charge is always added once, regardless of push count.
  const gross = serviceTotal + Math.max(0, input.visitFee ?? 0);
  const promo = Math.max(0, input.promoDiscount ?? 0);
  const walletDiscount = Math.min(
    Math.max(0, input.walletCash ?? 0),
    Math.max(0, gross - promo),
  );
  const total = Math.max(0, gross - walletDiscount - promo);
  return { lines, serviceTotal, gross, walletDiscount, total };
}
