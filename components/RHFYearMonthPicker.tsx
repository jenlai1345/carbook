// components/RHFYearMonthField.tsx
import * as React from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
} from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";
import { getAsciiFromEvent } from "./RHFEngNumTextField";

type Props = TextFieldProps & {
  control: any;
  name: string;
  label: string;
};

function toDisplay(store: string | null | undefined): string {
  if (!store) return "";
  const m = store.match(/^(\d{4})-(\d{2})$/);
  return m ? `${m[1]}/${m[2]}` : "";
}

function toStore(display: string): string | "" {
  const m = display.match(/^(\d{4})\/(0[1-9]|1[0-2])$/);
  return m ? `${m[1]}-${m[2]}` : "";
}

function normalizeDisplayDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 4) return digits; // "2025"
  return `${digits.slice(0, 4)}/${digits.slice(4)}`; // "2025/05"
}

type InnerProps = {
  field: ControllerRenderProps<any, string>;
  fieldState: ControllerFieldState;
  label: string;
} & TextFieldProps;

const YearMonthInput: React.FC<InnerProps> = ({
  field,
  fieldState,
  label,
  ...rest
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [display, setDisplay] = React.useState<string>(toDisplay(field.value));

  React.useEffect(() => {
    setDisplay(toDisplay(field.value));
  }, [field.value]);

  const commitIfValid = (s: string) => {
    const store = toStore(s);
    field.onChange(store);
    setDisplay(toDisplay(store));
  };

  const insertAtCursor = (ch: string) => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? display.length;
    const end = el.selectionEnd ?? display.length;
    const nextRaw = display.slice(0, start) + ch + display.slice(end);
    const normalized = normalizeDisplayDigits(nextRaw);
    setDisplay(normalized);
    requestAnimationFrame(() => {
      const pos = Math.min(
        start +
          ch.length +
          (normalized.includes("/") && start + ch.length === 5 ? 1 : 0),
        normalized.length
      );
      inputRef.current?.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
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

    if (isIME) {
      const ascii = getAsciiFromEvent(e);
      if (ascii) {
        e.preventDefault();
        if (/[0-9]/.test(ascii)) {
          insertAtCursor(ascii);
        } else if (ascii === "/") {
          if (
            !display.includes("/") &&
            display.replace(/\D/g, "").length >= 4
          ) {
            insertAtCursor("/");
          }
        }
      }
      return;
    }

    // Normal keyboard path
    if (e.key.length === 1) {
      if (/[0-9]/.test(e.key)) return;
      if (e.key === "/") {
        const hasSlash = display.includes("/");
        const digitCount = display.replace(/\D/g, "").length;
        if (!hasSlash && digitCount >= 4) return;
      }
      e.preventDefault();
    }
  };

  const handleBeforeInput = (e: any) => {
    const data: string | undefined = e?.data;
    if (data && /[^\x00-\x7F]/.test(data)) e.preventDefault?.();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setDisplay(normalizeDisplayDigits(e.target.value ?? ""));
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    commitIfValid(display);
    field.onBlur(); // 通知 RHF 已 blur
  };

  return (
    <TextField
      {...rest}
      label={label}
      value={display}
      onChange={handleChange}
      onBlur={handleBlur}
      // 同時滿足 RHF 的 ref & 我們自己的 inputRef
      inputRef={(el) => {
        inputRef.current = el;
        field.ref(el);
      }}
      onKeyDown={handleKeyDown}
      onBeforeInput={handleBeforeInput}
      placeholder="YYYY/MM"
      inputProps={{
        inputMode: "numeric",
        pattern: "[0-9/]*",
        lang: "en",
        autoCapitalize: "off",
        autoCorrect: "off",
        ...(rest.inputProps ?? {}),
      }}
      error={!!fieldState.error || !!rest.error}
      helperText={fieldState.error?.message ?? rest.helperText}
    />
  );
};

export default function RHFYearMonthField({
  control,
  name,
  label,
  ...rest
}: Props) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <YearMonthInput
          field={field}
          fieldState={fieldState}
          label={label}
          {...rest}
        />
      )}
    />
  );
}
