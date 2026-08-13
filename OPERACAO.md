# Operação e atualização dos dados

## Pré-requisitos

- Python 3.12 ou superior;
- Node.js 22 ou superior;
- CSV exportado do InspectApp conforme `DADOS.md`;
- internet para atualizar a referência geográfica do IBGE.

## Atualizar o snapshot

1. Criar branch a partir de `main`.
2. Executar `python scripts/import_forms.py --input "C:\caminho\formularios_respondidos.csv" --min-year 2022`.
3. Executar `python scripts/enrich_geography.py`.
4. Conferir `quality.json` e `unresolved.json`.
5. Executar `./check.ps1`.
6. Revisar manifesto, totais anuais e campos publicados.
7. Abrir PR. O merge publica pelo GitHub Actions.

A carga substitui integralmente o snapshot anterior; nunca soma o novo CSV ao
JSON existente. Falha de validação ocorre antes da promoção e preserva a versão
pública vigente.
O corte `--min-year 2022` é obrigatório para este módulo. Registros anteriores
permanecem auditáveis como descartados no manifesto, mas não chegam ao painel.

## Rollback

Reverter em nova branch o commit inválido, executar `./check.ps1`, abrir PR e
publicar novamente pelo workflow. Em emergência, reaplicar o último commit
aprovado e disparar manualmente `Checks e GitHub Pages`. Não editar o artefato.

## Atualizar respostas dos formulários

Executar `python scripts/import_responses.py --input <respostas.csv> --catalog <catalogo.xlsx>`, revisar manifesto e qualidade, e então executar `./check.ps1`.
