// components/inventory/BasicTab.tsx
import * as React from "react";
import { Controller } from "react-hook-form";
import { Box, TextField, Grid, Autocomplete } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import Parse from "@/lib/parseClient";
import { DATE_TF_PROPS } from "@/components/mui";
import { useCarSnackbar } from "../CarSnackbarProvider";
import {
  DEALER_OPTIONS,
  DEFAULT_CONDITIONS,
  DEFAULT_DISPOSITIONS,
} from "@/utils/constants";
import type { Control } from "react-hook-form";
import type { FormValues } from "@/schemas/carSchemas";

type Props = {
  control: Control<FormValues, any, any>; // note the third generic
};

export default function BasicTab({ control }: Props) {
  const { showMessage: _showMessage } = useCarSnackbar(); // underscore to avoid unused warning

  const [conditionOpts, setConditionOpts] =
    React.useState<string[]>(DEFAULT_CONDITIONS);
  const [dispositionOpts, setDispositionOpts] =
    React.useState<string[]>(DEFAULT_DISPOSITIONS);

  // Optional: load options from Parse "Setting" (scope: "inventory")
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const Setting = Parse.Object.extend("Setting");
        const q = new Parse.Query(Setting);
        q.equalTo("scope", "inventory");
        const s = await q.first();
        if (!alive || !s) return;
        const cond = s.get("conditionOptions");
        const disp = s.get("dispositionOptions");
        if (Array.isArray(cond)) setConditionOpts(cond.filter(Boolean));
        if (Array.isArray(disp)) setDispositionOpts(disp.filter(Boolean));
      } catch {
        // keep defaults silently
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 出廠（年/月） */}
        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"factoryYM" as any}
            control={control}
            render={({ field }) => (
              <DatePicker
                label="出廠（年/月）"
                views={["year", "month"]}
                value={
                  field.value ? (dayjs(`${field.value}-01`) as Dayjs) : null
                }
                onChange={(v) => field.onChange(v ? v.format("YYYY-MM") : "")}
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        {/* 領牌（年/月） */}
        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"plateYM" as any}
            control={control}
            render={({ field }) => (
              <DatePicker
                label="領牌（年/月）"
                views={["year", "month"]}
                value={
                  field.value ? (dayjs(`${field.value}-01`) as Dayjs) : null
                }
                onChange={(v) => field.onChange(v ? v.format("YYYY-MM") : "")}
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"model" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Model" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"displacementCc" as any}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="排氣量"
                inputProps={{ inputMode: "numeric" }}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"transmission" as any}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                SelectProps={{ native: true }}
                label="排檔（A/M）"
                fullWidth
              >
                <option value=""></option>
                <option value="A">A</option>
                <option value="M">M</option>
              </TextField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"color" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="顏色" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={"engineNo" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="引擎號碼" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={"vin" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="車身號碼" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name={"dealer" as any}
            control={control}
            render={({ field }) => (
              <Autocomplete<string, false, false, false>
                options={[...DEALER_OPTIONS]}
                value={field.value ? String(field.value) : null}
                onChange={(_e, v) => field.onChange(v ?? "")}
                renderInput={(params) => (
                  <TextField {...params} label="代理商" fullWidth />
                )}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 10 }}>
          <Controller
            name={"equipment" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="配備" multiline fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={"remark" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="備註" multiline fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={"condition" as any}
            control={control}
            render={({ field }) => (
              <Autocomplete<string, false, false, true>
                freeSolo
                options={conditionOpts}
                value={field.value ? String(field.value) : null}
                onInputChange={(_e, v) => field.onChange(v ?? "")}
                onChange={(_e, v) => field.onChange(v ?? "")}
                renderInput={(params) => (
                  <TextField {...params} label="整備情形" fullWidth />
                )}
              />
            )}
          />
        </Grid>

        {/* 三個日曆 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name={"inboundDate" as any}
            control={control}
            render={({ field }) => (
              <DatePicker
                label="進廠日（年/月/日）"
                value={field.value ? (dayjs(field.value) as Dayjs) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name={"promisedDate" as any}
            control={control}
            render={({ field }) => (
              <DatePicker
                label="預交日（年/月/日）"
                value={field.value ? (dayjs(field.value) as Dayjs) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name={"returnDate" as any}
            control={control}
            render={({ field }) => (
              <DatePicker
                label="回公司日（年/月/日）"
                value={field.value ? (dayjs(field.value) as Dayjs) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name={"disposition" as any}
            control={control}
            render={({ field }) => (
              <Autocomplete<string, false, false, true>
                freeSolo
                options={dispositionOpts}
                value={field.value ? String(field.value) : null}
                onInputChange={(_e, v) => field.onChange(v ?? "")}
                onChange={(_e, v) => field.onChange(v ?? "")}
                renderInput={(params) => (
                  <TextField {...params} label="處置" fullWidth />
                )}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
