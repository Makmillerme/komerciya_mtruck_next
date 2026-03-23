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
        <main className="flex-1 min-h-0 overflow-auto bg-background text-foreground p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
