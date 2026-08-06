import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";

describe("App shell", () => {
  it("abre na visão geral de todos os anos e meses", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "Formulários respondidos" })).toBeInTheDocument();
    expect(screen.getByText("Todos os anos e meses")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
