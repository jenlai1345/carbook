import * as React from "react";
import { TextField, TextFieldProps } from "@mui/material";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { daysInMonth, pad2 } from "@/utils/helpers";

/** Parse inputs like "072/05/01", "72/5/1", "720501", or "民國72年5月1日" into ROC parts */
export function parseRocInputToParts(raw: string) {
  const clean = raw
    .replace(/民國/gi, "")
    .replace(/[年月日.\-]/g, "/")
    .replace(/\s+/g, "")
    .replace(/^\/+|\/+$/g, "");

  // compact numeric like 720501 (YYMMDD) or 0720501 (YYYMMDD)
  if (/^\d+$/.test(clean)) {
    if (clean.length === 7) {
      // yyy mm dd
      return {
        yyy: clean.slice(0, 3),
        mm: clean.slice(3, 5),
        dd: clean.slice(5, 7),
      };
    }
    if (clean.length === 6) {
      // yy mm dd  -> left-pad ROC year to 3 digits
      const yyy = clean.slice(0, 2).padStart(3, "0");
      return {
        yyy,
        mm: clean.slice(2, 4),
        dd: clean.slice(4, 6),
      };
    }
  }

  const parts = clean.split("/");
  if (parts.length >= 3) {
    const [yRaw, mRaw, dRaw] = parts;
    const yyy = (yRaw || "").padStart(3, "0").slice(-3);
    const mm = String(parseInt(mRaw || "0", 10) || "").padStart(2, "0");
    const dd = String(parseInt(dRaw || "0", 10) || "").padStart(2, "0");
    return { yyy, mm, dd };
  }
  return { yyy: "", mm: "", dd: "" };
}

/** ROC (YYY/MM/DD) parts -> AD ISO (YYYY-MM-DD) */
export function rocPartsToAdIso(
  yyy: string,
  mm: string,
  dd: string
): string | null {
  const y = parseInt(yyy, 10);
  const m = parseInt(mm, 10);
  const d = parseInt(dd, 10);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d))
    return null;
  const ad = y + 1911;
  if (ad < 1912 || ad > 9999) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > daysInMonth(ad, m)) return null;
  return `${ad}-${pad2(m)}-${pad2(d)}`;
}

/** AD ISO (YYYY-MM-DD) -> ROC display (YYY/MM/DD) */
export function adIsoToRocDisplay(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const ad = parseInt(m[1], 10);
  const mm = m[2];
  const dd = m[3];
  if (!Number.isFinite(ad) || ad < 1912) return "";
  const roc = String(ad - 1911).padStart(3, "0");
  return `${roc}/${mm}/${dd}`;
}

export function adIsoToHelper(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  return `西元：${m[1]} 年 ${parseInt(m[2], 10)} 月 ${parseInt(m[3], 10)} 日`;
}

// ---------- inner input component (hooks live here) ----------
type RocDateInputProps = {
  iso: string; // "YYYY-MM-DD" or ""
  onIsoChange: (nextIso: string) => void;
  label: string;
  error: boolean;
  helperText: React.ReactNode;
  textFieldProps?: Omit<
    TextFieldProps,
    "value" | "onChange" | "label" | "error" | "helperText"
  >;
};

function RocDateInput({
  iso,
  onIsoChange,
  label,
  error,
  helperText,
  textFieldProps,
}: RocDateInputProps) {
  const [display, setDisplay] = React.useState<string>(
    iso ? adIsoToRocDisplay(iso) : ""
  );

  // sync when external iso changes
  React.useEffect(() => {
    setDisplay(iso ? adIsoToRocDisplay(iso) : "");
  }, [iso]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
      .replace(/[^\d年月日\/.\-\s]/g, "") // keep digits & common separators
      .slice(0, 12);
    setDisplay(raw);

    const { yyy, mm, dd } = parseRocInputToParts(raw);
    if (yyy && mm && dd) {
      const nextIso = rocPartsToAdIso(yyy, mm, dd);
      if (nextIso) {
        onIsoChange(nextIso); // ✅ store AD ISO
        return;
      }
    }
    // keep typing; don't update iso until valid
  };

  const computedHelper =
    typeof iso === "string" && iso
      ? adIsoToHelper(iso)
      : "請輸入：YYY/MM/DD（例：072/05/01、72/5/1、或 720501）";

  return (
    <TextField
      {...textFieldProps}
      label={label}
      value={display}
      onChange={handleChange}
      error={error}
      helperText={helperText ?? computedHelper}
      inputProps={{
        ...(textFieldProps?.inputProps ?? {}),
        inputMode: "numeric",
        pattern: "[0-9/.-年月日]*",
        maxLength:
          textFieldProps?.inputProps?.maxLength !== undefined
            ? (textFieldProps.inputProps.maxLength as number)
            : 12,
      }}
      placeholder={textFieldProps?.placeholder ?? "YYY/MM/DD"}
      fullWidth={textFieldProps?.fullWidth ?? true}
    />
  );
}

// ---------- exported RHF wrapper ----------
export type RHFRocDateFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  /** The form field name that stores AD ISO string like "1983-05-01" */
  name: FieldPath<TFieldValues>;
  label?: string;
  /** Override the computed helperText. If not provided, shows AD helper when valid. */
  helperTextOverride?: React.ReactNode;
  /** Pass through to MUI TextField (except value/onChange/label/error/helperText) */
  textFieldProps?: Omit<
    TextFieldProps,
    "value" | "onChange" | "label" | "error" | "helperText"
  >;
};

export default function RHFRocDateField<TFieldValues extends FieldValues>({
  control,
  name,
  label = "生日（民國）",
  helperTextOverride,
  textFieldProps,
}: RHFRocDateFieldProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <RocDateInput
          iso={(field.value ?? "") as string}
          onIsoChange={
            (v) => field.onChange(v) // keep RHF controlled
          }
          label={label}
          error={!!fieldState.error}
          helperText={fieldState.error?.message ?? helperTextOverride ?? ""}
          textFieldProps={textFieldProps}
        />
      )}
    />
  );
}
