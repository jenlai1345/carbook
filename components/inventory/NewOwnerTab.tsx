// components/NewOwnerTab.tsx
import * as React from "react";
import { Grid, Box, TextField, Typography, MenuItem } from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DATE_TF_PROPS } from "../mui";
import { useCarSnackbar } from "../CarSnackbarProvider";
import { loadSettingsType } from "@/utils/helpers";

export type NewOwnerForm = {
  newOwnerName: string;
  newOwnerPhone: string;

  newContractDate: string; // YYYY-MM-DD
  handoverDate: string; // YYYY-MM-DD
  newDealPriceWan: string;
  newCommissionWan: string;

  newOwnerIdNo: string;
  newOwnerBirth: string; // YYYY-MM-DD

  newOwnerRegAddr: string;
  newOwnerRegZip: string;
  newOwnerMailAddr: string;
  newOwnerMailZip: string;

  buyerAgentName: string;
  buyerAgentPhone: string;
  referrerName2: string;
  referrerPhone2: string;

  salesmanName: string; // 銷售員（DB: salesperson）
  salesCommissionPct: string;
  salesMode: string; // 銷貨模式（DB: saleStyle）
  salesMethod?: string; // 銷售方式（DB: salesMethod） ← 新增欄位

  preferredShop: string;
  newOwnerNote: string;
};

export default function NewOwnerTab({
  control,
  errors,
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  const { showMessage } = useCarSnackbar();

  // DB-driven options
  const [salespersons, setSalespersons] = React.useState<string[]>([""]);
  const [saleStyles, setSaleStyles] = React.useState<string[]>([""]); // 銷貨模式
  const [salesMethods, setSalesMethods] = React.useState<string[]>([""]); // 銷售方式
  const [perferredShops, setPerferredShops] = React.useState<string[]>([""]); // 特約廠

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [sp, ss, sm, ssh] = await Promise.all([
          loadSettingsType("salesperson"),
          loadSettingsType("saleStyle"),
          loadSettingsType("salesMethod"),
          loadSettingsType("preferredShop"),
        ]);
        if (!alive) return;
        setSalespersons(["", ...sp.filter(Boolean)]);
        setSaleStyles(["", ...ss.filter(Boolean)]);
        setSalesMethods(["", ...sm.filter(Boolean)]);
        setPerferredShops(["", ...ssh.filter(Boolean)]);
      } catch (e) {
        console.error("Failed to load sales settings:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

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
              <DatePicker
                label="合約日期"
                value={field.value ? dayjs(field.value) : null}
                onChange={(v) =>
                  field.onChange(v ? v.format("YYYY-MM-DD") : "")
                }
                slotProps={{ textField: DATE_TF_PROPS }}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="handoverDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="交車日期"
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

        {/* 銷售員（DB: salesperson） / 銷售佣金比率% / 銷貨模式（DB: saleStyle） */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="salesmanName"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="銷售員" fullWidth>
                {salespersons.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
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
              <TextField {...field} select label="銷貨模式" fullWidth>
                {saleStyles.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        {/* 銷售方式（DB: salesMethod） */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="salesMethod"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="銷售方式" fullWidth>
                {salesMethods.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Controller
            name="preferredShop"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="特約廠" fullWidth>
                {perferredShops.map((v) => (
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
