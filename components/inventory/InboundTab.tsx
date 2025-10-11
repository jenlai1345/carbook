import * as React from "react";
import {
  Grid,
  Paper,
  TextField,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DATE_TF_PROPS } from "@/components/mui";
import { loadSettingsType } from "@/utils/helpers";

export default function InBoundTab({
  control,
  errors,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  // options from DB
  const [purchaseModes, setPurchaseModes] = React.useState<string[]>([""]);
  const [purchasers, setPurchasers] = React.useState<string[]>([""]);
  const [changeMethods, setChangeMethods] = React.useState<string[]>([""]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [importStyleOpts, purchaserOpts, moveMethodOpts] =
          await Promise.all([
            loadSettingsType("importStyle"),
            loadSettingsType("purchaser"),
            loadSettingsType("moveMethod"),
          ]);

        if (!alive) return;
        setPurchaseModes(importStyleOpts);
        setPurchasers(purchaserOpts);
        setChangeMethods(moveMethodOpts);
      } catch (e) {
        console.error("Load settings failed:", e);
        // keep initial blank options
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 單號 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.orderNo"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="單號" fullWidth />
            )}
          />
        </Grid>

        {/* 鑰號 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.keyNo"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="鑰號" fullWidth />
            )}
          />
        </Grid>

        {/* 進貨模式（Setting: importStyle） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.purchaseMode"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="進貨模式" fullWidth>
                {purchaseModes.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* 採購員（Setting: purchaser） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.purchaser"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="採購員" fullWidth>
                {purchasers.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* 訂價（萬） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.listPriceWan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="訂價"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">萬</InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* 附註 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.note"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="附註" fullWidth />
            )}
          />
        </Grid>

        {/* 附註金額（萬） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.noteAmountWan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="附註金額"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">萬</InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* 採購獎金比（%） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.purchaseBonusPct"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="採購獎金比"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* 新車價（萬） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.newCarPriceWan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="新車價"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">萬</InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* 異動日期 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.changeDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="異動日期"
                value={field.value ? dayjs(field.value) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        {/* 異動方式（Setting: moveMethod） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.changeMethod"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="異動方式" fullWidth>
                {changeMethods.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* 原公里數 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.originalMileageKm"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="原公里數"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">km</InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* 調後公里數 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="inbound.adjustedMileageKm"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="調後公里數"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">km</InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
