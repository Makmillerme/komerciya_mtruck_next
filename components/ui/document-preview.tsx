"use client";

import { A4_WIDTH, A4_HEIGHT } from "@/lib/a4-constants";

export interface DocumentPreviewProps {
  children: React.ReactNode;
  /** Додаткові класи для контейнера */
  className?: string;
}

/**
 * Уніфікований переглядач документів у стилі Google Docs.
 * Сірий фон, аркуші з тінню, чіткі розміри A4.
 */
export function DocumentPreview({ children, className = "" }: DocumentPreviewProps) {
  return (
    <div
      className={`flex flex-col items-center gap-8 py-8 px-6 min-h-full ${className}`}
      style={{ background: "#f1f3f4" }}
      role="document"
      aria-label="Попередній перегляд документа"
    >
      {children}
    </div>
  );
}

export interface DocumentPageProps {
  children: React.ReactNode;
  /** Номер сторінки (для aria та screenshot) */
  pageNumber?: number;
  /** Додаткові класи */
  className?: string;
}

export interface DocumentPageWithLabelProps extends DocumentPageProps {
  /** Показувати технічну мітку зверху над аркушем (false для PDF/screenshot) */
  showPageLabel?: boolean;
}

/**
 * Один аркуш документа A4. Білий фон, рамка, тінь.
 */
export function DocumentPage({
  children,
  pageNumber,
  className = "",
}: DocumentPageProps) {
  return (
    <div
      className={`shrink-0 overflow-hidden bg-white ${className}`}
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        boxShadow:
          "0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)",
        border: "1px solid #dadce0",
        borderRadius: "1px",
      }}
      role="region"
      aria-label={pageNumber != null ? `Сторінка ${pageNumber}` : undefined}
      {...(pageNumber != null ? { "data-page": pageNumber } : {})}
    >
      {children}
    </div>
  );
}

/**
 * Аркуш з технічною міткою зверху (номер сторінки в сірій зоні).
 */
export function DocumentPageWithLabel({
  children,
  pageNumber,
  showPageLabel = true,
  className = "",
}: DocumentPageWithLabelProps) {
  if (pageNumber == null || !showPageLabel) {
    return <DocumentPage pageNumber={pageNumber} className={className}>{children}</DocumentPage>;
  }
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0" style={{ width: A4_WIDTH }}>
      <span
        className="text-[11px] text-[#6b7280] font-medium w-full text-left"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        Сторінка {pageNumber}
      </span>
      <DocumentPage pageNumber={pageNumber} className={className}>
        {children}
      </DocumentPage>
    </div>
  );
}
