"use client";

import { useMemo, useState } from "react";
import type { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { ProposalHistoryEntry } from "@/lib/proposal-history";
import type { KmpFormValues } from "@/lib/kmp-form";
import type { KmpSeedFromProposal } from "@/lib/kmp-from-proposal";
import { KMP_PROPOSAL_HISTORY_NONE } from "@/lib/kmp-history-constants";

function historyLabel(entry: ProposalHistoryEntry): string {
  const d = new Date(entry.date);
  const dateStr = Number.isFinite(d.getTime())
    ? d.toLocaleString("uk-UA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : entry.date;
  const m = entry.formData.model?.trim() || "—";
  const v = entry.formData.vin?.trim() || "—";
  return `${dateStr} · ${m} · ${v}`;
}

function matchesHistorySearch(
  entry: ProposalHistoryEntry,
  raw: string
): boolean {
  const q = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return true;
  const m = (entry.formData.model ?? "").toLowerCase().replace(/\s+/g, " ");
  const v = (entry.formData.vin ?? "").toLowerCase().replace(/\s+/g, " ");
  const parts = q.split(" ").filter(Boolean);
  return parts.every((p) => m.includes(p) || v.includes(p));
}

export type KmpImportFromProposalCardProps = {
  control: Control<KmpFormValues>;
  history: ProposalHistoryEntry[];
  historyPick: string;
  onHistoryPickChange: (id: string) => void;
  historyTriggerLabel: string;
  seedHint: KmpSeedFromProposal | null;
  formatUah: (n: number) => string;
};

export function KmpImportFromProposalCard({
  control,
  history,
  historyPick,
  onHistoryPickChange,
  historyTriggerLabel,
  seedHint,
  formatUah,
}: KmpImportFromProposalCardProps) {
  const [historySearch, setHistorySearch] = useState("");

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim();
    const base = !q
      ? history
      : history.filter((h) => matchesHistorySearch(h, q));
    if (historyPick === KMP_PROPOSAL_HISTORY_NONE) return base;
    const sel = history.find((h) => h.id === historyPick);
    if (!sel) return base;
    if (base.some((h) => h.id === historyPick)) return base;
    return [sel, ...base];
  }, [history, historySearch, historyPick]);

  const textField = (
    name: "identityModel" | "identityVin" | "identityContractor",
    label: string,
    placeholder: string
  ) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              className="h-9"
              placeholder={placeholder}
              autoComplete="off"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Card>
      <CardHeader className="border-b border-border pb-4">
        <CardTitle>Імпорт з КП</CardTitle>
        <CardDescription>
          Оберіть збережену КП, щоб підставити дані та вартість у поля нижче. Марка,
          VIN і контрагент допоможуть знайти цей розрахунок у вашій історії КМП.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 pt-4">
        <div className="flex max-w-2xl flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Запис історії</span>
            <Select
              value={historyPick}
              highlightItemOnHover={false}
              onValueChange={(v) =>
                onHistoryPickChange(v ?? KMP_PROPOSAL_HISTORY_NONE)
              }
            >
              <SelectTrigger className="h-9 w-full min-w-0">
                <span className="truncate text-left">
                  {historyTriggerLabel}
                </span>
              </SelectTrigger>
              <SelectContent
                alignItemWithTrigger={false}
                className="max-h-[min(340px,var(--available-height))]"
                header={
                  <Input
                    type="search"
                    placeholder="Пошук за маркою / моделлю або VIN…"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    autoComplete="off"
                    onMouseDown={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                }
              >
                <SelectItem value={KMP_PROPOSAL_HISTORY_NONE}>
                  Не імпортувати
                </SelectItem>
                {filteredHistory.length === 0 &&
                history.length > 0 &&
                historySearch.trim() ? (
                  <div className="px-3 py-2 text-xs text-muted-foreground">
                    Немає записів за цим запитом.
                  </div>
                ) : (
                  filteredHistory.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {historyLabel(h)}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {history.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Історія порожня — збережіть КП на головній сторінці.
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {textField(
              "identityModel",
              "Марка / модель",
              "Напр. MAN TGX 18.500 4x2, 2022"
            )}
            {textField("identityVin", "VIN", "Напр. WMA06DZZ0MP123456")}
            <div className="sm:col-span-2">
              {textField(
                "identityContractor",
                "Контрагент",
                "Організація або ФОП"
              )}
            </div>
          </div>

          {seedHint ? (
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              {!seedHint.hasPrice ? (
                <p>
                  Недостатньо даних для суми з КП (перевірте поля вартості в записі
                  або вкажіть суму вручну в параметрах угоди).
                </p>
              ) : (
                <p>
                  Вартість з ПДВ з КП (оцінка):{" "}
                  <strong className="text-foreground">
                    {formatUah(seedHint.vehiclePriceUah)}
                  </strong>
                </p>
              )}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

