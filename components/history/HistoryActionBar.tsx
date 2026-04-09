import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Обгортка рядка дій з історією (швидке заповнення + кнопки) — однакові відступи на КП і КМП.
 */
export function HistoryActionBar({
  className,
  leading,
  trailing,
  footer,
}: {
  className?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        {leading}
        {trailing}
      </div>
      {footer}
    </div>
  );
}

