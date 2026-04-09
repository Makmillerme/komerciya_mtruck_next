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

/** Текст за замовчуванням для поля «Примітка про курс» у формі (абзаци через \n). */
export function getDefaultRateDisclaimerText(date: Date = new Date()): string {
  return getRateDisclaimerLines(formatRateDisclaimerDate(date)).join("\n");
}

/** Розбити збережений текст на абзаци для КП; порожній рядок → заводські рядки з датою. */
export function parseRateDisclaimerLines(
  raw: string | undefined,
  date: Date = new Date()
): string[] {
  const t = (raw ?? "").trim();
  if (!t) return getRateDisclaimerLines(formatRateDisclaimerDate(date));
  return t.split(/\n+/).map((l) => l.trim()).filter(Boolean);
}
