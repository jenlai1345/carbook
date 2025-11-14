// components/RHFEngNumTextField.tsx
import * as React from "react";
import { Controller } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

type Props = TextFieldProps & {
  control: any;
  name: string;
  toUpperCase?: boolean;
  allowDash?: boolean;
};

/** Unified ASCII extractor: handles IME Process events + fallback for 3/4/6/7 under 注音 */
export function getAsciiFromEvent(e: any, allowDash = true): string | null {
  // Primary: KeyboardEvent.code
  if (typeof e.code === "string") {
    if (e.code.startsWith("Key")) return e.code.slice(3); // KeyA -> A
    if (e.code.startsWith("Digit")) return e.code.slice(5); // Digit3 -> 3
    if (e.code.startsWith("Numpad")) {
      const n = e.code.slice(6);
      if (/^[0-9]$/.test(n)) return n;
      if (allowDash && n === "Subtract") return "-";
    }
    if (allowDash && e.code === "Minus") return "-";
  }

  // ---- Fallback for IME Process (mac zhuyin digits 3/4/6/7 etc.) ----
  const kc = e.which ?? e.keyCode;
  // 0–9 on top row
  if (kc >= 48 && kc <= 57) return String(kc - 48);
  // Numpad 0–9
  if (kc >= 96 && kc <= 105) return String(kc - 96);
  // '-' (varies by browser)
  if (allowDash && (kc === 189 || kc === 173)) return "-";
  return null;
}

export default function RHFEngNumTextField({
  control,
  name,
  toUpperCase = true,
  allowDash = true,
  ...rest
}: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const value = field.value ?? "";
        const shouldShrink =
          value !== "" && value !== undefined && value !== null;

        const applyFilter = (s: string) => {
          let v = s.replace(allowDash ? /[^0-9a-zA-Z-]/g : /[^0-9a-zA-Z]/g, "");
          if (toUpperCase) v = v.toUpperCase();
          return v;
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
          const el = inputRef.current;
          if (!el) return;

          // Allow navigation / shortcuts
          const nav = new Set([
            "Backspace",
            "Delete",
            "ArrowLeft",
            "ArrowRight",
            "ArrowUp",
            "ArrowDown",
            "Home",
            "End",
            "Tab",
          ]);
          if (nav.has(e.key) || e.ctrlKey || e.metaKey || e.altKey) return;

          const isIME =
            (e as any).isComposing ||
            e.key === "Process" ||
            (e as any).keyCode === 229;

          const ascii = isIME ? getAsciiFromEvent(e, allowDash) : null;

          if (isIME && ascii) {
            e.preventDefault();

            const start = el.selectionStart ?? value.length;
            const end = el.selectionEnd ?? value.length;
            const ch = toUpperCase ? ascii.toUpperCase() : ascii;
            const newVal = value.slice(0, start) + ch + value.slice(end);

            field.onChange(applyFilter(newVal));

            // Restore caret after state update
            requestAnimationFrame(() => {
              const pos = start + ch.length;
              inputRef.current?.setSelectionRange(pos, pos);
            });
            return;
          }

          // Non-IME path: block non-allowed characters
          if (e.key.length === 1) {
            const ok = allowDash
              ? /[0-9a-zA-Z-]/.test(e.key)
              : /[0-9a-zA-Z]/.test(e.key);
            if (!ok) e.preventDefault();
          }
        };

        const handleBeforeInput = (e: any) => {
          const data: string | undefined = e?.data;
          if (data && /[^\x00-\x7F]/.test(data)) e.preventDefault?.();
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          field.onChange(applyFilter(e.target.value ?? ""));
        };

        return (
          <TextField
            {...rest}
            {...field}
            value={value}
            inputRef={inputRef}
            onKeyDown={handleKeyDown}
            onBeforeInput={handleBeforeInput}
            onChange={handleChange}
            inputProps={{
              inputMode: "text",
              pattern: allowDash ? "-?[0-9A-Za-z-]*" : "[0-9A-Za-z]*",
              lang: "en",
              autoCapitalize: "characters",
              autoCorrect: "off",
              ...(rest.inputProps ?? {}),
            }}
            InputLabelProps={{
              ...(rest.InputLabelProps ?? {}),
              shrink: shouldShrink || rest.InputLabelProps?.shrink,
            }}
            autoComplete="off"
            error={!!fieldState.error || !!rest.error}
            helperText={fieldState.error?.message ?? rest.helperText}
          />
        );
      }}
    />
  );
}
