import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { availableValues, decodeFilters, encodeFilters, filterFacts } from "../analytics/filters";
import type { Dimensions, Fact, FilterKey, FilterState, Periodicity } from "../types/dashboard";

type FilterContextValue = {
  facts: Fact[];
  filteredFacts: Fact[];
  dimensions: Dimensions;
  filters: FilterState;
  historyDepth: number;
  periodicity: Periodicity;
  setPeriodicity: (value: Periodicity) => void;
  optionsFor: (key: FilterKey) => string[];
  setSingleFilter: (key: FilterKey, value: string) => void;
  drillTo: (updates: FilterState) => void;
  removeFilter: (key: FilterKey, value?: string) => void;
  clearFilters: () => void;
  drillUp: () => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ facts, dimensions, children }: { facts: Fact[]; dimensions: Dimensions; children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(() => decodeFilters(window.location.search));
  const [periodicity, setPeriodicity] = useState<Periodicity>(() => { const value = Number(new URLSearchParams(window.location.search).get("periodicity")); return ([1, 2, 3, 6, 12] as number[]).includes(value) ? value as Periodicity : 1; });
  const [history, setHistory] = useState<FilterState[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(encodeFilters(filters));
    if (periodicity !== 1) params.set("periodicity", String(periodicity));
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [filters, periodicity]);

  const change = useCallback((next: FilterState) => {
    setFilters((current) => {
      setHistory((items) => [...items, current]);
      return next;
    });
  }, []);

  const setSingleFilter = useCallback((key: FilterKey, value: string) => {
    const next = { ...filters };
    if (value) next[key] = [value]; else delete next[key];
    change(next);
  }, [change, filters]);
  const drillTo = useCallback((updates: FilterState) => change({ ...filters, ...updates }), [change, filters]);

  const removeFilter = useCallback((key: FilterKey, value?: string) => {
    const next = { ...filters };
    if (!value) delete next[key];
    else {
      const values = next[key]?.filter((item) => item !== value) ?? [];
      if (values.length) next[key] = values; else delete next[key];
    }
    change(next);
  }, [change, filters]);

  const clearFilters = useCallback(() => change({}), [change]);
  const drillUp = useCallback(() => {
    setHistory((items) => {
      const previous = items.at(-1);
      if (previous) setFilters(previous);
      return items.slice(0, -1);
    });
  }, []);

  const value = useMemo<FilterContextValue>(() => ({
    facts,
    dimensions,
    filters,
    filteredFacts: filterFacts(facts, filters),
    historyDepth: history.length,
    periodicity,
    setPeriodicity,
    optionsFor: (key) => availableValues(facts, filters, key),
    setSingleFilter,
    drillTo,
    removeFilter,
    clearFilters,
    drillUp,
  }), [facts, dimensions, filters, history.length, periodicity, setSingleFilter, drillTo, removeFilter, clearFilters, drillUp]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilters deve ser usado dentro de FilterProvider.");
  return context;
}
