import { lazy, Suspense, useEffect, useState } from "react";

import { FilterBar } from "./components/FilterBar";
import { filterLabels } from "./analytics/filters";
import { FilterProvider, useFilters } from "./state/FilterContext";
import { loadDashboardData } from "./data/loadDashboardData";
import type { DashboardData } from "./types/dashboard";

const packages = ["Visão geral", "Mapa por cidade", "Proporções", "Rankings"];
const MapPanel = lazy(() => import("./components/MapPanel").then((module) => ({ default: module.MapPanel })));
const AnalyticsPanel = lazy(() => import("./components/AnalyticsPanel").then((module) => ({ default: module.AnalyticsPanel })));
const RankingPanel = lazy(() => import("./components/RankingPanel").then((module) => ({ default: module.RankingPanel })));
const glossary = [
  ["Formulários respondidos", "Quantidade registrada no InspectApp; não representa pessoas, atendimentos ou formulários enviados."],
  ["Participação", "Percentual do agrupamento sobre o total do recorte filtrado."],
  ["Média anterior", "Média aritmética de todos os períodos anteriores ao período analisado."],
  ["Variação vs. média anterior", "Diferença percentual entre o último período e a média dos períodos anteriores."],
  ["Crescimento ou queda", "Resultado positivo ou negativo do período quando comparado à média histórica anterior."],
  ["Tipo predominante", "Tipo de unidade com maior quantidade de formulários respondidos na cidade."],
  ["Período parcial", "Período ainda em formação; seus totais não devem ser comparados diretamente com períodos completos."],
  ["Posição no mapa", "Centro aproximado da malha municipal do IBGE, não o endereço físico da unidade."],
] as const;

function Dashboard() {
  const { filteredFacts, filters, periodicity, periodRange, historyDepth, drillUp, clearFilters, isPeriodIncomplete } = useFilters();
  const [showContext, setShowContext] = useState(false);
  const total = filteredFacts.reduce((sum, fact) => sum + fact.quantity, 0);
  const periodicityLabel = { 1: "Mensal", 2: "Bimestral", 3: "Trimestral", 6: "Semestral", 12: "Anual" }[periodicity];
  const activeFilters = Object.entries(filters).flatMap(([key, values]) => (values ?? []).map((value) => ({ key, label: filterLabels[key as keyof typeof filterLabels], value: key === "formId" ? `Formulário ${value}` : value })));

  useEffect(() => { const update = () => setShowContext(window.scrollY > 420); update(); window.addEventListener("scroll", update, { passive: true }); return () => window.removeEventListener("scroll", update); }, []);

  return (
    <>
      <FilterBar />
      <div className="context-banner"><strong>{total.toLocaleString("pt-BR")}</strong> respondidos em {filteredFacts.length.toLocaleString("pt-BR")} agrupamentos no recorte atual. {isPeriodIncomplete && <span className="partial-period-warning">⚠ Período parcial incluído</span>}</div>
      {showContext && <aside className="floating-context" aria-label="Contexto atual da análise"><header><div><span>CONTEXTO ATUAL</span><strong>Nível {historyDepth + 1}</strong></div><b>{total.toLocaleString("pt-BR")}</b></header><dl><div><dt>Periodicidade</dt><dd>{periodicityLabel}</dd></div><div><dt>Intervalo</dt><dd>{periodRange.start} a {periodRange.end}</dd></div></dl>{isPeriodIncomplete && <div className="floating-partial-warning">⚠ Período parcial: interprete os resultados com cautela</div>}<div className="floating-context-filters">{activeFilters.length ? activeFilters.map((item) => <span key={`${item.key}-${item.value}`}><small>{item.label}</small>{item.value}</span>) : <em>Nenhum filtro dimensional</em>}</div><div className="floating-context-actions">{historyDepth > 0 && <button type="button" onClick={drillUp}>← Voltar nível</button>}<button type="button" onClick={clearFilters}>Limpar contexto</button></div></aside>}
      <Suspense fallback={<section className="state-panel" role="status">Preparando visualizações…</section>}>
        <MapPanel />
        <AnalyticsPanel />
        <RankingPanel />
      </Suspense>
    </>
  );
}

function LoadingState() {
  return <section className="state-panel" role="status">Carregando dados validados…</section>;
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="state-panel state-panel-error" role="alert">
      <strong>Não foi possível carregar o painel.</strong>
      <span>{message}</span>
    </section>
  );
}

export function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const loadedAt = data ? new Date(data.manifest.generatedAt) : null;
  const loadedAtLabel = loadedAt && !Number.isNaN(loadedAt.getTime()) ? loadedAt.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

  useEffect(() => {
    let active = true;
    loadDashboardData()
      .then((loaded) => active && setData(loaded))
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Erro inesperado.");
      });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (!glossaryOpen) return; const close = (event: KeyboardEvent) => event.key === "Escape" && setGlossaryOpen(false); window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [glossaryOpen]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand" aria-label="SEST SENAT — Painéis InspectApp">
          <span className="brand-mark" aria-hidden="true">SS</span>
          <span><strong>SEST SENAT</strong><small>Painéis InspectApp</small></span>
        </div>
        <div className="dataset-status">
          <span className="status-dot" aria-hidden="true" />
          <span>{data ? "Dados validados" : "Carregando dados"}{data && <small>Atualizado em {loadedAtLabel}</small>}</span>
        </div>
      </header>

      <nav className="module-nav" aria-label="Navegação do painel">
        {packages.map((item, index) => (
          <a key={item} href={`#secao-${index}`} aria-current={index === 0 ? "page" : undefined}>{item}</a>
        ))}
        <button className="glossary-trigger" type="button" onClick={() => setGlossaryOpen(true)}>Glossário</button>
      </nav>

      <main id="conteudo" className="dashboard-main">
        <section className="hero" id="secao-0">
          <div>
            <p className="eyebrow">PANORAMA NACIONAL</p>
            <h1>Formulários respondidos</h1>
            <p className="hero-copy">Visão integrada por período, território, formulário, unidade e responsável.</p>
          </div>
          <div className="period-pill" aria-label="Período disponível na fonte de dados">
            <span>Dados disponíveis</span>
            <strong>{data ? `${data.manifest.periodStart} a ${data.manifest.periodEnd}` : "Todos os anos e meses"}</strong>
          </div>
        </section>

        {error ? <ErrorState message={error} /> : !data ? <LoadingState /> : (
          <FilterProvider facts={data.facts} dimensions={data.dimensions}>
            <Dashboard />
          </FilterProvider>
        )}
      </main>

      {glossaryOpen && <div className="glossary-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setGlossaryOpen(false)}><section className="glossary-dialog" role="dialog" aria-modal="true" aria-labelledby="glossary-title"><header><div><p className="eyebrow">REFERÊNCIA ANALÍTICA</p><h2 id="glossary-title">Glossário do painel</h2></div><button type="button" onClick={() => setGlossaryOpen(false)} aria-label="Fechar glossário">×</button></header><dl>{glossary.map(([term, definition]) => <div key={term}><dt>{term}</dt><dd>{definition}</dd></div>)}</dl></section></div>}

      <footer>
        <span>Fonte: InspectApp</span>
        <span>{data ? `Carga ${data.manifest.datasetVersion}` : "SEST SENAT · Inteligência para decisões"}</span>
      </footer>
    </div>
  );
}
