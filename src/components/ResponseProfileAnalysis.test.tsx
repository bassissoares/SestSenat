import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ResponseDimensions } from "../types/responses";
import { ResponseProfileAnalysis } from "./ResponseProfileAnalysis";

vi.mock("./EChart", () => ({ EChart: ({ ariaLabel }: { ariaLabel: string }) => <div role="img" aria-label={ariaLabel} /> }));

const dimensions: ResponseDimensions = {
  forms: [{ id: 1, name: "Formulário teste" }],
  councils: ["Conselho A"],
  units: [], responsibles: [],
  sexes: ["Feminino", "Masculino"],
  ageBands: ["25–34", "35–44"],
  ageQualities: [], questions: [{ id: 1, formId: 1, label: "Questão teste", type: "Lista simples" }],
  questionGroups: [{ id: "g1", label: "Questão teste" }],
  options: [{ groupId: "g1", label: "Sim" }, { groupId: "g1", label: "Não" }],
};

describe("ResponseProfileAnalysis", () => {
  it("apresenta síntese e comparações da questão com denominadores de perfil", () => {
    const facts = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 20],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 10],
    ];
    const profiles = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 40],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 30],
    ];

    const denominators = [[0, 0, 0, 0, 0, 0, 100]];
    render(<ResponseProfileAnalysis facts={facts} questionScopeFacts={facts} profiles={profiles} denominators={denominators} dimensions={dimensions} denominator={100} periodicity={1} demographicFiltered={false} formName="Formulário teste" questionLabel="Questão teste" />);

    expect(screen.getByText("Síntese automática")).toBeInTheDocument();
    expect(screen.getByText(/cobertura de/)).toHaveTextContent("70%");
    expect(screen.getByText(/a opção líder é/)).toHaveTextContent("Sim");
    expect(screen.getByRole("img", { name: "Comparação das opções por sexo" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Opções por faixa etária" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Evolução percentual da questão" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Percentual da questão por conselho" })).toBeInTheDocument();
  });
});
