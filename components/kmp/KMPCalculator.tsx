"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { parseCurrencyApiPayload } from "@/lib/currency-api";
import {
  kmpFormEmptyValues,
  kmpFormSchema,
  round2,
  type KmpFormValues,
} from "@/lib/kmp-form";
import { KMP_PROPOSAL_HISTORY_NONE } from "@/lib/kmp-history-constants";
import { kmpHistoryAutoSaveFingerprint } from "@/lib/kmp-history-fingerprint";
import { mapProposalHistoryToKmpSeed } from "@/lib/kmp-from-proposal";
import type { CurrencyRatesSnapshot } from "@/lib/proposal-cost-from-form";
import { readKmpDraft } from "@/lib/kmp-draft";
import type { KmpHistoryEntry } from "@/lib/kmp-history-store";
import type { KmpPaymentMode } from "@/lib/kmp-loan";
import { queryKeys } from "@/lib/query-keys";
import type { ProposalHistoryEntry } from "@/lib/proposal-history";
import {
  useKmpHistoryList,
  useRemoveKmpHistoryEntry,
  useSaveKmpHistoryEntry,
} from "@/hooks/use-kmp-history";
import { useProposalHistoryList } from "@/hooks/use-proposal-history";
import { KmpHistoryDrawer } from "@/components/kmp/KmpHistoryDrawer";
import { KmpImportFromProposalCard } from "@/components/kmp/KmpImportFromProposalCard";
import {
  filterKmpHistoryBySearch,
  KMP_MODE_LABELS_LONG,
} from "@/lib/kmp-history-labels";
import {
  KmpCalculatorLivePanel,
  KmpDraftAutosave,
} from "@/components/kmp/KmpCalculatorLiveBlocks";
import { formatKmpUah0, formatKmpUah2 } from "@/lib/kmp-format-uah";

type CurrencyApi = CurrencyRatesSnapshot & { updatedAt?: string };

function clampPercent0to100(p: number): number {
  return Math.min(100, Math.max(0, p));
}

const formatUah = formatKmpUah0;
const formatUah2 = formatKmpUah2;

function historyCompactLabel(entry: ProposalHistoryEntry): string {
  const m = entry.formData.model?.trim() || "—";
  const v = entry.formData.vin?.trim() || "—";
  return `${m} · ${v}`;
}

/** Задає value для input, зберігаючи курсор у числових полях. */
function setInputValue(el: HTMLInputElement | null, value: string) {
  if (!el) return;
  if (el.value !== value) el.value = value;
}

export function KMPCalculator() {
  const draftWriteReadyRef = useRef(false);
  /** Збільшується після кожного `form.reset`, щоб жива панель синхронізувала `watched` (порядок layout-ефектів батько/дитина не гарантує reset до першого `getValues` у дитини). */
  const [formValuesSyncTick, setFormValuesSyncTick] = useState(0);
  const [lastSavedKmpFingerprint, setLastSavedKmpFingerprint] = useState<
    string | null
  >(null);
  const [historyPick, setHistoryPick] = useState<string>(
    KMP_PROPOSAL_HISTORY_NONE
  );
  const [kmpHistoryOpen, setKmpHistoryOpen] = useState(false);
  const [kmpHistorySearch, setKmpHistorySearch] = useState("");
  const [modeValue, setModeValue] = useState<KmpPaymentMode>("annuity");

  const kmpDefaultValues = useMemo(() => kmpFormEmptyValues(), []);

  const form = useForm<KmpFormValues>({
    resolver: zodResolver(kmpFormSchema) as Resolver<KmpFormValues>,
    mode: "onBlur",
    defaultValues: kmpDefaultValues,
  });

  const advPctRef = useRef<HTMLInputElement | null>(null);
  const advSumRef = useRef<HTMLInputElement | null>(null);

  const advPctReg = form.register("downPaymentPercent", {
    valueAsNumber: true,
    onChange(e: React.ChangeEvent<HTMLInputElement>) {
      const t = e.target.value;
      const raw = Number.parseFloat(t);
      const p = clampPercent0to100(t === "" ? 0 : Number.isFinite(raw) ? raw : 0);
      form.setValue("downPaymentPercent", p);
      syncAdvanceFromPercent(p);
    },
  });
  const advSumReg = form.register("downPaymentSum", {
    valueAsNumber: true,
    onChange(e: React.ChangeEvent<HTMLInputElement>) {
      const t = e.target.value;
      const raw = Number.parseFloat(t);
      const s = t === "" ? 0 : Number.isFinite(raw) ? raw : 0;
      const price = Math.round(form.getValues("vehiclePriceUah"));
      const capped = price > 0 ? Math.min(Math.max(0, s), price) : Math.max(0, s);
      form.setValue("downPaymentSum", capped);
      syncAdvanceFromSum(capped);
    },
  });

  const vehiclePriceW = useWatch({ control: form.control, name: "vehiclePriceUah" });
  const downPaymentSumW = useWatch({ control: form.control, name: "downPaymentSum" });
  const financingDisplay = useMemo(() => {
    const price = Math.round(Number(vehiclePriceW ?? 0));
    const advance = round2(Math.max(0, Number(downPaymentSumW ?? 0)));
    const financingUah = round2(Math.max(0, price - advance));
    const financingPct =
      price > 0 ? round2((financingUah / price) * 100) : 0;
    return { financingUah, financingPct };
  }, [vehiclePriceW, downPaymentSumW]);

  const { data: rates = null } = useQuery({
    queryKey: queryKeys.currency,
    queryFn: async (): Promise<CurrencyApi | null> => {
      const r = await fetch("/api/currency");
      if (!r.ok) return null;
      const json = (await r.json()) as unknown;
      return parseCurrencyApiPayload(json);
    },
  });

  const { data: history = [], isFetched: proposalHistoryFetched } =
    useProposalHistoryList();
  const { data: kmpHistoryList = [] } = useKmpHistoryList();

  const kmpLast5 = useMemo(
    () => kmpHistoryList.slice(0, 5),
    [kmpHistoryList]
  );

  const kmpHistoryFiltered = useMemo(
    () =>
      filterKmpHistoryBySearch(
        kmpHistoryList,
        kmpHistorySearch,
        formatUah
      ),
    [kmpHistoryList, kmpHistorySearch]
  );

  const saveKmpMutation = useSaveKmpHistoryEntry({
    onSaved: (entry) => {
      if (!entry) return;
      setLastSavedKmpFingerprint(
        kmpHistoryAutoSaveFingerprint(
          entry.inputs,
          entry.summary,
          entry.sourceProposalHistoryId
        )
      );
    },
  });

  const deleteKmpMutation = useRemoveKmpHistoryEntry();

  useLayoutEffect(() => {
    const d = readKmpDraft();
    if (d?.v === 1 && d.values) {
      form.reset({
        ...kmpFormEmptyValues(),
        ...d.values,
        residualSum: 0,
        residualPercent: 0,
      });
      if (d.values.mode) setModeValue(d.values.mode);
      setFormValuesSyncTick((n) => n + 1);
    }
    if (typeof d?.historyPick === "string") {
      setHistoryPick(d.historyPick);
    }
    draftWriteReadyRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const selectedEntry =
    historyPick !== KMP_PROPOSAL_HISTORY_NONE
      ? history.find((h) => h.id === historyPick)
      : undefined;

  const seedHint = selectedEntry
    ? mapProposalHistoryToKmpSeed(
        selectedEntry,
        rates ? { usd: rates.usd, eur: rates.eur } : null
      )
    : null;

  const historyTriggerLabel =
    historyPick === KMP_PROPOSAL_HISTORY_NONE
      ? "Оберіть КП з історії"
      : selectedEntry
        ? historyCompactLabel(selectedEntry)
        : proposalHistoryFetched
          ? "Запис у історії КП не знайдено"
          : "Завантаження…";

  const loadKmpHistoryEntry = (entry: KmpHistoryEntry) => {
    const vals = {
      ...kmpFormEmptyValues(),
      ...entry.inputs,
      residualSum: 0,
      residualPercent: 0,
    };
    form.reset(vals);
    setFormValuesSyncTick((n) => n + 1);
    setModeValue(vals.mode);
    setHistoryPick(entry.sourceProposalHistoryId ?? KMP_PROPOSAL_HISTORY_NONE);
    setLastSavedKmpFingerprint(
      kmpHistoryAutoSaveFingerprint(
        entry.inputs,
        entry.summary,
        entry.sourceProposalHistoryId
      )
    );
    setKmpHistoryOpen(false);
  };

  const openKmpHistory = () => {
    setKmpHistoryOpen(true);
  };

  const removeKmpFromHistory = (id: string) => {
    deleteKmpMutation.mutate(id);
  };

  const onProposalHistoryIdChange = (idPick: string) => {
    setHistoryPick(idPick);
    if (idPick === KMP_PROPOSAL_HISTORY_NONE) return;
    const entry = history.find((h) => h.id === idPick);
    if (!entry) return;
    const seed = mapProposalHistoryToKmpSeed(
      entry,
      rates ? { usd: rates.usd, eur: rates.eur } : null
    );
    const modelLine = [seed.model.trim(), seed.year.trim()]
      .filter(Boolean)
      .join(", ");
    form.setValue("identityModel", modelLine);
    form.setValue("identityVin", seed.vin.trim());
    form.setValue("identityContractor", "");
    if (seed.hasPrice && seed.vehiclePriceUah > 0) {
      const p = seed.vehiclePriceUah;
      form.setValue("vehiclePriceUah", p);
      const pct = form.getValues("downPaymentPercent");
      form.setValue("downPaymentSum", round2((p * Math.min(100, Math.max(0, pct))) / 100));
      form.setValue("residualPercent", 0);
      form.setValue("residualSum", 0);
    }
  };

  const syncDerivedFromPrice = useCallback((price: number) => {
    if (price > 0) {
      const pct = clampPercent0to100(form.getValues("downPaymentPercent"));
      const advSum = round2((price * pct) / 100);
      form.setValue("downPaymentSum", advSum);
      setInputValue(advSumRef.current, advSum === 0 ? "" : String(advSum));
      form.setValue("residualPercent", 0);
      form.setValue("residualSum", 0);
    } else {
      form.setValue("downPaymentSum", 0);
      setInputValue(advSumRef.current, "");
      form.setValue("residualPercent", 0);
      form.setValue("residualSum", 0);
    }
  }, [form]);

  const syncAdvanceFromPercent = useCallback((pct: number) => {
    const price = Math.round(form.getValues("vehiclePriceUah"));
    const c = clampPercent0to100(pct);
    form.setValue("downPaymentPercent", c);
    form.setValue("residualPercent", 0);
    form.setValue("residualSum", 0);
    if (price > 0 && c > 0) {
      const s = round2((price * c) / 100);
      form.setValue("downPaymentSum", s);
      setInputValue(advSumRef.current, String(s));
    } else {
      form.setValue("downPaymentSum", 0);
      setInputValue(advSumRef.current, "");
    }
  }, [form]);

  const syncAdvanceFromSum = useCallback((sum: number) => {
    const price = Math.round(form.getValues("vehiclePriceUah"));
    const raw = round2(Math.max(0, sum));
    const capped = price > 0 ? Math.min(raw, price) : raw;
    form.setValue("downPaymentSum", capped);
    form.setValue("residualPercent", 0);
    form.setValue("residualSum", 0);
    if (price > 0 && capped > 0) {
      const p = round2((capped / price) * 100);
      form.setValue("downPaymentPercent", p);
      setInputValue(advPctRef.current, String(p));
    } else {
      form.setValue("downPaymentPercent", 0);
      setInputValue(advPctRef.current, "");
    }
  }, [form]);

  return (
    <>
      <KmpDraftAutosave
        form={form}
        historyPick={historyPick}
        readyRef={draftWriteReadyRef}
      />
      <div className="flex min-w-0 flex-col gap-8">
          <FormProvider {...form}>
          <div className="grid min-w-0 gap-6">
            <KmpImportFromProposalCard
              control={form.control}
              history={history}
              historyPick={historyPick}
              onHistoryPickChange={onProposalHistoryIdChange}
              historyTriggerLabel={historyTriggerLabel}
              seedHint={seedHint}
              formatUah={formatUah}
            />
            <Card>
              <CardHeader className="border-b border-border pb-4">
                <CardTitle>Параметри угоди</CardTitle>
                <CardDescription>
                  Вкажіть ціну, аванс, строк і ставку — платежі та графік оновлюються
                  автоматично. Режим: аннуїтет або рівні частки тіла; кредитне тіло дорівнює
                  сумі фінансування (ціна мінус аванс), без балуну на кінець строку.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="kmp-price">Повна вартість авто з ПДВ, грн</Label>
                  <Input
                    id="kmp-price"
                    type="number"
                    min={1}
                    step={1}
                    inputMode="numeric"
                    defaultValue=""
                    {...form.register("vehiclePriceUah", {
                      valueAsNumber: true,
                      onChange(e: React.ChangeEvent<HTMLInputElement>) {
                        const raw = e.target.value;
                        const parsed = Number.parseInt(raw, 10);
                        const price = raw === "" ? 0 : Number.isFinite(parsed) ? parsed : 0;
                        form.setValue("vehiclePriceUah", price);
                        syncDerivedFromPrice(price);
                      },
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kmp-adv-pct">Аванс, %</Label>
                  <Input
                    id="kmp-adv-pct"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    defaultValue=""
                    {...advPctReg}
                    ref={(el) => { advPctReg.ref(el); advPctRef.current = el; }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kmp-adv-sum">Сума авансу, грн</Label>
                  <Input
                    id="kmp-adv-sum"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue=""
                    {...advSumReg}
                    ref={(el) => { advSumReg.ref(el); advSumRef.current = el; }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kmp-term">Термін, міс.</Label>
                  <Input
                    id="kmp-term"
                    type="number"
                    min={1}
                    step={1}
                    defaultValue=""
                    {...form.register("termMonths", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kmp-rate">Ставка річних, %</Label>
                  <Input
                    id="kmp-rate"
                    type="number"
                    min={0}
                    step={0.01}
                    defaultValue=""
                    {...form.register("annualRatePercent", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kmp-fee">Разова комісія, %</Label>
                  <Input
                    id="kmp-fee"
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    defaultValue=""
                    {...form.register("feePercent", { valueAsNumber: true })}
                  />
                </div>

                <div className="col-span-full grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Тип платежів</Label>
                    <Select
                      value={modeValue}
                      onValueChange={(v) => {
                        const m = (v ?? "annuity") as KmpPaymentMode;
                        setModeValue(m);
                        form.setValue("mode", m);
                      }}
                    >
                      <SelectTrigger className="w-full min-w-0">
                        <span className="truncate text-left">
                          {KMP_MODE_LABELS_LONG[modeValue]}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annuity">
                          {KMP_MODE_LABELS_LONG.annuity}
                        </SelectItem>
                        <SelectItem value="differentiated">
                          {KMP_MODE_LABELS_LONG.differentiated}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Сума фінансування, грн</Label>
                    <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/40 px-3 py-1 text-sm tabular-nums">
                      {formatUah2(financingDisplay.financingUah)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Сума фінансування, % від ціни</Label>
                    <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/40 px-3 py-1 text-sm tabular-nums">
                      {financingDisplay.financingPct.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="col-span-full flex flex-row items-center gap-2">
                  <input
                    id="kmp-vat"
                    type="checkbox"
                    className="size-4 rounded border-input accent-primary"
                    defaultChecked={true}
                    {...form.register("showVatBreakdown")}
                  />
                  <Label htmlFor="kmp-vat" className="font-normal leading-snug">
                    Відображати ПДВ (20%) у структурі виплат
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
          </FormProvider>

          <div className="min-w-0">
            <KmpCalculatorLivePanel
            form={form}
            formValuesSyncTick={formValuesSyncTick}
            kmpLast5={kmpLast5}
            loadKmpHistoryEntry={loadKmpHistoryEntry}
            openKmpHistory={openKmpHistory}
            saveKmpMutation={saveKmpMutation}
            historyPick={historyPick}
            lastSavedKmpFingerprint={lastSavedKmpFingerprint}
            formatUah={formatUah}
            formatUah2={formatUah2}
          />
          </div>
      </div>

      <KmpHistoryDrawer
        open={kmpHistoryOpen}
        onClose={() => setKmpHistoryOpen(false)}
        search={kmpHistorySearch}
        onSearchChange={setKmpHistorySearch}
        entries={kmpHistoryList}
        filteredEntries={kmpHistoryFiltered}
        formatUah={formatUah}
        onLoadEntry={loadKmpHistoryEntry}
        onRemoveEntry={removeKmpFromHistory}
      />
    </>
  );
}
