# Escopo do projeto

## Objetivo

Criar painéis analíticos para o cliente SEST SENAT com base em dados
sumarizados exportados do InspectApp. A solução deve apresentar uma visão
geral clara, rápida e responsiva por meio de indicadores, tabelas, gráficos,
mapas e detalhamentos.

## Escopo funcional

- importar dados recebidos em planilhas XLSX ou CSV;
- validar, normalizar, anonimizar e sumarizar os dados antes da publicação;
- disponibilizar filtros globais e filtros específicos por módulo;
- apresentar indicadores, séries temporais, rankings, distribuições e mapas;
- permitir consulta detalhada e exportação dos dados já autorizados;
- informar origem, período de cobertura e data da última atualização;
- construir e publicar os painéis incrementalmente, módulo por módulo.

## Módulos candidatos

Os módulos serão confirmados conforme as planilhas recebidas:

1. Panorama executivo.
2. Inspeções e respostas.
3. Formulários.
4. Clientes, contratos, regionais e unidades.
5. Responsáveis e produtividade.
6. Ordens de serviço e atividades.
7. Processos BPM e etapas.
8. Distribuição e coleta descentralizada.
9. Comunicações e notificações.
10. Planos de ação.
11. Qualidade dos dados.

## Fora de escopo

- autenticação e controle de acesso;
- consulta direta ao banco do InspectApp;
- edição de dados do InspectApp;
- processamento de Python no navegador ou no GitHub Pages;
- publicação de planilhas brutas, dados pessoais ou dados confidenciais;
- análises sem cobertura objetiva nos dados recebidos.

## Referência funcional

O repositório `C:/Projetos/GitHub/inspect_web` pode ser consultado para entender
entidades, nomes, status e relações do InspectApp. Ele é referência funcional,
mas não cria automaticamente um contrato para as planilhas deste projeto.
