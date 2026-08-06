# Governança do projeto

## Critérios para publicação

Uma entrega só pode ser publicada quando cumprir todos os gates.

### Dados

- contrato da planilha documentado;
- origem, período e data da atualização identificados;
- validações obrigatórias aprovadas;
- nenhum dado pessoal ou confidencial não autorizado;
- totais reconciliados com a planilha de origem;
- limitações e lacunas conhecidas registradas.

### Produto

- pergunta de negócio de cada indicador e gráfico documentada;
- filtros e cálculos consistentes entre cards, gráficos, tabelas e mapas;
- estados vazio, carregando e erro implementados;
- layout responsivo e navegação compreensível;
- fonte e período visíveis ao usuário.

### Qualidade técnica

- script oficial de checks aprovado;
- testes do pipeline e dos cálculos aprovados;
- build de produção concluído;
- ausência de erro relevante no console do navegador;
- validação local usando a base `/SestSenat/`;
- smoke test concluído na URL publicada.

## Priorização

1. Segurança e qualidade dos dados.
2. Correção e rastreabilidade dos indicadores.
3. Panorama executivo e filtros comuns.
4. Módulos com maior valor para decisão do cliente.
5. Otimizações e visualizações avançadas.

## Riscos e rollback

| Risco | Controle | Rollback |
|---|---|---|
| Exposição de dado sensível | allowlist de colunas e revisão antes do deploy | restaurar publicação anterior e remover artefato |
| Indicador incorreto | cálculo testado e reconciliação com origem | voltar ao JSON e código da versão anterior |
| Arquivo incompatível | validação bloqueante por contrato | manter dados publicados anteriormente |
| Regressão no GitHub Pages | build e smoke test com base correta | republicar o último artefato aprovado |
| Provedor de mapa indisponível | tratamento de erro e painel independente | ocultar camada externa sem afetar análises |
| Volume excessivo | agregação e carga por módulo | retirar detalhe e manter visão sumarizada |

## Métricas do produto

- tempo de carregamento do módulo;
- percentual de registros válidos e publicados;
- completude dos campos necessários aos indicadores;
- divergência entre totais de origem e painel;
- quantidade de módulos homologados;
- quantidade de análises bloqueadas por falta de dados;
- resultado dos testes de responsividade e acessibilidade.

## Homologação

Cada módulo deve ser homologado com planilha identificada, roteiro executado,
resultado esperado, resultado obtido e evidência mínima. A homologação de um
módulo não valida automaticamente os módulos seguintes.
