import { lazy, Suspense, useEffect, useState } from "react";

import { FilterBar } from "./components/FilterBar";
import { FilterProvider, useFilters } from "./state/FilterContext";
import { loadDashboardData } from "./data/loadDashboardData";
import type { DashboardData } from "./types/dashboard";

const packages = ["Visão geral", "Mapa por cidade", "Proporções", "Rankings"];
const MapPanel = lazy(() => import("./components/MapPanel").then((module) => ({ default: module.MapPanel })));
const AnalyticsPanel = lazy(() => import("./components/AnalyticsPanel").then((module) => ({ default: module.AnalyticsPanel })));
const RankingPanel = lazy(() => import("./components/RankingPanel").then((module) => ({ default: module.RankingPanel })));

function Dashboard() {
  const { filteredFacts } = useFilters();
  const total = filteredFacts.reduce((sum, fact) => sum + fact.quantity, 0);

  return (
    <>
      <FilterBar />
      <div className="context-banner"><strong>{total.toLocaleString("pt-BR")}</strong> respondidos em {filteredFacts.length.toLocaleString("pt-BR")} agrupamentos no recorte atual.</div>
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

  useEffect(() => {
    let active = true;
    loadDashboardData()
      .then((loaded) => active && setData(loaded))
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Erro inesperado.");
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand" aria-label="SEST SENAT — Painéis InspectApp">
          <span className="brand-mark" aria-hidden="true">SS</span>
          <span><strong>SEST SENAT</strong><small>Painéis InspectApp</small></span>
        </div>
        <div className="dataset-status">
          <span className="status-dot" aria-hidden="true" />
          {data ? "Dados validados" : "Carregando dados"}
        </div>
      </header>

      <nav className="module-nav" aria-label="Navegação do painel">
        {packages.map((item, index) => (
          <a key={item} href={`#secao-${index}`} aria-current={index === 0 ? "page" : undefined}>{item}</a>
        ))}
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

      <footer>
        <span>Fonte: InspectApp</span>
        <span>{data ? `Carga ${data.manifest.datasetVersion}` : "SEST SENAT · Inteligência para decisões"}</span>
      </footer>
    </div>
  );
}
