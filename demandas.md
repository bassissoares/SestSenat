# Demandas dos Painéis InspectApp — SEST SENAT

Este arquivo contém o backlog de entregas. Regras transversais pertencem a
`GOVERNANCA.md`, `DIRETRIZES.md`, `DADOS.md` e `QUALITY_ROADMAP.md`.

## Convenções

- Status: `PENDENTE`, `EM ANÁLISE`, `EM DESENVOLVIMENTO`, `EM HOMOLOGAÇÃO`,
  `CONCLUÍDO` ou `BLOQUEADO`.
- Nenhum módulo entra em desenvolvimento sem planilha ou amostra representativa.
- Toda análise deve indicar fonte, fórmula, filtros e limitações.
- A conclusão exige os gates de `GOVERNANCA.md`.

## [BASE-01] Bootstrap do projeto

- Status: `PENDENTE`.
- Objetivo: criar a base estática e reutilizável dos painéis.

### Escopo

- React, TypeScript e Vite;
- configuração da base `/SestSenat/`;
- layout, navegação e identidade visual inicial;
- roteamento compatível com GitHub Pages;
- componentes de loading, vazio e erro;
- lint, testes, build e `check.ps1`;
- workflow de publicação no GitHub Pages.

### Critérios de aceite

- build executa sem erro;
- rotas funcionam localmente sob `/SestSenat/`;
- site demonstrativo abre na URL publicada;
- console do navegador sem erro relevante;
- layout responsivo validado.

## [BASE-02] Pipeline de importação

- Status: `PENDENTE`.
- Objetivo: transformar planilhas aprovadas em dados públicos confiáveis.

### Escopo

- leitura de XLSX/CSV;
- validação por contrato;
- normalização e anonimização;
- geração de JSON/GeoJSON e manifesto;
- relatório de erros e alertas;
- dados demonstrativos sem informação real sensível;
- testes automatizados.

### Critérios de aceite

- arquivo válido gera saída reproduzível;
- arquivo incompatível falha com mensagem acionável;
- colunas não autorizadas não são publicadas;
- totais de origem e saída são informados;
- dados gerados são consumidos pelo build estático.

## [BASE-03] Biblioteca de componentes analíticos

- Status: `PENDENTE`.
- Objetivo: criar componentes consistentes para todos os módulos.

### Escopo

- filtros globais;
- cards de indicadores;
- gráficos de linha, barras e composição;
- tabela analítica;
- mapa com clusters;
- metadados da fonte;
- estados de carregamento, ausência e erro;
- padrões de cores, números, datas e tooltips.

### Critérios de aceite

- componentes recebem dados tipados;
- filtros atualizam componentes relacionados;
- componentes são responsivos e acessíveis;
- indicadores exibem unidade, período e contexto.

## [MOD-01] Formulários respondidos — visão geral interativa

- Status: `EM ANÁLISE`.
- Fonte: `formularios_respondidos.csv`, snapshot de 06/08/2026.
- Objetivo: apresentar, sem filtros obrigatórios, o panorama de formulários
  respondidos e permitir exploração coordenada por tempo, território,
  formulário, unidade e responsável.

### Baseline da fonte

- período atual: 2025 e 2026;
- 2.459 agrupamentos;
- 507.741 formulários respondidos;
- 29 formulários, 18 conselhos, 140 unidades e 350 responsáveis;
- nomes de responsáveis autorizados para apresentação pública;
- detalhamento de unidade ausente em 9 agrupamentos.

### Hierarquias de drill-down e drill-up

- tempo: todos os anos → ano → mês;
- território: Brasil → UF/conselho → cidade → unidade;
- formulário: todos → formulário;
- operação: conselho → unidade → responsável;
- retorno por breadcrumb, chips ou nova seleção, sem recarregar a página.

## [PKG-01] Contrato e pipeline do módulo

- Status: `CONCLUÍDO`.
- Dependência: `BASE-02`.

### Escopo

- aplicar os dez cabeçalhos confirmados ao CSV sem cabeçalho;
- receber o caminho do CSV por parâmetro e aceitar cabeçalho canônico opcional;
- validar ano, mês, IDs, textos e quantidade positiva;
- descobrir períodos e dimensões dinamicamente, sem anos ou meses fixos;
- suportar snapshot completo desde 2021 e anos futuros sem mudança de código;
- decompor `unidade_detalhe` em ID, nome, situação, conselho, município e UF;
- gerar dimensões canônicas e fatos agregados;
- gerar manifesto, relatório de qualidade e JSON por nível analítico;
- registrar hash, versão do contrato, período e contagens da carga;
- gerar em área temporária e promover saídas somente após validação completa;
- manter o último snapshot aprovado quando a nova carga falhar;
- impedir que o CSV bruto integre a pasta pública ou o artefato do site;
- preservar nomes autorizados e omitir `responsavel_id` da interface;
- reconciliar 507.741 respostas, 335.072 em 2025 e 172.669 em 2026.

### Critérios de aceite

- nenhuma linha válida perdida;
- totais por ano e total geral reconciliados;
- nove ausências geográficas sinalizadas sem exclusão dos totais;
- nova carga completa substitui a anterior sem somar ou duplicar histórico;
- inclusão de novo ano não exige alteração de código;
- falha de validação não altera os JSON públicos vigentes;
- saída reproduzível e testada;
- nenhuma coluna fora do contrato publicada.

### Evidências

- snapshot `b7ef33b912a56c3c`: 2.459 agrupamentos e 507.741 respostas;
- reconciliação: 335.072 em 2025 e 172.669 em 2026;
- 18 alertas geográficos preservados no relatório de qualidade;
- 4 testes automatizados cobrindo cabeçalho, total, rejeição e rollback;
- comando: `python scripts/import_forms.py --input <arquivo.csv>`;
- checks: `./check.ps1` aprovado.

## [PKG-02] Design system SEST SENAT e shell analítico

- Status: `CONCLUÍDO`.
- Dependência: `BASE-01`.

### Escopo

- identidade baseada no site oficial do SEST SENAT;
- tipografia Khand para títulos/KPIs e Open Sans para leitura;
- tokens azul escuro, azul principal, azul claro, amarelo e verde;
- cabeçalho compacto, período, última atualização e fonte;
- data da última carga e cobertura temporal derivadas do manifesto;
- layout responsivo com mapa e panorama acima da dobra em desktop;
- filtros avançados recolhidos e chips de seleção sempre visíveis;
- resumo flutuante do contexto durante a rolagem, com periodicidade, intervalo,
  nível, total, filtros ativos e ações de retorno/limpeza;
- estados de loading, vazio, erro e localização não identificada.

### Critérios de aceite

- identidade reconhecível sem copiar componentes do site institucional;
- contraste e navegação por teclado aprovados;
- visão geral acessível sem clique inicial;
- celular, tablet e desktop validados.

### Evidências

- shell React/TypeScript/Vite com base `/SestSenat/`;
- fontes Khand e Open Sans empacotadas localmente;
- tokens visuais, navegação, skip-link e redução de movimento;
- teste de abertura na visão geral;
- `npm test` e `npm run build` integrados ao `check.ps1`.

## [PKG-03] Motor de filtros e interação coordenada

- Status: `CONCLUÍDO`.
- Dependências: `BASE-03`, `PKG-01` e `PKG-02`.

### Escopo

- estado único para tempo, UF, conselho, cidade, unidade, formulário e responsável;
- cross-filter entre cards, mapa, gráficos, rankings e tabela;
- seleção simples e múltipla quando fizer sentido;
- chips removíveis, breadcrumb e ação global `Limpar filtros`;
- drill-down e drill-up sem troca de página;
- preservação do contexto ao alternar visualizações;
- URL/hash capaz de representar o estado compartilhável quando viável.

### Critérios de aceite

- qualquer seleção atualiza todas as visões compatíveis;
- nenhuma tabela ou gráfico mantém filtro contraditório;
- drill-up retorna ao nível anterior em um clique;
- visão geral integral é restaurada em um clique;
- interação permanece fluida no volume completo.

### Evidências

- carga paralela de fatos, dimensões e manifesto com reconciliação de linhas;
- estado canônico para oito dimensões e filtros em cascata;
- query string compartilhável, chips removíveis, limpar e voltar nível;
- visão geral sem seleção inicial e filtros avançados recolhidos;
- testes unitários de combinação e serialização dos filtros.

## [PKG-04] Mapa inicial por cidade e unidade

- Status: `CONCLUÍDO`.
- Dependências: `PKG-01` e `PKG-03`.

### Escopo

- normalizar município/UF e relacionar com malha oficial do IBGE;
- gerar centroide municipal e GeoJSON otimizado;
- exibir mapa nacional já na visão geral;
- combinar mapa coroplético por UF com bolhas/cluster por cidade;
- colorir UFs em escala contínua do azul claro ao escuro, proporcional ao volume filtrado;
- permitir destaque reversível dos tipos de unidade pela legenda, sem alterar o filtro analítico;
- representar quantidade e proporção de formulários respondidos;
- tooltip com cidade, UF, unidades, responsáveis e participação;
- drill Brasil → UF/conselho → cidade → unidade;
- lista de correspondências geográficas não resolvidas.

### Critérios de aceite

- mapa aparece sem filtro prévio;
- totais do mapa reconciliam com gráficos e tabela;
- clicar no mapa filtra todo o painel;
- posição aproximada é informada ao usuário;
- falha do mapa-base não impede o uso das demais análises.

### Evidências

- municípios relacionados à API de Localidades e malhas simplificadas do IBGE;
- GeoJSON estadual e centros municipais gerados fora do CSV bruto;
- mapa Leaflet com UF, bolhas proporcionais, tooltip e alternativa textual;
- clique em UF ou cidade integrado ao motor de filtros e drill;
- pendências geográficas preservadas sem retirar valores dos totais.

## [PKG-05] Indicadores e gráficos de proporção

- Status: `CONCLUÍDO`.
- Dependência: `PKG-03`.

### Escopo

- cards de total, anos, formulários, conselhos, unidades e responsáveis;
- periodicidade global mensal, bimestral, trimestral, semestral ou anual;
- intervalo contínuo por ano/mês inicial e ano/mês final, substituindo filtros isolados;
- visão inicial encerrada no último período completo da periodicidade selecionada;
- série temporal com comparação e zoom na periodicidade escolhida;
- barras 100% empilhadas para proporção por formulário e território;
- ranking visual horizontal com participação acumulada;
- treemap para composição dos formulários respondidos;
- heatmap temporal alternável por tipo de unidade, unidade, conselho, cidade,
  formulário e responsável;
- curva de crescimento acumulado comparando os cinco principais agrupamentos;
- gráfico de bolhas comparando o último período com a média dos períodos anteriores,
  com volume atual no tamanho, variação no eixo vertical e agrupamento selecionável;
- tabela de desempenho por período com total, média anterior, diferença, variação e situação;
- gráfico combinado de total realizado e média dos períodos anteriores, com drill no período;
- alternância entre quantidade absoluta e participação percentual;
- destaque visual e animações curtas sem prejudicar leitura;
- tooltips ricos e acessíveis;
- clique em qualquer elemento aplicando filtro coordenado.

### Critérios de aceite

- soma das proporções fecha em 100% no contexto selecionado;
- quantidade e percentual usam o mesmo denominador filtrado;
- gráficos suportam drill-down e drill-up definidos;
- célula do heatmap aplica simultaneamente período e agrupamento ao contexto;
- rótulos continuam legíveis em telas menores;
- não chamar respostas de envios sem definição formal adicional.

### Evidências

- seis KPIs e quatro visualizações ECharts coordenadas;
- série temporal com zoom, curva acumulada comparativa, heatmap, ranking horizontal, treemap e distribuição por UF;
- alternância entre quantidade e participação sobre o mesmo contexto;
- clique em formulário ou UF integrado ao motor de filtros;
- alternativa textual e teste automatizado de fechamento em 100%.

## [PKG-06] Rankings e tabelas coordenadas

- Status: `CONCLUÍDO`.
- Dependência: `PKG-03`.

### Escopo

- ranking nominal de responsáveis;
- unidade vinculada no ranking nominal de responsáveis;
- ranking e filtro por tipo de unidade derivado do prefixo antes do número;
- ranking de unidades, conselhos, cidades e formulários;
- ordem dos agrupamentos: conselhos, tipos de unidade, unidades, cidades, responsáveis e formulários;
- ranking de cidades identificado por cidade e UF;
- posição, quantidade, participação e evolução no período;
- pesquisa textual, ordenação, paginação e colunas configuráveis;
- tabela mestre refletindo seleções originadas em mapa e gráficos;
- seleção de linha atualizando mapa, gráficos e indicadores;
- expansão de unidade para responsáveis e formulários;
- exportação somente do recorte filtrado e autorizado.

### Critérios de aceite

- ranking geral abre sem filtros obrigatórios;
- totais e posições mudam conforme o contexto selecionado;
- tabela não renderiza milhares de linhas simultaneamente;
- interação com linhas mantém contexto e breadcrumb;
- exportação corresponde exatamente ao filtro visível.
- bolhas do mapa usam cores por tipo predominante e exibem tooltip analítico no hover.

### Evidências

- rankings alternáveis de responsáveis, tipos de unidade, unidades, conselhos, cidades e formulários;
- responsáveis apresentam unidades vinculadas, preservando vínculos múltiplos;
- posição, quantidade, participação e evolução entre primeiro e último ano;
- pesquisa, ordenação e paginação de dez registros;
- ação de linha integrada ao filtro global e breadcrumb;
- exportação CSV limitada ao recorte pesquisado e autorizado.

## [PKG-07] Desempenho, acessibilidade e qualidade analítica

- Status: `CONCLUÍDO`.
- Dependências: `PKG-04`, `PKG-05` e `PKG-06`.

### Escopo

- carga sob demanda e divisão de dados por nível/módulo;
- otimização do GeoJSON e agrupamentos pré-calculados;
- alternativa textual para mapas e gráficos;
- navegação completa por teclado;
- testes de reconciliação após combinações de filtros;
- testes de interação coordenada e drill;
- monitoramento de tamanho do build e arquivos de dados.

### Critérios de aceite

- painel permanece responsivo durante filtros e drill;
- nenhum componente bloqueia a thread principal perceptivelmente;
- todas as informações essenciais possuem alternativa não visual;
- checks, testes e build de produção aprovados.

### Evidências

- mapa, gráficos e rankings divididos em chunks carregados sob demanda;
- fontes limitadas ao subconjunto latino, sem famílias não utilizadas;
- alternativas textuais para mapa e gráficos e tabela semântica paginada;
- layout responsivo e redução de movimento preservados;
- limite automatizado para JavaScript, CSS, JSON e GeoJSON no `check.ps1`.

## [PKG-08] GitHub Pages, homologação e publicação

- Status: `EM HOMOLOGAÇÃO`.
- Dependência: `PKG-07`.

### Escopo

- workflow de build e deploy pelo GitHub Actions;
- base `/SestSenat/` e rotas estáticas validadas;
- cache/versionamento dos JSON e GeoJSON;
- comando documentado para importar novo CSV, validar, gerar e publicar;
- teste de atualização com snapshot ampliado e teste de rollback em carga inválida;
- roteiro funcional cobrindo mapa, gráficos, tabelas, filtros e drill;
- evidências em desktop e celular;
- plano de rollback para o último artefato aprovado;
- smoke test na URL pública.

### Critérios de aceite

- acesso direto e atualização de rota funcionam no GitHub Pages;
- nenhum ativo ou arquivo de dados retorna 404;
- visão geral, mapa e interações funcionam na URL publicada;
- console sem erro relevante;
- homologação registrada com snapshot e totais da fonte.

### Evidências preparadas

- workflow único de checks, build e deploy do GitHub Pages;
- operação documentada para importar, validar, substituir e reverter dados;
- roteiro funcional com fluxo principal, casos negativos e regressão;
- revalidação de JSON/GeoJSON no navegador contra cache obsoleto;
- publicação e smoke test pendentes ao merge em `main`.

## Modelo para novos módulos

Cada nova planilha deve originar uma demanda com:

- módulo e objetivo;
- responsável funcional;
- identificação e período da fonte;
- granularidade e chave;
- análises solicitadas;
- análises adicionais possíveis;
- análises inviáveis e dados faltantes;
- filtros e dimensões;
- indicadores e fórmulas;
- gráficos, mapas e tabelas;
- riscos de privacidade e qualidade;
- critérios de aceite e roteiro de homologação.
