# Roteiro funcional de homologação

## Identificação

- Módulo: Formulários respondidos.
- Snapshot: `b7ef33b912a56c3c`.
- Período: janeiro/2025 a dezembro/2026.
- Baseline: 2.459 agrupamentos e 507.741 respostas.

## Sequência principal

1. Abrir a URL pública e confirmar 507.741 respostas, 29 formulários, 18 conselhos, 140 unidades e 350 responsáveis.
2. Confirmar mapa nacional sem filtro obrigatório e 138 cidades.
3. Selecionar cidade e confirmar chips e atualização de todos os componentes.
4. Usar `Voltar nível` e confirmar o contexto anterior.
5. Selecionar `Participação` e confirmar composição total de 100%.
6. Selecionar formulário pela alternativa do gráfico e confirmar tabela.
7. No ranking de unidades, pesquisar uma unidade e clicar `Analisar`.
8. Exportar CSV e conferir somente o recorte pesquisado.
9. `Limpar filtros` deve restaurar o total geral.
10. Repetir passos essenciais em 390×844.

## Casos negativos e regressão

- Tiles indisponíveis não podem bloquear gráficos, filtros e tabelas.
- Filtros sem dados devem exibir zero sem erro.
- CSV inválido deve falhar e preservar o snapshot anterior.
- URL com filtros deve restaurar o mesmo contexto.
- CSV bruto, IDs de responsáveis e colunas não autorizadas não podem ser publicados.

## Evidência mínima

- URL, commit e workflow;
- resultado de `./check.ps1`;
- capturas desktop e móvel;
- console e rede sem erro relevante;
- esperado e obtido por passo, responsável e data.
