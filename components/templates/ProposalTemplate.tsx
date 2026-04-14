import {
  Settings,
  Zap,
  Camera,
  Phone,
  Send,
  Building2,
  MapPin,
  Wallet,
} from "lucide-react";
import type { FormattedProposalData } from "@/lib/format-proposal-data";

import { getMainSpecItems, getTechSpecItems } from "@/lib/proposal-specs";
import { PROPOSAL_BRAND_NAVY_HEX } from "@/lib/proposal-template-constants";
import { DocumentPreview, DocumentPageWithLabel } from "@/components/ui/document-preview";
import { FinancingQrImage } from "@/components/proposal/FinancingQrImage";

export interface ProposalTemplateProps {
  data: FormattedProposalData;
  /** 8 фото: data URL або порожній рядок */
  imageUrls: string[];
  /** Базовий URL для статичних зображень (logo, qr). Для PDF — шлях до temp dir */
  baseUrl?: string;
  /** Ідентифікатор шаблону для майбутніх варіантів */
  templateId?: string;
  /** Режим для screenshot/PDF — без міток «Сторінка N» */
  printMode?: boolean;
  /** `data:image/...` або абсолютний/відносний URL до згенерованого QR; без пропа — статичний img/qr/qrcode.webp */
  financingQrSrc?: string | null;
}

const NAVY = PROPOSAL_BRAND_NAVY_HEX;

const IconBox = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-white shrink-0 ${className}`}
    style={{ background: NAVY, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }}
  >
    {children}
  </span>
);

export function ProposalTemplate({
  data,
  imageUrls,
  baseUrl = "",
  templateId = "commercial",
  printMode = false,
  financingQrSrc = null,
}: ProposalTemplateProps) {
  /** baseUrl="" → відносні шляхи (PDF). baseUrl="/" → абсолютні (веб). */
  const img = (path: string) => (baseUrl ? `${baseUrl.replace(/\/$/, "")}/${path}` : path);

  const pageContent = (
    <>
      {/* Page 1 */}
      <DocumentPageWithLabel pageNumber={1} showPageLabel={!printMode}>
        <div
          className="h-full flex flex-col overflow-hidden relative"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          data-template-id={templateId}
        >
          <header
            className="text-white text-center py-6 px-6 shrink-0"
            style={{ background: NAVY }}
          >
            <h1 className="text-2xl md:text-[28px] font-bold tracking-tight mb-1.5">
              КОМЕРЦІЙНА ПРОПОЗИЦІЯ
            </h1>
            <p className="text-base opacity-90 font-medium tracking-wide">
              {data.model || "—"}
            </p>
          </header>
          <div className="flex-1 overflow-hidden px-3 py-2">
            <section
              className="rounded-xl py-3 px-4 mb-3"
              style={{
                background: "#f8f9fa",
                borderLeft: "4px solid " + NAVY,
              }}
            >
              <p className="text-sm text-[#666] font-medium mb-3">
                Вантажний автомобіль для комерційного використання
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-[#e5e7eb] p-3 shadow-sm">
                  <h3 className="flex items-center gap-2.5 text-[13px] font-semibold mb-2 pb-1.5 border-b border-[#e5e7eb]" style={{ color: NAVY }}>
                    <IconBox>
                      <Settings className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </IconBox>
                    Основні характеристики
                  </h3>
                  <SpecList items={getMainSpecItems(data)} />
                </div>
                <div className="bg-white rounded-xl border border-[#e5e7eb] p-3 shadow-sm">
                  <h3 className="flex items-center gap-2.5 text-[13px] font-semibold mb-2 pb-1.5 border-b border-[#e5e7eb]" style={{ color: NAVY }}>
                    <IconBox>
                      <Zap className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </IconBox>
                    Технічні характеристики
                  </h3>
                  <SpecList items={getTechSpecItems(data)} />
                </div>
              </div>
              <div className="mt-3 bg-white rounded-xl border border-[#e5e7eb] px-3 py-2.5 shadow-sm">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-[11px] sm:flex-nowrap sm:items-start">
                  <span className="text-[#555] font-medium shrink-0">Технічний стан:</span>
                  <span className="font-semibold text-[#1f2937] text-right sm:flex-1 sm:min-w-0">
                    {data.technical_state || "—"}
                  </span>
                </div>
              </div>
            </section>
            <PhotoGallery imageUrls={imageUrls.slice(0, 4)} startIndex={1} />
          </div>
        </div>
      </DocumentPageWithLabel>

      {/* Page 2 */}
      <DocumentPageWithLabel pageNumber={2} showPageLabel={!printMode}>
        <div
          className="h-full flex flex-col overflow-hidden relative"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          <div className="flex-1 overflow-hidden px-3 pt-3 pb-2">
            <PhotoGallery imageUrls={imageUrls.slice(4, 8)} startIndex={5} showTitle={false} />
            <section
              className="text-white rounded-xl py-5 px-5 my-3 text-center"
              style={{ background: NAVY, minHeight: 120 }}
            >
              <h3 className="flex items-center justify-center gap-2 text-[13px] font-semibold mb-3">
                <Wallet className="w-4 h-4 opacity-90" strokeWidth={2.5} />
                Вартість та умови
              </h3>
              <div className={`grid gap-3 mt-2 ${data.show_currency_non_cash && data.currency_non_cash ? "grid-cols-4" : "grid-cols-3"}`}>
                {data.show_currency_non_cash && data.currency_non_cash ? (
                  <div className="bg-white/10 rounded-lg px-4 py-3">
                    <div className="text-[11px] opacity-90">Вал. безгот. вартість</div>
                    <div className="text-xs font-bold mt-1">{data.currency_non_cash}</div>
                  </div>
                ) : null}
                <div className="bg-white/10 rounded-lg px-4 py-3">
                  <div className="text-[11px] opacity-90">Вартість без ПДВ</div>
                  <div className="text-xs font-bold mt-1">{data.price_without_vat || "—"}</div>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-3">
                  <div className="text-[11px] opacity-90">ПДВ (20%)</div>
                  <div className="text-xs font-bold mt-1">{data.vat || "—"}</div>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-3">
                  <div className="text-[11px] opacity-90">Вартість з ПДВ (грн)</div>
                  <div className="text-xs font-bold mt-1">{data.price_with_vat || "—"}</div>
                </div>
              </div>
              {data.show_currency_non_cash ? (
                <div className="text-[10px] opacity-90 mt-3 text-left leading-snug space-y-1.5 px-0.5">
                  {data.rate_disclaimer_lines.map((line, i) => (
                    <p key={i} className="mb-0 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
            </section>
            <div
              className="border rounded-xl overflow-hidden shadow-sm my-3"
              style={{ borderColor: NAVY }}
            >
              <div className="flex items-center gap-4 p-3">
                <div className="flex-1">
                  <div className="text-[13px] font-bold mb-1.5" style={{ color: NAVY }}>
                    {data.financing_title || "—"}
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm text-[#333]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 shrink-0" style={{ color: NAVY }} />
                      <span>{data.financing_phone || "—"}</span>
                    </div>
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 shrink-0" style={{ color: NAVY }} />
                      <span>{data.financing_messenger || "—"}</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-medium mt-2" style={{ color: NAVY }}>
                    {data.financing_cta || "—"}
                  </p>
                </div>
                <div className="box-border flex h-[102px] w-[102px] shrink-0 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white p-2 shadow-sm">
                  <FinancingQrImage
                    key={financingQrSrc ?? "__static_qr__"}
                    src={financingQrSrc}
                    fallbackSrc={img("img/qr/qrcode.webp")}
                    alt="QR-код для консультації"
                    className="block max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
            <section className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-xl p-3 my-3">
              <h3 className="text-[13px] font-semibold mb-2 text-center" style={{ color: NAVY }}>
                Інформація про постачальника
              </h3>
              <div
                className="grid gap-3 items-center justify-items-center w-full"
                style={{
                  gridTemplateColumns: `repeat(${1 + (data.supplier_show_address ? 1 : 0) + (data.supplier_show_contact ? 1 : 0)}, minmax(0, 1fr))`,
                }}
              >
                <div className="flex items-center gap-2 text-[11px] text-center">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ background: NAVY }}
                  >
                    <Building2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <strong>{(data.supplier_company || "").trim() || "—"}</strong>
                    <br />
                    ЄДРПОУ: {(data.supplier_edrpou || "").trim() || "—"}
                  </div>
                </div>
                {data.supplier_show_address ? (
                  <div className="flex items-center gap-2 text-[11px] text-center">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ background: NAVY }}
                    >
                      <MapPin className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                    <div>
                      {data.supplier_address_lines.map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < data.supplier_address_lines.length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
                {data.supplier_show_contact ? (
                  <div className="flex min-w-0 items-center gap-2 text-[11px] text-center">
                    <div
                      className="w-6 h-6 shrink-0 rounded-lg flex items-center justify-center text-white"
                      style={{ background: NAVY }}
                    >
                      <Phone className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                    <div className="flex min-w-0 flex-col items-center justify-center gap-0.5 text-[#333]">
                      {data.supplier_contact_phones.map((tel, i) => (
                        <span key={i} className="break-all text-center">
                          {tel}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
          <footer
            className="text-white py-2.5 px-3 text-center text-xs shrink-0 mt-3"
            style={{ background: NAVY }}
          >
            <div className="flex justify-center py-1">
              <img
                src={img("img/logo/M-TRUCK logo iron.png")}
                alt="M-TRUCK Logo"
                className="max-w-[100px] h-auto"
              />
            </div>
          </footer>
        </div>
      </DocumentPageWithLabel>
    </>
  );

  return (
    <DocumentPreview className={printMode ? "!gap-0 !py-2 !px-2" : ""}>
      {pageContent}
    </DocumentPreview>
  );
}

function SpecList({
  items,
}: {
  items: [string, string][];
}) {
  return (
    <div className="space-y-1">
      {items.map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between py-1 text-[11px] border-b border-[#f1f3f4] last:border-0"
        >
          <span className="text-[#555]">{label}:</span>
          <span className="font-semibold text-[#1f2937] text-right">{value || "—"}</span>
        </div>
      ))}
    </div>
  );
}

function PhotoGallery({
  imageUrls,
  startIndex,
  showTitle = true,
}: {
  imageUrls: string[];
  startIndex: number;
  showTitle?: boolean;
}) {
  return (
    <section className={showTitle ? "my-3" : "mt-0 mb-3"}>
      {showTitle && (
        <h3 className="flex items-center gap-2.5 text-xs font-semibold mb-2" style={{ color: NAVY }}>
          <IconBox>
            <Camera className="w-3.5 h-3.5" strokeWidth={2.5} />
          </IconBox>
          Фотографії автомобіля
        </h3>
      )}
      <div className="grid grid-cols-2 gap-2.5 max-w-full">
        {imageUrls.map((url, i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-xl border border-[#e5e7eb] overflow-hidden bg-[#f8f9fa] flex items-center justify-center"
          >
            {url ? (
              <img
                src={url}
                alt={`Photo ${startIndex + i}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[11px] text-[#6c757d]">Фото {startIndex + i}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
