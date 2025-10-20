// components/NewOwnerTab.tsx
import * as React from "react";
import {
  Box,
  Typography,
  MenuItem,
  FormControl,
  FormLabel,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { DATE_TF_PROPS } from "../mui";
import { useCarSnackbar } from "../CarSnackbarProvider";
import { loadSettingsType } from "@/utils/helpers";
import RHFTextField from "../RHFTextField";

export type NewOwnerForm = {
  newOwnerName: string;
  newOwnerPhone: string;
  isPeer?: "是" | "否";
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
  salesmanName: string; // select
  salesCommissionPct: string;
  salesMode: string; // select
  salesMethod?: string; // select
  preferredShop: string; // select
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
  const [saleStyles, setSaleStyles] = React.useState<string[]>([""]);
  const [salesMethods, setSalesMethods] = React.useState<string[]>([""]);
  const [perferredShops, setPerferredShops] = React.useState<string[]>([""]);

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
        {/* 新車主名 / 電話 / 同行（是／否） */}
        <Grid size={{ xs: 12, md: 5 }}>
          <RHFTextField
            control={control}
            name="newOwnerName"
            label="新車主名"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <RHFTextField
            control={control}
            name="newOwnerPhone"
            label="電話"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 2 }}>
          <Controller
            name="isPeer"
            control={control}
            render={({ field }) => (
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontSize: 12, mb: 0.5 }}>
                  同行
                </FormLabel>
                <RadioGroup
                  row
                  value={field.value ?? "否"}
                  onChange={(e) =>
                    field.onChange(e.target.value as "是" | "否")
                  }
                >
                  <FormControlLabel
                    value="否"
                    control={<Radio size="small" />}
                    label="否"
                  />
                  <FormControlLabel
                    value="是"
                    control={<Radio size="small" />}
                    label="是"
                  />
                </RadioGroup>
              </FormControl>
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
          <RHFTextField
            control={control}
            name="newDealPriceWan"
            label="成交價（萬）"
            fullWidth
            inputProps={{ inputMode: "decimal" }}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <RHFTextField
            control={control}
            name="newCommissionWan"
            label="佣金（萬）"
            fullWidth
            inputProps={{ inputMode: "decimal" }}
          />
        </Grid>

        {/* 身分字號 / 生日 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <RHFTextField
            control={control}
            name="newOwnerIdNo"
            label="身分字號"
            fullWidth
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
          <RHFTextField
            control={control}
            name="newOwnerRegZip"
            label="戶籍 郵號"
            fullWidth
            inputProps={{ inputMode: "numeric", maxLength: 5 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <RHFTextField
            control={control}
            name="newOwnerRegAddr"
            label="戶籍地址"
            fullWidth
          />
        </Grid>

        {/* 通訊地址（郵號 + 地址） */}
        <Grid size={{ xs: 12, md: 3 }}>
          <RHFTextField
            control={control}
            name="newOwnerMailZip"
            label="通訊 郵號"
            fullWidth
            inputProps={{ inputMode: "numeric", maxLength: 5 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 9 }}>
          <RHFTextField
            control={control}
            name="newOwnerMailAddr"
            label="通訊地址"
            fullWidth
          />
        </Grid>

        {/* 代購人 / 電話 / 介紹人 / 電話 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <RHFTextField
            control={control}
            name="buyerAgentName"
            label="代購人"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <RHFTextField
            control={control}
            name="buyerAgentPhone"
            label="代購人電話"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <RHFTextField
            control={control}
            name="referrerName2"
            label="介紹人"
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <RHFTextField
            control={control}
            name="referrerPhone2"
            label="介紹人電話"
            fullWidth
          />
        </Grid>

        {/* 銷售員 / 銷售佣金% / 銷貨模式 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="salesmanName"
            control={control}
            render={({ field }) => (
              <RHFTextField
                {...field}
                control={control as any}
                name="salesmanName"
                label="銷售員"
                select
                fullWidth
              >
                {salespersons.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </RHFTextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <RHFTextField
            control={control}
            name="salesCommissionPct"
            label="銷售獎金比（%）"
            fullWidth
            inputProps={{ inputMode: "decimal" }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="salesMode"
            control={control}
            render={({ field }) => (
              <RHFTextField
                {...field}
                control={control as any}
                name="salesMode"
                label="銷貨模式"
                select
                fullWidth
              >
                {saleStyles.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </RHFTextField>
            )}
          />
        </Grid>

        {/* 特約廠 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="preferredShop"
            control={control}
            render={({ field }) => (
              <RHFTextField
                {...field}
                control={control as any}
                name="preferredShop"
                label="特約廠"
                select
                fullWidth
              >
                {perferredShops.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </RHFTextField>
            )}
          />
        </Grid>

        {/* 銷售方式 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="salesMethod"
            control={control}
            render={({ field }) => (
              <RHFTextField
                {...field}
                control={control as any}
                name="salesMethod"
                label="銷售方式"
                select
                fullWidth
              >
                {salesMethods.map((v) => (
                  <MenuItem key={v || "__blank"} value={v}>
                    {v || "（未選）"}
                  </MenuItem>
                ))}
              </RHFTextField>
            )}
          />
        </Grid>

        {/* 備註 */}
        <Grid size={{ xs: 12, md: 4 }}>
          <RHFTextField
            control={control}
            name="newOwnerNote"
            label="備註"
            multiline
            fullWidth
          />
        </Grid>
      </Grid>
    </Box>
  );
}
