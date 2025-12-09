// components/RHFEngNumTextField.tsx
import * as React from "react";
import { Controller } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

type Props = TextFieldProps & {
  control: any;
  name: string;
  toUpperCase?: boolean;
  /** Allow - (dash / minus sign) */
  allowDash?: boolean;
  /** Allow . (decimal point) */
  allowDecimal?: boolean;
  /** Allow / (slash) */
  allowSlash?: boolean;
};

export default function RHFEngNumTextField({
  control,
  name,
  toUpperCase = true,
  allowDash = true,
  allowDecimal = true,
  allowSlash = true,
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

        // Build allowed character class: 0-9, a-z, A-Z plus optional . - /
        const allowedClass = React.useMemo(() => {
          let cls = "0-9a-zA-Z";
          if (allowDash) cls += "\\-"; // dash/minus
          if (allowDecimal) cls += "\\."; // decimal point
          if (allowSlash) cls += "\\/"; // slash
          return cls;
        }, [allowDash, allowDecimal, allowSlash]);

        const filterRegex = React.useMemo(
          () => new RegExp(`[^${allowedClass}]`, "g"),
          [allowedClass]
        );

        const applyFilter = (s: string) => {
          let v = (s ?? "").replace(filterRegex, "");
          if (toUpperCase) v = v.toUpperCase();
          return v;
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const filtered = applyFilter(e.target.value ?? "");
          field.onChange(filtered);
          if (typeof rest.onChange === "function") {
            // If parent passed an onChange, call it too
            rest.onChange(e);
          }
        };

        return (
          <TextField
            {...rest}
            {...field}
            value={value}
            inputRef={inputRef}
            onChange={handleChange}
            inputProps={{
              inputMode: "text",
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
