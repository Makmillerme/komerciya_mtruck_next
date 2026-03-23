import { redirect } from "next/navigation";
import { ProposalTemplate } from "@/components/templates/ProposalTemplate";
import { formatProposalData } from "@/lib/format-proposal-data";
import { getProposalPrintData } from "@/lib/proposal-print-store";

export const dynamic = "force-dynamic";

export default async function ProposalPrintPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) {
    redirect("/");
  }

  const data = await getProposalPrintData(id);
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">
          Дані не знайдено або застаріли. Спробуйте згенерувати PDF ще раз.
        </p>
      </div>
    );
  }

  const formatted = formatProposalData(data.formData);
  const imageUrls = [...data.imageDataUrls];
  while (imageUrls.length < 8) imageUrls.push("");

  return (
    <div
      data-print-root
      className="min-h-screen bg-white flex flex-col items-center py-2 print:py-0"
    >
      <ProposalTemplate
        data={formatted}
        imageUrls={imageUrls}
        baseUrl="/"
        printMode
      />
    </div>
  );
}
