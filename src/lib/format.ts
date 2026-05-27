export function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatUsdCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatVolume(value: number): string {
  if (value < 1000) return `$${value.toFixed(2)}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatAge(days: number): string {
  if (days < 30) return `${days}d`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months}mo`;
  }
  const years = Math.floor(days / 365);
  const remainingDays = days % 365;
  if (remainingDays === 0) return `${years}yr`;
  return `${years}yr ${remainingDays}d`;
}
