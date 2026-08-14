# Estratégia de testes

## Pipeline de dados

- leitura das planilhas suportadas;
- rejeição de aba ou coluna obrigatória ausente;
- conversão consistente de datas, números e percentuais;
- normalização de status e dimensões;
- detecção de chave duplicada;
- validação de latitude e longitude;
- bloqueio de colunas e conteúdos proibidos;
- totais de entrada, descarte e publicação;
- geração válida do manifesto, JSON e GeoJSON;
- execução repetida com a mesma entrada produzindo o mesmo resultado lógico.

## Cálculos

- denominadores e percentuais;
- comparação com período anterior;
- heatmap mensal por agrupamento e drill de célula para período + dimensão;
- agrupamento temporal;
- tratamento de valores ausentes;
- filtros combinados;
- arredondamento e unidades;
- reconciliação com casos conhecidos da planilha.

## Interface

- abertura direta de cada rota no GitHub Pages;
- aplicação e limpeza dos filtros;
- consistência entre card, gráfico, mapa e tabela;
- tooltip, legenda e rótulos;
- estados carregando, vazio e erro;
- responsividade em celular, tablet e desktop;
- teclado, foco, contraste e texto alternativo;
- exportação quando disponível.

## Interação coordenada e navegação analítica

- abertura inicial apresenta todos os anos e meses sem ação do usuário;
- mapa está visível na primeira área analítica da página em desktop;
- seleção de cidade atualiza cards, gráficos, rankings e tabela;
- seleção de formulário, conselho, unidade ou responsável atualiza todas as visões;
- tipo de unidade filtra todas as visões e possui ranking próprio;
- ranking de responsável apresenta todas as unidades vinculadas sem perder casos multiunidade;
- tabela reflete filtros originados nos gráficos e no mapa;
- drill-down segue a hierarquia definida para a visualização;
- drill-up pelo breadcrumb restaura exatamente o nível anterior;
- chips identificam todos os filtros ativos e podem ser removidos individualmente;
- após a rolagem, o resumo flutuante reflete intervalo, periodicidade, nível,
  total e dimensões filtradas sem encobrir a análise em telas menores;
- `Limpar filtros` restaura totais e seleções da visão geral;
- alternar visualização não perde o contexto atual;
- alternar entre mensal, bimestral, trimestral, semestral e anual preserva o total filtrado;
- ano/mês inicial e final formam um intervalo contínuo, inclusive quando cruza anos;
- abertura inicial termina no último período completo e permite incluir manualmente o período atual;
- no módulo de respostas, períodos incompletos não podem ser selecionados em nenhuma periodicidade;
- sexo e faixa etária reconciliam fatos de perfil deduplicados, sem soma entre questões;
- questão fixada mostra simultaneamente todas as opções cruzadas por sexo e faixa etária;
- barra de filtros permanece acessível na rolagem e remove chips individualmente sem limpar os demais;
- período parcial gera alerta no contexto principal, nas análises e no resumo flutuante;
- glossário abre e fecha por controle acessível, e a data da carga corresponde ao manifesto;
- série, heatmap, variação dos rankings e curva acumulada usam a mesma periodicidade;
- rankings comparam o último período à média de todos os anteriores e não às extremidades do intervalo;
- curva acumulada é monotônica e termina no total de cada agrupamento comparado;
- gráfico de bolhas usa a média de todos os períodos anteriores e o último período
  completo disponível na periodicidade selecionada;
- tabela e gráfico de desempenho reconciliam total, média dos períodos anteriores,
  diferença absoluta, variação percentual e situação de cada período;
- estado vazio indica qual combinação de filtros não possui dados;
- teclado e leitor de tela conseguem acionar filtros e consultar alternativas
  textuais aos gráficos.

## Mapas

- coordenadas válidas e inválidas;
- clusterização e enquadramento;
- filtros refletidos nos pontos e totais;
- ausência de coordenadas;
- indisponibilidade do mapa-base;
- proteção de localização sensível.
- correspondência município/UF validada contra referência oficial;
- centroide municipal identificado como posição aproximada;
- registros sem localização continuam contabilizados nos totais;
- seleção e drill-down do mapa reconciliam com tabela e gráficos.
- cor da bolha corresponde ao tipo predominante e o hover exibe dados e composição por tipo.
- intensidade azul de cada UF acompanha proporcionalmente o volume do recorte filtrado.
- clique na legenda destaca o tipo selecionado, reduz a opacidade dos demais e o segundo clique restaura o mapa.
- bolhas das cidades permanecem acima do preenchimento estadual após carga, filtro e destaque da legenda.

## Publicação

Roteiro mínimo:

1. Executar o pipeline com conjunto conhecido.
2. Executar `./check.ps1`.
3. Gerar o build de produção.
4. Servir localmente com a base `/SestSenat/`.
5. Validar console, rede, rotas, filtros, gráficos e mapas.
6. Publicar pelo workflow oficial.
7. Abrir `https://bassissoares.github.io/SestSenat/`.
8. Repetir o smoke test na publicação.
9. Registrar versão, planilha, horário e resultado.
