import type { EChartsCoreOption } from "echarts/core";
import { EChart } from "./EChart";
import type { ResponseDimensions } from "../types/responses";
import {
  percentage,
  percentagePointChange,
  previousMean,
  responseBlock,
  sumRows,
  type ResponsePeriodicity,
} from "../data/responseAnalytics";

type Props = {
  facts: number[][];
  questionScopeFacts: number[][];
  profiles: number[][];
  denominators: number[][];
  dimensions: ResponseDimensions;
  denominator: number;
  periodicity: ResponsePeriodicity;
  demographicFiltered: boolean;
  formName?: string;
  questionLabel?: string;
};

const format = (value: number, digits = 1) =>
  value.toLocaleString("pt-BR", { maximumFractionDigits: digits });

export function ResponseProfileAnalysis({
  facts,
  questionScopeFacts,
  profiles,
  denominators,
  dimensions,
  denominator,
  periodicity,
  demographicFiltered,
  formName,
  questionLabel,
}: Props) {
  const eligibleKeys = new Set(
    questionScopeFacts.map((row) => `${row[0]}|${row[1]}|${row[2]}`),
  );
  const isEligible = (row: number[]) =>
    eligibleKeys.has(`${row[0]}|${row[1]}|${row[2]}`);
  const eligibleDenominators = questionLabel
    ? denominators.filter(isEligible)
    : denominators;
  const eligibleProfiles = questionLabel
    ? profiles.filter(isEligible)
    : profiles;
  const eligibleTotal = sumRows(eligibleDenominators, 6);
  const profileTotal = sumRows(eligibleProfiles, 9);
  const analysisBase = demographicFiltered ? profileTotal : eligibleTotal;
  const questionTypes = new Set(
    questionScopeFacts.map((row) => dimensions.questions[row[9]]?.type ?? ""),
  );
  const isMultiple = [...questionTypes].some((type) =>
    type.toLocaleLowerCase("pt-BR").includes("múltipla"),
  );

  const optionMap = new Map<
    string,
    { total: number; sex: Map<string, number>; age: Map<string, number> }
  >();
  facts.forEach((row) => {
    const label = dimensions.options[row[11]].label;
    const item = optionMap.get(label) ?? {
      total: 0,
      sex: new Map(),
      age: new Map(),
    };
    item.total += row[12];
    item.sex.set(
      dimensions.sexes[row[6]],
      (item.sex.get(dimensions.sexes[row[6]]) ?? 0) + row[12],
    );
    item.age.set(
      dimensions.ageBands[row[7]],
      (item.age.get(dimensions.ageBands[row[7]]) ?? 0) + row[12],
    );
    optionMap.set(label, item);
  });
  const options = [...optionMap]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15);
  const selections = options.reduce((sum, [, item]) => sum + item.total, 0);

  const sexDenominators = new Map<string, number>();
  const ageDenominators = new Map<string, number>();
  eligibleProfiles.forEach((row) => {
    const sex = dimensions.sexes[row[6]],
      age = dimensions.ageBands[row[7]];
    sexDenominators.set(sex, (sexDenominators.get(sex) ?? 0) + row[9]);
    ageDenominators.set(age, (ageDenominators.get(age) ?? 0) + row[9]);
  });

  const sexColors: Record<string, string> = {
    Feminino: "#A85FA8",
    Masculino: "#2E72E0",
  };
  const bubble: EChartsCoreOption = {
    tooltip: {
      formatter: (raw: unknown) => {
        const p = raw as { seriesName: string; name: string; value: number[] };
        return `<b>${p.name}</b><br>${p.seriesName}: ${format(p.value[2], 0)} seleções<br>${format(p.value[0])}% dentro do perfil`;
      },
    },
    legend: { top: 0 },
    grid: { left: 190, right: 30, top: 45, bottom: 45 },
    xAxis: {
      type: "value",
      name: "% dentro do sexo",
      axisLabel: { formatter: "{value}%" },
    },
    yAxis: { type: "category", data: options.map((item) => item[0]).reverse() },
    series: dimensions.sexes.map((sex) => ({
      name: sex,
      type: "scatter",
      itemStyle: { color: sexColors[sex] ?? "#5B8FA3", opacity: 0.82 },
      data: options.map(([name, item]) => {
        const quantity = item.sex.get(sex) ?? 0,
          base = sexDenominators.get(sex) ?? 0;
        return {
          name,
          value: [percentage(quantity, base), name, quantity],
          symbolSize: Math.max(10, Math.min(54, Math.sqrt(quantity) / 3)),
        };
      }),
    })),
  };

  const heatData: number[][] = [];
  options.forEach(([, item], y) =>
    dimensions.ageBands.forEach((age, x) =>
      heatData.push([
        x,
        y,
        percentage(item.age.get(age) ?? 0, ageDenominators.get(age) ?? 0),
      ]),
    ),
  );
  const heat: EChartsCoreOption = {
    tooltip: {
      formatter: (raw: unknown) => {
        const p = raw as { value: number[] };
        return `${options[p.value[1]]?.[0]}<br>${dimensions.ageBands[p.value[0]]}: <b>${format(p.value[2])}%</b>`;
      },
    },
    grid: { left: 190, right: 30, top: 20, bottom: 75 },
    xAxis: {
      type: "category",
      data: dimensions.ageBands,
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: "category", data: options.map((item) => item[0]) },
    visualMap: {
      min: 0,
      max: Math.max(...heatData.map((item) => item[2]), 1),
      orient: "horizontal",
      left: "center",
      bottom: 5,
      inRange: { color: ["#E8F5FC", "#20AAEE", "#003770"] },
    },
    series: [{ type: "heatmap", data: heatData, label: { show: false } }],
  };

  const periodMap = new Map<
    string,
    { label: string; selections: number; eligible: number }
  >();
  facts.forEach((row) => {
    const block = responseBlock(row, periodicity),
      item = periodMap.get(block.key) ?? {
        label: block.label,
        selections: 0,
        eligible: 0,
      };
    item.selections += row[12];
    periodMap.set(block.key, item);
  });
  eligibleDenominators.forEach((row) => {
    const block = responseBlock(row, periodicity),
      item = periodMap.get(block.key) ?? {
        label: block.label,
        selections: 0,
        eligible: 0,
      };
    item.eligible += row[6];
    periodMap.set(block.key, item);
  });
  const periods = [...periodMap]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, item]) => ({
      ...item,
      rate: isMultiple
        ? item.selections / Math.max(item.eligible, 1)
        : percentage(item.selections, item.eligible),
    }));
  const rates = periods.map((item) => item.rate),
    historicalRate = previousMean(rates),
    latest = periods.at(-1),
    delta = latest ? percentagePointChange(latest.rate, historicalRate) : null;
  const timeline: EChartsCoreOption = {
    tooltip: { trigger: "axis" },
    legend: { top: 0 },
    grid: { left: 65, right: 65, top: 45, bottom: 45 },
    xAxis: { type: "category", data: periods.map((item) => item.label) },
    yAxis: [
      {
        type: "value",
        name: isMultiple ? "opções/formulário" : "cobertura (%)",
        axisLabel: { formatter: isMultiple ? "{value}" : "{value}%" },
      },
      { type: "value", name: "volume" },
    ],
    series: [
      {
        name: isMultiple ? "Opções por elegível" : "Cobertura",
        type: "line",
        smooth: true,
        data: periods.map((item) => Number(item.rate.toFixed(2))),
        itemStyle: { color: "#068E3A" },
      },
      {
        name: "Formulários elegíveis",
        type: "bar",
        yAxisIndex: 1,
        data: periods.map((item) => item.eligible),
        itemStyle: { color: "#B9DCEB" },
      },
    ],
  };

  const councilRows = dimensions.councils
    .map((label, index) => {
      const value = sumRows(
          facts.filter((row) => row[3] === index),
          12,
        ),
        base = sumRows(
          eligibleDenominators.filter((row) => row[3] === index),
          6,
        );
      return {
        label,
        value,
        base,
        rate: isMultiple ? value / Math.max(base, 1) : percentage(value, base),
      };
    })
    .filter((item) => item.value)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 15);
  const territory: EChartsCoreOption = {
    tooltip: {
      formatter: (raw: unknown) => {
        const p = raw as {
          name: string;
          data: { value: number; base: number };
        };
        return `${p.name}<br><b>${format(p.data.value)}${isMultiple ? " opções/elegível" : "%"}</b><br>Base: ${format(p.data.base, 0)} formulários elegíveis`;
      },
    },
    grid: { left: 95, right: 30, top: 15, bottom: 35 },
    xAxis: {
      type: "value",
      name: isMultiple ? "opções por elegível" : "% de cobertura",
    },
    yAxis: {
      type: "category",
      data: councilRows.map((item) => item.label).reverse(),
    },
    series: [
      {
        type: "bar",
        data: councilRows
          .map((item) => ({
            value: Number(item.rate.toFixed(2)),
            base: item.base,
          }))
          .reverse(),
        itemStyle: { color: "#2E72E0", borderRadius: [0, 6, 6, 0] },
      },
    ],
  };

  const top = options[0],
    second = options[1],
    topAge = [...ageDenominators].sort((a, b) => b[1] - a[1])[0],
    missingAge = ageDenominators.get("Não informada") ?? 0,
    missingAgeRate = percentage(missingAge, profileTotal),
    coverage = percentage(profileTotal, eligibleTotal || denominator);
  return (
    <>
      <section className="insight-panel" aria-labelledby="insight-title">
        <p className="eyebrow">LEITURA DO RECORTE</p>
        <h2 id="insight-title">Síntese automática</h2>
        <div className="insight-grid">
          <p>
            {formName ? (
              <>
                No formulário <strong>{formName}</strong>,{" "}
              </>
            ) : (
              <>No contexto atual, </>
            )}
            há <strong>{format(eligibleTotal || denominator, 0)}</strong>{" "}
            formulários {questionLabel ? "elegíveis" : "respondidos"} e{" "}
            <strong>{format(profileTotal, 0)}</strong> com perfil, cobertura de{" "}
            <strong>{format(coverage)}%</strong>.
          </p>
          {questionLabel && top && (
            <p>
              Em <strong>{questionLabel}</strong>, a opção líder é{" "}
              <strong>{top[0]}</strong>: {format(top[1].total, 0)} seleções,
              equivalentes a{" "}
              <strong>{format(percentage(top[1].total, analysisBase))}%</strong>{" "}
              da base aplicável
              {second
                ? ` e ${format(top[1].total - second[1].total, 0)} seleções acima da segunda opção`
                : ""}
              .
            </p>
          )}
          {questionLabel && (
            <p>
              {isMultiple ? (
                <>
                  A pergunta aceita múltiplas escolhas e registra{" "}
                  <strong>
                    {format(percentage(selections, analysisBase) / 100, 2)}
                  </strong>{" "}
                  opções por formulário elegível.
                </>
              ) : (
                <>
                  A cobertura estimada da pergunta é de{" "}
                  <strong>
                    {format(percentage(selections, analysisBase))}%
                  </strong>
                  .
                </>
              )}
            </p>
          )}
          {latest && delta !== null && (
            <p>
              No último período completo, o indicador foi{" "}
              <strong>
                {format(latest.rate)}
                {isMultiple ? " opções por elegível" : "%"}
              </strong>, variação de{" "}
              <strong>
                {delta >= 0 ? "+" : ""}
                {format(delta)} {isMultiple ? "opções/elegível" : "p.p."}
              </strong>{" "}
              contra a média dos períodos anteriores.
            </p>
          )}
          {topAge && (
            <p>
              A faixa etária mais representada é <strong>{topAge[0]}</strong>.
              Idade não informada corresponde a{" "}
              <strong>{format(missingAgeRate)}%</strong> dos perfis e limita
              comparações etárias.
            </p>
          )}
        </div>
        <small>
          Leitura descritiva. Percentuais usam formulários elegíveis; múltipla
          seleção pode superar 100% quando somada.
        </small>
      </section>
      {questionLabel && (
        <section className="analytics-section">
          <header className="panel-heading">
            <div>
              <p className="eyebrow">DESEMPENHO DA QUESTÃO</p>
              <h2>Percentuais, período e perfil</h2>
            </div>
            <span className="panel-note">
              Base elegível: {format(analysisBase, 0)} formulários.
            </span>
          </header>
          <div className="kpi-grid response-kpis">
            <article>
              <span>Formulários elegíveis</span>
              <strong>{format(eligibleTotal, 0)}</strong>
            </article>
            <article>
              <span>Seleções</span>
              <strong>{format(selections, 0)}</strong>
            </article>
            <article>
              <span>
                {isMultiple ? "Opções por elegível" : "Cobertura estimada"}
              </span>
              <strong>
                {isMultiple
                  ? format(selections / Math.max(analysisBase, 1), 2)
                  : `${format(percentage(selections, analysisBase))}%`}
              </strong>
            </article>
            <article>
              <span>Variação no último período</span>
              <strong>
                {delta === null
                  ? "Base inicial"
                  : `${delta >= 0 ? "+" : ""}${format(delta)} ${isMultiple ? "opções/elegível" : "p.p."}`}
              </strong>
            </article>
          </div>
          <div className="chart-grid">
            <article className="chart-card chart-wide">
              <h3>Evolução por período completo</h3>
              <EChart
                ariaLabel="Evolução percentual da questão"
                option={timeline}
              />
            </article>
            <article className="chart-card chart-wide">
              <h3>Comparação proporcional por conselho</h3>
              <EChart
                ariaLabel="Percentual da questão por conselho"
                option={territory}
              />
            </article>
            <article className="chart-card chart-wide">
              <h3>Bolhas pareadas por sexo</h3>
              <EChart
                ariaLabel="Comparação das opções por sexo"
                option={bubble}
              />
            </article>
            <article className="chart-card chart-wide heatmap-card">
              <h3>Percentual das opções por faixa etária</h3>
              <EChart ariaLabel="Opções por faixa etária" option={heat} />
            </article>
          </div>
        </section>
      )}
    </>
  );
}
