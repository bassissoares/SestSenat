import { describe, expect, it } from "vitest";

import { decodeFilters, encodeFilters, filterFacts } from "./filters";
import type { Fact } from "../types/dashboard";

const fact = (year: number, state: string, quantity: number): Fact => ({
  year, month: 1, formId: 9, formName: "Form", council: "CR", unitSummary: "U",
  unitId: 1, unitName: "Unidade", unitStatus: "Ativo", city: "Cidade", state,
  geoStatus: "city-detected", responsibleName: "Pessoa", quantity,
});

describe("filtros coordenados", () => {
  it("filtra todas as dimensões ativas", () => {
    expect(filterFacts([fact(2025, "SP", 10), fact(2026, "RJ", 20)], { year: ["2026"], state: ["RJ"] })).toHaveLength(1);
  });

  it("preserva o estado em query string", () => {
    const encoded = encodeFilters({ year: ["2025", "2026"], state: ["SP"] });
    expect(decodeFilters(`?${encoded}`)).toEqual({ year: ["2025", "2026"], state: ["SP"] });
  });
});
