"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { proposalSchema, type ProposalFormData } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  fetchProposalHistory,
  saveProposalHistoryEntry,
  removeProposalHistoryEntry,
  fileToDataUrl,
  dataUrlToFile,
  type ProposalHistoryEntry,
} from "@/lib/proposal-history";
import { ProposalTemplate } from "@/components/templates/ProposalTemplate";
import { formatProposalData } from "@/lib/format-proposal-data";

function reorderFiles(arr: File[], from: number, to: number): File[] {
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function ProposalForm() {
  const [photos, setPhotos] = useState<File[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyList, setHistoryList] = useState<ProposalHistoryEntry[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [last5, setLast5] = useState<ProposalHistoryEntry[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPhotoUrls, setPreviewPhotoUrls] = useState<string[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [currencyRates, setCurrencyRates] = useState<{ usd: { buy: string; sell: string }; eur: { buy: string; sell: string }; updatedAt: string } | null>(null);

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    mode: "onChange",
    defaultValues: {
      model: "",
      vin: "",
      year: "",
      mileage: "",
      color: "",
      country: "",
      body_type: "",
      wheel_formula: "",
      engine_type: "",
      engine_volume: "",
      power: "",
      gearbox: "",
      seats: "",
      technical_state: "",
      cost_mode: "calculator",
      currency_value: "",
      percent_base: "",
      additional_services: "",
      currency_non_cash_manual: "",
      currency_code: "usd",
      show_currency_non_cash: true,
      price_with_vat: "",
      price_without_vat: "",
      vat: "",
    },
  });

  const PHOTO_COUNT_REQUIRED = 8;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const next = [...photos, ...files].slice(0, PHOTO_COUNT_REQUIRED);
    setPhotos(next);
    if (next.length > PHOTO_COUNT_REQUIRED) setError(`Максимум ${PHOTO_COUNT_REQUIRED} фото`);
    else setError(null);
  };

  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    if (dragIndex === i) setDragIndex(null);
    else if (dragIndex != null && dragIndex > i) setDragIndex(dragIndex - 1);
  };

  const handlePhotoDragStart = (i: number) => setDragIndex(i);
  const handlePhotoDragEnd = () => setDragIndex(null);
  const handlePhotoDragOver = (e: React.DragEvent) => e.preventDefault();
  const handlePhotoDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;
    setPhotos((p) => reorderFiles(p, dragIndex, dropIndex));
    setDragIndex(null);
  };

  const defaultCostFields: Partial<ProposalFormData> = {
    cost_mode: "calculator",
    currency_value: "",
    percent_base: "",
    additional_services: "",
    currency_non_cash_manual: "",
    currency_code: "usd",
    show_currency_non_cash: true,
  };
  const mergeFormData = (entry: ProposalHistoryEntry): ProposalFormData => {
    const fd = entry.formData as Partial<ProposalFormData>;
    return {
      ...defaultCostFields,
      ...fd,
      cost_mode: fd.cost_mode === "manual" ? "manual" : "calculator",
      currency_non_cash_manual:
        typeof fd.currency_non_cash_manual === "string"
          ? fd.currency_non_cash_manual
          : "",
    } as ProposalFormData;
  };

  const reloadHistory = async () => {
    const h = await fetchProposalHistory();
    setLast5(h.slice(0, 5));
    setHistoryList(h);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const h = await fetchProposalHistory();
      if (cancelled) return;
      setLast5(h.slice(0, 5));
      if (h.length > 0) {
        const entry = h[0];
        form.reset(mergeFormData(entry));
        if (entry.photoDataUrls?.length) {
          setPhotos(
            entry.photoDataUrls.map((url, i) => dataUrlToFile(url, `photo-${i}.jpg`))
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openHistory = () => {
    void (async () => {
      const h = await fetchProposalHistory();
      setHistoryList(h);
      setLast5(h.slice(0, 5));
      setHistoryOpen(true);
    })();
  };

  const loadHistoryEntry = (entry: ProposalHistoryEntry) => {
    form.reset(mergeFormData(entry));
    if (entry.photoDataUrls?.length) {
      setPhotos(
        entry.photoDataUrls.map((url, i) => dataUrlToFile(url, `photo-${i}.jpg`))
      );
    } else {
      setPhotos([]);
    }
    setHistoryOpen(false);
  };

  const removeFromHistory = (id: string) => {
    void (async () => {
      await removeProposalHistoryEntry(id);
      await reloadHistory();
    })();
  };

  const historyFiltered =
    historySearch.trim() === ""
      ? historyList
      : historyList.filter((entry) => {
          const q = historySearch.trim().toLowerCase();
          const model = (entry.formData.model ?? "").toLowerCase();
          const vin = (entry.formData.vin ?? "").toLowerCase();
          return model.includes(q) || vin.includes(q);
        });

  const onSubmit = async (data: ProposalFormData) => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        const val = typeof v === "boolean" ? String(v) : v;
        if (typeof val === "string") formData.append(k, val);
      });
      photos.forEach((f) => formData.append("photos", f));

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const json = await res.json();

      if (json.success) {
        const photoDataUrls =
          photos.length > 0
            ? await Promise.all(photos.slice(0, 8).map(fileToDataUrl))
            : undefined;
        await saveProposalHistoryEntry({
          file: json.file,
          formData: data,
          photoDataUrls,
        });
        await reloadHistory();
        if (json.pdf_base64 && json.file) {
          const bin = atob(json.pdf_base64);
          const arr = new Uint8Array(bin.length);
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          const blob = new Blob([arr], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = json.file;
          a.click();
          URL.revokeObjectURL(url);
        }
        setSuccess(json.download_url ?? "downloaded");
      } else {
        setError(json.error ?? "Помилка");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Помилка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    if (photos.length === 0) {
      const empty: string[] = [];
      while (empty.length < 8) empty.push("");
      setPreviewPhotoUrls(empty);
      setPreviewLoading(false);
      return;
    }
    Promise.all(photos.slice(0, 8).map(fileToDataUrl))
      .then((urls) => {
        if (cancelled) return;
        const padded = [...urls];
        while (padded.length < 8) padded.push("");
        setPreviewPhotoUrls(padded);
      })
      .catch((err) => {
        if (!cancelled) setPreviewError(err instanceof Error ? err.message : "Помилка");
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => { cancelled = true; };
  }, [photos]);

  useEffect(() => {
    fetch("/api/currency")
      .then((r) => r.json())
      .then((data) => {
        if (data?.usd?.sell != null) setCurrencyRates(data);
      })
      .catch(() => {});
  }, []);

  const costMode = form.watch("cost_mode");
  const currencyValue = form.watch("currency_value");
  const percentBase = form.watch("percent_base");
  const additionalServices = form.watch("additional_services");
  const currencyNonCashManual = form.watch("currency_non_cash_manual");
  const currencyCode = form.watch("currency_code");
  const currencyLabel = currencyCode === "eur" ? "EUR" : "USD";
  const cvNum = Number.parseFloat(String(currencyValue ?? "").replace(",", ".")) || 0;
  const pctNum = Number.parseFloat(String(percentBase ?? "0").replace(",", ".")) || 0;
  const addSvcNum = Number.parseFloat(String(additionalServices ?? "").replace(",", ".")) || 0;
  const currencyNonCashRounded =
    costMode === "calculator"
      ? Math.round(cvNum * (1 + pctNum / 100) + addSvcNum)
      : Math.round(
          Number.parseFloat(String(currencyNonCashManual ?? "").replace(",", ".")) || 0
        );
  const currencyNonCashDisplay =
    currencyNonCashRounded > 0
      ? `${currencyNonCashRounded.toLocaleString("uk-UA")} ${currencyLabel}`
      : "—";

  useEffect(() => {
    if (costMode === "calculator") {
      form.clearErrors(["price_with_vat", "vat", "price_without_vat"]);
    }
  }, [costMode, form]);

  useEffect(() => {
    if (costMode !== "calculator") return;
    const cv = Number.parseFloat(String(currencyValue ?? "").replace(",", ".")) || 0;
    const pct = Number.parseFloat(String(percentBase ?? "0").replace(",", ".")) || 0;
    const addSvc = Number.parseFloat(String(additionalServices ?? "").replace(",", ".")) || 0;
    const code = (currencyCode ?? "usd") as "usd" | "eur";
    const roundedNonCash = Math.round(cv * (1 + pct / 100) + addSvc);
    const sellStr = currencyRates?.[code]?.sell ?? "";
    const rate = Number.parseFloat(sellStr.replace(",", ".")) || 0;
    const priceWithVatUahRaw = roundedNonCash * rate;
    const priceWithVatRounded = Math.round(priceWithVatUahRaw);
    const vatUah = priceWithVatRounded * 0.2;
    const priceWithoutVatUah = priceWithVatRounded - vatUah;
    const withVat = rate > 0 && roundedNonCash > 0 ? priceWithVatRounded.toFixed(2) : "";
    const withoutVat =
      rate > 0 && roundedNonCash > 0 ? priceWithoutVatUah.toFixed(2) : "";
    const vatVal = rate > 0 && roundedNonCash > 0 ? vatUah.toFixed(2) : "";
    form.setValue("price_with_vat", withVat, { shouldValidate: false });
    form.setValue("price_without_vat", withoutVat, { shouldValidate: false });
    form.setValue("vat", vatVal, { shouldValidate: false });
  }, [
    costMode,
    currencyValue,
    percentBase,
    additionalServices,
    currencyCode,
    currencyRates,
  ]);

  const openPreview = () => {
    setPreviewError(null);
    setPreviewOpen(true);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {last5.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Заповнити з останнього:</span>
              {last5.map((entry, i) => (
                <Button
                  key={entry.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.reset(mergeFormData(entry));
                    if (entry.photoDataUrls?.length) {
                      setPhotos(
                        entry.photoDataUrls.map((url, j) =>
                          dataUrlToFile(url, `photo-${j}.jpg`)
                        )
                      );
                    } else {
                      setPhotos([]);
                    }
                  }}
                  title={entry.file}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
          <Button type="button" variant="outline" size="sm" onClick={openHistory}>
            Історія генерацій
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium tracking-tight">
                Основні дані ТЗ
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Марка / Модель</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VIN</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Рік (р.)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1900} max={2100} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пробіг (км)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Виробник</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Колір</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="technical_state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Технічний стан</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium tracking-tight">
                Кузов і ходова частина
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="body_type"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Тип кузова</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wheel_formula"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Колісна формула</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="seats"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Кількість місць (шт.)</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium tracking-tight">
                Двигун і трансмісія
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={form.control}
                name="engine_type"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Тип двигуна</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="engine_volume"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Об&apos;єм двигуна (л)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="power"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>Потужність (кВт)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gearbox"
                render={({ field }) => (
                  <FormItem className="min-w-0">
                    <FormLabel>КПП</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium tracking-tight">
              Фотографії (8 шт.)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Завантажити фото</Label>
                <span
                  className={cn(
                    "text-xs",
                    photos.length === PHOTO_COUNT_REQUIRED
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  )}
                >
                  Додано {photos.length} з {PHOTO_COUNT_REQUIRED}
                </span>
              </div>
              <div
                className={cn(
                  "rounded-lg border-2 border-dashed border-input p-8 text-center text-muted-foreground transition-colors cursor-pointer hover:border-ring hover:bg-muted/50"
                )}
                onClick={() => document.getElementById("photos")?.click()}
              >
                <input
                  id="photos"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <p className="text-sm">Натисніть для завантаження</p>
              </div>
              {photos.length > 0 && photos.length !== PHOTO_COUNT_REQUIRED && (
                <p className="text-xs text-destructive">
                  Потрібно додати рівно {PHOTO_COUNT_REQUIRED} фото для генерації PDF.
                </p>
              )}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {photos.map((f, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handlePhotoDragStart(i)}
                    onDragEnd={handlePhotoDragEnd}
                    onDragOver={handlePhotoDragOver}
                    onDrop={(e) => handlePhotoDrop(e, i)}
                    className={cn(
                      "relative aspect-square rounded-lg overflow-hidden bg-muted ring-1 ring-border cursor-grab active:cursor-grabbing",
                      dragIndex === i && "opacity-50 ring-2 ring-primary"
                    )}
                  >
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                    />
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="destructive"
                      className="absolute top-1 right-1 rounded-full z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(i);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
            <CardTitle className="text-sm font-medium tracking-tight">
              Вартість
            </CardTitle>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Шаблон</span>
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant={costMode === "calculator" ? "default" : "outline"}
                  className="size-8 p-0 shrink-0"
                  title="Шаблон 1 — калькулятор"
                  onClick={() => form.setValue("cost_mode", "calculator")}
                >
                  1
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={costMode === "manual" ? "default" : "outline"}
                  className="size-8 p-0 shrink-0"
                  title="Шаблон 2 — вручну"
                  onClick={() => {
                    const cv =
                      Number.parseFloat(
                        String(form.getValues("currency_value") ?? "").replace(",", ".")
                      ) || 0;
                    const pct =
                      Number.parseFloat(
                        String(form.getValues("percent_base") ?? "0").replace(",", ".")
                      ) || 0;
                    const addSvc =
                      Number.parseFloat(
                        String(form.getValues("additional_services") ?? "").replace(",", ".")
                      ) || 0;
                    const rounded = Math.round(cv * (1 + pct / 100) + addSvc);
                    if (rounded > 0) {
                      form.setValue("currency_non_cash_manual", String(rounded), {
                        shouldValidate: false,
                      });
                    }
                    form.setValue("cost_mode", "manual");
                  }}
                >
                  2
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-wrap items-end gap-4">
              {costMode === "calculator" ? (
                <>
                  <FormField
                    control={form.control}
                    name="currency_value"
                    render={({ field }) => (
                      <FormItem className="min-w-0 shrink-0">
                        <FormLabel className="whitespace-nowrap">Валютна вартість ({currencyLabel})</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step="0.01" placeholder="0" className="w-28" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="percent_base"
                    render={({ field }) => (
                      <FormItem className="min-w-0 shrink-0">
                        <FormLabel className="whitespace-nowrap">Відсоткова база (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step="0.01" placeholder="0" className="w-24" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additional_services"
                    render={({ field }) => (
                      <FormItem className="min-w-0 shrink-0">
                        <FormLabel className="whitespace-nowrap">Дод. послуги ({currencyLabel})</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} step="0.01" placeholder="0" className="w-28" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="currency_non_cash_manual"
                    render={({ field }) => (
                      <FormItem className="min-w-0 shrink-0">
                        <FormLabel className="whitespace-nowrap">Валютна безготівкова ({currencyLabel})</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            inputMode="numeric"
                            placeholder="0"
                            className="w-28"
                            {...field}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (raw === "") {
                                field.onChange("");
                                return;
                              }
                              const n = Number.parseInt(raw, 10);
                              field.onChange(Number.isNaN(n) ? "" : String(Math.max(0, n)));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem className="min-w-0 shrink-0 opacity-60 pointer-events-none">
                    <FormLabel className="whitespace-nowrap">Відсоткова база (%)</FormLabel>
                    <Input readOnly value="" placeholder="—" className="w-24 bg-muted" aria-hidden />
                  </FormItem>
                  <FormItem className="min-w-0 shrink-0 opacity-60 pointer-events-none">
                    <FormLabel className="whitespace-nowrap">Дод. послуги ({currencyLabel})</FormLabel>
                    <Input readOnly value="" placeholder="—" className="w-28 bg-muted" aria-hidden />
                  </FormItem>
                </>
              )}
              <FormField
                control={form.control}
                name="currency_code"
                render={({ field }) => (
                  <FormItem className="min-w-0 shrink-0 flex flex-col">
                    <FormLabel className="whitespace-nowrap">Валюта</FormLabel>
                    <FormControl>
                      <div className="flex min-h-8 items-center">
                        <Select
                          value={field.value}
                          onValueChange={(v) => field.onChange(v as "usd" | "eur")}
                        >
                          <SelectTrigger className="h-8 w-full min-w-20 py-1 px-2.5 pr-8">
                            <SelectValue placeholder="Валюта" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usd">USD</SelectItem>
                            <SelectItem value="eur">EUR</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Курс продажу станом на момент генерації КП
              {currencyRates && (
                <span className="ml-1">
                  ({currencyCode === "eur" ? currencyRates.eur.sell : currencyRates.usd.sell} грн)
                </span>
              )}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex flex-col gap-1.5">
                <Label className="text-muted-foreground text-xs">Валютна безготівкова вартість</Label>
                <span className="text-sm font-medium">{currencyNonCashDisplay}</span>
              </div>
              <FormField
                control={form.control}
                name="show_currency_non_cash"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Показувати валютну безготівкову вартість у шаблоні КП
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price_with_vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Вартість з ПДВ (грн)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        readOnly={costMode === "calculator"}
                        className={costMode === "calculator" ? "bg-muted" : ""}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ПДВ (20%)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        readOnly={costMode === "calculator"}
                        className={costMode === "calculator" ? "bg-muted" : ""}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price_without_vat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Вартість без ПДВ (грн)</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        readOnly={costMode === "calculator"}
                        className={costMode === "calculator" ? "bg-muted" : ""}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 items-center">
          <Button
            type="button"
            variant="outline"
            onClick={openPreview}
            disabled={previewLoading}
          >
            {previewLoading ? "Завантаження…" : "Попередній перегляд"}
          </Button>
          <Button
            type="submit"
            disabled={
              !form.formState.isValid ||
              loading ||
              photos.length !== PHOTO_COUNT_REQUIRED
            }
          >
            {loading ? "Генеруємо PDF..." : "Згенерувати PDF"}
          </Button>
          {success && (
            <Card className="h-8 min-w-0 flex items-center justify-center py-0 rounded-lg border border-border bg-green-500/5 ring-0 shadow-none">
              <CardContent className="py-0 px-2.5 flex items-center justify-center gap-2">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 text-center">
                  {success === "downloaded"
                    ? "PDF створено та завантажено"
                    : "PDF створено"}
                </p>
                {success !== "downloaded" && (
                  <a href={success} download className="inline-flex">
                    <Button variant="outline" size="sm" className="h-6">
                      Завантажити PDF
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-4 text-sm text-destructive">
              {error}
            </CardContent>
          </Card>
        )}
        </form>
      </Form>

      {previewOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            aria-hidden
            onClick={() => setPreviewOpen(false)}
          />
          <div
            className="fixed left-1/2 top-1/2 z-50 flex w-[min(98vw,1000px)] -translate-x-1/2 -translate-y-1/2 max-h-[90vh] flex-col rounded-xl border border-border bg-background shadow-xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Попередній перегляд (A4)"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3">
              <div>
                <h2 className="text-base font-medium">Попередній перегляд</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Аркуші A4 (210×297 mm)
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setPreviewOpen(false)}
                aria-label="Закрити"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="min-h-0 flex-1 flex flex-col overflow-x-hidden overflow-y-auto bg-[#e5e7eb]">
              {previewError && (
                <p className="text-sm text-destructive shrink-0 px-5 py-4">{previewError}</p>
              )}
              {previewLoading && (
                <p className="text-sm text-muted-foreground shrink-0 px-5 py-8">Завантаження…</p>
              )}
              {!previewLoading && (
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                  <ProposalTemplate
                    data={formatProposalData(form.getValues())}
                    imageUrls={previewPhotoUrls}
                    baseUrl="/"
                    templateId="commercial"
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in-0 duration-200"
            aria-hidden
            onClick={() => setHistoryOpen(false)}
          />
          <aside
            className="fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col rounded-l-xl border-l border-border bg-background shadow-lg ring-1 ring-foreground/10 animate-in slide-in-from-right duration-200 ease-out"
            aria-label="Історія генерацій"
          >
            <div className="space-y-3 border-b border-border px-4 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-medium leading-snug">Історія генерацій</h2>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => setHistoryOpen(false)}
                  aria-label="Закрити"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <Input
                type="search"
                placeholder="Пошук за маркою/моделлю або VIN"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="max-w-full"
                aria-label="Пошук за маркою, моделлю або VIN"
              />
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {historyFiltered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {historyList.length === 0 ? "Немає записів" : "Нічого не знайдено"}
                </p>
              ) : (
                historyFiltered.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-xl border border-border bg-card p-3 ring-1 ring-foreground/10 space-y-2"
                  >
                    <p className="truncate text-sm font-medium" title={entry.file}>
                      {entry.file}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(entry.date)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => loadHistoryEntry(entry)}
                      >
                        Заповнити форму
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeFromHistory(entry.id)}
                        aria-label="Видалити з історії"
                        title="Видалити з історії"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
