import * as React from "react";
import { Box, TextField, Typography, Grid } from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DATE_TF_PROPS } from "../mui";

export type OriginalOwnerForm = {
  // 基本
  origOwnerName: string;
  origOwnerIdNo: string;
  origOwnerBirth: string; // YYYY-MM-DD
  origOwnerPhone: string; // NEW: 原車主電話

  // 地址
  origOwnerRegZip: string; // NEW: 戶籍 郵遞區號
  origOwnerRegAddr: string; // 戶籍地址
  origOwnerMailZip: string; // NEW: 通訊 郵遞區號
  origOwnerMailAddr: string; // 通訊地址

  // 成交資訊
  origContractDate: string; // NEW: 合約日 YYYY-MM-DD
  origDealPriceWan: string; // NEW: 成交價（萬）
  origCommissionWan: string; // NEW: 佣金（萬）

  // 其他
  consignorName: string; // 代售人
  consignorPhone: string;
  referrerName: string; // 介紹人
  referrerPhone: string;
  purchasedTransferred: string; // 是/否
  registeredToName: string; // 過戶名下
  procurementMethod: string; // 採購方式
  origOwnerNote: string; // 備註
};

export default function OriginalOwnerTab({
  control,
  errors,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
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

        {/* 第六列：買進已過戶 / 過戶名下 / 採購方式 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="purchasedTransferred"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                SelectProps={{ native: true }}
                label="買進已過戶"
                fullWidth
              >
                <option value=""></option>
                <option value="是">是</option>
                <option value="否">否</option>
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="registeredToName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="過戶名下" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="procurementMethod"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                SelectProps={{ native: true }}
                label="採購方式"
                fullWidth
              >
                <option value=""></option>
                <option value="買斷">買斷</option>
                <option value="寄售">寄售</option>
                <option value="置換">置換</option>
                <option value="拍賣">拍賣</option>
                <option value="其他">其他</option>
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
