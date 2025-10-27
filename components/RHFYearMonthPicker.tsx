import * as React from "react";
import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { DATE_TF_PROPS } from "./mui";

/**
 * Year/Month picker (masked like YYYY/MM), stores "YYYY-MM".
 *
 * Usage:
 *   <RHFYearMonthPicker name="factoryYM" label="出廠（年/月）" />
 */
export default function RHFYearMonthPicker({
  control,
  name,
  label,
}: {
  control: any;
  name: string;
  label: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        // field.value is expected to be "" or "YYYY-MM"
        const value: Dayjs | null = field.value
          ? dayjs(`${field.value}-01`)
          : null;

        // critical: provide a stable referenceDate so typing month first
        // (e.g., "0" -> "08") doesn't reset the year to 2001/2021.
        const referenceDate = value ?? dayjs().startOf("month"); // any stable month is fine

        return (
          <DatePicker
            label={label}
            views={["year", "month"]}
            openTo="year"
            value={value}
            referenceDate={referenceDate}
            // Display "YYYY/MM" while the stored value remains "YYYY-MM"
            format="YYYY/MM"
            onChange={(v) => {
              if (!v || !v.isValid()) {
                field.onChange("");
                return;
              }
              field.onChange(v.format("YYYY-MM"));
            }}
            slotProps={{
              textField: {
                ...DATE_TF_PROPS,
                placeholder: "YYYY/MM",
              },
            }}
          />
        );
      }}
    />
  );
}
