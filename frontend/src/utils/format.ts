const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

export function formatCurrency(value: string | number): string {
  return currencyFormatter.format(Number(value));
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: string | number): string {
  const num = Number(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(1)}%`;
}
