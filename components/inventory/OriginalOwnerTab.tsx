// components/inventory/OriginalOwnerTab.tsx
import * as React from "react";
import {
  Box,
  Typography,
  MenuItem,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Grid,
} from "@mui/material";
import { Controller, Control, FieldErrors, useWatch } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DATE_TF_PROPS } from "../mui";
import { useCarSnackbar } from "../CarSnackbarProvider";
import { applyZipPrefix, loadSettingsType } from "@/utils/helpers";
import RHFTextField from "../RHFTextField";

export type OriginalOwnerForm = {
  origOwnerName: string;
  origOwnerIdNo: string;
  origOwnerBirth: string;
  origOwnerPhone: string;

  origOwnerRegZip: string;
  origOwnerRegAddr: string;
  origOwnerMailZip: string;
  origOwnerMailAddr: string;

  origContractDate: string;
  origDealPriceWan: string;
  origCommissionWan: string;

  consignorName: string;
  consignorPhone: string;
  referrerName: string;
  referrerPhone: string;
  purchasedTransferred: string; // 是/否
  registeredToName: string;
  procurementMethod: string;
  origOwnerNote: string;
};

export default function OriginalOwnerTab({
  control,
  errors,
  setValue,
  getValues,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
  setValue: (name: any, value: any, options?: any) => void;
  getValues: (name?: any) => any;
}) {
  const { showMessage } = useCarSnackbar();

  const [procurementMethods, setProcurementMethods] = React.useState<string[]>([
    "",
  ]);
  // 監聽郵遞區號
  const regZip = useWatch({ control, name: "origOwnerRegZip" });
  const mailZip = useWatch({ control, name: "origOwnerMailZip" });

  // 戶籍地址自動帶入
  React.useEffect(() => {
    const zip = typeof regZip === "string" ? regZip : "";
    if (zip.replace(/\D/g, "").length >= 3) {
      const curr = getValues("origOwnerRegAddr") ?? "";
      const next = applyZipPrefix(zip, curr);
      if (next !== curr)
        setValue("origOwnerRegAddr", next, { shouldDirty: true });
    }
  }, [regZip, getValues, setValue]);

  // 通訊地址自動帶入
  React.useEffect(() => {
    const zip = typeof mailZip === "string" ? mailZip : "";
    if (zip.replace(/\D/g, "").length >= 3) {
      const curr = getValues("origOwnerMailAddr") ?? "";
      const next = applyZipPrefix(zip, curr);
      if (next !== curr)
        setValue("origOwnerMailAddr", next, { shouldDirty: true });
    }
  }, [mailZip, getValues, setValue]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const opts = await loadSettingsType("purchaseMethod");
        if (!alive) return;
        setProcurementMethods(["", ...opts.filter(Boolean)]);
      } catch (e) {
        console.error("Failed to load purchaseMethod settings:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const names = await loadSettingsType("registeredToName");
        if (!alive) return;

        const firstNonEmpty =
          (names || []).find((s) => !!s?.trim())?.trim() ?? "";

        const current = getValues("registeredToName");
        if (!current && firstNonEmpty) {
          setValue("registeredToName", firstNonEmpty, {
            shouldDirty: false,
            shouldValidate: true,
          });
        }
      } catch (e) {
        console.error("Failed to load Setting -> registeredToName:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [getValues, setValue]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        原車主資料
      </Typography>

      <Grid container spacing={2}>
        {/* 第一列：原車主名 / 身分字號 / 生日 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <RHFTextField
            control={control}
            name="origOwnerName"
            label="原車主名"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <RHFTextField
            control={control}
            name="origOwnerIdNo"
            label="身分字號"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="origOwnerBirth"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="生日"
                value={field.value ? dayjs(field.value) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        {/* 第二列：合約日期 / 成交價 / 佣金 / 原車主電話 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="origContractDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="合約日期（年/月/日）"
                value={field.value ? dayjs(field.value) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="origDealPriceWan"
            label="成交價（萬）"
            fullWidth
            inputProps={{ inputMode: "decimal" }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="origCommissionWan"
            label="佣金（萬）"
            fullWidth
            inputProps={{ inputMode: "decimal" }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <RHFTextField
            control={control}
            name="origOwnerPhone"
            label="原車主電話"
            fullWidth
          />
        </Grid>

        {/* 第三列：戶籍地址（郵遞區號 + 地址） */}
        <Grid size={{ xs: 12, md: 2 }}>
          <RHFTextField
            control={control}
            name="origOwnerRegZip"
            label="戶籍 郵遞區號"
            fullWidth
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 5,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 10 }}>
          <RHFTextField
            control={control}
            name="origOwnerRegAddr"
            label="戶籍地址"
            fullWidth
          />
        </Grid>

        {/* 第四列：通訊地址（郵遞區號 + 地址） */}
        <Grid size={{ xs: 12, md: 2 }}>
          <RHFTextField
            control={control}
            name="origOwnerMailZip"
            label="通訊 郵遞區號"
            fullWidth
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 5,
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 10 }}>
          <RHFTextField
            control={control}
            name="origOwnerMailAddr"
            label="通訊地址"
            fullWidth
          />
        </Grid>

        {/* 第五列：代售人 / 電話 / 介紹人 / 電話 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <RHFTextField
            control={control}
            name="consignorName"
            label="代售人"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RHFTextField
            control={control}
            name="consignorPhone"
            label="電話"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <RHFTextField
            control={control}
            name="referrerName"
            label="介紹人"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <RHFTextField
            control={control}
            name="referrerPhone"
            label="電話"
            fullWidth
          />
        </Grid>

        {/* 第六列：買進已過戶(是/否) / 過戶名下 / 採購方式（DB） */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="purchasedTransferred"
            control={control}
            render={({ field }) => (
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontSize: 12, mb: 0.5 }}>
                  買進已過戶
                </FormLabel>
                <RadioGroup
                  row
                  value={field.value ?? "否"}
                  onChange={(e) =>
                    field.onChange(e.target.value as "是" | "否")
                  }
                >
                  <FormControlLabel
                    value="否"
                    control={<Radio size="small" />}
                    label="否"
                  />
                  <FormControlLabel
                    value="是"
                    control={<Radio size="small" />}
                    label="是"
                  />
                </RadioGroup>
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <RHFTextField
            control={control}
            name="registeredToName"
            label="過戶名下"
            fullWidth
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="procurementMethod"
            control={control}
            render={({ field }) => (
              <RHFTextField
                {...field}
                // RHFTextField accepts TextField props; for selects we still need Controller for value/onChange
                control={control as any}
                name="procurementMethod"
                label="採購方式"
                select
                fullWidth
              >
                {procurementMethods.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </RHFTextField>
            )}
          />
        </Grid>

        {/* 備註 */}
        <Grid size={{ xs: 12 }}>
          <RHFTextField
            control={control}
            name="origOwnerNote"
            label="備註"
            multiline
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  );
}
