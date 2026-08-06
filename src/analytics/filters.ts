import type { Fact, FilterKey, FilterState, Periodicity, PeriodRange } from "../types/dashboard";

export const filterLabels: Record<FilterKey, string> = {
  year: "Ano",
  month: "Mês",
  formId: "Formulário",
  council: "Conselho",
  state: "UF",
  city: "Cidade",
  unitType: "Tipo de unidade",
  unitSummary: "Unidade",
  responsibleName: "Responsável",
};

export function factValue(fact: Fact, key: FilterKey): string {
  return String(fact[key] ?? "");
}

export const factPeriod = (fact: Fact) => `${fact.year}-${String(fact.month).padStart(2, "0")}`;

export function dataPeriodBounds(facts: Fact[]): PeriodRange {
  const periods = facts.map(factPeriod).sort();
  return { start: periods[0] ?? "", end: periods.at(-1) ?? "" };
}

export function latestCompletePeriodEnd(facts: Fact[], periodicity: Periodicity, today = new Date()): string {
  const bounds = dataPeriodBounds(facts);
  const currentYear = today.getFullYear(); const currentMonth = today.getMonth() + 1;
  const completedMonth = Math.floor((currentMonth - 1) / periodicity) * periodicity;
  const cutoff = completedMonth ? `${currentYear}-${String(completedMonth).padStart(2, "0")}` : `${currentYear - 1}-12`;
  return bounds.end && bounds.end < cutoff ? bounds.end : cutoff;
}

export function filterFacts(facts: Fact[], filters: FilterState, ignore?: FilterKey, range?: PeriodRange): Fact[] {
  return facts.filter((fact) => (!range || (factPeriod(fact) >= range.start && factPeriod(fact) <= range.end)) && Object.entries(filters).every(([rawKey, values]) => {
    const key = rawKey as FilterKey;
    if (key === ignore || !values?.length) return true;
    return values.includes(factValue(fact, key));
  }));
}

export function availableValues(facts: Fact[], filters: FilterState, key: FilterKey, range?: PeriodRange): string[] {
  const candidates = filterFacts(facts, filters, key, range);
  return [...new Set(candidates.map((fact) => factValue(fact, key)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

export function encodeFilters(filters: FilterState): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, values]) => {
    values?.forEach((value) => params.append(key, value));
  });
  return params.toString();
}

export function decodeFilters(search: string): FilterState {
  const params = new URLSearchParams(search);
  const state: FilterState = {};
  for (const key of Object.keys(filterLabels) as FilterKey[]) {
    const values = params.getAll(key);
    if (values.length) state[key] = values;
  }
  return state;
}
