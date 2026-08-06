const packages = [
  "Visão geral",
  "Mapa por cidade",
  "Proporções",
  "Rankings",
];

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand" aria-label="SEST SENAT — Painéis InspectApp">
          <span className="brand-mark" aria-hidden="true">SS</span>
          <span>
            <strong>SEST SENAT</strong>
            <small>Painéis InspectApp</small>
          </span>
        </div>
        <div className="dataset-status">
          <span className="status-dot" aria-hidden="true" />
          Dados validados
        </div>
      </header>

      <nav className="module-nav" aria-label="Navegação do painel">
        {packages.map((item, index) => (
          <a key={item} href={`#secao-${index}`} aria-current={index === 0 ? "page" : undefined}>
            {item}
          </a>
        ))}
      </nav>

      <main id="conteudo" className="dashboard-main">
        <section className="hero" id="secao-0">
          <div>
            <p className="eyebrow">PANORAMA NACIONAL</p>
            <h1>Formulários respondidos</h1>
            <p className="hero-copy">
              Visão integrada por período, território, formulário, unidade e responsável.
            </p>
          </div>
          <div className="period-pill" aria-label="Período inicial: todos os anos e meses">
            <span>Período</span>
            <strong>Todos os anos e meses</strong>
          </div>
        </section>

        <section className="filter-summary" aria-label="Resumo dos filtros">
          <span className="filter-chip filter-chip-active">Visão geral</span>
          <button type="button" disabled>Limpar filtros</button>
        </section>

        <section className="loading-panel" aria-live="polite">
          <div className="loading-map" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="eyebrow">PRÓXIMA ENTREGA</p>
            <h2>Mapa e análises coordenadas</h2>
            <p>Os componentes analíticos serão ativados pelos próximos pacotes.</p>
          </div>
        </section>
      </main>

      <footer>
        <span>Fonte: InspectApp</span>
        <span>SEST SENAT · Inteligência para decisões</span>
      </footer>
    </div>
  );
}
