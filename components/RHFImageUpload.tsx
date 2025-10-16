// components/RHFImageUpload.tsx
import * as React from "react";
import {
  Box,
  Button,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  OpenInNew,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { Control, FieldValues, useController } from "react-hook-form";
import Parse from "@/lib/parseClient";
import type { UploadedImage } from "@/schemas/carSchemas";

/** ---- filename & base64 helpers ---- */
const extFrom = (name: string, fallback = "jpg") => {
  const dot = name.lastIndexOf(".");
  const raw = dot >= 0 ? name.slice(dot + 1) : "";
  return raw ? raw.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() : fallback;
};

const safeName = (orig: string, mime?: string) => {
  const ext =
    (mime &&
      mime
        .split("/")[1]
        ?.replace(/[^a-zA-Z0-9]/g, "")
        .toLowerCase()) ||
    extFrom(orig) ||
    "jpg";
  const rand = Math.random().toString(36).slice(2, 8);
  return `img_${Date.now()}_${rand}.${ext}`;
};

const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] || "");
    r.onerror = reject;
    r.readAsDataURL(file);
  });

/** ---- Reusable RHF image uploader ---- */
export default function RHFImageUpload<TFieldValues extends FieldValues>({
  control,
  name,
  label = "上傳圖片",
  cols = 4,
  height = 120,
}: {
  control: Control<TFieldValues>;
  name: any; // 支援巢狀路徑，如 "document.images" 或 "images"
  label?: string;
  cols?: number;
  height?: number;
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

        const pf = new Parse.File(name, { base64 }, f.type || undefined);
        await pf.save();

        const url = pf.url();
        const id = pf.name();
        if (!url || !id) continue;

        current.push({ id, url, name: f.name }); // 顯示原始中文檔名
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

      <ImageList sx={{ mt: 1 }} cols={cols} gap={8}>
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
                height,
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
