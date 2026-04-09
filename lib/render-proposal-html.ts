import { formatProposalData } from "./format-proposal-data";

import type { ProposalFormData } from "./schema";

export interface RenderProposalOptions {
  formData: Partial<ProposalFormData>;
  imageDataUrls: string[];
  /** Для PDF: порожній (HTML у temp dir). Для веб: "/" */
  baseUrl?: string;
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function specRow(label: string, value: string): string {
  return `<div style="display:flex;justify-content:space-between;padding:0.25rem 0;font-size:11px;border-bottom:1px solid #f1f3f4"><span style="color:#555">${esc(label)}:</span><span style="font-weight:600;color:#1f2937;text-align:right">${esc(value || "—")}</span></div>`;
}

function photoCell(url: string, index: number): string {
  if (url) {
    return `<img src="${url.replace(/"/g, "&quot;")}" alt="Photo ${index}" style="width:100%;height:100%;object-fit:cover">`;
  }
  return `<span style="font-size:11px;color:#6c757d">Фото ${index}</span>`;
}

export function renderProposalHtml({
  formData,
  imageDataUrls,
  baseUrl = "",
}: RenderProposalOptions): string {
  const d = formatProposalData(formData);
  const urls = [...imageDataUrls];
  while (urls.length < 8) urls.push("");

  const img = (path: string) => (baseUrl ? `${baseUrl.replace(/\/$/, "")}/${path}` : path);

  const walletIconSvg = `<svg class="w-4 h-4 opacity-90 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`;

  const basicSpecs = [
    ["Тип кузова", d.body_type],
    ["VIN", d.vin],
    ["Рік виготовлення", d.year],
    ["Пробіг", d.mileage],
    ["Колір", d.color],
    ["Країна виробник", d.country],
  ]
    .map(([l, v]) => specRow(l, v))
    .join("");

  const technicalStateFullRow = `<div class="mt-3 bg-white rounded-xl border border-[#e5e7eb] px-3 py-2.5 shadow-sm" style="margin-top:0.75rem;background:#fff;border-radius:0.75rem;border:1px solid #e5e7eb;padding:0.625rem 0.75rem;box-shadow:0 1px 2px rgba(0,0,0,0.05)">
    <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:0.5rem 1rem;font-size:11px">
      <span style="color:#555;font-weight:500;flex-shrink:0">Технічний стан:</span>
      <span style="font-weight:600;color:#1f2937;text-align:right;flex:1;min-width:0">${esc(d.technical_state || "—")}</span>
    </div>
  </div>`;

  const techSpecs = [
    ["Колісна формула", d.wheel_formula],
    ["Двигун", d.engine_type],
    ["Об'єм двигуна", d.engine_volume],
    ["Потужність", d.power],
    ["КПП", d.gearbox],
    ["Кількість місць", d.seats],
  ]
    .map(([l, v]) => specRow(l, v))
    .join("");

  const photoBox = (content: string) =>
    `<div style="aspect-ratio:4/3;border-radius:0.75rem;border:1px solid #e5e7eb;overflow:hidden;background:#f8f9fa;display:flex;align-items:center;justify-content:center">${content}</div>`;
  const photos1_4 = urls
    .slice(0, 4)
    .map((url, i) => photoBox(photoCell(url, i + 1)))
    .join("");
  const photos5_8 = urls
    .slice(4, 8)
    .map((url, i) => photoBox(photoCell(url, i + 5)))
    .join("");

  const showNc = d.show_currency_non_cash && d.currency_non_cash;
  const gridCols = showNc ? 4 : 3;
  const nonCashCell = showNc
    ? `<div class="bg-white/10 rounded-lg px-4 py-3" style="background:rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.75rem 1rem">
      <div class="text-[11px] opacity-90" style="font-size:11px;opacity:0.9">Вал. безгот. вартість</div>
      <div class="text-xs font-bold mt-1" style="font-size:12px;font-weight:700;margin-top:0.25rem">${esc(d.currency_non_cash)}</div>
    </div>`
    : "";
  const supplierAddrHtml = d.supplier_address_lines
    .map((line) => esc(line))
    .join("<br>");
  const supplierAddressColumn = d.supplier_show_address
    ? `<div class="flex items-center gap-2 text-[11px] text-center">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0" style="background: #1D304E">📍</div>
            <div>${supplierAddrHtml}</div>
          </div>`
    : "";
  const supplierGridStyle = d.supplier_show_address
    ? "display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0.75rem;align-items:flex-start;justify-items:center"
    : "display:grid;grid-template-columns:minmax(0,1fr);gap:0.75rem;align-items:flex-start;justify-items:center";
  const supplierContactBlock = d.supplier_show_contact
    ? `<div class="mt-3 pt-3 border-t border-[#e5e7eb] text-[11px] text-center w-full" style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid #e5e7eb;font-size:11px;text-align:center;width:100%">
          <p style="color:#1D304E;font-weight:600;margin-bottom:0.5rem">Контактна інформація</p>
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.375rem;color:#333">
            ${d.supplier_contact_phones
              .map(
                (tel) =>
                  `<div style="display:flex;align-items:center;gap:0.5rem;justify-content:center"><span aria-hidden="true">📞</span><span>${esc(tel)}</span></div>`
              )
              .join("")}
          </div>
        </div>`
    : "";

  const rateLines = d.rate_disclaimer_lines
    .map(
      (line) =>
        `<p style="margin:0 0 0.35rem 0;font-size:10px;line-height:1.45;opacity:0.9">${esc(line)}</p>`
    )
    .join("");
  const rateDisclaimerBlock = d.show_currency_non_cash
    ? `<div class="mt-3 text-left" style="margin-top:0.75rem;text-align:left">${rateLines}</div>`
    : "";

  const body = `
<div class="proposal-template w-full max-w-[210mm] mx-auto bg-white relative" style="font-family: Inter, system-ui, sans-serif" data-template-id="commercial">
  <div class="relative">
  <header class="text-white text-center py-6 px-6" style="background: #1D304E">
    <h1 class="text-2xl md:text-[28px] font-bold tracking-tight mb-1.5">КОМЕРЦІЙНА ПРОПОЗИЦІЯ</h1>
    <p class="text-base opacity-90 font-medium tracking-wide">${esc(d.model || "—")}</p>
  </header>
  <div class="px-3 py-2">
    <section class="rounded-xl py-3 px-4 mb-3" style="background: #f8f9fa; border-left: 4px solid #1D304E">
      <p class="text-sm text-[#666] font-medium mb-3">Вантажний автомобіль для комерційного використання</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="bg-white rounded-xl border border-[#e5e7eb] p-3 shadow-sm">
          <h3 class="flex items-center gap-2.5 text-[#1D304E] text-[13px] font-semibold mb-2 pb-1.5 border-b border-[#e5e7eb]">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg text-white shrink-0" style="background: #1D304E; box-shadow: 0 1px 2px rgba(0,0,0,0.08)">⚙</span>
            Основні характеристики
          </h3>
          <div class="space-y-1">${basicSpecs}</div>
        </div>
        <div class="bg-white rounded-xl border border-[#e5e7eb] p-3 shadow-sm">
          <h3 class="flex items-center gap-2.5 text-[#1D304E] text-[13px] font-semibold mb-2 pb-1.5 border-b border-[#e5e7eb]">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg text-white shrink-0" style="background: #1D304E; box-shadow: 0 1px 2px rgba(0,0,0,0.08)">⚡</span>
            Технічні характеристики
          </h3>
          <div class="space-y-1">${techSpecs}</div>
        </div>
      </div>
      ${technicalStateFullRow}
    </section>
    <section class="my-3">
        <h3 class="flex items-center gap-2.5 text-[#1D304E] text-xs font-semibold mb-2">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg text-white shrink-0" style="background: #1D304E; box-shadow: 0 1px 2px rgba(0,0,0,0.08)">📷</span>
        Фотографії автомобіля
      </h3>
      <div class="grid grid-cols-2 gap-2.5 max-w-full">${photos1_4}</div>
    </section>
  </div>
    <div class="mt-8 pt-6 border-t border-[#e5e7eb] relative" style="page-break-before: always">
      <section class="my-3">
        <h3 class="flex items-center gap-2.5 text-[#1D304E] text-xs font-semibold mb-2">
        <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg text-white shrink-0" style="background: #1D304E; box-shadow: 0 1px 2px rgba(0,0,0,0.08)">📷</span>
          Фотографії автомобіля
        </h3>
        <div class="grid grid-cols-2 gap-2.5 max-w-full">${photos5_8}</div>
      </section>
      <section class="text-white rounded-xl py-5 px-5 my-3 text-center" style="background: #1D304E; min-height: 120px">
        <h3 class="flex items-center justify-center gap-2 text-[13px] font-semibold mb-3">${walletIconSvg} Вартість та умови</h3>
        <div class="grid gap-3 mt-2" style="display:grid;grid-template-columns:repeat(${gridCols},minmax(0,1fr));gap:0.75rem;margin-top:0.5rem">
          ${nonCashCell}
          <div class="bg-white/10 rounded-lg px-4 py-3" style="background:rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.75rem 1rem">
            <div class="text-[11px] opacity-90" style="font-size:11px;opacity:0.9">Вартість без ПДВ</div>
            <div class="text-xs font-bold mt-1" style="font-size:12px;font-weight:700;margin-top:0.25rem">${esc(d.price_without_vat || "—")}</div>
          </div>
          <div class="bg-white/10 rounded-lg px-4 py-3" style="background:rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.75rem 1rem">
            <div class="text-[11px] opacity-90" style="font-size:11px;opacity:0.9">ПДВ (20%)</div>
            <div class="text-xs font-bold mt-1" style="font-size:12px;font-weight:700;margin-top:0.25rem">${esc(d.vat || "—")}</div>
          </div>
          <div class="bg-white/10 rounded-lg px-4 py-3" style="background:rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.75rem 1rem">
            <div class="text-[11px] opacity-90" style="font-size:11px;opacity:0.9">Вартість з ПДВ (грн)</div>
            <div class="text-xs font-bold mt-1" style="font-size:12px;font-weight:700;margin-top:0.25rem">${esc(d.price_with_vat || "—")}</div>
          </div>
        </div>
        ${rateDisclaimerBlock}
      </section>
      <div class="border border-[#1D304E] rounded-xl overflow-hidden shadow-sm my-3">
        <div class="flex items-center gap-4 p-3">
          <div class="flex-1">
            <div class="text-[13px] font-bold text-[#1D304E] mb-1.5">Фінансування авто | Кредит | Лізинг</div>
            <div class="flex flex-col gap-1.5 text-sm text-[#333]">
              <div class="flex items-center gap-2"><span>📞</span><span>+38 050 231 13 39</span></div>
              <div class="flex items-center gap-2"><span>✉</span><span>M-Truck_finans</span></div>
            </div>
            <p class="text-[11px] text-[#1D304E] font-medium mt-2">Отримати консультацію - Перейди за QR-кодом →</p>
          </div>
          <div class="w-[110px] h-[110px] rounded-xl border border-[#e5e7eb] overflow-hidden shrink-0 flex items-center justify-center bg-[#f8f9fa]">
            <img src="${img("img/qr/qrcode.webp")}" alt="QR-код для консультації" class="w-full h-full object-contain">
          </div>
        </div>
      </div>
      <section class="bg-[#f8f9fa] border border-[#e5e7eb] rounded-xl p-3 my-3">
        <h3 class="text-[#1D304E] text-[13px] font-semibold mb-2 text-center">Інформація про постачальника</h3>
        <div style="${supplierGridStyle}">
          <div class="flex items-center gap-2 text-[11px] text-center">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0" style="background: #1D304E">🏢</div>
            <div><strong>${esc(d.supplier_company)}</strong><br>ЄДРПОУ: ${esc(d.supplier_edrpou)}</div>
          </div>
          ${supplierAddressColumn}
        </div>
        ${supplierContactBlock}
      </section>
      <footer class="text-white py-2.5 px-3 text-center text-xs mt-3" style="background: #1D304E">
        <div class="flex justify-center py-1">
          <img src="${img("img/logo/M-TRUCK logo iron.png")}" alt="M-TRUCK Logo" class="max-w-[100px] h-auto">
        </div>
      </footer>
    </div>
  </div>
</div>`;

  const pdfStyles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', system-ui, sans-serif; font-size: 14px; line-height: 1.6; color: #333; background: #f8f9fa; }
.proposal-template { width: 100%; max-width: 210mm; margin: 0 auto; background: white; position: relative; font-family: Inter, system-ui, sans-serif; }
.proposal-template .flex { display: flex; }
.proposal-template .flex-col { flex-direction: column; }
.proposal-template .flex-1 { flex: 1 1 0%; }
.proposal-template .shrink-0 { flex-shrink: 0; }
.proposal-template .items-center { align-items: center; }
.proposal-template .justify-center { justify-content: center; }
.proposal-template .justify-between { justify-content: space-between; }
.proposal-template .gap-2 { gap: 0.5rem; }
.proposal-template .gap-2\\.5 { gap: 0.625rem; }
.proposal-template .gap-3 { gap: 0.75rem; }
.proposal-template .gap-4 { gap: 1rem; }
.proposal-template .grid { display: grid; }
.proposal-template .grid-cols-1 { grid-template-columns: 1fr; }
.proposal-template .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.proposal-template .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
@media (min-width: 640px) { .proposal-template .sm\\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 768px) { .proposal-template .md\\:text-\\[28px\\] { font-size: 28px; } }
.proposal-template .max-w-full { max-width: 100%; }
.proposal-template .w-full, .proposal-template img.w-full { width: 100%; }
.proposal-template .h-full, .proposal-template img.h-full { height: 100%; }
.proposal-template .w-6 { width: 24px; }
.proposal-template .h-6 { height: 24px; }
.proposal-template .w-4 { width: 16px; }
.proposal-template .h-4 { height: 16px; }
.proposal-template .p-2 { padding: 0.5rem; }
.proposal-template .p-3 { padding: 0.75rem; }
.proposal-template .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.proposal-template .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.proposal-template .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.proposal-template .py-2\\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
.proposal-template .px-4 { padding-left: 1rem; padding-right: 1rem; }
.proposal-template .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.proposal-template .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
.proposal-template .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
.proposal-template .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.proposal-template .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
.proposal-template .pt-6 { padding-top: 1.5rem; }
.proposal-template .mt-1 { margin-top: 0.25rem; }
.proposal-template .mt-2 { margin-top: 0.5rem; }
.proposal-template .mt-3 { margin-top: 0.75rem; }
.proposal-template .mt-8 { margin-top: 2rem; }
.proposal-template .mb-1\\.5 { margin-bottom: 0.375rem; }
.proposal-template .mb-2 { margin-bottom: 0.5rem; }
.proposal-template .mb-3 { margin-bottom: 0.75rem; }
.proposal-template .my-3 { margin-top: 0.75rem; margin-bottom: 0.75rem; }
.proposal-template .text-center { text-align: center; }
.proposal-template .text-right { text-align: right; }
.proposal-template .text-xs { font-size: 0.75rem; }
.proposal-template .text-sm { font-size: 0.875rem; }
.proposal-template .text-base { font-size: 1rem; }
.proposal-template .text-lg { font-size: 1.125rem; }
.proposal-template .text-2xl { font-size: 1.5rem; }
.proposal-template .font-medium { font-weight: 500; }
.proposal-template .font-semibold { font-weight: 600; }
.proposal-template .font-bold { font-weight: 700; }
.proposal-template .tracking-tight { letter-spacing: -0.025em; }
.proposal-template .tracking-wide { letter-spacing: 0.025em; }
.proposal-template .opacity-90 { opacity: 0.9; }
.proposal-template .rounded-lg { border-radius: 0.5rem; }
.proposal-template .rounded-xl { border-radius: 0.75rem; }
.proposal-template .border { border: 1px solid; }
.proposal-template .border-0 { border-width: 0; }
.proposal-template .border-b { border-bottom: 1px solid; }
.proposal-template .border-t { border-top: 1px solid; }
.proposal-template .overflow-hidden { overflow: hidden; }
.proposal-template .inline-flex { display: inline-flex; }
.proposal-template .inline-block { display: inline-block; }
.proposal-template .object-cover { object-fit: cover; }
.proposal-template .object-contain { object-fit: contain; }
.proposal-template .space-y-1 > * + * { margin-top: 0.25rem; }
.proposal-template .space-y-1 > *:last-child { border-bottom: none !important; }
.proposal-template .aspect-4\\/3 { aspect-ratio: 4/3; }
.proposal-template .last\\:border-0:last-child { border: none; }
.proposal-template .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.proposal-template .pb-1\\.5 { padding-bottom: 0.375rem; }
.proposal-template [style*="width: 110px"] { width: 110px; height: 110px; }
.proposal-template .max-w-100px, .proposal-template .max-w-\\[100px\\] { max-width: 100px; }
.proposal-template .max-w-\\[210mm\\] { max-width: 210mm; }
.proposal-template .text-\\[11px\\] { font-size: 11px; }
.proposal-template .text-\\[13px\\] { font-size: 13px; }
.proposal-template .text-\\[28px\\] { font-size: 28px; }
.proposal-template .border-\\[#e5e7eb\\], .proposal-template .border-\\[#f1f3f4\\] { border-color: #e5e7eb; }
.proposal-template .border-\\[#1D304E\\] { border-color: #1D304E; }
.proposal-template .text-\\[#1D304E\\] { color: #1D304E; }
.proposal-template .text-\\[#555\\] { color: #555; }
.proposal-template .text-\\[#666\\] { color: #666; }
.proposal-template .text-\\[#333\\] { color: #333; }
.proposal-template .text-\\[#1f2937\\] { color: #1f2937; }
.proposal-template .text-\\[#6c757d\\] { color: #6c757d; }
.proposal-template .bg-white\\/10 { background: rgba(255,255,255,0.1); }
.proposal-template .w-\\[110px\\] { width: 110px; }
.proposal-template .h-\\[110px\\] { height: 110px; }
.proposal-template .justify-items-center { justify-items: center; }
@page { size: A4; margin: 0; }
@media print {
  body { background: white; }
  .proposal-template { box-shadow: none !important; }
  .proposal-template [style*="page-break-before"] { page-break-before: always !important; }
}
`;

  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794">
  <title>Комерційна пропозиція - ${esc(d.model || "ТЗ")}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>${pdfStyles}</style>
</head>
<body>
  ${body}
</body>
</html>`;
}
