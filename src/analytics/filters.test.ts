import { describe, expect, it } from "vitest";

import { decodeFilters, encodeFilters, filterFacts, latestCompletePeriodEnd } from "./filters";
import type { Fact } from "../types/dashboard";

const fact = (year: number, state: string, quantity: number): Fact => ({
  year, month: 1, formId: 9, formName: "Form", council: "CR", unitSummary: "U", unitType: "B",
  unitId: 1, unitName: "Unidade", unitStatus: "Ativo", city: "Cidade", state,
  geoStatus: "city-detected", responsibleName: "Pessoa", quantity,
});

describe("filtros coordenados", () => {
  it("filtra todas as dimensões ativas", () => {
    expect(filterFacts([fact(2025, "SP", 10), fact(2026, "RJ", 20)], { year: ["2026"], state: ["RJ"] })).toHaveLength(1);
    expect(filterFacts([fact(2025, "SP", 10)], { unitType: ["B"] })).toHaveLength(1);
  });

  it("preserva o estado em query string", () => {
    const encoded = encodeFilters({ year: ["2025", "2026"], state: ["SP"] });
    expect(decodeFilters(`?${encoded}`)).toEqual({ year: ["2025", "2026"], state: ["SP"] });
  });
  it("filtra por intervalo contínuo de ano e mês", () => { const rows = [fact(2025, "SP", 10), { ...fact(2026, "RJ", 20), month: 2 }]; expect(filterFacts(rows, {}, undefined, { start: "2025-06", end: "2026-01" })).toHaveLength(0); expect(filterFacts(rows, {}, undefined, { start: "2026-01", end: "2026-02" })).toHaveLength(1); });
  it("encontra o último período fechado conforme a periodicidade", () => { const rows = [{ ...fact(2026, "SP", 10), month: 8 }]; const today = new Date(2026, 7, 6); expect(latestCompletePeriodEnd(rows, 1, today)).toBe("2026-07"); expect(latestCompletePeriodEnd(rows, 2, today)).toBe("2026-06"); expect(latestCompletePeriodEnd(rows, 12, today)).toBe("2025-12"); });
});
