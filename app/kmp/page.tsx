import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

function KmpCalculatorFallback() {
  return (
    <div className="flex w-full flex-col gap-6">
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

const KMPCalculator = dynamic(
  () => import("@/components/kmp/KMPCalculator").then((m) => m.KMPCalculator),
  { loading: () => <KmpCalculatorFallback /> }
);

export default function KMPPage() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-3 sm:px-4 lg:max-w-7xl xl:max-w-[85rem] 2xl:max-w-[92rem] lg:px-6">
      <KMPCalculator />
    </div>
  );
}

