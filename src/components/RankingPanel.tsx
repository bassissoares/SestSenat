import { useMemo, useState } from "react";
import { buildRanking, rankingCsv } from "../analytics/rankings";
import { useFilters } from "../state/FilterContext";
import type { Fact, FilterKey } from "../types/dashboard";

const dimensions: Array<{ key: FilterKey; label: string; item: string; render?: (fact: Fact) => string }> = [
  { key: "council", label: "Conselhos", item: "conselho" }, { key: "unitType", label: "Tipos de unidade", item: "tipo de unidade" }, { key: "unitSummary", label: "Unidades", item: "unidade" }, { key: "city", label: "Cidades", item: "cidade" }, { key: "responsibleName", label: "Responsáveis", item: "responsável" }, { key: "formId", label: "Formulários", item: "formulário", render: (fact) => fact.formName },
];
const number = new Intl.NumberFormat("pt-BR"); const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });

export function RankingPanel() {
  const { filteredFacts, drillTo, periodicity } = useFilters(); const [dimension, setDimension] = useState(dimensions[0]); const [search, setSearch] = useState(""); const [page, setPage] = useState(0); const [ascending, setAscending] = useState(false);
  const ranking = useMemo(() => buildRanking(filteredFacts, dimension.key, dimension.render, periodicity), [filteredFacts, dimension, periodicity]);
  const visible = useMemo(() => { const term = search.toLocaleLowerCase("pt-BR"); return ranking.filter((row) => row.label.toLocaleLowerCase("pt-BR").includes(term) || (dimension.key === "responsibleName" && row.relatedUnits.some((unit) => unit.toLocaleLowerCase("pt-BR").includes(term)))).sort((a, b) => ascending ? a.quantity - b.quantity : b.quantity - a.quantity); }, [ranking, search, ascending, dimension.key]);
  const pageSize = 10; const pages = Math.max(1, Math.ceil(visible.length / pageSize)); const rows = visible.slice(page * pageSize, (page + 1) * pageSize);
  const selectDimension = (next: typeof dimensions[number]) => { setDimension(next); setSearch(""); setPage(0); };
  const select = (row: (typeof ranking)[number]) => drillTo(dimension.key === "responsibleName" && row.relatedUnits.length === 1 ? { responsibleName: [row.key], unitSummary: row.relatedUnits } : dimension.key === "city" && row.relatedStates.length === 1 ? { city: [row.key], state: row.relatedStates } : { [dimension.key]: [row.key] });
  const exportVisible = () => { const blob = new Blob(["\uFEFF", rankingCsv(visible)], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `ranking-${dimension.key}.csv`; anchor.click(); URL.revokeObjectURL(url); };
  return <section className="ranking-section" id="secao-3" aria-labelledby="ranking-title">
    <div className="panel-heading"><div><p className="eyebrow">DESEMPENHO OPERACIONAL</p><h2 id="ranking-title">Rankings coordenados</h2></div><button className="export-button" onClick={exportVisible}>Exportar recorte CSV</button></div>
    <div className="ranking-tabs" role="tablist" aria-label="Dimensão do ranking">{dimensions.map((item) => <button role="tab" aria-selected={dimension.key === item.key} key={item.key} onClick={() => selectDimension(item)}>{item.label}</button>)}</div>
    <div className="table-toolbar"><label><span>Pesquisar {dimension.item}</span><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder={`Digite para localizar ${dimension.item}`} /></label><span>{visible.length} resultados no contexto</span></div>
    <div className="table-scroll"><table><caption className="sr-only">Ranking de {dimension.label.toLocaleLowerCase("pt-BR")}</caption><thead><tr><th>Posição</th><th>{dimension.item}</th>{dimension.key === "responsibleName" && <th>Unidade vinculada</th>}<th><button onClick={() => setAscending((value) => !value)}>Quantidade {ascending ? "↑" : "↓"}</button></th><th>Participação</th><th>Evolução</th><th>Ação</th></tr></thead><tbody>{rows.map((row) => <tr key={row.key}><td><strong>#{ranking.indexOf(row) + 1}</strong></td><td>{row.label}</td>{dimension.key === "responsibleName" && <td className="unit-links">{row.relatedUnits.join(" · ")}</td>}<td>{number.format(row.quantity)}</td><td><span className="share-bar"><i style={{ width: `${Math.max(2, row.share * 100)}%` }} /></span>{percent.format(row.share)}</td><td className={row.evolution !== null && row.evolution < 0 ? "negative" : "positive"}>{row.evolution === null ? "—" : percent.format(row.evolution)}</td><td><button className="row-action" onClick={() => select(row)}>Analisar</button></td></tr>)}</tbody></table></div>
    <div className="pagination"><button disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Anterior</button><span>Página {page + 1} de {pages}</span><button disabled={page + 1 >= pages} onClick={() => setPage((value) => value + 1)}>Próxima</button></div>
  </section>;
}
