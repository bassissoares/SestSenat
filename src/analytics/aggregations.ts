import type { Fact, FilterKey } from "../types/dashboard";
export type Aggregate = { key: string; label: string; quantity: number; share: number };
export type TemporalMatrix = { periods: string[]; groups: Aggregate[]; cells: Array<{ group: string; period: string; quantity: number }> };
export function aggregateBy(facts: Fact[], key: FilterKey, label?: (fact: Fact) => string): Aggregate[] {
  const totals = new Map<string, { label: string; quantity: number }>();
  for (const fact of facts) { const value = String(fact[key] ?? "Não identificado"); const current = totals.get(value) ?? { label: label?.(fact) ?? value, quantity: 0 }; current.quantity += fact.quantity; totals.set(value, current); }
  const total = [...totals.values()].reduce((sum, item) => sum + item.quantity, 0);
  return [...totals.entries()].map(([aggregateKey, item]) => ({ key: aggregateKey, ...item, share: total ? item.quantity / total : 0 })).sort((a, b) => b.quantity - a.quantity);
}
export function monthlySeries(facts: Fact[]): Aggregate[] {
  const totals = new Map<string, number>();
  for (const fact of facts) { const key = `${fact.year}-${String(fact.month).padStart(2, "0")}`; totals.set(key, (totals.get(key) ?? 0) + fact.quantity); }
  const total = [...totals.values()].reduce((sum, value) => sum + value, 0);
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, quantity]) => ({ key, label: key, quantity, share: total ? quantity / total : 0 }));
}
export const sumShares = (items: Aggregate[]) => items.reduce((sum, item) => sum + item.share, 0);

export function temporalMatrix(facts: Fact[], key: FilterKey, label?: (fact: Fact) => string, limit = 18): TemporalMatrix {
  const periods = [...new Set(facts.map((fact) => `${fact.year}-${String(fact.month).padStart(2, "0")}`))].sort();
  const groups = aggregateBy(facts, key, label).slice(0, limit);
  const accepted = new Set(groups.map((group) => group.key));
  const totals = new Map<string, number>();
  for (const fact of facts) {
    const group = String(fact[key] ?? "Não identificado");
    if (!accepted.has(group)) continue;
    const period = `${fact.year}-${String(fact.month).padStart(2, "0")}`;
    const compound = JSON.stringify([group, period]);
    totals.set(compound, (totals.get(compound) ?? 0) + fact.quantity);
  }
  const cells = [...totals.entries()].map(([compound, quantity]) => { const [group, period] = JSON.parse(compound) as [string, string]; return { group, period, quantity }; });
  return { periods, groups, cells };
}
