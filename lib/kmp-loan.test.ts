import { describe, expect, it } from "vitest";
import { computeHtmlLoan } from "./kmp-loan";

describe("computeHtmlLoan", () => {
  it("повертає null, якщо кредитне тіло не додатне", () => {
    expect(
      computeHtmlLoan({
        price: 100_000,
        advanceSum: 100_000,
        residualSum: 0,
        termMonths: 12,
        annualRatePercent: 18,
        feePercent: 0,
        mode: "annuity",
      })
    ).toBeNull();
  });

  it("разова комісія від бази фінансування (ціна − аванс)", () => {
    const r = computeHtmlLoan({
      price: 100_000,
      advanceSum: 20_000,
      residualSum: 0,
      termMonths: 12,
      annualRatePercent: 18,
      feePercent: 2,
      mode: "annuity",
    });
    expect(r).not.toBeNull();
    expect(r!.oneTimeFee).toBe(1600);
  });
});
