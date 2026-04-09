"use client";

import { useWatch, type Control } from "react-hook-form";

import type { ProposalFormData } from "@/lib/schema";

const COST_FIELD_NAMES = [
  "cost_mode",
  "currency_value",
  "percent_base",
  "additional_services",
  "currency_non_cash_manual",
  "currency_code",
] as const;

/** Одна підписка на поля калькулятора вартості замість кількох form.watch. */
export function useProposalCostFields(control: Control<ProposalFormData>) {
  return useWatch({
    control,
    name: [...COST_FIELD_NAMES],
  }) as [
    ProposalFormData["cost_mode"],
    ProposalFormData["currency_value"],
    ProposalFormData["percent_base"],
    ProposalFormData["additional_services"],
    ProposalFormData["currency_non_cash_manual"],
    ProposalFormData["currency_code"],
  ];
}
