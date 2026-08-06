import { filterLabels } from "../analytics/filters";
import { useFilters } from "../state/FilterContext";
import type { FilterKey, Periodicity } from "../types/dashboard";

const filterKeys: FilterKey[] = ["year", "month", "formId", "council", "state", "city", "unitType", "unitSummary", "responsibleName"];
const periodicities: Array<{ value: Periodicity; label: string }> = [{ value: 1, label: "Mensal" }, { value: 2, label: "Bimestral" }, { value: 3, label: "Trimestral" }, { value: 6, label: "Semestral" }, { value: 12, label: "Anual" }];

function optionLabel(key: FilterKey, value: string): string {
  if (key === "month") return new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(new Date(`2024-${value.padStart(2, "0")}-01T00:00:00Z`));
  if (key === "formId") return `Formulário ${value}`;
  return value;
}

export function FilterBar() {
  const { filters, optionsFor, setSingleFilter, removeFilter, clearFilters, drillUp, historyDepth, periodicity, setPeriodicity } = useFilters();
  const activeEntries = Object.entries(filters) as Array<[FilterKey, string[]]>;

  return (
    <section className="filter-area" aria-label="Filtros coordenados">
      <div className="filter-summary">
        {activeEntries.length === 0 ? <span className="filter-chip filter-chip-active">Visão geral</span> : activeEntries.flatMap(([key, values]) => values.map((value) => (
          <button key={`${key}-${value}`} className="filter-chip filter-chip-selected" type="button" onClick={() => removeFilter(key, value)} aria-label={`Remover ${filterLabels[key]} ${optionLabel(key, value)}`}>
            <span>{filterLabels[key]}: {optionLabel(key, value)}</span><b aria-hidden="true">×</b>
          </button>
        )))}
        <span className="filter-periodicity">Periodicidade: {periodicities.find((item) => item.value === periodicity)?.label}</span>
        {historyDepth > 0 && <button className="filter-action" type="button" onClick={drillUp}>← Voltar nível</button>}
        <button className="filter-action" type="button" onClick={clearFilters} disabled={activeEntries.length === 0}>Limpar filtros</button>
      </div>

      <details className="advanced-filters">
        <summary>Refinar análise</summary>
        <div className="filter-grid">
          <label className="periodicity-control">
            <span>Periodicidade das análises</span>
            <select value={periodicity} onChange={(event) => setPeriodicity(Number(event.target.value) as Periodicity)}>
              {periodicities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          {filterKeys.map((key) => (
            <label key={key}>
              <span>{filterLabels[key]}</span>
              <select value={filters[key]?.[0] ?? ""} onChange={(event) => setSingleFilter(key, event.target.value)}>
                <option value="">Todos</option>
                {optionsFor(key).map((value) => <option key={value} value={value}>{optionLabel(key, value)}</option>)}
              </select>
            </label>
          ))}
        </div>
      </details>
    </section>
  );
}
