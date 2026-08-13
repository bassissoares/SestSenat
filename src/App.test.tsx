import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./components/EChart", () => ({ EChart: ({ ariaLabel }: { ariaLabel: string }) => <div role="img" aria-label={ariaLabel} /> }));

import { App } from "./App";

describe("App shell", () => {
  afterEach(() => vi.restoreAllMocks());

  it("abre na visão geral com o período integral da carga", async () => {
    const responses = [
      [{ year: 2025, month: 1, formId: 9, formName: "Form", council: "CR", unitSummary: "B 1", unitType: "B", unitId: 1, unitName: "U", unitStatus: "Ativo", city: "Cidade", state: "SP", geoStatus: "city-detected", responsibleName: "Pessoa", quantity: 10 }],
      { datasetVersion: "abc", generatedAt: "2026-08-06T17:32:10Z", periodStart: "2025-01", periodEnd: "2026-12", publishedRows: 1, warnings: 0, totalAnswered: 10, totalsByYear: { "2025": 10 } },
      { years: [2025], months: [1], forms: [{ id: 9, name: "Form" }], councils: ["CR"], units: ["B 1"], unitTypes: ["B"], responsibles: ["Pessoa"] },
      [{ municipalityId: "1", city: "Cidade", normalizedCity: "CIDADE", state: "SP", latitude: -23, longitude: -46, positionType: "ibge-simplified-mesh-center" }],
      { type: "FeatureCollection", features: [] },
    ];
    let call = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes("respostas-formularios")) {
        if (url.endsWith("manifest.json")) return { ok: true, json: async () => ({ datasetVersion: "r1", generatedAt: "2026-08-06T17:32:10Z", periodStart: "2026-06", periodEnd: "2026-08", publishedRows: 0, totalSelections: 0, invalidAgeQuantity: 0, warnings: 0 }) };
        if (url.endsWith("dimensions.json")) return { ok: true, json: async () => ({ forms: [], councils: [], units: [], responsibles: [], sexes: [], ageBands: [], ageQualities: [], questions: [], questionGroups: [], options: [] }) };
        return { ok: true, json: async () => [] };
      }
      return { ok: true, json: async () => responses[call++] };
    }));
    render(<App />);
    expect(screen.getByRole("heading", { name: "Formulários respondidos" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("2025-01 a 2026-12")).toBeInTheDocument());
    expect(screen.getByText(/Atualizado em/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Glossário" }));
    expect(screen.getByRole("dialog", { name: "Glossário do painel" })).toHaveTextContent("Variação vs. média anterior");
    fireEvent.click(screen.getByRole("button", { name: "Fechar glossário" }));
    expect(screen.queryByRole("dialog", { name: "Glossário do painel" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Visão geral")).toHaveLength(2);
    Object.defineProperty(window, "scrollY", { value: 600, configurable: true });
    fireEvent.scroll(window);
    expect(await screen.findByRole("complementary", { name: "Contexto atual da análise" })).toHaveTextContent("Periodicidade");
  });
});
