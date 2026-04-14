/**
 * Логіка графіка платежів узгоджена з циклом `calculate()` у прототипі index.html (GAS):
 * balance = price - advance; creditBody = price - advance - residual (у КМП residual = 0);
 * разова комісія від бази фінансування (ціна − аванс); корекція останнього рядка до residual.
 */

export type KmpPaymentMode = "annuity" | "differentiated";

export type KmpLoanScheduleRow = {
  month: number;
  /** Дата платежу, uk-UA (як toLocaleDateString у HTML). */
  date: string;
  payment: number;
  principal: number;
  interest: number;
  /** Залишок боргу після платежу (у кінці ≈ residualSum, у КМП ≈ 0). */
  balanceAfter: number;
};

export type KmpLoanInput = {
  /** Повна вартість ТЗ (грн з ПДВ у складі). */
  price: number;
  /** Аванс, грн. */
  advanceSum: number;
  /**
   * Балун на кінець строку (грн). У КМП завжди 0; поле залишено для сумісності з двигуном.
   */
  residualSum: number;
  termMonths: number;
  /** Річна номінальна ставка, %. */
  annualRatePercent: number;
  /**
   * Разова комісія, % від бази фінансування (ціна − аванс), не входить у щомісячні платежі.
   */
  feePercent: number;
  mode: KmpPaymentMode;
  /**
   * Початкова дата для розрахунку дат (у HTML перед циклом `new Date()`).
   * У циклі спочатку додається +1 місяць, потім push — як у прототипі.
   */
  scheduleStartDate?: Date;
};

export type KmpComputationResult = {
  schedule: KmpLoanScheduleRow[];
  totalInterest: number;
  totalPaymentSum: number;
  oneTimeFee: number;
  creditBody: number;
  /** price - advanceSum (початковий борг для відсотків). */
  initialBalance: number;
  /**
   * Для UI: аннуїтет — платіж першого місяця; диференційований — середній (totalPaymentSum / term), як у HTML.
   */
  monthlyPaymentDisplay: number;
  /**
   * Частка відсотків від ціни: (totalInterest / price) * 100 — як `interestPercentDisplay` у HTML.
   */
  interestPercentOfPrice: number;
};

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatScheduleDate(d: Date): string {
  return d.toLocaleDateString("uk-UA");
}

/**
 * Повертає null, якщо price/term некоректні або creditBody ≤ 0.
 */
export function computeHtmlLoan(input: KmpLoanInput): KmpComputationResult | null {
  const price = roundMoney(Math.max(0, input.price));
  const advanceSum = roundMoney(Math.max(0, input.advanceSum));
  const residualSum = roundMoney(Math.max(0, input.residualSum));
  const term = Math.floor(input.termMonths);
  const feePercent = Math.max(0, input.feePercent);
  const monthlyRate = input.annualRatePercent / 100 / 12;

  if (price <= 0 || term < 1) return null;

  const creditBody = roundMoney(price - advanceSum - residualSum);
  if (creditBody <= 0) return null;

  const feeBase = roundMoney(Math.max(0, price - advanceSum));
  const oneTimeFee = roundMoney((feeBase * feePercent) / 100);

  let balance = roundMoney(price - advanceSum);
  const cursor = input.scheduleStartDate
    ? new Date(input.scheduleStartDate)
    : new Date();

  let annuityTotal = 0;
  let fixedPrincipal = 0;

  if (input.mode === "annuity") {
    if (monthlyRate === 0) {
      annuityTotal = roundMoney(creditBody / term);
    } else {
      const pow = Math.pow(1 + monthlyRate, term);
      const annuityCoeff = (monthlyRate * pow) / (pow - 1);
      const standardPmt = creditBody * annuityCoeff;
      const residualInterest = residualSum * monthlyRate;
      annuityTotal = roundMoney(standardPmt + residualInterest);
    }
  } else {
    fixedPrincipal = roundMoney(creditBody / term);
  }

  const schedule: KmpLoanScheduleRow[] = [];
  let totalInterest = 0;
  let totalPaymentSum = 0;

  for (let i = 1; i <= term; i++) {
    const interestPayment = roundMoney(balance * monthlyRate);
    let principalPayment: number;
    let monthlyPayment: number;

    if (input.mode === "annuity") {
      monthlyPayment = annuityTotal;
      principalPayment = roundMoney(monthlyPayment - interestPayment);
    } else {
      principalPayment = fixedPrincipal;
      monthlyPayment = roundMoney(principalPayment + interestPayment);
    }

    balance = roundMoney(balance - principalPayment);
    cursor.setMonth(cursor.getMonth() + 1);

    schedule.push({
      month: i,
      date: formatScheduleDate(new Date(cursor)),
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balanceAfter: balance,
    });

    totalInterest = roundMoney(totalInterest + interestPayment);
    totalPaymentSum = roundMoney(totalPaymentSum + monthlyPayment);
  }

  const last = schedule[schedule.length - 1];
  if (last) {
    const diff = roundMoney(last.balanceAfter - residualSum);
    if (Math.abs(diff) > 0.01) {
      last.principal = roundMoney(last.principal + diff);
      last.payment = roundMoney(last.payment + diff);
      last.balanceAfter = residualSum;
      totalPaymentSum = roundMoney(totalPaymentSum + diff);
    }
  }

  const monthlyPaymentDisplay =
    input.mode === "annuity"
      ? schedule[0]?.payment ?? 0
      : term > 0
        ? roundMoney(totalPaymentSum / term)
        : 0;

  const interestPercentOfPrice =
    price > 0 ? Math.round((totalInterest / price) * 1000) / 10 : 0;

  return {
    schedule,
    totalInterest,
    totalPaymentSum,
    oneTimeFee,
    creditBody,
    initialBalance: roundMoney(price - advanceSum),
    monthlyPaymentDisplay,
    interestPercentOfPrice,
  };
}

export function scheduleTotals(rows: KmpLoanScheduleRow[]): {
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
} {
  let totalPayment = 0;
  let totalPrincipal = 0;
  let totalInterest = 0;
  for (const row of rows) {
    totalPayment += row.payment;
    totalPrincipal += row.principal;
    totalInterest += row.interest;
  }
  return {
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalPrincipal: Math.round(totalPrincipal * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
  };
}
