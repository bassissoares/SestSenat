import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { availableValues, dataPeriodBounds, decodeFilters, encodeFilters, filterFacts, latestCompletePeriodEnd } from "../analytics/filters";
import type { Dimensions, Fact, FilterKey, FilterState, Periodicity, PeriodRange } from "../types/dashboard";

type FilterContextValue = {
  facts: Fact[];
  filteredFacts: Fact[];
  dimensions: Dimensions;
  filters: FilterState;
  historyDepth: number;
  periodicity: Periodicity;
  setPeriodicity: (value: Periodicity) => void;
  periodRange: PeriodRange;
  periodBounds: PeriodRange;
  isPeriodIncomplete: boolean;
  setPeriodRange: (value: PeriodRange) => void;
  optionsFor: (key: FilterKey) => string[];
  setSingleFilter: (key: FilterKey, value: string) => void;
  drillTo: (updates: FilterState) => void;
  drillToPeriod: (updates: FilterState, range: PeriodRange) => void;
  removeFilter: (key: FilterKey, value?: string) => void;
  clearFilters: () => void;
  drillUp: () => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ facts, dimensions, children }: { facts: Fact[]; dimensions: Dimensions; children: React.ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(() => decodeFilters(window.location.search));
  const initialPeriodicity = useMemo<Periodicity>(() => { const value = Number(new URLSearchParams(window.location.search).get("periodicity")); return ([1, 2, 3, 6, 12] as number[]).includes(value) ? value as Periodicity : 1; }, []);
  const periodBounds = useMemo(() => dataPeriodBounds(facts), [facts]);
  const defaultRange = useCallback((value: Periodicity): PeriodRange => ({ start: periodBounds.start, end: latestCompletePeriodEnd(facts, value) }), [facts, periodBounds.start]);
  const [periodicity, setPeriodicityState] = useState<Periodicity>(initialPeriodicity);
  const [periodRange, setPeriodRangeState] = useState<PeriodRange>(() => { const params = new URLSearchParams(window.location.search); return { start: params.get("periodStart") ?? periodBounds.start, end: params.get("periodEnd") ?? latestCompletePeriodEnd(facts, initialPeriodicity) }; });
  const [history, setHistory] = useState<Array<{ filters: FilterState; periodRange: PeriodRange }>>([]);

  useEffect(() => {
    const params = new URLSearchParams(encodeFilters(filters));
    if (periodicity !== 1) params.set("periodicity", String(periodicity));
    params.set("periodStart", periodRange.start);
    params.set("periodEnd", periodRange.end);
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [filters, periodicity, periodRange]);

  const change = useCallback((next: FilterState, nextRange = periodRange) => {
    setFilters((current) => {
      setHistory((items) => [...items, { filters: current, periodRange }]);
      return next;
    });
    setPeriodRangeState(nextRange);
  }, [periodRange]);

  const setPeriodicity = useCallback((value: Periodicity) => { setPeriodicityState(value); change(filters, defaultRange(value)); }, [change, defaultRange, filters]);
  const setPeriodRange = useCallback((value: PeriodRange) => change(filters, value), [change, filters]);

  const setSingleFilter = useCallback((key: FilterKey, value: string) => {
    const next = { ...filters };
    if (value) next[key] = [value]; else delete next[key];
    change(next);
  }, [change, filters]);
  const drillTo = useCallback((updates: FilterState) => change({ ...filters, ...updates }), [change, filters]);
  const drillToPeriod = useCallback((updates: FilterState, range: PeriodRange) => change({ ...filters, ...updates }, range), [change, filters]);

  const removeFilter = useCallback((key: FilterKey, value?: string) => {
    const next = { ...filters };
    if (!value) delete next[key];
    else {
      const values = next[key]?.filter((item) => item !== value) ?? [];
      if (values.length) next[key] = values; else delete next[key];
    }
    change(next);
  }, [change, filters]);

  const clearFilters = useCallback(() => change({}, defaultRange(periodicity)), [change, defaultRange, periodicity]);
  const drillUp = useCallback(() => {
    setHistory((items) => {
      const previous = items.at(-1);
      if (previous) { setFilters(previous.filters); setPeriodRangeState(previous.periodRange); }
      return items.slice(0, -1);
    });
  }, []);

  const value = useMemo<FilterContextValue>(() => ({
    facts,
    dimensions,
    filters,
    filteredFacts: filterFacts(facts, filters, undefined, periodRange),
    historyDepth: history.length,
    periodicity,
    setPeriodicity,
    periodRange,
    periodBounds,
    isPeriodIncomplete: periodRange.end > latestCompletePeriodEnd(facts, periodicity),
    setPeriodRange,
    optionsFor: (key) => availableValues(facts, filters, key, periodRange),
    setSingleFilter,
    drillTo,
    drillToPeriod,
    removeFilter,
    clearFilters,
    drillUp,
  }), [facts, dimensions, filters, history.length, periodicity, periodRange, periodBounds, setPeriodicity, setPeriodRange, setSingleFilter, drillTo, drillToPeriod, removeFilter, clearFilters, drillUp]);

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useFilters(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) throw new Error("useFilters deve ser usado dentro de FilterProvider.");
  return context;
}
