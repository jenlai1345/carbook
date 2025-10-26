// components/inventory/BasicTab.tsx
import * as React from "react";
import { Controller } from "react-hook-form";
import { Box, TextField, Grid, Autocomplete, Typography } from "@mui/material";
import dayjs from "dayjs";
import Parse from "@/lib/parseClient";
import { useCarSnackbar } from "../CarSnackbarProvider";
import { DEALER_OPTIONS } from "@/utils/constants";
import type { Control } from "react-hook-form";
import type { FormValues } from "@/schemas/carSchemas";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import RHFImageUpload from "@/components/RHFImageUpload";
import RHFDatePicker from "../RHFDatePicker";
import RHFYearMonthPicker from "../RHFYearMonthPicker";

type Props = {
  control: Control<FormValues, any, any>; // note the third generic
};

export default function BasicTab({ control }: Props) {
  const { showMessage: _showMessage } = useCarSnackbar(); // underscore to avoid unused warning

  const [equipmentOpts, setEquipmentOpts] = React.useState<string[]>([]);
  const [conditionOpts, setConditionOpts] = React.useState<string[]>([]);
  const [dispositionOpts, setDispositionOpts] = React.useState<string[]>([]);

  // Optional: load options from Parse "Setting" (scope: "inventory")
  React.useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const user = Parse.User.current();
        const dealer = user?.get("dealer"); // ✅ dealer pointer on _User
        if (!user || !dealer) return;

        const Setting = Parse.Object.extend("Setting");

        // 整備情形
        const qCond = new Parse.Query(Setting);
        qCond.equalTo("dealer", dealer);
        qCond.equalTo("type", "condition");
        qCond.equalTo("active", true);
        qCond.ascending("order").addAscending("name");
        const condList = await qCond.find();

        if (!alive) return;
        setConditionOpts(condList.map((o) => o.get("name")).filter(Boolean));

        // 配備
        const qEquip = new Parse.Query(Setting);
        qEquip.equalTo("dealer", dealer);
        qEquip.equalTo("type", "equipment");
        qEquip.equalTo("active", true);
        qEquip.ascending("order").addAscending("name");
        const equipList = await qEquip.find();

        if (!alive) return;
        setEquipmentOpts(equipList.map((o) => o.get("name")).filter(Boolean));

        // 處置設定
        const qDisp = new Parse.Query(Setting);
        qDisp.equalTo("type", "disposal");
        qDisp.equalTo("active", true);
        qDisp.ascending("order").addAscending("name");
        const dispList = await qDisp.find();

        if (!alive) return;
        setDispositionOpts(dispList.map((o) => o.get("name")).filter(Boolean));
      } catch (e) {
        // keep defaults silently
        console.error(e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* 出廠（年/月） */}
        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"factoryYM" as any}
            control={control}
            render={({ field }) => {
              const ym = field.value ? dayjs(`${field.value}-01`) : null;
              return (
                <RHFYearMonthPicker
                  control={control}
                  name="factoryYM"
                  label="出廠（年/月）"
                />
              );
            }}
          />
        </Grid>

        {/* 領牌（年/月） */}
        <Grid size={{ xs: 6, md: 4 }}>
          <RHFYearMonthPicker
            control={control}
            name="plateYM"
            label="領牌（年/月）"
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"model" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Model" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"displacementCc" as any}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="排氣量"
                inputProps={{ inputMode: "numeric" }}
                fullWidth
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"transmission" as any}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                SelectProps={{ native: true }}
                label="排檔（A/M）"
                fullWidth
              >
                <option value=""></option>
                <option value="A">A</option>
                <option value="M">M</option>
              </TextField>
            )}
          />
        </Grid>

        <Grid size={{ xs: 6, md: 4 }}>
          <Controller
            name={"color" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="顏色" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={"engineNo" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="引擎號碼" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name={"vin" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="車身號碼" fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name={"dealer" as any}
            control={control}
            render={({ field }) => {
              const val = typeof field.value === "string" ? field.value : null;

              return (
                <Autocomplete<string, false, false, false>
                  options={DEALER_OPTIONS as readonly string[]}
                  value={val}
                  onChange={(_e, v) => field.onChange(v ?? "")}
                  renderInput={(params) => (
                    <TextField {...params} label="代理商" fullWidth />
                  )}
                />
              );
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="equipment"
            control={control}
            render={({ field }) => (
              <Autocomplete<string, false, false, true>
                freeSolo
                forcePopupIcon={true}
                popupIcon={<ArrowDropDownIcon />}
                options={equipmentOpts}
                inputValue={field.value ?? ""}
                onInputChange={(_e, v) => field.onChange(v ?? "")}
                value={null}
                onChange={() => {}}
                renderInput={(params) => (
                  <TextField {...params} label="配備" fullWidth />
                )}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name={"remark" as any}
            control={control}
            render={({ field }) => (
              <TextField {...field} label="備註" multiline fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <Autocomplete<string, false, false, true>
                freeSolo
                forcePopupIcon={true}
                popupIcon={<ArrowDropDownIcon />}
                options={conditionOpts}
                inputValue={field.value ?? ""}
                onInputChange={(_e, v) => field.onChange(v ?? "")}
                value={null}
                onChange={() => {}}
                renderInput={(params) => (
                  <TextField {...params} label="整備情形" fullWidth />
                )}
              />
            )}
          />
        </Grid>

        {/* 三個日曆 */}
        <Grid size={{ xs: 12, md: 3 }}>
          <RHFDatePicker
            control={control}
            name="inboundDate"
            label="進廠日（年/月/日）"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <RHFDatePicker
            control={control}
            name="promisedDate"
            label="預交日（年/月/日）"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <RHFDatePicker
            control={control}
            name="returnDate"
            label="回公司日（年/月/日）"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Controller
            name="disposition"
            control={control}
            render={({ field }) => (
              <Autocomplete<string, false, false, true>
                freeSolo
                forcePopupIcon={true}
                popupIcon={<ArrowDropDownIcon />}
                options={dispositionOpts}
                inputValue={field.value ?? ""}
                onInputChange={(_e, v) => field.onChange(v ?? "")}
                value={null}
                onChange={() => {}}
                renderInput={(params) => (
                  <TextField {...params} label="處置" fullWidth />
                )}
              />
            )}
          />
        </Grid>

        {/* 車輛照片（在「處置」之後） */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight={700}>
            車輛照片
          </Typography>
          <RHFImageUpload<FormValues>
            control={control}
            name="images" // ⬅️ 存在表單根層的 images
            label="上傳車輛照片"
            cols={5} // 你可以調整每列幾張
            height={140} // 也可以調整縮圖高度
          />
        </Box>
      </Grid>
    </Box>
  );
}
