// components/inventory/InsuranceTab.tsx
import * as React from "react";
import {
  Paper,
  MenuItem,
  InputAdornment,
  FormControl,
  FormLabel,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { loadSettingsType } from "@/utils/helpers";
import RHFTextField from "@/components/RHFTextField";
import RHFDollarTextField from "../RHFDollarTextField";
import RHFDatePicker from "../RHFDatePicker";

export default function InsuranceTab({
  control,
  errors,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  const [insuranceTypes, setInsuranceTypes] = React.useState<string[]>([""]);
  const [insurers, setInsurers] = React.useState<string[]>([""]);
  const [lenders, setLenders] = React.useState<string[]>([""]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [types, companies, loaners] = await Promise.all([
          loadSettingsType("insuranceType"),
          loadSettingsType("insuranceCompany"),
          loadSettingsType("loanCompany"),
        ]);
        if (!alive) return;
        setInsuranceTypes(["", ...types.filter(Boolean)]);
        setInsurers(["", ...companies.filter(Boolean)]);
        setLenders(["", ...loaners.filter(Boolean)]);
      } catch (e) {
        console.error("Failed to load insurance settings:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 保險類別 */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RHFTextField
            control={control}
            name="insurance.insuranceType"
            label="保險類別"
            select
            fullWidth
          >
            {insuranceTypes.map((v) => (
              <MenuItem key={v || "__blank"} value={v}>
                {v || "（未選）"}
              </MenuItem>
            ))}
          </RHFTextField>
        </Grid>

        {/* 到期日 */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RHFDatePicker
            control={control}
            name="insurance.expireDate"
            label="到期日"
          />
        </Grid>

        {/* 保險公司 */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <RHFTextField
            control={control}
            name="insurance.insuranceCompany"
            label="保險公司"
            select
            fullWidth
          >
            {insurers.map((v) => (
              <MenuItem key={v || "__blank"} value={v}>
                {v || "（未選）"}
              </MenuItem>
            ))}
          </RHFTextField>
        </Grid>

        {/* 貸款公司 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="insurance.loanCompany"
            label="貸款公司"
            select
            fullWidth
          >
            {lenders.map((v) => (
              <MenuItem key={v || "__blank"} value={v}>
                {v || "（未選）"}
              </MenuItem>
            ))}
          </RHFTextField>
        </Grid>

        {/* 聯絡人 */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <RHFTextField
            control={control}
            name="insurance.contactName"
            label="聯絡人"
            fullWidth
          />
        </Grid>

        {/* 電話 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="insurance.contactPhone"
            label="電話"
            fullWidth
          />
        </Grid>

        {/* 金額 */}
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <RHFDollarTextField
            control={control}
            name="insurance.amount"
            label="金額"
            suffix="元"
            fullWidth
          />
        </Grid>

        {/* 期數 */}
        <Grid size={{ xs: 6, sm: 3, md: 1 }}>
          <RHFTextField
            control={control}
            name="insurance.installments"
            label="期數"
            fullWidth
            type="number"
            inputProps={{ step: "1", min: "0" }}
          />
        </Grid>

        {/* 基數 */}
        <Grid size={{ xs: 6, sm: 3, md: 1 }}>
          <RHFTextField
            control={control}
            name="insurance.baseAmount"
            label="基數"
            fullWidth
            type="number"
            inputProps={{ step: "1", min: "0" }}
          />
        </Grid>

        {/* 發票：無 / 有 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl>
            <FormLabel>發票</FormLabel>
            <Controller
              name="insurance.invoice"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel value="無" control={<Radio />} label="無" />
                  <FormControlLabel value="有" control={<Radio />} label="有" />
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 無 -> 個人 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="insurance.personalName"
            label="無→個人"
            fullWidth
          />
        </Grid>

        {/* 過戶 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="insurance.collection"
            label="過戶"
            fullWidth
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
