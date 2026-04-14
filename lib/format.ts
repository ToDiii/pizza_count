/**
 * Formats a pizza amount as a human-readable string.
 * 0.5 → "½", 1.0 → "1", 1.5 → "1½", 2.0 → "2"
 */
export function formatPizzaCount(amount: number): string {
  const whole = Math.floor(amount);
  const isHalf = amount - whole >= 0.25; // treat anything ≥ 0.25 remainder as half
  if (!isHalf) return String(whole);
  if (whole === 0) return "½";
  return `${whole}½`;
}

export function starsDisplay(rating: number | null | undefined): string {
  if (!rating) return "";
  return "⭐".repeat(rating);
}
