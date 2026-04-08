/** Дата для дисклеймера про курс (українська локаль). */

export function formatRateDisclaimerDate(d: Date = new Date()): string {
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getRateDisclaimerLines(dateLabel: string): string[] {
  return [
    `Розрахунок здійснено із застосуванням середнього курсу валют на дату формування пропозиції (Джерело: Minfin.com.ua, станом на ${dateLabel}).`,
    "При проведенні фактичних оплат застосовується курс на дату кожного платежу.",
    "У зв'язку з можливими коливаннями валютного курсу, остаточна сума в гривні може відрізнятись від попереднього розрахунку.",
  ];
}
