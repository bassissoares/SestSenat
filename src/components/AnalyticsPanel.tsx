import { useMemo, useState } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { aggregateBy, monthlySeries } from "../analytics/aggregations";
import { useFilters } from "../state/FilterContext";
import { EChart } from "./EChart";
const number = new Intl.NumberFormat("pt-BR");
const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 });
const palette = ["#003770", "#2e72e0", "#20aaee", "#ffd500", "#068e3a", "#6f42c1"];
export function AnalyticsPanel() {
  const { filteredFacts, drillTo } = useFilters(); const [mode, setMode] = useState<"quantity" | "share">("quantity");
  const total = filteredFacts.reduce((sum, fact) => sum + fact.quantity, 0);
  const forms = useMemo(() => aggregateBy(filteredFacts, "formId", (fact) => fact.formName), [filteredFacts]);
  const states = useMemo(() => aggregateBy(filteredFacts, "state"), [filteredFacts]); const months = useMemo(() => monthlySeries(filteredFacts), [filteredFacts]);
  const distinct = (key: keyof (typeof filteredFacts)[number]) => new Set(filteredFacts.map((fact) => fact[key]).filter(Boolean)).size;
  const valueOf = (item: { quantity: number; share: number }) => mode === "quantity" ? item.quantity : Number((item.share * 100).toFixed(2));
  const valueLabel = (value: number) => mode === "quantity" ? number.format(value) : `${value.toLocaleString("pt-BR")}%`;
  const timeline: EChartsCoreOption = { color: palette, tooltip: { trigger: "axis", valueFormatter: valueLabel }, grid: { left: 52, right: 24, top: 25, bottom: 58 }, xAxis: { type: "category", data: months.map((item) => item.key) }, yAxis: { type: "value" }, dataZoom: [{ type: "inside" }, { type: "slider", height: 18 }], series: [{ type: "line", smooth: true, symbolSize: 9, areaStyle: { opacity: .12 }, data: months.map(valueOf) }] };
  const formBars: EChartsCoreOption = { color: palette, tooltip: { trigger: "axis", valueFormatter: valueLabel }, grid: { left: 150, right: 30, top: 12, bottom: 32 }, xAxis: { type: "value", max: mode === "share" ? 100 : undefined }, yAxis: { type: "category", inverse: true, data: forms.slice(0, 10).map((item) => item.label) }, series: [{ type: "bar", data: forms.slice(0, 10).map(valueOf), itemStyle: { borderRadius: [0, 7, 7, 0] } }] };
  const treemap: EChartsCoreOption = { color: palette, tooltip: {}, series: [{ type: "treemap", roam: false, breadcrumb: { show: false }, label: { formatter: "{b}" }, data: forms.map((item) => ({ name: item.label, value: valueOf(item) })) }] };
  const stateBars: EChartsCoreOption = { color: ["#20aaee"], tooltip: { trigger: "axis", valueFormatter: valueLabel }, grid: { left: 42, right: 18, top: 12, bottom: 50 }, xAxis: { type: "category", data: states.map((item) => item.key), axisLabel: { rotate: 45 } }, yAxis: { type: "value", max: mode === "share" ? 100 : undefined }, series: [{ type: "bar", data: states.map(valueOf) }] };
  const selectForm = (name: string) => { const form = forms.find((item) => item.label === name); if (form) drillTo({ formId: [form.key] }); };
  return <section className="analytics-section" id="secao-2" aria-labelledby="analytics-title">
    <div className="panel-heading"><div><p className="eyebrow">LEITURA COORDENADA</p><h2 id="analytics-title">Indicadores e proporções</h2></div><div className="segmented" aria-label="Unidade dos gráficos"><button className={mode === "quantity" ? "active" : ""} onClick={() => setMode("quantity")}>Quantidade</button><button className={mode === "share" ? "active" : ""} onClick={() => setMode("share")}>Participação</button></div></div>
    <div className="kpi-grid"><article><span>Respondidos</span><strong>{number.format(total)}</strong></article><article><span>Anos</span><strong>{distinct("year")}</strong></article><article><span>Formulários</span><strong>{distinct("formId")}</strong></article><article><span>Conselhos</span><strong>{distinct("council")}</strong></article><article><span>Unidades</span><strong>{distinct("unitSummary")}</strong></article><article><span>Responsáveis</span><strong>{distinct("responsibleName")}</strong></article></div>
    <div className="chart-grid"><article className="chart-card chart-wide"><h3>Evolução mensal</h3><EChart option={timeline} ariaLabel="Série mensal de formulários respondidos" /></article><article className="chart-card"><h3>Top formulários</h3><EChart option={formBars} ariaLabel="Ranking dos dez principais formulários" onSelect={selectForm} /></article><article className="chart-card"><h3>Composição dos formulários</h3><EChart option={treemap} ariaLabel="Treemap da composição por formulário" onSelect={selectForm} /></article><article className="chart-card chart-wide"><h3>Distribuição territorial</h3><EChart option={stateBars} ariaLabel="Proporção de respondidos por unidade federativa" onSelect={(name) => drillTo({ state: [name] })} /></article></div>
    <details className="visual-alternative"><summary>Consultar dados dos gráficos em lista</summary><ol>{forms.slice(0, 10).map((item) => <li key={item.key}><button onClick={() => drillTo({ formId: [item.key] })}>{item.label}: {number.format(item.quantity)} ({percent.format(item.share)})</button></li>)}</ol></details>
  </section>;
}
