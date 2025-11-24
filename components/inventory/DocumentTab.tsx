// components/inventory/DocumentTab.tsx
import * as React from "react";
import {
  Box,
  Paper,
  FormControl,
  FormLabel,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Checkbox,
  FormGroup,
  TextField,
} from "@mui/material";
import { Controller, Control } from "react-hook-form";
import type { FormValues } from "@/schemas/carSchemas";
import RHFImageUpload from "@/components/RHFImageUpload";
import RHFTextField from "@/components/RHFTextField";
import RHFEngNumTextField from "../RHFEngNumTextField";

/** 將使用者輸入自動整理成 民國年 YYY/MM/DD */
function formatRocDateInput(input: string): string {
  // 只留數字，限制最多 7 碼（YYYMMDD）
  const digits = input.replace(/\D/g, "").slice(0, 7);

  if (!digits) return "";

  if (digits.length <= 3) {
    // 只輸入到年
    return digits;
  }

  if (digits.length <= 5) {
    // YYYMM
    return `${digits.slice(0, 3)}/${digits.slice(3)}`;
  }

  // YYYMMDD
  return `${digits.slice(0, 3)}/${digits.slice(3, 5)}/${digits.slice(5)}`;
}

/** ---------- Document Tab（含圖片上傳） ---------- */
type Props = { control: Control<FormValues, any, any> };

export default function DocumentTab({ control }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 音響密碼 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFEngNumTextField
            control={control}
            name="document.audioCode"
            label="音響密碼"
            fullWidth
          />
        </Grid>

        {/* 預備鑰 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFEngNumTextField
            control={control}
            name="document.spareKey"
            label="預備鑰"
            fullWidth
          />
        </Grid>

        {/* 證件齊全 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>證件齊全</FormLabel>
            <Controller
              name="document.certOk"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有", "缺"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 行照 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>行照</FormLabel>
            <Controller
              name="document.license"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有", "缺"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 牌照登記書 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>牌照登記書</FormLabel>
            <Controller
              name="document.application"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有", "缺"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 過戶書 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>過戶書</FormLabel>
            <Controller
              name="document.transferPaper"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 清償證明 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>清償證明</FormLabel>
            <Controller
              name="document.payoffProof"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 驗車(民國) — 文字輸入、自動補斜線 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="document.inspectDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="驗車(民國)"
                fullWidth
                placeholder="例如：114/05/20"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                inputMode="numeric"
                onChange={(e) => {
                  const formatted = formatRocDateInput(e.target.value);
                  field.onChange(formatted);
                }}
              />
            )}
          />
        </Grid>

        {/* 完稅證 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>完稅證</FormLabel>
            <Controller
              name="document.taxCert"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有", "影本"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 出廠證 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>出廠證</FormLabel>
            <Controller
              name="document.factoryCert"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有", "缺"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 身分證影本 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>身分證影本</FormLabel>
            <Controller
              name="document.copyFlag"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 鐵牌 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>鐵牌</FormLabel>
            <Controller
              name="document.plate"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有", "缺"].map((opt) => (
                    <FormControlLabel
                      key={opt}
                      value={opt}
                      control={<Radio size="small" />}
                      label={opt}
                    />
                  ))}
                </RadioGroup>
              )}
            />
          </FormControl>
        </Grid>

        {/* 稅金 */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <FormControl component="fieldset">
            <FormLabel>稅金</FormLabel>
            <Controller
              name="document.taxStatus"
              control={control}
              render={({ field }) => {
                const value: string[] = field.value ?? [];
                const options = ["已繳", "未稅", "牌照", "燃料"];

                return (
                  <FormGroup row>
                    {options.map((opt) => {
                      const checked = value.includes(opt);
                      return (
                        <FormControlLabel
                          key={opt}
                          label={opt}
                          control={
                            <Checkbox
                              size="small"
                              checked={checked}
                              onChange={(_, isChecked) => {
                                if (isChecked) {
                                  field.onChange([...value, opt]);
                                } else {
                                  field.onChange(
                                    value.filter((v) => v !== opt)
                                  );
                                }
                              }}
                            />
                          }
                        />
                      );
                    })}
                  </FormGroup>
                );
              }}
            />
          </FormControl>
        </Grid>

        {/* 備註 */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <RHFTextField
            control={control}
            name="document.remark"
            label="備註"
            fullWidth
            multiline
            rows={1}
          />
        </Grid>
      </Grid>

      {/* 證件圖片上傳 */}
      <Box sx={{ mb: 2, mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom fontWeight={700}>
          證件資料維護
        </Typography>

        <FormControl component="fieldset" fullWidth>
          <FormLabel>證件圖片（行照、身分證、登記書影本…）</FormLabel>
          <RHFImageUpload<FormValues>
            control={control}
            name="document.images"
            label="上傳證件照片"
          />
        </FormControl>
      </Box>
    </Paper>
  );
}
