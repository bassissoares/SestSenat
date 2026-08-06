import { periodKey } from "./aggregations";
import type { Fact, FilterKey, Periodicity } from "../types/dashboard";

export type RankingRow = { key: string; label: string; quantity: number; share: number; evolution: number | null; relatedUnits: string[] };

export function buildRanking(facts: Fact[], key: FilterKey, label?: (fact: Fact) => string, periodicity: Periodicity = 12): RankingRow[] {
  const periods = [...new Set(facts.map((fact) => periodKey(fact.year, fact.month, periodicity)))].sort();
  const firstPeriod = periods[0]; const lastPeriod = periods.at(-1);
  const groups = new Map<string, { label: string; quantity: number; first: number; last: number; relatedUnits: Set<string> }>();
  for (const fact of facts) {
    const value = String(fact[key] ?? "Não identificado");
    const group = groups.get(value) ?? { label: label?.(fact) ?? value, quantity: 0, first: 0, last: 0, relatedUnits: new Set<string>() };
    group.quantity += fact.quantity;
    const period = periodKey(fact.year, fact.month, periodicity);
    if (period === firstPeriod) group.first += fact.quantity;
    if (period === lastPeriod) group.last += fact.quantity;
    group.relatedUnits.add(fact.unitSummary);
    groups.set(value, group);
  }
  const total = facts.reduce((sum, fact) => sum + fact.quantity, 0);
  return [...groups.entries()].map(([rankingKey, group]) => ({ key: rankingKey, label: group.label, quantity: group.quantity, share: total ? group.quantity / total : 0, evolution: periods.length > 1 && group.first ? (group.last - group.first) / group.first : null, relatedUnits: [...group.relatedUnits].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true })) })).sort((a, b) => b.quantity - a.quantity);
}

export function rankingCsv(rows: RankingRow[]): string {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return ["posição,nome,unidades_vinculadas,quantidade,participação,evolução", ...rows.map((row, index) => [index + 1, row.label, row.relatedUnits.join(" | "), row.quantity, row.share, row.evolution ?? ""].map(escape).join(","))].join("\r\n");
}
