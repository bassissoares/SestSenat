# Diretrizes técnicas e de experiência

## Arquitetura

- aplicação estática em React e TypeScript, construída com Vite;
- gráficos com Apache ECharts;
- mapas com Leaflet e dados geográficos em GeoJSON;
- tabelas com ordenação, busca, filtros e paginação no cliente;
- pipeline Python para ler, validar e transformar XLSX/CSV;
- JSON/GeoJSON separados por módulo e carregados sob demanda;
- publicação da pasta de build por GitHub Actions no GitHub Pages;
- nenhuma dependência de backend em tempo de execução.

## Compatibilidade com GitHub Pages

- configurar o Vite com `base: '/SestSenat/'`;
- usar rotas compatíveis com hospedagem estática, preferencialmente HashRouter;
- usar caminhos relativos ou derivados da base configurada;
- não depender de reescrita de URL no servidor;
- testar o build de produção localmente antes da publicação;
- validar a URL publicada após cada entrega;
- carregar bibliotecas pelo bundle, evitando dependência obrigatória de CDN;
- tratar falhas do provedor externo de tiles sem quebrar o restante do painel.

## Componentes reutilizáveis

- cabeçalho do painel e data da atualização;
- barra de filtros;
- card de indicador com comparação temporal;
- gráfico com estados de carregamento, vazio e erro;
- tabela analítica;
- mapa com legenda, clusters e enquadramento automático;
- painel de qualidade e cobertura dos dados;
- aviso de filtro ativo e ação para limpar filtros;
- rodapé com fonte e período de referência.

## Experiência e visualização

- cada componente deve responder a uma pergunta de negócio definida;
- abrir sempre na visão geral, considerando todos os anos e meses disponíveis;
- manter os filtros avançados recolhidos até o usuário solicitar refinamento;
- exigir no máximo um clique para selecionar ou limpar uma dimensão visível;
- fazer mapas, gráficos, indicadores e tabelas compartilharem o mesmo estado de filtros;
- permitir drill-down e drill-up por seleção direta e breadcrumb contextual;
- preservar filtros e nível de detalhamento ao alternar entre visualizações;
- mostrar unidade, período e denominador dos indicadores;
- manter cores consistentes para os mesmos status em todos os módulos;
- não depender somente de cor para comunicar estado;
- evitar gráficos de pizza com muitas categorias;
- usar barras para rankings e linhas para evolução temporal;
- oferecer texto alternativo, navegação por teclado e contraste adequado;
- adaptar layout para desktop, tablet e celular;
- exibir mensagem útil quando não houver dados para a seleção atual;
- não gerar interpretações ou metas que não estejam sustentadas pelos dados.

## Identidade visual SEST SENAT

Referência primária: `https://www.sestsenat.org.br/home`.

- usar `Khand` em títulos, destaques e indicadores, como no site oficial;
- usar `Open Sans` ou fonte sans-serif equivalente nos textos de leitura;
- azul institucional escuro: `#003770`;
- azul principal: `#2E72E0`;
- azul claro de destaque: `#20AAEE`;
- amarelo de ênfase: `#FFD500`;
- verde semântico: `#068E3A`;
- fundo claro e superfícies brancas com contraste alto;
- cores de destaque devem comunicar seleção, comparação ou estado, sem excesso;
- validar logotipo, margens de proteção e tokens finais contra manual oficial de
  marca, caso ele seja fornecido.

## Interação coordenada

- seleção no mapa filtra gráficos, rankings e tabela;
- seleção em gráfico filtra mapa, indicadores e tabela;
- seleção de linha ou entidade na tabela filtra ou detalha as demais visões;
- seleções múltiplas devem ser visíveis como chips removíveis;
- clicar novamente na seleção ativa deve removê-la quando não houver ambiguidade;
- breadcrumb deve representar a hierarquia atual e permitir drill-up em um clique;
- botão `Limpar filtros` deve restaurar a visão geral;
- nenhuma interação pode exigir recarregamento completo da página.

## Performance

- carregar inicialmente apenas shell, filtros e dados do módulo atual;
- dividir código e dados por rota/módulo;
- não publicar planilha bruta como fonte consumida pelo navegador;
- agregar dados no pipeline sempre que o detalhe não for necessário;
- revisar formatos mais compactos somente quando o JSON se tornar insuficiente;
- evitar renderizar todos os pontos do mapa sem clusterização;
- manter imagens e ativos otimizados.

## Convenções de código

- separar componentes visuais, regras de cálculo, acesso a dados e tipos;
- manter cálculos de indicadores testáveis e sem efeitos colaterais;
- validar todos os JSON gerados contra contrato conhecido;
- não duplicar a mesma regra de indicador em componentes diferentes;
- preferir mudanças pequenas, revisáveis e acompanhadas de testes.
