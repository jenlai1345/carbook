import { Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import { DATE_TF_PROPS } from "./mui";

export default function RHFYearMonthPicker({
  control,
  name,
  label,
}: {
  control: any;
  name: string;
  label: string;
}) {
  const [draft, setDraft] = React.useState<string>("");

  // helper: strict YYYY-MM or YYYY/MM
  const toStored = (s: string) => s.replace("/", "-");
  const isValidYM = (s: string) => /^\d{4}[-/](0[1-9]|1[0-2])$/.test(s);

  return (
    <Controller
      name={name as any}
      control={control}
      render={({ field }) => {
        // the committed value from RHF
        const committed = field.value as string; // "YYYY-MM" or ""
        // what to show in the text box
        const displayText =
          draft !== "" ? draft : committed ? committed.replace("-", "/") : "";

        // dayjs value for calendar view (only when committed is valid)
        const value: Dayjs | null = committed ? dayjs(`${committed}-01`) : null;

        return (
          <Controller
            name={name as any}
            control={control}
            render={({ field }) => (
              <DatePicker
                label={label}
                openTo="year"
                views={["year", "month"]}
                format="YYYY/MM"
                // ✅ Only Dayjs | null here
                value={field.value ? dayjs(`${field.value}-01`) : null}
                onChange={(v) => field.onChange(v ? v.format("YYYY-MM") : "")}
                // ❌ no referenceDate, no textField.value override
                slotProps={{
                  textField: {
                    ...DATE_TF_PROPS,
                    inputProps: {
                      placeholder: "YYYY/MM",
                      inputMode: "numeric",
                    },
                  },
                }}
              />
            )}
          />
        );
      }}
    />
  );
}
