import { describe, expect, it } from "vitest";
import { percentage, percentagePointChange, previousMean, responseBlock, sumRows } from "./responseAnalytics";

describe("responseAnalytics", () => {
  it("agrupa competências em blocos civis", () => {
    expect(responseBlock([2026, 5], 2)).toEqual({ key: "2026-05", label: "2026-05 a 2026-06" });
    expect(responseBlock([2026, 12], 12)).toEqual({ key: "2026-01", label: "2026-01 a 2026-12" });
  });

  it("calcula base, percentual e variação em pontos percentuais", () => {
    expect(sumRows([[0, 20], [0, 30]], 1)).toBe(50);
    expect(percentage(25, 100)).toBe(25);
    expect(previousMean([20, 30, 50])).toBe(25);
    expect(percentagePointChange(50, 25)).toBe(25);
  });
});
