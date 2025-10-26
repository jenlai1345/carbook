import * as React from "react";
import { Controller } from "react-hook-form";
import { DATE_TF_PROPS } from "./mui";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

/**
 * Masked RHF text field for dates.
 * - display "YYYY/MM/DD", store "YYYY-MM-DD" (8 digits)
 *
 * Usage:
 *   <RHFDatePicker name="inboundDate" label="進廠日（年/月/日）" />
 */
export default function RHFDatePicker({
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
      render={({ field }) => (
        <DatePicker
          label={label}
          value={field.value ? dayjs(field.value) : null}
          onChange={(v) => field.onChange(v ? v.format("YYYY-MM-DD") : "")}
          slotProps={{ textField: DATE_TF_PROPS }}
        />
      )}
    />
  );
}
