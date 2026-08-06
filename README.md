# Painéis InspectApp — SEST SENAT

Site estático de painéis analíticos construídos a partir de dados sumarizados
exportados do InspectApp.

## Documentação

- [Escopo](ESCOPO.md)
- [Diretrizes técnicas](DIRETRIZES.md)
- [Contrato e tratamento dos dados](DADOS.md)
- [Backlog de entregas](demandas.md)
- [Governança](GOVERNANCA.md)
- [Qualidade e fluxo de desenvolvimento](QUALITY_ROADMAP.md)
- [Estratégia de testes](TESTES.md)
- [Registro de decisões](DECISOES.md)
- [Operação e atualização](OPERACAO.md)
- [Roteiro de homologação](ROTEIRO_HOMOLOGACAO.md)

## Publicação

Destino previsto: `https://bassissoares.github.io/SestSenat/`.

O GitHub Pages hospedará somente o site estático gerado. As planilhas serão
validadas e convertidas em JSON/GeoJSON antes do build e não serão processadas
no navegador.

## Desenvolvimento

```powershell
npm ci
./check.ps1
npm run preview
```

O merge em `main` executa testes, gera o build com a base `/SestSenat/` e
publica exclusivamente pelo GitHub Actions.
