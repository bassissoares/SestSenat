import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { availableValues, decodeFilters, encodeFilters, filterFacts } from "../analytics/filters";
import type { Dimensions, Fact, FilterKey, FilterState } from "../types/dashboard";

type FilterContextValue = {
  facts: Fact[];
  filteredFacts: Fact[];
  dimensions: Dimensions;
  filters: FilterState;
  historyDepth: number;
  optionsFor: (key: FilterKey) => string[];
  setSingleFilter: (key: FilterKey, value: string) => void;
  removeFilter: (key: FilterKey, value?: string) => void;
  clearFilters: () => void;
  drillUp: () => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ facts, dimensions, children }: { facts: Fact[]; dimensions: Dimensions; children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(() => decodeFilters(window.location.search));
  const [history, setHistory] = useState<FilterState[]>([]);

  useEffect(() => {
    const query = encodeFilters(filters);
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [filters]);

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
    optionsFor: (key) => availableValues(facts, filters, key),
    setSingleFilter,
    removeFilter,
    clearFilters,
    drillUp,
  }), [facts, dimensions, filters, history.length, setSingleFilter, removeFilter, clearFilters, drillUp]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilters deve ser usado dentro de FilterProvider.");
  return context;
}
