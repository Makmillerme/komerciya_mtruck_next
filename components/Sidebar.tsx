"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Calculator } from "lucide-react";

const navItems = [
  { href: "/", label: "КП", icon: FileText },
  { href: "/kmp", label: "КМП", icon: Calculator },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-52 shrink-0 h-full border-r border-border bg-card flex flex-col"
      aria-label="Навігація"
    >
      <div className="h-14 shrink-0 flex items-center px-4 border-b border-border">
        <Link href="/" className="text-sm font-medium tracking-tight text-foreground">
          M-Truck
        </Link>
      </div>
      <nav className="p-2 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
