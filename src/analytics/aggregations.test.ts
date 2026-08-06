import { describe, expect, it } from "vitest";
import { aggregateBy, cumulativeComparison, monthlySeries, periodFilterValues, periodKey, periodSeries, sumShares, temporalMatrix, variationAnalysis } from "./aggregations";
import type { Fact } from "../types/dashboard";
const base = { formName: "Form", council: "CR", unitSummary: "B 1", unitType: "B", unitId: 1, unitName: "U", unitStatus: "Ativo", city: "Cidade", state: "SP", geoStatus: "city-detected", responsibleName: "Pessoa" };
const facts: Fact[] = [{ ...base, year: 2025, month: 1, formId: 9, quantity: 30 }, { ...base, year: 2025, month: 2, formId: 12, formName: "Outro", quantity: 70 }];
describe("agregações analíticas", () => {
  it("fecha a participação do contexto em 100%", () => expect(sumShares(aggregateBy(facts, "formId"))).toBeCloseTo(1));
  it("ordena a série mensal cronologicamente", () => expect(monthlySeries(facts).map((item) => item.key)).toEqual(["2025-01", "2025-02"]));
  it("monta heatmap pelo agrupamento escolhido", () => { const matrix = temporalMatrix(facts, "unitType"); expect(matrix.periods).toEqual(["2025-01", "2025-02"]); expect(matrix.groups[0].key).toBe("B"); expect(matrix.cells.reduce((sum, cell) => sum + cell.quantity, 0)).toBe(100); });
  it("agrupa os meses em periodicidades de calendário", () => { expect(periodKey(2025, 2, 2)).toBe("2025 · B1"); expect(periodSeries(facts, 3)).toMatchObject([{ key: "2025 · T1", quantity: 100 }]); });
  it("converte o período agregado nos meses usados pelo drill", () => expect(periodFilterValues("2025 · T2", 3)).toEqual({ year: ["2025"], month: ["4", "5", "6"] }));
  it("gera curvas acumuladas reconciliadas e crescentes", () => { const comparison = cumulativeComparison(facts, "unitType", undefined, 1); expect(comparison.series[0].values).toEqual([30, 100]); expect(comparison.series[0].values.at(-1)).toBe(comparison.groups[0].quantity); });
  it("agrega o heatmap na periodicidade escolhida", () => expect(temporalMatrix(facts, "unitType", undefined, 18, 2).periods).toEqual(["2025 · B1"]));
  it("compara o último período com a média histórica", () => { const analysis = variationAnalysis(facts, "unitType"); expect(analysis).toMatchObject({ historyStart: "2025-01", historyEnd: "2025-01", latestPeriod: "2025-02" }); expect(analysis.points[0]).toMatchObject({ average: 30, latest: 70, variation: 4 / 3 }); });
});
