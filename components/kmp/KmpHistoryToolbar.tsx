"use client";

import { Button } from "@/components/ui/button";
import { HistoryActionBar } from "@/components/history/HistoryActionBar";
import type { KmpHistoryEntry } from "@/lib/kmp-history-store";
import { kmpSavedEntryLabel } from "@/lib/kmp-history-labels";

export type KmpHistoryToolbarProps = {
  kmpLast5: readonly KmpHistoryEntry[];
  onPickRecent: (entry: KmpHistoryEntry) => void;
  onOpenHistory: () => void;
  canSave: boolean;
  savePending: boolean;
  onSave: () => void;
};

export function KmpHistoryToolbar({
  kmpLast5,
  onPickRecent,
  onOpenHistory,
  canSave,
  savePending,
  onSave,
}: KmpHistoryToolbarProps) {
  return (
    <HistoryActionBar
      leading={
        kmpLast5.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Заповнити з останнього:
            </span>
            {kmpLast5.map((entry, i) => (
              <Button
                key={entry.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-9 min-w-9 px-3"
                onClick={() => onPickRecent(entry)}
                title={kmpSavedEntryLabel(entry)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            Збережіть валідний розрахунок кнопкою нижче — він з&apos;явиться тут
            швидким вибором.
          </span>
        )
      }
      trailing={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9"
            onClick={onOpenHistory}
          >
            Історія розрахунків
          </Button>
          <Button
            type="button"
            disabled={!canSave || savePending}
            size="sm"
            className="h-9"
            onClick={onSave}
          >
            {savePending ? "Збереження…" : "Зберегти в історію"}
          </Button>
        </div>
      }
    />
  );
}

