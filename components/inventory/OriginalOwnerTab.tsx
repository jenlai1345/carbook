import * as React from "react";
import { Grid, Box, TextField, Typography, MenuItem } from "@mui/material";
import {
  Controller,
  Control,
  FieldErrors,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DATE_TF_PROPS } from "../mui";
import { useCarSnackbar } from "../CarSnackbarProvider";
import { loadSettingsType } from "@/utils/helpers";

export type OriginalOwnerForm = {
  // 基本
  origOwnerName: string;
  origOwnerIdNo: string;
  origOwnerBirth: string; // YYYY-MM-DD
  origOwnerPhone: string;

  // 地址
  origOwnerRegZip: string;
  origOwnerRegAddr: string;
  origOwnerMailZip: string;
  origOwnerMailAddr: string;

  // 成交資訊
  origContractDate: string;
  origDealPriceWan: string;
  origCommissionWan: string;

  // 其他
  consignorName: string;
  consignorPhone: string;
  referrerName: string;
  referrerPhone: string;
  purchasedTransferred: string; // 是/否
  registeredToName: string; // ← 過戶名下（要自 DB 帶入）
  procurementMethod: string; // 採購方式（從 DB）
  origOwnerNote: string;
};

export default function OriginalOwnerTab({
  control,
  errors,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  const { showMessage } = useCarSnackbar();

  // 取用父層的 setValue/getValues（需要外層用 FormProvider 包住）
  const { setValue, getValues } = useFormContext();

  // 採購方式 options 由 DB 載入（Setting.type = "purchaseMethod"）
  const [procurementMethods, setProcurementMethods] = React.useState<string[]>([
    "",
  ]);

  // 「過戶名下」預設值（來自 Setting -> registeredToName）
  const [registeredToNameDefault, setRegisteredToNameDefault] =
    React.useState<string>("");

  // 監看目前表單的 registeredToName（避免重複覆蓋使用者已輸入值）
  const currentRegisteredToName = useWatch({
    control,
    name: "registeredToName",
  });

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const opts = await loadSettingsType("purchaseMethod"); // returns string[]
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

  // 讀取 Setting -> registeredToName，並在欄位尚未有值時帶入
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const names = await loadSettingsType("registeredToName"); // e.g. ["大瑋汽車"] 或多個；取第一個非空
        if (!alive) return;

        const firstNonEmpty =
          (names || []).find((s) => !!s?.trim())?.trim() ?? "";
        setRegisteredToNameDefault(firstNonEmpty);

        // 若表單目前沒有值，才寫入預設值（避免覆蓋使用者的手動輸入）
        const current = getValues?.("registeredToName");
        if (!current && firstNonEmpty) {
          setValue?.("registeredToName", firstNonEmpty, {
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
          <Controller
            name="origOwnerName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="原車主名" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="origOwnerIdNo"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="身分字號" fullWidth />
            )}
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

        {/* 第二列：合約日 / 成交價 / 佣金 / 原車主電話 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="origContractDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="交車日（年/月/日）"
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
          <Controller
            name="origDealPriceWan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="成交價（萬）"
                inputProps={{ inputMode: "decimal" }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Controller
            name="origCommissionWan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="佣金（萬）"
                inputProps={{ inputMode: "decimal" }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="origOwnerPhone"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="原車主電話" fullWidth />
            )}
          />
        </Grid>

        {/* 第三列：戶籍地址（郵遞區號 + 地址） */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="origOwnerRegZip"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="戶籍 郵遞區號"
                inputProps={{ inputMode: "numeric", maxLength: 5 }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 10 }}>
          <Controller
            name="origOwnerRegAddr"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="戶籍地址" fullWidth />
            )}
          />
        </Grid>

        {/* 第四列：通訊地址（郵遞區號 + 地址） */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="origOwnerMailZip"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="通訊 郵遞區號"
                inputProps={{ inputMode: "numeric", maxLength: 5 }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 10 }}>
          <Controller
            name="origOwnerMailAddr"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="通訊地址" fullWidth />
            )}
          />
        </Grid>

        {/* 第五列：代售人 / 電話 / 介紹人 / 電話 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="consignorName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="代售人" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="consignorPhone"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="電話" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="referrerName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="介紹人" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="referrerPhone"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="電話" fullWidth />
            )}
          />
        </Grid>

        {/* 第六列：買進已過戶 / 過戶名下 / 採購方式（DB） */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="purchasedTransferred"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="買進已過戶" fullWidth>
                <MenuItem value=""></MenuItem>
                <MenuItem value="是">是</MenuItem>
                <MenuItem value="否">否</MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="registeredToName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="過戶名下"
                fullWidth
                helperText={
                  !currentRegisteredToName && registeredToNameDefault
                    ? `已自動帶入設定值：${registeredToNameDefault}`
                    : undefined
                }
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="procurementMethod"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="採購方式" fullWidth>
                {procurementMethods.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* 備註 */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="origOwnerNote"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="備註" multiline fullWidth />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
