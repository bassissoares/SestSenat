import type { Fact, FilterKey } from "../types/dashboard";

export type RankingRow = { key: string; label: string; quantity: number; share: number; evolution: number | null };

export function buildRanking(facts: Fact[], key: FilterKey, label?: (fact: Fact) => string): RankingRow[] {
  const years = [...new Set(facts.map((fact) => fact.year))].sort();
  const firstYear = years[0]; const lastYear = years.at(-1);
  const groups = new Map<string, { label: string; quantity: number; first: number; last: number }>();
  for (const fact of facts) {
    const value = String(fact[key] ?? "Não identificado");
    const group = groups.get(value) ?? { label: label?.(fact) ?? value, quantity: 0, first: 0, last: 0 };
    group.quantity += fact.quantity;
    if (fact.year === firstYear) group.first += fact.quantity;
    if (fact.year === lastYear) group.last += fact.quantity;
    groups.set(value, group);
  }
  const total = facts.reduce((sum, fact) => sum + fact.quantity, 0);
  return [...groups.entries()].map(([rankingKey, group]) => ({ key: rankingKey, label: group.label, quantity: group.quantity, share: total ? group.quantity / total : 0, evolution: years.length > 1 && group.first ? (group.last - group.first) / group.first : null })).sort((a, b) => b.quantity - a.quantity);
}

export function rankingCsv(rows: RankingRow[]): string {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return ["posição,nome,quantidade,participação,evolução", ...rows.map((row, index) => [index + 1, row.label, row.quantity, row.share, row.evolution ?? ""].map(escape).join(","))].join("\r\n");
}
