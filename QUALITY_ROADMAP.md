# Qualidade, arquitetura e fluxo de desenvolvimento

Este arquivo é a fonte de verdade para o fluxo de desenvolvimento do projeto.

## Leitura obrigatória

1. Ler `CODEX_PATHS.toml` antes de planejar ou implementar.
2. Para arquitetura, ler `ESCOPO.md`, `DIRETRIZES.md` e `DECISOES.md`.
3. Para dados, ler `DADOS.md` e o item correspondente em `demandas.md`.
4. Para prioridade, risco, publicação ou rollback, ler `GOVERNANCA.md`.
5. Para mudança funcional ou visual, ler `TESTES.md`.

Em conflito, prevalece: `CODEX_PATHS.toml` para caminhos, este arquivo para
workflow, `GOVERNANCA.md` para gates e riscos, e `demandas.md` para escopo do
item.

## Fluxo de trabalho

- manter `main` sempre publicável;
- usar branch própria para mudanças funcionais, preferencialmente com prefixos
  `feature/`, `fix/`, `chore/` ou `docs/`;
- implementar uma demanda ou correção lógica por vez;
- não misturar atualização de dados com refatoração ampla sem necessidade;
- executar o script oficial `./check.ps1` antes de commit ou publicação;
- registrar testes executados e resultado na entrega;
- publicar por GitHub Actions, sem editar manualmente o conteúdo implantado;
- validar a URL pública após o workflow concluir.

## Pull requests

O corpo do PR deve conter:

- Contexto: por que a mudança é necessária.
- Resumo: o que foi alterado.
- Escopo: módulos e áreas afetadas.
- Dados: planilha/contrato usado, quando aplicável.
- Checks: comando exato e resultado.
- Testes: testes adicionados/alterados e como executar.
- Riscos e plano de rollback.

## Definition of Done

- demanda e critérios de aceite atualizados;
- contrato de dados atualizado quando necessário;
- cálculos centralizados e testados;
- componentes responsivos e acessíveis;
- reconciliação com a fonte concluída;
- nenhum dado proibido no artefato público;
- checks e build aprovados;
- validação manual proporcional ao risco concluída;
- documentação afetada atualizada;
- publicação e smoke test concluídos quando fizerem parte da entrega.

## Roadmap técnico inicial

1. Bootstrap React/TypeScript/Vite e identidade visual.
2. Pipeline Python, contratos e dados demonstrativos.
3. Componentes compartilhados de filtros, indicadores e estados.
4. Panorama executivo.
5. Primeiro módulo definido por planilha real.
6. Mapas e componentes geográficos.
7. Automação de build, checks e GitHub Pages.
8. Evolução incremental conforme `demandas.md`.
