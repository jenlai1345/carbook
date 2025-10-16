// components/inventory/DocumentTab.tsx
import * as React from "react";
import {
  Box,
  Paper,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Stack,
  Grid,
} from "@mui/material";
import {
  Controller,
  Control,
  FieldValues,
  useController,
} from "react-hook-form";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DATE_TF_PROPS } from "../mui";
import Parse from "@/lib/parseClient"; // ← 視你的專案路徑調整
import {
  OpenInNew,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import type { FormValues, UploadedImage } from "@/schemas/carSchemas";
import { safeName, toBase64 } from "@/utils/helpers";

/** ---------- 通用 RHF 圖片上傳元件 ---------- */
function RHFImageUpload<TFieldValues extends FieldValues>({
  control,
  name,
  label = "上傳圖片",
}: {
  control: Control<TFieldValues>;
  name: any; // 支援 "document.images" 這種巢狀路徑
  label?: string;
}) {
  const { field } = useController({ control, name });
  const [uploading, setUploading] = React.useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const current: UploadedImage[] = Array.isArray(field.value)
        ? (field.value as UploadedImage[])
        : [];

      for (const f of Array.from(files)) {
        const name = safeName(f.name, f.type);
        const base64 = await toBase64(f);

        // name must be ASCII-safe; base64 payload avoids filename charset issues
        const pf = new Parse.File(name, { base64 }, f.type || undefined);
        await pf.save();

        const url = pf.url();
        const id = pf.name();
        if (!url || !id) continue;

        current.push({ id, url, name: f.name }); // keep original name for display
      }

      field.onChange(current);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("上傳失敗，請稍後再試。");
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (img: UploadedImage) => {
    const current = Array.isArray(field.value)
      ? (field.value as UploadedImage[])
      : [];
    const next = current.filter((x) => x.id !== img.id);
    field.onChange(next);
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Button
          variant="outlined"
          size="small"
          startIcon={<UploadIcon />}
          component="label"
        >
          {label}
          <input
            hidden
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFiles(e.target.files)}
          />
        </Button>
        {uploading && (
          <Box sx={{ flex: 1 }}>
            <LinearProgress />
          </Box>
        )}
      </Stack>

      <ImageList sx={{ mt: 1 }} cols={4} gap={8}>
        {(Array.isArray(field.value)
          ? (field.value as UploadedImage[])
          : []
        ).map((img) => (
          <ImageListItem key={img.id}>
            <img
              src={img.url}
              alt={img.name}
              loading="lazy"
              style={{
                objectFit: "cover",
                width: "100%",
                height: 120,
                borderRadius: 8,
              }}
            />
            <ImageListItemBar
              title={img.name}
              actionIcon={
                <Stack direction="row" spacing={0.5} sx={{ mr: 0.5 }}>
                  <IconButton
                    aria-label="open"
                    size="small"
                    onClick={() => window.open(img.url, "_blank")}
                  >
                    <OpenInNew fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => removeAt(img)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
}

/** ---------- Document Tab（含圖片上傳） ---------- */
type Props = { control: Control<FormValues, any, any> };

export default function DocumentTab({ control }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom fontWeight={700}>
        證件資料維護
      </Typography>

      {/* 新增：證件圖片上傳 */}
      <Box sx={{ mb: 2 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel>證件圖片（行照、身分證、登記書影本…）</FormLabel>
          <RHFImageUpload<FormValues>
            control={control}
            name="document.images"
            label="上傳證件照片"
          />
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        {/* 音響密碼 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="document.audioCode"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="音響密碼" fullWidth />
            )}
          />
        </Grid>

        {/* 預備鑰 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Controller
            name="document.spareKey"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="預備鑰" fullWidth />
            )}
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
          <Controller
            name="document.remark"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="備註" fullWidth multiline rows={1} />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
