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
} from "@mui/material";
import { Controller, Control } from "react-hook-form";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DATE_TF_PROPS } from "../mui";
import type { FormValues } from "@/schemas/carSchemas";
import RHFImageUpload from "@/components/RHFImageUpload";
import RHFTextField from "@/components/RHFTextField";

/** ---------- Document Tab（含圖片上傳） ---------- */
type Props = { control: Control<FormValues, any, any> };

export default function DocumentTab({ control }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 音響密碼 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="document.audioCode"
            label="音響密碼"
            fullWidth
          />
        </Grid>

        {/* 預備鑰 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <RHFTextField
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

        {/* 申請書（缺(米)） */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>申請書</FormLabel>
            <Controller
              name="document.application"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有", "缺(米)"].map((opt) => (
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

        {/* 驗車日期 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="document.inspectDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="驗車日期"
                value={field.value ? dayjs(field.value) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
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
                  {["無", "有", "缺(△)"].map((opt) => (
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

        {/* 影本 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>影本</FormLabel>
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

        {/* 牌照 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>牌照</FormLabel>
            <Controller
              name="document.plate"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["無", "有", "缺(Φ)"].map((opt) => (
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl component="fieldset">
            <FormLabel>稅金</FormLabel>
            <Controller
              name="document.taxStatus"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {["已繳", "缺"].map((opt) => (
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

        {/* 備註 */}
        <Grid size={{ xs: 12 }}>
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
