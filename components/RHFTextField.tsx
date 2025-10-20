// components/RHFTextField.tsx
import * as React from "react";
import { Controller, Control } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

type Props = TextFieldProps & { control: Control<any>; name: string };

export default function RHFTextField({ control, name, ...rest }: Props) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const v = field.value ?? ""; // keep controlled
        const shouldShrink = v !== "" && v !== undefined && v !== null; // handles 0 as well if you allow numbers
        return (
          <TextField
            {...field}
            {...rest}
            value={v}
            InputLabelProps={{
              shrink: shouldShrink || rest?.InputLabelProps?.shrink,
            }}
          />
        );
      }}
    />
  );
}
