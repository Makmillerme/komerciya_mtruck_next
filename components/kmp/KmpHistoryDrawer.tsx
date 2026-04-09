"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import type { KmpHistoryEntry } from "@/lib/kmp-history-store";
import {
  formatKmpHistoryDate,
  kmpHistoryEntryIdentityLine,
  KMP_MODE_LABELS_LONG,
} from "@/lib/kmp-history-labels";

export type KmpHistoryDrawerProps = {
  open: boolean;
  onClose: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  entries: KmpHistoryEntry[];
  filteredEntries: KmpHistoryEntry[];
  formatUah: (n: number) => string;
  onLoadEntry: (entry: KmpHistoryEntry) => void;
  onRemoveEntry: (id: string) => void;
};

export function KmpHistoryDrawer({
  open,
  onClose,
  search,
  onSearchChange,
  entries,
  filteredEntries,
  formatUah,
  onLoadEntry,
  onRemoveEntry,
}: KmpHistoryDrawerProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 animate-in fade-in-0 duration-200"
        aria-hidden
        onClick={onClose}
      />
      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col rounded-l-xl border-l border-border bg-background shadow-lg ring-1 ring-foreground/10 animate-in slide-in-from-right duration-200 ease-out"
        aria-label="Історія розрахунків КМП"
        role="dialog"
        aria-modal="true"
      >
        <div className="space-y-3 border-b border-border px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-medium leading-snug">
              Історія розрахунків
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0"
              onClick={onClose}
              aria-label="Закрити"
            >
              <X className="size-4" />
            </Button>
          </div>
          <Input
            type="search"
            placeholder="Марка, VIN, контрагент, платіж, дата, id…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-full"
            aria-label="Пошук у історії КМП"
          />
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-4">
          <div className="flex flex-col gap-2">
            {filteredEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {entries.length === 0
                  ? "Немає записів"
                  : "Нічого не знайдено"}
              </p>
            ) : (
              filteredEntries.map((entry) => {
                const idLine = kmpHistoryEntryIdentityLine(entry);
                return (
                  <div
                    key={entry.id}
                    className="space-y-2 rounded-xl border border-border bg-card p-3 ring-1 ring-foreground/10"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 flex-1 truncate text-sm font-medium">
                        {KMP_MODE_LABELS_LONG[entry.summary.mode]}{" "}
                        <span className="tabular-nums text-foreground">
                          {formatUah(entry.summary.monthlyPaymentDisplay)}
                        </span>
                      </p>
                      {entry.sourceProposalHistoryId ? (
                        <span className="shrink-0 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-muted-foreground">
                          КП
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatKmpHistoryDate(entry.date)}
                    </p>
                    {idLine ? (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {idLine}
                      </p>
                    ) : null}
                    <p className="truncate text-xs text-muted-foreground">
                      Тіло:{" "}
                      <span className="tabular-nums">
                        {formatUah(entry.summary.creditBody)}
                      </span>
                      {" · "}відсотки:{" "}
                      <span className="tabular-nums">
                        {formatUah(entry.summary.totalInterest)}
                      </span>
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onLoadEntry(entry)}
                      >
                        Заповнити форму
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => onRemoveEntry(entry.id)}
                        aria-label="Видалити з історії"
                        title="Видалити з історії"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

