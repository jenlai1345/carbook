// components/inventory/BasicTab.tsx
import * as React from "react";
import { Controller, FieldErrors, Control } from "react-hook-form";
import { Box, TextField, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DATE_TF_PROPS } from "@/components/mui";
import type { FormValues } from "@/schemas/carSchemas";

interface Props {
  tab: number;
  control: Control<FormValues>;
  errors: FieldErrors<FormValues>;
}

export default function BasicTab({
  control,
  errors,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 出廠（年/月） */}
        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name="factoryYM"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="出廠（年/月）"
                views={["year", "month"]}
                value={field.value ? dayjs(`${field.value}-01`) : null}
                onChange={(v) => field.onChange(v ? v.format("YYYY-MM") : "")}
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        {/* 領牌（年/月） */}
        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name="plateYM"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="領牌（年/月）"
                views={["year", "month"]}
                value={field.value ? dayjs(`${field.value}-01`) : null}
                onChange={(v) => field.onChange(v ? v.format("YYYY-MM") : "")}
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name="model"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Model" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name="displacementCc"
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
            name="transmission"
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
            name="color"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="顏色" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="engineNo"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="引擎號碼" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="vin"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="車身號碼" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="dealer"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="代理商" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 10 }}>
          <Controller
            name="equipment"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="配備" multiline fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="remark"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="備註" multiline fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="整備情形" fullWidth />
            )}
          />
        </Grid>

        {/* 三個日曆 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="inboundDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="進廠日（年/月/日）"
                value={field.value ? dayjs(field.value) : null}
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
            name="promisedDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="預交日（年/月/日）"
                value={field.value ? dayjs(field.value) : null}
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
            name="returnDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="回公司日（年/月/日）"
                value={field.value ? dayjs(field.value) : null}
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
            name="disposition"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="處置" fullWidth />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
