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
- `Limpar filtros` restaura totais e seleções da visão geral;
- alternar visualização não perde o contexto atual;
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
