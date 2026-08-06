# Contrato e tratamento dos dados

## Fluxo oficial

1. Receber a planilha e registrar módulo, origem, período e responsável.
2. Preservar o arquivo recebido fora do conteúdo público do site.
3. Inventariar abas, colunas, tipos, volume e chaves disponíveis.
4. Avaliar as análises solicitadas e documentar sua viabilidade.
5. Validar campos obrigatórios, formatos e domínios.
6. Normalizar datas, textos, identificadores, status e coordenadas.
7. Remover ou agregar dados pessoais e confidenciais.
8. Calcular indicadores reproduzíveis.
9. Gerar JSON/GeoJSON por módulo e um relatório de validação.
10. Executar testes, build e validação visual antes da publicação.

## Atualização recorrente por CSV

- o pipeline deve receber o caminho do CSV por parâmetro, sem depender de nome
  ou pasta pessoal fixa;
- a entrada padrão será um snapshot completo, substituindo logicamente a carga
  anterior somente depois de todas as validações;
- anos, meses, formulários, conselhos, unidades e responsáveis devem ser
  descobertos nos dados, sem listas ou períodos fixos no código;
- o mesmo contrato deve aceitar o histórico completo desde 2021 e anos futuros;
- a ordem das dez colunas permanece fixa enquanto o arquivo não tiver cabeçalho;
- o pipeline pode aceitar cabeçalho opcional, desde que valide exatamente os
  nomes canônicos antes de processar;
- o CSV bruto deve permanecer fora da pasta pública e não deve ser incluído no
  artefato do GitHub Pages;
- os JSON/GeoJSON novos devem ser gerados em área temporária e promovidos de
  forma atômica após reconciliação;
- em caso de erro, os dados públicos anteriores devem permanecer intactos;
- cada carga deve registrar hash do arquivo, horário, período, contagens e versão
  do contrato no manifesto;
- a publicação deve mostrar a data da carga e o período efetivamente disponível.

### Política de substituição

O CSV completo é a fonte de verdade do snapshot. A atualização não deve somar o
novo arquivo ao anterior, pois isso duplicaria os agrupamentos históricos. Para
uma futura carga incremental será necessário criar contrato próprio com chave,
operação e estratégia explícita de merge.

## Regra de publicação

Somente colunas explicitamente permitidas podem entrar nos arquivos públicos.
Colunas desconhecidas não devem ser copiadas automaticamente. A geração deve
falhar quando houver quebra de contrato, campo obrigatório ausente ou risco de
exposição não resolvido.

## Dados proibidos no site público

- CPF, CNPJ individual, e-mail e telefone;
- credenciais, tokens, chaves e URLs privadas;
- respostas abertas com conteúdo pessoal ou confidencial;
- fotografias, assinaturas e evidências não autorizadas;
- coordenadas que identifiquem pessoa ou instalação sensível;
- identificadores internos que permitam reidentificação indevida.

## Saídas mínimas do pipeline

- `manifest.json`: versão, módulo, período, geração, origem e contagens;
- arquivos JSON de indicadores e dimensões;
- GeoJSON quando houver visualização espacial;
- relatório de validação com erros, alertas e registros descartados;
- resumo de qualidade com completude, duplicidade e cobertura.

## Contrato do manifesto

Campos mínimos:

| Campo | Tipo | Descrição |
|---|---|---|
| `schemaVersion` | string | Versão do contrato gerado |
| `module` | string | Identificador do módulo |
| `generatedAt` | datetime ISO 8601 | Data/hora de geração |
| `periodStart` | date ou null | Início da cobertura |
| `periodEnd` | date ou null | Fim da cobertura |
| `sourceLabel` | string | Descrição pública da origem |
| `inputRows` | integer | Registros recebidos |
| `publishedRows` | integer | Registros publicados |
| `discardedRows` | integer | Registros descartados |
| `warnings` | integer | Quantidade de alertas |

## Avaliação de uma nova planilha

Para cada envio devem ser respondidas estas perguntas:

- quais indicadores são calculáveis;
- quais análises sugeridas não possuem dados suficientes;
- quais dimensões podem ser cruzadas com segurança;
- qual é a granularidade real de cada linha;
- qual campo funciona como chave e se ele é confiável;
- quais filtros são úteis;
- quais mapas são possíveis e qual a qualidade das coordenadas;
- quais dados precisam ser anonimizados ou excluídos;
- qual será o impacto do volume no carregamento.

## Contrato MOD-01 — Formulários respondidos

Fonte inicial: `formularios_respondidos.csv`, snapshot de 06/08/2026.

Granularidade: uma linha por ano, mês, formulário, conselho, unidade e
responsável, contendo a quantidade agregada de formulários respondidos.

O arquivo recebido não possui cabeçalho. O pipeline deve aplicar e validar esta
ordem fixa:

| Posição | Campo | Tipo | Regra |
|---:|---|---|---|
| 1 | `ano` | inteiro | ano de referência |
| 2 | `mes` | inteiro | valor entre 1 e 12 |
| 3 | `formulario_id` | inteiro | chave do formulário |
| 4 | `formulario_nome` | texto | nome público do formulário |
| 5 | `conselho` | texto | conselho regional |
| 6 | `unidade_resumida` | texto | código e conselho/UF |
| 7 | `unidade_detalhe` | texto opcional | IdUnidade, nome, situação, conselho e UF |
| 8 | `responsavel_id` | inteiro | chave interna; não exibir na interface |
| 9 | `responsavel_nome` | texto | nome autorizado para ranking público |
| 10 | `quantidade` | inteiro positivo | formulários respondidos no agrupamento |

### Baseline do snapshot

- 2.459 agrupamentos;
- 507.741 formulários respondidos;
- 335.072 em 2025;
- 172.669 em 2026;
- 29 formulários;
- 18 conselhos;
- 140 unidades resumidas;
- 350 responsáveis;
- 9 agrupamentos sem detalhe completo da unidade;
- nenhuma duplicidade na chave das nove dimensões;
- nenhuma quantidade zero, negativa ou fracionária.

Esse baseline serve para reconciliar o arquivo atual, mas não pode ser usado
como limite fixo. Novas cargas podem adicionar anos, meses, dimensões e volume.

### Agregação temporal

- a periodicidade apenas agrupa os fatos existentes; não altera o total do contexto filtrado;
- bimestres, trimestres e semestres seguem períodos civis iniciados em janeiro;
- a curva acumulada soma cronologicamente os períodos e deve terminar no total do agrupamento;
- o drill de um período agregado aplica todos os meses que compõem aquele intervalo.

### Enriquecimento geográfico

- extrair município e UF de `unidade_detalhe`;
- normalizar nomes e relacionar com a malha municipal oficial do IBGE;
- usar centroide municipal como localização aproximada quando não houver
  coordenada oficial da unidade;
- manter tabela de correspondências e exceções versionada;
- não tratar o centroide municipal como endereço físico da unidade;
- agrupamentos sem detalhe geográfico permanecem nos totais e aparecem como
  `Localização não identificada`.

### Tipo de unidade

- o tipo é o prefixo alfabético de `unidade_resumida` imediatamente anterior ao número;
- prefixos compostos, como `DN` e `CN`, constituem um único tipo;
- unidade sem o padrão prefixo + número recebe `Não identificado`;
- o tipo integra fatos, dimensões, filtros, ranking e codificação de cores do mapa;
- quando uma cidade possuir mais de um tipo, a bolha usa a cor do tipo com maior
  quantidade de formulários respondidos e o tooltip apresenta toda a composição.

### Terminologia

O único fato disponível é `quantidade de formulários respondidos`. A interface
não deve chamar esse valor de `enviados`, `concluídos`, `atendimentos` ou
`pessoas atendidas` sem novo dado ou definição formal que sustente o termo.
