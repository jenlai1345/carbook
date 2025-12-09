// components/RHFYearMonthField.tsx
import * as React from "react";
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
} from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

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

// Normalize raw input into "YYYY" or "YYYY/MM" based on digits only
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

  // Sync display when external value changes
  React.useEffect(() => {
    setDisplay(toDisplay(field.value));
  }, [field.value]);

  const commitIfValid = (s: string) => {
    const store = toStore(s); // "" if invalid
    field.onChange(store);
    setDisplay(toDisplay(store));
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const raw = e.target.value ?? "";
    const normalized = normalizeDisplayDigits(raw);
    setDisplay(normalized);

    // If parent passed an onChange, call it too
    if (typeof rest.onChange === "function") {
      rest.onChange(e);
    }
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    commitIfValid(display);
    field.onBlur(); // 通知 RHF 已 blur

    if (typeof rest.onBlur === "function") {
      rest.onBlur(e);
    }
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
