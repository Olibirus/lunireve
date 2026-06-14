/**
 * Summer launch promo: 50% off the FIRST subscription payment (monthly or
 * annual), applied automatically, no code. Exceptional offer that does NOT
 * renew (August onward for monthly, next year for annual revert to standard
 * price). Mirrors a future promo_codes row; kept as a constant until Stripe +
 * promo codes land (V2). When wiring real checkout, apply `percent` to the
 * first invoice only.
 */
export const SUMMER_PROMO = {
  percent: 50,
  /** Inclusive last day the promo is honored. */
  endDate: "2026-07-30",
};

export function isPromoActive(now: Date = new Date()): boolean {
  return now.getTime() <= new Date(`${SUMMER_PROMO.endDate}T23:59:59`).getTime();
}

/** Apply the promo to a price, rounded to 2 decimals. */
export function promoPrice(price: number): number {
  return Math.round(price * (1 - SUMMER_PROMO.percent / 100) * 100) / 100;
}

/** Localized end-date label, e.g. "30 juillet 2026" / "30 July 2026". */
export function promoEndLabel(locale: string): string {
  return new Date(`${SUMMER_PROMO.endDate}T12:00:00`).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "long", year: "numeric" }
  );
}
