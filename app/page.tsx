import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function ProposalFormFallback() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Skeleton className="mx-auto h-9 w-full max-w-md" />
      <Skeleton className="h-[min(520px,70vh)] w-full rounded-xl" />
    </div>
  );
}

const ProposalForm = dynamic(
  () => import("@/components/ProposalForm").then((m) => m.ProposalForm),
  { loading: () => <ProposalFormFallback /> }
);

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <ProposalForm />
    </div>
  );
}
