import type { Fact, FilterKey, Periodicity } from "../types/dashboard";
export type Aggregate = { key: string; label: string; quantity: number; share: number };
export type TemporalMatrix = { periods: string[]; groups: Aggregate[]; cells: Array<{ group: string; period: string; quantity: number }> };
export type CumulativeComparison = { periods: string[]; groups: Aggregate[]; series: Array<{ key: string; label: string; values: number[] }> };
export function periodKey(year: number, month: number, periodicity: Periodicity): string {
  if (periodicity === 12) return String(year);
  const position = Math.floor((month - 1) / periodicity) + 1;
  if (periodicity === 6) return `${year} · S${position}`;
  if (periodicity === 3) return `${year} · T${position}`;
  if (periodicity === 2) return `${year} · B${position}`;
  return `${year}-${String(month).padStart(2, "0")}`;
}
export function periodFilterValues(period: string, periodicity: Periodicity): { year: string[]; month?: string[] } {
  const year = period.slice(0, 4);
  if (periodicity === 12) return { year: [year] };
  const position = periodicity === 1 ? Number(period.slice(5, 7)) : Number(period.match(/[BST](\d+)/)?.[1]);
  if (!position) return { year: [year] };
  const startMonth = periodicity === 1 ? position : ((position - 1) * periodicity) + 1;
  return { year: [year], month: Array.from({ length: periodicity }, (_, index) => String(startMonth + index)) };
}
export function aggregateBy(facts: Fact[], key: FilterKey, label?: (fact: Fact) => string): Aggregate[] {
  const totals = new Map<string, { label: string; quantity: number }>();
  for (const fact of facts) { const value = String(fact[key] ?? "Não identificado"); const current = totals.get(value) ?? { label: label?.(fact) ?? value, quantity: 0 }; current.quantity += fact.quantity; totals.set(value, current); }
  const total = [...totals.values()].reduce((sum, item) => sum + item.quantity, 0);
  return [...totals.entries()].map(([aggregateKey, item]) => ({ key: aggregateKey, ...item, share: total ? item.quantity / total : 0 })).sort((a, b) => b.quantity - a.quantity);
}
export function periodSeries(facts: Fact[], periodicity: Periodicity): Aggregate[] {
  const totals = new Map<string, number>();
  for (const fact of facts) { const key = periodKey(fact.year, fact.month, periodicity); totals.set(key, (totals.get(key) ?? 0) + fact.quantity); }
  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, quantity]) => ({ key, label: key, quantity, share: total ? quantity / total : 0 }));
}
export const sumShares = (items: Aggregate[]) => items.reduce((sum, item) => sum + item.share, 0);

export function temporalMatrix(facts: Fact[], key: FilterKey, label?: (fact: Fact) => string, limit = 18, periodicity: Periodicity = 1): TemporalMatrix {
  const periods = [...new Set(facts.map((fact) => periodKey(fact.year, fact.month, periodicity)))].sort();
  const groups = aggregateBy(facts, key, label).slice(0, limit);
  const accepted = new Set(groups.map((group) => group.key));
  const totals = new Map<string, number>();
  for (const fact of facts) {
    const group = String(fact[key] ?? "Não identificado");
    if (!accepted.has(group)) continue;
    const period = periodKey(fact.year, fact.month, periodicity);
    const compound = JSON.stringify([group, period]);
    totals.set(compound, (totals.get(compound) ?? 0) + fact.quantity);
  }
  const cells = [...totals.entries()].map(([compound, quantity]) => { const [group, period] = JSON.parse(compound) as [string, string]; return { group, period, quantity }; });
  return { periods, groups, cells };
}

export function cumulativeComparison(facts: Fact[], key: FilterKey, label?: (fact: Fact) => string, periodicity: Periodicity = 1, limit = 5): CumulativeComparison {
  const periods = periodSeries(facts, periodicity).map((period) => period.key);
  const groups = aggregateBy(facts, key, label).slice(0, limit);
  const accepted = new Set(groups.map((group) => group.key));
  const totals = new Map<string, number>();
  for (const fact of facts) {
    const group = String(fact[key] ?? "Não identificado");
    if (!accepted.has(group)) continue;
    const compound = JSON.stringify([group, periodKey(fact.year, fact.month, periodicity)]);
    totals.set(compound, (totals.get(compound) ?? 0) + fact.quantity);
  }
  const series = groups.map((group) => { let cumulative = 0; return { key: group.key, label: group.label, values: periods.map((period) => { cumulative += totals.get(JSON.stringify([group.key, period])) ?? 0; return cumulative; }) }; });
  return { periods, groups, series };
}
export const monthlySeries = (facts: Fact[]) => periodSeries(facts, 1);
