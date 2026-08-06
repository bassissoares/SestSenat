import type { Fact, FilterKey, FilterState } from "../types/dashboard";

export const filterLabels: Record<FilterKey, string> = {
  year: "Ano",
  month: "Mês",
  formId: "Formulário",
  council: "Conselho",
  state: "UF",
  city: "Cidade",
  unitSummary: "Unidade",
  responsibleName: "Responsável",
};

export function factValue(fact: Fact, key: FilterKey): string {
  return String(fact[key] ?? "");
}

export function filterFacts(facts: Fact[], filters: FilterState, ignore?: FilterKey): Fact[] {
  return facts.filter((fact) => Object.entries(filters).every(([rawKey, values]) => {
    const key = rawKey as FilterKey;
    if (key === ignore || !values?.length) return true;
    return values.includes(factValue(fact, key));
  }));
}

export function availableValues(facts: Fact[], filters: FilterState, key: FilterKey): string[] {
  const candidates = filterFacts(facts, filters, key);
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
