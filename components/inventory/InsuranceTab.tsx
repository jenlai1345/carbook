import * as React from "react";
import {
  Grid,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DATE_TF_PROPS } from "@/components/mui";

export default function InsuranceTab({
  control,
  errors,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  // tweak these lists any time
  const insuranceTypes = ["", "強制險", "任意險", "第三責任", "車體險", "其他"];
  const insurers = ["", "新光", "國泰", "富邦", "和泰", "安達", "兆豐", "其他"];
  const lenders = ["", "和運", "裕融", "中租", "合作金庫", "玉山", "其他"];

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 保險類別 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.insuranceType"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="保險類別" select fullWidth>
                {insuranceTypes.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* 到期日 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.expireDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="到期日"
                value={field.value ? dayjs(field.value) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>

        {/* 保險公司 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.insuranceCompany"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="保險公司" select fullWidth>
                {insurers.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* 貸款公司 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.loanCompany"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="貸款公司" select fullWidth>
                {lenders.map((v) => (
                  <MenuItem key={v} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* 聯絡人 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.contactName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="聯絡人" fullWidth />
            )}
          />
        </Grid>

        {/* 電話 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.contactPhone"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="電話" fullWidth />
            )}
          />
        </Grid>

        {/* 金額 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.amount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="金額"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">元</InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* 期數 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.installments"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="期數"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
              />
            )}
          />
        </Grid>

        {/* 基數 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.baseAmount"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="基數"
                fullWidth
                type="number"
                inputProps={{ step: "1", min: "0" }}
              />
            )}
          />
        </Grid>

        {/* 簽票：無 / 有 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl>
            <FormLabel>簽票</FormLabel>
            <Controller
              name="insurance.promissoryNote"
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
          <Controller
            name="insurance.personalName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="無→個人" fullWidth />
            )}
          />
        </Grid>

        {/* 追戶 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="insurance.collection"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="追戶" fullWidth />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
