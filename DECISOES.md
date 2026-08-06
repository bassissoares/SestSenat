# Registro de decisões

## DEC-001 — Aplicação estática no GitHub Pages

- Status: aprovada.
- Decisão: publicar o dashboard como aplicação estática no repositório
  `bassissoares/SestSenat`.
- Motivo: não há autenticação nem necessidade de backend em tempo de execução.
- Consequência: somente dados autorizados para exposição pública podem compor o
  artefato publicado.

## DEC-002 — Processamento de planilhas antes do build

- Status: aprovada.
- Decisão: usar Python para validar e transformar XLSX/CSV em JSON/GeoJSON.
- Motivo: garantir desempenho, contrato, rastreabilidade e controle de campos.
- Consequência: o GitHub Pages não executará Python; toda atualização de dados
  exige nova geração e publicação.

## DEC-003 — Stack inicial do frontend

- Status: aprovada para bootstrap, sujeita a validação no primeiro módulo.
- Decisão: React, TypeScript, Vite, Apache ECharts e Leaflet.
- Motivo: componentes reutilizáveis, boa cobertura de visualizações e suporte a
  build estático.
- Consequência: configurar base `/SestSenat/` e rotas compatíveis com GitHub
  Pages.

## DEC-004 — Desenvolvimento orientado pelas planilhas

- Status: aprovada.
- Decisão: cada módulo nasce de uma planilha real e das análises propostas.
- Motivo: evitar indicadores sem suporte nos dados.
- Consequência: antes da implementação será emitida avaliação de viabilidade,
  qualidade, privacidade, filtros, cálculos e visualizações possíveis.

## DEC-005 — Visão geral como estado inicial

- Status: aprovada.
- Decisão: abrir cada módulo considerando todos os anos e meses disponíveis.
- Motivo: reduzir cliques e entregar panorama imediato.
- Consequência: filtros temporais serão refinamentos opcionais e a interface
  mostrará claramente o período integral selecionado.

## DEC-006 — Componentes analíticos coordenados

- Status: aprovada.
- Decisão: mapa, gráficos, cards, rankings e tabelas compartilharão um único
  estado de filtros, com drill-down, drill-up, chips e breadcrumb.
- Motivo: permitir exploração sem formulários repetitivos ou navegação quebrada.
- Consequência: todos os componentes devem publicar e consumir seleções por
  dimensões canônicas, sem manter filtros locais contraditórios.

## DEC-007 — Geolocalização aproximada por município

- Status: aprovada.
- Decisão: relacionar município/UF extraídos da unidade com a malha oficial do
  IBGE e usar o centroide municipal quando não existir coordenada oficial.
- Motivo: viabilizar o mapa inicial sem inventar endereço da unidade.
- Consequência: a interface informará que o ponto é aproximado; registros sem
  correspondência permanecem nos totais.

## DEC-008 — Identidade visual do SEST SENAT

- Status: aprovada como baseline inicial.
- Decisão: derivar tipografia e paleta do site oficial, com Khand, Open Sans,
  azuis institucionais e destaques amarelo/verde.
- Motivo: manter reconhecimento visual e coerência com o cliente.
- Consequência: logotipo e tokens finais devem ser revistos se o manual oficial
  de marca for disponibilizado.

## DEC-009 — Atualização por snapshot CSV completo

- Status: aprovada.
- Decisão: cada nova planilha completa substitui logicamente o snapshot anterior
  após validação, reconciliação e geração atômica dos dados públicos.
- Motivo: permitir atualização de 2021 em diante sem duplicidade e sem alteração
  manual de código ou períodos.
- Consequência: o pipeline não acumula arquivos automaticamente; falhas mantêm o
  último snapshot aprovado e o CSV bruto não integra o site público.
