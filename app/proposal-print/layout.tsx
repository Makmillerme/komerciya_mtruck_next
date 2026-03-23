import { Noto_Sans } from "next/font/google";

const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic", "latin-ext", "cyrillic-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export default function ProposalPrintLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={notoSans.className}
      style={{
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        textRendering: "optimizeLegibility",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page { size: A4; margin: 0; }
              body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              [data-print-root] { background: white !important; padding: 0 !important; gap: 0 !important; }
              [data-page] { page-break-after: always; box-shadow: none !important; border-radius: 0 !important; }
              [data-page]:last-child { page-break-after: auto; }
            }
          `,
        }}
      />
      {children}
    </div>
  );
}
