"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { AppHeader } from "@/components/AppHeader";

export function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPrintPage = pathname?.startsWith("/proposal-print");

  if (isPrintPage) {
    return <div className="min-h-screen bg-[#f1f3f4]">{children}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <AppHeader />
        <main className="min-h-0 min-w-0 w-full flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 pb-10 text-foreground sm:p-6 sm:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
