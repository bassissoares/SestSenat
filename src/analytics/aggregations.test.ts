import { describe, expect, it } from "vitest";
import { aggregateBy, monthlySeries, sumShares } from "./aggregations";
import type { Fact } from "../types/dashboard";
const base = { formName: "Form", council: "CR", unitSummary: "U", unitId: 1, unitName: "U", unitStatus: "Ativo", city: "Cidade", state: "SP", geoStatus: "city-detected", responsibleName: "Pessoa" };
const facts: Fact[] = [{ ...base, year: 2025, month: 1, formId: 9, quantity: 30 }, { ...base, year: 2025, month: 2, formId: 12, formName: "Outro", quantity: 70 }];
describe("agregações analíticas", () => {
  it("fecha a participação do contexto em 100%", () => expect(sumShares(aggregateBy(facts, "formId"))).toBeCloseTo(1));
  it("ordena a série mensal cronologicamente", () => expect(monthlySeries(facts).map((item) => item.key)).toEqual(["2025-01", "2025-02"]));
});
