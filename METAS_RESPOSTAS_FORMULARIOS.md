# Metas — Análise de respostas dos formulários

## Objetivo

Disponibilizar uma análise coordenada das respostas, mantendo o padrão visual e operacional aprovado no módulo de formulários respondidos.

## Acompanhamento

- [x] Validar o CSV de respostas e o catálogo de questões.
- [x] Definir sexo e faixa etária como dimensões transversais.
- [x] Classificar idade como válida, não informada ou inválida.
- [x] Criar questão agregada; quando não houver equivalência, usar a própria questão.
- [x] Gerar JSON compacto e compatível com GitHub Pages.
- [ ] Homologar filtros, indicadores, gráficos, mapa e tabela com o usuário.
- [ ] Incorporar ajustes identificados na homologação.
- [ ] Publicar a versão homologada no GitHub Pages.

## Critérios de aceite

- filtros coordenados por período, formulário, território, unidade, responsável, sexo, faixa etária, qualidade da idade e questão agregada;
- mapa, indicadores, gráficos e tabela compartilham o mesmo recorte;
- questões equivalentes podem ser analisadas conjuntamente e mantêm rastreabilidade aos códigos originais;
- valores etários inválidos não entram nas faixas válidas;
- totais deixam claro que representam seleções/respostas às questões, e não pessoas ou formulários;
- carga local, testes, build e limites do artefato aprovados.
