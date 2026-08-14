# Metas — Análise de respostas dos formulários

## Objetivo

Disponibilizar uma análise coordenada das respostas, mantendo o padrão visual e operacional aprovado no módulo de formulários respondidos.

## Acompanhamento

- [x] Validar o CSV de respostas e o catálogo de questões.
- [x] Definir sexo e faixa etária como dimensões transversais.
- [x] Classificar idade como válida, não informada ou inválida.
- [x] Criar questão agregada; quando não houver equivalência, usar a própria questão.
- [x] Gerar JSON compacto e compatível com GitHub Pages.
- [x] Particionar fatos por competência para suportar cargas maiores.
- [x] Reconciliar denominadores com a base de formulários respondidos.
- [x] Calcular percentual de opções sobre formulários respondidos.
- [x] Disponibilizar barras e bolhas para análise das opções.
- [x] Fixar questão/formulário em mapa por cidade, conselho e unidade.
- [x] Deduplicar formulários com perfil antes das análises de sexo e idade.
- [x] Exibir sexo e faixa etária de todas as opções ao fixar uma questão.
- [x] Bloquear competências incompletas conforme a periodicidade.
- [x] Manter filtros visíveis durante a rolagem e removíveis individualmente.
- [x] Exibir bolhas pareadas por sexo, comparando taxa e volume por opção.
- [x] Exibir heatmap de opções por faixa etária.
- [x] Exibir contexto flutuante específico da análise de respostas.
- [x] Identificar filtros ativos com rótulos legíveis e remoção independente.
- [x] Gerar leitura textual descritiva e auditável do recorte selecionado.
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
