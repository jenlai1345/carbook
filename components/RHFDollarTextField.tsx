// components/RHFDollarTextField.tsx
import * as React from "react";
import { Controller } from "react-hook-form";
import { TextField, InputAdornment, TextFieldProps } from "@mui/material";

type RHFDollarTextFieldProps = TextFieldProps & {
  control: any;
  name: string;
  suffix?: React.ReactNode;
};

export default function RHFDollarTextField({
  control,
  name,
  suffix = "萬",
  ...rest
}: RHFDollarTextFieldProps) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...rest}
          {...field}
          type="text"
          value={field.value ?? ""}
          onChange={(e) => {
            let v = e.target.value ?? "";

            // allow empty + lone "-" while typing
            if (v === "" || v === "-") {
              field.onChange(v);
              return;
            }

            const hasLeadingMinus = v.startsWith("-");
            // strip everything except digits and dots
            v = v.replace(/[^0-9.]/g, "");

            // keep only a single dot
            const parts = v.split(".");
            if (parts.length > 2) {
              v = parts[0] + "." + parts.slice(1).join("");
            }

            // re-attach leading "-" if it was there originally
            if (hasLeadingMinus && v !== "") {
              v = "-" + v;
            }

            field.onChange(v);
          }}
          inputProps={{
            inputMode: "decimal",
            pattern: "-?[0-9]*[.]?[0-9]*",
            ...rest.inputProps,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">{suffix}</InputAdornment>
            ),
            ...rest.InputProps,
          }}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
}
