// components/NewOwnerTab.tsx
import * as React from "react";
import { Box, TextField, Typography, Grid } from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";

export type NewOwnerForm = {
  newOwnerName: string; // 新車主名
  newOwnerPhone: string; // 電話

  newContractDate: string; // 合約日期 YYYY-MM-DD
  handoverDate: string; // 交車日期 YYYY-MM-DD
  newDealPriceWan: string; // 成交價（萬）
  newCommissionWan: string; // 佣金（萬）

  newOwnerIdNo: string; // 身分字號
  newOwnerBirth: string; // 生日 YYYY-MM-DD

  newOwnerRegAddr: string; // 戶籍地址
  newOwnerRegZip: string; // 戶籍 郵號
  newOwnerMailAddr: string; // 通訊地址
  newOwnerMailZip: string; // 通訊 郵號

  buyerAgentName: string; // 代購人
  buyerAgentPhone: string; // 代購人電話
  referrerName2: string; // 介紹人
  referrerPhone2: string; // 介紹人電話

  salesmanName: string; // 銷售員
  salesCommissionPct: string; // 銷售佣金比率（%）
  salesMode: string; // 銷貨模式（選單）

  preferredShop: string; // 特約廠
  newOwnerNote: string; // 備註
};

export default function NewOwnerTab({
  control,
  errors,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        新車主資料
      </Typography>

      <Grid container spacing={2}>
        {/* 新車主名 / 電話 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="newOwnerName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="新車主名" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="newOwnerPhone"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="電話" fullWidth />
            )}
          />
        </Grid>

        {/* 合約日期 / 交車日期 / 成交價（萬） / 佣金（萬） */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="newContractDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="合約日期"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="handoverDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="交車日期"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Controller
            name="newDealPriceWan"
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
            name="newCommissionWan"
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

        {/* 身分字號 / 生日 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="newOwnerIdNo"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="身分字號" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="newOwnerBirth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                label="生日"
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
          />
        </Grid>

        {/* 戶籍地址（郵號 + 地址） */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="newOwnerRegZip"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="戶籍 郵號"
                inputProps={{ inputMode: "numeric", maxLength: 5 }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Controller
            name="newOwnerRegAddr"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="戶籍地址" fullWidth />
            )}
          />
        </Grid>

        {/* 通訊地址（郵號 + 地址） */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="newOwnerMailZip"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="通訊 郵號"
                inputProps={{ inputMode: "numeric", maxLength: 5 }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <Controller
            name="newOwnerMailAddr"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="通訊地址" fullWidth />
            )}
          />
        </Grid>

        {/* 代購人 / 電話 / 介紹人 / 電話 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="buyerAgentName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="代購人" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="buyerAgentPhone"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="代購人電話" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="referrerName2"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="介紹人" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="referrerPhone2"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="介紹人電話" fullWidth />
            )}
          />
        </Grid>

        {/* 銷售員 / 銷售佣金比率% / 銷貨模式 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="salesmanName"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="銷售員" fullWidth />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="salesCommissionPct"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="銷售佣金比率（%）"
                inputProps={{ inputMode: "decimal" }}
                fullWidth
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="salesMode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                SelectProps={{ native: true }}
                label="銷貨模式"
                fullWidth
              >
                <option value=""></option>
                <option value="現金">現金</option>
                <option value="貸款">貸款</option>
                <option value="其他">其他</option>
              </TextField>
            )}
          />
        </Grid>

        {/* 特約廠 */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="preferredShop"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="特約廠" fullWidth />
            )}
          />
        </Grid>

        {/* 備註 */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="newOwnerNote"
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
