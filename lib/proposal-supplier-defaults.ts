/**
 * Заводські значення блоку «Інформація про постачальника».
 * Мають збігатися з тим, що показує КП при початковому заповненні форми.
 */

import type { ProposalFormData } from "./schema";

export const DEFAULT_SUPPLIER_COMPANY = 'ПП "БРЕЙН КОМПАНІ"';
export const DEFAULT_SUPPLIER_EDRPOU = "45373226";

export const DEFAULT_SUPPLIER_POSTAL_CODE = "07400";
export const DEFAULT_SUPPLIER_REGION = "Київська обл.";
export const DEFAULT_SUPPLIER_CITY = "Бровари";
export const DEFAULT_SUPPLIER_STREET = "вул. Січових Стрільців, буд. 11";

export type SupplierAddressParts = {
  supplier_postal_code: string;
  supplier_region: string;
  supplier_city: string;
  supplier_street: string;
};

export function emptySupplierAddressParts(): SupplierAddressParts {
  return {
    supplier_postal_code: "",
    supplier_region: "",
    supplier_city: "",
    supplier_street: "",
  };
}

/** Розбиття старого поля `supplier_address` (до структурованих ключів). */
export function migrateLegacySupplierAddress(legacy: string): SupplierAddressParts {
  const t = legacy.trim();
  if (!t) return emptySupplierAddressParts();
  const lines = t
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return emptySupplierAddressParts();
  if (lines.length === 1) {
    return { ...emptySupplierAddressParts(), supplier_street: lines[0] };
  }
  const head = lines[0];
  const street = lines.slice(1).join("\n");
  const bits = head.split(",").map((s) => s.trim()).filter(Boolean);
  let postal = "";
  let region = "";
  let city = "";
  if (bits[0]?.match(/^\d{5}$/)) {
    postal = bits[0];
    region = bits[1] ?? "";
    city = (bits.slice(2).join(", ") || "")
      .replace(/^м\.\s*/i, "")
      .replace(/,$/, "")
      .trim();
  } else {
    region = bits[0] ?? "";
    city = (bits.slice(1).join(", ") || "").replace(/^м\.\s*/i, "").trim();
  }
  return {
    supplier_postal_code: postal,
    supplier_region: region,
    supplier_city: city,
    supplier_street: street,
  };
}

export function parseSupplierAddressLines(raw: string | undefined): string[] {
  return (raw ?? "")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Збирає 1–2 рядки для КП з частин адреси (лише непорожні частини). */
export function composeSupplierAddressLinesFromParts(
  p: Partial<SupplierAddressParts>
): string[] {
  const postal = (p.supplier_postal_code ?? "").trim();
  const region = (p.supplier_region ?? "").trim();
  const cityRaw = (p.supplier_city ?? "").trim();
  const street = (p.supplier_street ?? "").trim();
  let cityDisplay = "";
  if (cityRaw) {
    if (/^(м\.|смт\.|с\.|с-ще\s)/i.test(cityRaw)) {
      cityDisplay = cityRaw;
    } else {
      cityDisplay = `м. ${cityRaw}`;
    }
  }
  const line1Parts: string[] = [];
  if (postal) line1Parts.push(postal);
  if (region) line1Parts.push(region);
  if (cityDisplay) line1Parts.push(cityDisplay);
  const line1 = line1Parts.join(", ");
  const out: string[] = [];
  if (line1) out.push(line1);
  if (street) out.push(street);
  return out;
}

export function hasStructuredSupplierAddressKeys(fd: object): boolean {
  return (
    "supplier_postal_code" in fd ||
    "supplier_region" in fd ||
    "supplier_city" in fd ||
    "supplier_street" in fd
  );
}

export function getDefaultSupplierFormValues(): Pick<
  ProposalFormData,
  | "supplier_company"
  | "supplier_edrpou"
  | "supplier_postal_code"
  | "supplier_region"
  | "supplier_city"
  | "supplier_street"
  | "supplier_phone_primary"
  | "supplier_phone_secondary"
> {
  return {
    supplier_company: DEFAULT_SUPPLIER_COMPANY,
    supplier_edrpou: DEFAULT_SUPPLIER_EDRPOU,
    supplier_postal_code: DEFAULT_SUPPLIER_POSTAL_CODE,
    supplier_region: DEFAULT_SUPPLIER_REGION,
    supplier_city: DEFAULT_SUPPLIER_CITY,
    supplier_street: DEFAULT_SUPPLIER_STREET,
    supplier_phone_primary: "",
    supplier_phone_secondary: "",
  };
}

type SupplierResolveInput = Partial<
  Pick<
    ProposalFormData,
    | "supplier_company"
    | "supplier_edrpou"
    | "supplier_postal_code"
    | "supplier_region"
    | "supplier_city"
    | "supplier_street"
    | "supplier_phone_primary"
    | "supplier_phone_secondary"
  >
> & { supplier_address?: string };

export function resolveSupplierForProposal(data: SupplierResolveInput): {
  supplier_company: string;
  supplier_edrpou: string;
  supplier_address_lines: string[];
  supplier_contact_phones: string[];
  supplier_show_address: boolean;
  supplier_show_contact: boolean;
} {
  const defs = getDefaultSupplierFormValues();
  const company =
    typeof data.supplier_company === "string" && data.supplier_company.trim() !== ""
      ? data.supplier_company
      : defs.supplier_company;
  const edrpou =
    typeof data.supplier_edrpou === "string" && data.supplier_edrpou.trim() !== ""
      ? data.supplier_edrpou
      : defs.supplier_edrpou;

  const raw = data as Record<string, unknown>;
  const legacyAddress =
    typeof raw.supplier_address === "string" ? raw.supplier_address : "";

  let parts: SupplierAddressParts = {
    supplier_postal_code:
      data.supplier_postal_code !== undefined && data.supplier_postal_code !== null
        ? String(data.supplier_postal_code)
        : "",
    supplier_region:
      data.supplier_region !== undefined && data.supplier_region !== null
        ? String(data.supplier_region)
        : "",
    supplier_city:
      data.supplier_city !== undefined && data.supplier_city !== null
        ? String(data.supplier_city)
        : "",
    supplier_street:
      data.supplier_street !== undefined && data.supplier_street !== null
        ? String(data.supplier_street)
        : "",
  };

  const structuredTouched = hasStructuredSupplierAddressKeys(data);
  if (!structuredTouched && legacyAddress.trim()) {
    parts = migrateLegacySupplierAddress(legacyAddress);
  } else if (!structuredTouched) {
    parts = emptySupplierAddressParts();
  }

  let lines = composeSupplierAddressLinesFromParts(parts);
  if (lines.length === 0 && legacyAddress.trim() && structuredTouched) {
    lines = parseSupplierAddressLines(legacyAddress);
  }

  const p1 =
    data.supplier_phone_primary !== undefined && data.supplier_phone_primary !== null
      ? String(data.supplier_phone_primary).trim()
      : "";
  const p2 =
    data.supplier_phone_secondary !== undefined && data.supplier_phone_secondary !== null
      ? String(data.supplier_phone_secondary).trim()
      : "";
  const phones = [p1, p2].filter(Boolean).slice(0, 2);

  return {
    supplier_company: company,
    supplier_edrpou: edrpou,
    supplier_address_lines: lines,
    supplier_contact_phones: phones,
    supplier_show_address: lines.length > 0,
    supplier_show_contact: phones.length > 0,
  };
}

/** Поля постачальника для скидання форми з історії (міграція `supplier_address` → частини). */
export function mergeSupplierFormFieldsForHistory(
  fd: Partial<ProposalFormData> & { supplier_address?: string }
): Pick<
  ProposalFormData,
  | "supplier_company"
  | "supplier_edrpou"
  | "supplier_postal_code"
  | "supplier_region"
  | "supplier_city"
  | "supplier_street"
  | "supplier_phone_primary"
  | "supplier_phone_secondary"
> {
  const defs = getDefaultSupplierFormValues();
  const raw = fd as Record<string, unknown>;
  const hasStructured = hasStructuredSupplierAddressKeys(fd);
  const legacy =
    typeof raw.supplier_address === "string" ? raw.supplier_address.trim() : "";
  const migrated =
    !hasStructured && legacy ? migrateLegacySupplierAddress(raw.supplier_address as string) : null;

  const company =
    typeof fd.supplier_company === "string" && fd.supplier_company.trim() !== ""
      ? fd.supplier_company
      : defs.supplier_company;
  const edrpou =
    typeof fd.supplier_edrpou === "string" && fd.supplier_edrpou.trim() !== ""
      ? fd.supplier_edrpou
      : defs.supplier_edrpou;

  const part = (k: keyof SupplierAddressParts): string => {
    const v = raw[k];
    if (v !== undefined && v !== null) return String(v);
    if (migrated) return migrated[k];
    return "";
  };

  return {
    supplier_company: company,
    supplier_edrpou: edrpou,
    supplier_postal_code: part("supplier_postal_code"),
    supplier_region: part("supplier_region"),
    supplier_city: part("supplier_city"),
    supplier_street: part("supplier_street"),
    supplier_phone_primary:
      raw.supplier_phone_primary !== undefined && raw.supplier_phone_primary !== null
        ? String(raw.supplier_phone_primary)
        : "",
    supplier_phone_secondary:
      raw.supplier_phone_secondary !== undefined && raw.supplier_phone_secondary !== null
        ? String(raw.supplier_phone_secondary)
        : "",
  };
}
