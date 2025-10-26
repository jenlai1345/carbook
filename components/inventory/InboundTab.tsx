// components/inventory/InBoundTab.tsx
import * as React from "react";
import { Grid, Paper, InputAdornment, MenuItem } from "@mui/material";
import { Control, Controller, FieldErrors } from "react-hook-form";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DATE_TF_PROPS } from "@/components/mui";
import { loadSettingsType } from "@/utils/helpers";
import RHFTextField from "@/components/RHFTextField";
import RHFDollarTextField from "../RHFDollarTextField";
import RHFDatePicker from "../RHFDatePicker";

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
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* --------------------- LINE 1 --------------------- */}
        {/* 單號 */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <RHFTextField
            control={control}
            name="inbound.orderNo"
            label="單號"
            fullWidth
          />
        </Grid>

        {/* 鑰號 */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <RHFTextField
            control={control}
            name="inbound.keyNo"
            label="鑰號"
            fullWidth
          />
        </Grid>

        {/* --------------------- LINE 2 --------------------- */}
        {/* 進貨模式（Setting: importStyle） */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RHFTextField
            control={control}
            name="inbound.purchaseMode"
            label="進貨模式"
            select
            fullWidth
          >
            {purchaseModes.map((v) => (
              <MenuItem key={v || "__blank"} value={v}>
                {v || "（未選）"}
              </MenuItem>
            ))}
          </RHFTextField>
        </Grid>

        {/* 採購員（Setting: purchaser） */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RHFTextField
            control={control}
            name="inbound.purchaser"
            label="採購員"
            select
            fullWidth
          >
            {purchasers.map((v) => (
              <MenuItem key={v || "__blank"} value={v}>
                {v || "（未選）"}
              </MenuItem>
            ))}
          </RHFTextField>
        </Grid>

        {/* 採購獎金比（%） */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RHFTextField
            control={control}
            name="inbound.purchaseBonusPct"
            label="採購獎金比"
            fullWidth
            type="number"
            inputProps={{ step: "1", min: "0" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>

        {/* --------------------- LINE 3 --------------------- */}
        {/* 訂價（萬） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFDollarTextField
            control={control}
            name="inbound.listPriceWan"
            label="訂價"
            fullWidth
          />
        </Grid>

        {/* 新車價（萬） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFDollarTextField
            control={control}
            name="inbound.newCarPriceWan"
            label="新車價"
            fullWidth
          />
        </Grid>

        {/* 附註 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="inbound.note"
            label="附註"
            fullWidth
          />
        </Grid>

        {/* 附註金額（萬） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFDollarTextField
            control={control}
            name="inbound.noteAmountWan"
            label="附註金額"
            fullWidth
          />
        </Grid>

        {/* --------------------- LINE 3 --------------------- */}

        {/* 異動日期 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFDatePicker
            control={control}
            name="inbound.changeDate"
            label="異動日期"
          />
        </Grid>

        {/* 異動方式（Setting: moveMethod） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="inbound.changeMethod"
            label="異動方式"
            select
            fullWidth
          >
            {changeMethods.map((v) => (
              <MenuItem key={v || "__blank"} value={v}>
                {v || "（未選）"}
              </MenuItem>
            ))}
          </RHFTextField>
        </Grid>

        {/* 原公里數 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="inbound.originalMileageKm"
            label="原公里數"
            fullWidth
            type="number"
            inputProps={{ step: "1", min: "0" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
            }}
          />
        </Grid>

        {/* 調後公里數 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="inbound.adjustedMileageKm"
            label="調後公里數"
            fullWidth
            type="number"
            inputProps={{ step: "1", min: "0" }}
            InputProps={{
              endAdornment: <InputAdornment position="end">km</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
