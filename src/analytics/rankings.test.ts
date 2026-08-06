import { describe, expect, it } from "vitest";
import { buildRanking, rankingCsv } from "./rankings";
import type { Fact } from "../types/dashboard";
const base = { month: 1, formId: 9, formName: "Form", council: "CR", unitSummary: "B 1", unitType: "B", unitId: 1, unitName: "U", unitStatus: "Ativo", city: "Cidade", state: "SP", geoStatus: "ok" };
const facts: Fact[] = [{ ...base, year: 2025, responsibleName: "Ana", quantity: 10 }, { ...base, year: 2026, responsibleName: "Ana", unitSummary: "B 2", quantity: 15 }, { ...base, year: 2026, responsibleName: "Beto", quantity: 5 }];
describe("rankings", () => {
  it("calcula posição, participação e evolução", () => { const rows = buildRanking(facts, "responsibleName"); expect(rows[0]).toMatchObject({ label: "Ana", quantity: 25, evolution: .5 }); expect(rows[0].share).toBeCloseTo(25 / 30); });
  it("vincula todas as unidades ao responsável", () => expect(buildRanking(facts, "responsibleName")[0].relatedUnits).toEqual(["B 1", "B 2"]));
  it("exporta exatamente as linhas recebidas", () => expect(rankingCsv(buildRanking(facts, "responsibleName").slice(0, 1))).toContain('"Ana","B 1 | B 2","25"'));
});
