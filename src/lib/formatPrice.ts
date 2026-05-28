export function fmtPrice(n: number | null | undefined): string {
  if (n == null || n === 0 || !Number.isFinite(n)) return "—";
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  const exp = Math.floor(Math.log10(n));
  const decimals = Math.max(6, -exp + 3);
  return `$${n.toFixed(decimals)}`;
}
