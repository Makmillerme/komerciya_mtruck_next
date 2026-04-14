"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect, useMemo, useState, type RefObject } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type KmpDraftV1, writeKmpDraft } from "@/lib/kmp-draft";
import {
  kmpFormSchema,
  round2,
  type KmpFormValues,
} from "@/lib/kmp-form";
import { saveKmpHistoryEntry } from "@/lib/kmp-history-api";
import { KMP_PROPOSAL_HISTORY_NONE } from "@/lib/kmp-history-constants";
import { kmpHistoryAutoSaveFingerprint } from "@/lib/kmp-history-fingerprint";
import type { KmpHistoryEntry } from "@/lib/kmp-history-store";
import { computeHtmlLoan } from "@/lib/kmp-loan";
import { KmpHistoryToolbar } from "@/components/kmp/KmpHistoryToolbar";

const KmpPieStructureCard = dynamic(
  () =>
    import("@/components/kmp/KMPCharts").then((m) => m.KmpPieStructureCard),
  {
    loading: () => (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-56 w-full" />
        </CardContent>
      </Card>
    ),
  }
);

const KmpBarLineChartGrid = dynamic(
  () =>
    import("@/components/kmp/KMPCharts").then((m) => m.KmpBarLineChartGrid),
  {
    loading: () => (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[300px] w-full rounded-lg" />
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    ),
  }
);

/** Автозбереження чернетки без useWatch — лише subscribe + дебаунс (менше зайвих ре-рендерів). */
export function KmpDraftAutosave({
  form,
  historyPick,
  readyRef,
}: {
  form: UseFormReturn<KmpFormValues>;
  historyPick: string;
  readyRef: RefObject<boolean>;
}) {
  useEffect(() => {
    let timeoutId: number | undefined;

    const flushDraft = () => {
      if (!readyRef.current) return;
      try {
        const draft: KmpDraftV1 = {
          v: 1,
          values: form.getValues(),
          historyPick,
        };
        writeKmpDraft(draft);
      } catch {
        /* */
      }
    };

    const schedule = () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(flushDraft, 400);
    };

    const flushNow = () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
      flushDraft();
    };

    const sub = form.watch(() => {
      if (!readyRef.current) return;
      schedule();
    });

    window.addEventListener("pagehide", flushNow);
    window.addEventListener("beforeunload", flushNow);

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      sub.unsubscribe();
      window.removeEventListener("pagehide", flushNow);
      window.removeEventListener("beforeunload", flushNow);
    };
  }, [form, historyPick, readyRef]);

  useEffect(() => {
    if (!readyRef.current) return;
    try {
      writeKmpDraft({
        v: 1,
        values: form.getValues(),
        historyPick,
      });
    } catch {
      /* */
    }
  }, [form, historyPick, readyRef]);

  return null;
}

type SaveMut = UseMutationResult<
  Awaited<ReturnType<typeof saveKmpHistoryEntry>>,
  Error,
  Parameters<typeof saveKmpHistoryEntry>[0]
>;

function buildLoanFromParsed(d: KmpFormValues) {
  const price = Math.round(d.vehiclePriceUah);
  const advanceSum = round2(Math.max(0, d.downPaymentSum));
  const residualSum = round2(Math.max(0, d.residualSum));
  return computeHtmlLoan({
    price,
    advanceSum,
    residualSum,
    termMonths: Math.floor(d.termMonths),
    annualRatePercent: d.annualRatePercent,
    feePercent: d.feePercent,
    mode: d.mode,
  });
}

/**
 * Панель тулбару, зведення та графіків — окремо від форми вводу, щоб useWatch + важкі розрахунки
 * не ре-рендерили інпути як children. useDeferredValue прибрано — у поєднанні з React 19 + RHF давало
 * «Maximum update depth exceeded» при швидкому вводі.
 */
export function KmpCalculatorLivePanel({
  form,
  formValuesSyncTick,
  kmpLast5,
  loadKmpHistoryEntry,
  openKmpHistory,
  saveKmpMutation,
  historyPick,
  lastSavedKmpFingerprint,
  formatUah,
  formatUah2,
}: {
  form: UseFormReturn<KmpFormValues>;
  /** Збільшується в `KMPCalculator` після `form.reset` (чернетка / завантаження з історії). */
  formValuesSyncTick: number;
  kmpLast5: readonly KmpHistoryEntry[];
  loadKmpHistoryEntry: (entry: KmpHistoryEntry) => void;
  openKmpHistory: () => void;
  saveKmpMutation: SaveMut;
  historyPick: string;
  lastSavedKmpFingerprint: string | null;
  formatUah: (n: number) => string;
  formatUah2: (n: number) => string;
}) {
  const [watched, setWatched] = useState<KmpFormValues>(() => form.getValues());

  /**
   * Після `form.reset` у батьківському `KMPCalculator` оновлюємо знімок; `formValuesSyncTick` гарантує повтор після reset.
   * `setWatched` лише в microtask — без синхронного setState в тілі ефекту (eslint react-hooks/set-state-in-effect).
   */
  useLayoutEffect(() => {
    queueMicrotask(() => {
      setWatched(form.getValues());
    });
  }, [form, formValuesSyncTick]);

  useEffect(() => {
    let timeoutId: number | undefined;
    const sub = form.watch(() => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setWatched(form.getValues());
      }, 400);
    });
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      sub.unsubscribe();
    };
  }, [form, formValuesSyncTick]);

  const { parsed, loanParsed } = useMemo(() => {
    const r = kmpFormSchema.safeParse(watched);
    if (!r.success) return { parsed: null as KmpFormValues | null, loanParsed: null };
    const d = r.data;
    return { parsed: d, loanParsed: buildLoanFromParsed(d) };
  }, [watched]);

  const chartRows = useMemo(() => {
    if (!loanParsed?.schedule.length) return [];
    return loanParsed.schedule.map((row) => ({
      month: row.month,
      Тіло: row.principal,
      Відсотки: row.interest,
      Залишок: row.balanceAfter,
    }));
  }, [loanParsed]);

  const pieData = useMemo(() => {
    if (!loanParsed || !parsed) return [];
    const price = Math.round(parsed.vehiclePriceUah);
    const advance = round2(Math.max(0, parsed.downPaymentSum));
    const creditBody = loanParsed.creditBody;
    const residual = round2(Math.max(0, parsed.residualSum));
    const vatPart = round2(price - price / 1.2);
    const advanceNet = round2(advance / 1.2);
    const bodyNet = round2(creditBody / 1.2);
    const residualNet = round2(residual / 1.2);
    const interest = loanParsed.totalInterest;
    const fee = loanParsed.oneTimeFee;
    if (parsed.showVatBreakdown) {
      return [
        { name: "Аванс", value: advanceNet },
        { name: "Тіло кредиту", value: bodyNet },
        { name: "Залишок", value: residualNet },
        { name: "ПДВ (20%)", value: vatPart },
        { name: "Разова комісія", value: round2(fee) },
        { name: "Відсотки по кредиту", value: round2(interest) },
      ].filter((x) => x.value > 0);
    }
    return [
      { name: "Аванс", value: round2(advance) },
      { name: "Тіло кредиту", value: round2(creditBody) },
      { name: "Залишок", value: round2(residual) },
      { name: "Разова комісія", value: round2(fee) },
      { name: "Відсотки по кредиту", value: round2(interest) },
    ].filter((x) => x.value > 0);
  }, [loanParsed, parsed]);

  const pieTotal = useMemo(
    () => round2(pieData.reduce((s, x) => s + x.value, 0)),
    [pieData]
  );

  const currentKmpFingerprint = useMemo(() => {
    if (!parsed || !loanParsed) return null;
    const sid =
      historyPick === KMP_PROPOSAL_HISTORY_NONE ? null : historyPick;
    const summary = {
      creditBody: loanParsed.creditBody,
      totalInterest: loanParsed.totalInterest,
      totalPaymentSum: loanParsed.totalPaymentSum,
      oneTimeFee: loanParsed.oneTimeFee,
      monthlyPaymentDisplay: loanParsed.monthlyPaymentDisplay,
      interestPercentOfPrice: loanParsed.interestPercentOfPrice,
      mode: parsed.mode,
    };
    return kmpHistoryAutoSaveFingerprint(parsed, summary, sid);
  }, [loanParsed, historyPick, parsed]);

  const canSaveKmpToHistory =
    Boolean(currentKmpFingerprint) &&
    currentKmpFingerprint !== lastSavedKmpFingerprint &&
    !saveKmpMutation.isPending;

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <KmpHistoryToolbar
        kmpLast5={kmpLast5}
        onPickRecent={loadKmpHistoryEntry}
        onOpenHistory={openKmpHistory}
        canSave={canSaveKmpToHistory}
        savePending={saveKmpMutation.isPending}
        onSave={() => {
          const fresh = kmpFormSchema.safeParse(form.getValues());
          if (!fresh.success) return;
          const d = fresh.data;
          const loanNow = buildLoanFromParsed(d);
          if (!loanNow) return;
          saveKmpMutation.mutate({
            inputs: d,
            summary: {
              creditBody: loanNow.creditBody,
              totalInterest: loanNow.totalInterest,
              totalPaymentSum: loanNow.totalPaymentSum,
              oneTimeFee: loanNow.oneTimeFee,
              monthlyPaymentDisplay: loanNow.monthlyPaymentDisplay,
              interestPercentOfPrice: loanNow.interestPercentOfPrice,
              mode: d.mode,
            },
            sourceProposalHistoryId:
              historyPick === KMP_PROPOSAL_HISTORY_NONE ? null : historyPick,
          });
        }}
      />
      {loanParsed && parsed ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Щомісячний платіж</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {formatUah(loanParsed.monthlyPaymentDisplay)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {parsed.mode === "annuity"
                    ? "Фіксований платіж"
                    : "Середній платіж (диференційований)"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Переплата (відсотки)</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {formatUah(loanParsed.totalInterest)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <span className="inline-flex rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground">
                  +{loanParsed.interestPercentOfPrice.toFixed(1)}% до ціни
                </span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Перший внесок (разом)</CardDescription>
                <CardTitle className="text-2xl tabular-nums">
                  {formatUah(
                    round2(parsed.downPaymentSum ?? 0) +
                      (loanParsed.oneTimeFee ?? 0)
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Аванс</span>
                  <span className="font-medium text-foreground">
                    {formatUah(round2(parsed.downPaymentSum ?? 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Комісія</span>
                  <span className="font-medium text-foreground">
                    {formatUah(loanParsed.oneTimeFee ?? 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
          <KmpPieStructureCard
            key={parsed.showVatBreakdown ? "pie-vat-on" : "pie-vat-off"}
            pieData={pieData}
            pieTotal={pieTotal}
            formatUah={formatUah2}
            description={
              parsed.showVatBreakdown
                ? undefined
                : "Діаграма у гривнях з ПДВ: аванс і тіло кредиту (сума фінансування) без окремого сегмента ПДВ; додано комісія та відсотки. Сума сегментів = вартість ТЗ + комісія + відсотки."
            }
          />
        </>
      ) : null}
      <KmpBarLineChartGrid chartRows={chartRows} formatUah={formatUah} />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Графік платежів</CardTitle>
          <CardDescription>
            Дати та суми орієнтовні; залишок боргу після кожного платежу (у кінці
            строку ≈ 0 без балуну на кінець).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loanParsed && loanParsed.schedule.length ? (
            <div className="max-h-96 overflow-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    <th className="p-2 font-medium">№</th>
                    <th className="p-2 font-medium">Дата</th>
                    <th className="p-2 font-medium">Платіж</th>
                    <th className="p-2 font-medium">Тіло</th>
                    <th className="p-2 font-medium">Відсотки</th>
                    <th className="p-2 font-medium">Залишок</th>
                  </tr>
                </thead>
                <tbody>
                  {loanParsed.schedule.map((row) => (
                    <tr
                      key={row.month}
                      className="border-b border-border/80 hover:bg-muted/30"
                    >
                      <td className="p-2">{row.month}</td>
                      <td className="p-2 text-muted-foreground">{row.date}</td>
                      <td className="p-2">{formatUah(row.payment)}</td>
                      <td className="p-2">{formatUah(row.principal)}</td>
                      <td className="p-2">{formatUah(row.interest)}</td>
                      <td className="p-2">{formatUah(row.balanceAfter)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Таблиця з&apos;явиться після коректного заповнення форми.
            </p>
          )}
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        Індикативний розрахунок: умови банку, страхові продукти та комісії можуть
        змінювати фактичні платежі. Не є офертою.
      </p>
    </div>
  );
}
