// components/inventory/FeeTab.tsx
import * as React from "react";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Control,
  FieldErrors,
  Controller,
  useFieldArray,
  useWatch,
} from "react-hook-form";
import "dayjs/locale/zh-tw";
import Parse from "@/lib/parseClient";
import RHFTextField from "@/components/RHFTextField";
import { useConfirm } from "@/components/ConfirmProvider";
import RHFDollarTextField from "../RHFDollarTextField";
import RHFDatePicker from "../RHFDatePicker";

export type FeeItem = {
  date: string; // YYYY-MM-DD
  item: string; // 項目
  vendor: string; // 廠商
  amount: number | ""; // 金額
  cashOrCheck: "現" | "票"; // 現/票
  note?: string; // 說明
  handler?: string; // 經手人
};

const FIELD = "fees" as const;

/** 讀取某一 Setting.type 的「name」清單 */
async function fetchSettingNamesByType(type: string): Promise<string[]> {
  const user = Parse.User.current();
  const dealer = user?.get("dealer"); // ✅ dealer pointer on _User
  if (!user || !dealer) return [];

  const Setting = Parse.Object.extend("Setting");
  const q = new Parse.Query(Setting);
  q.equalTo("dealer", dealer);
  q.equalTo("type", type);
  q.equalTo("active", true);
  q.ascending("order").addAscending("name");
  q.limit(1000);
  const rows = await q.find();

  const names = rows
    .map((r) => (r.get("name") ?? "").toString().trim())
    .filter(Boolean);
  return Array.from(new Set(names));
}

/** 讀取 Setting.type = "feeItem" 的選項名稱 */
async function fetchFeeItemOptions(): Promise<string[]> {
  return fetchSettingNamesByType("feeItem");
}

/** 讀取 Setting.type = "maintenanceShop" 的選項名稱（廠商） */
async function fetchVendorOptions(): Promise<string[]> {
  return fetchSettingNamesByType("maintenanceShop");
}

export default function FeeTab({
  control,
  errors, // 未使用
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: FIELD,
  });

  const rows = (useWatch({ control, name: FIELD }) || []) as FeeItem[];
  const [checked, setChecked] = React.useState<Record<number, boolean>>({});

  // feeItem 選項
  const [feeItemOptions, setFeeItemOptions] = React.useState<string[]>([]);
  const [loadingFeeItems, setLoadingFeeItems] = React.useState<boolean>(false);

  // 廠商（maintenanceShop）選項
  const [vendorOptions, setVendorOptions] = React.useState<string[]>([]);
  const [loadingVendors, setLoadingVendors] = React.useState<boolean>(false);

  const { confirm } = useConfirm();

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingFeeItems(true);
        const opts = await fetchFeeItemOptions();
        if (mounted) setFeeItemOptions(opts);
      } catch (e) {
        console.error("Load feeItem options failed:", e);
      } finally {
        if (mounted) setLoadingFeeItems(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingVendors(true);
        const opts = await fetchVendorOptions();
        if (mounted) setVendorOptions(opts);
      } catch (e) {
        console.error("Load vendor options failed:", e);
      } finally {
        if (mounted) setLoadingVendors(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const addRow = () =>
    append({
      date: "",
      item: "",
      vendor: "",
      amount: "",
      cashOrCheck: "現",
      note: "",
      handler: "",
    });

  const deleteChecked = () => {
    Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => +k)
      .sort((a, b) => b - a)
      .forEach((i) => remove(i));
    setChecked({});
  };

  const totalFee = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: 48 }} /> {/* checkbox 欄寬 */}
            <col style={{ width: 180 }} /> {/* 日期欄寬 */}
            <col style={{ width: 170 }} /> {/* 項目欄寬 */}
            <col style={{ width: 170 }} /> {/* 廠商欄寬稍微放大 */}
            <col style={{ width: 150 }} /> {/* 金額欄寬 */}
            <col style={{ width: 100 }} /> {/* 現/票欄寬 */}
            <col style={{ width: 120 }} /> {/* 說明欄寬 */}
            <col style={{ width: 120 }} /> {/* 經手人欄寬 */}
            <col style={{ width: 60 }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    Object.values(checked).some(Boolean) &&
                    !Object.values(checked).every(Boolean)
                  }
                  checked={
                    fields.length > 0 && fields.every((_, i) => !!checked[i])
                  }
                  onChange={(e) => {
                    const all = e.target.checked;
                    const next: Record<number, boolean> = {};
                    fields.forEach((_, i) => (next[i] = all));
                    setChecked(next);
                  }}
                />
              </TableCell>
              <TableCell>日期</TableCell>
              <TableCell>項目</TableCell>
              <TableCell>廠商</TableCell>
              <TableCell>金額</TableCell>
              <TableCell>現/票</TableCell>
              <TableCell>說明</TableCell>
              <TableCell>經手人</TableCell>
              <TableCell align="center">刪除</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {fields.map((field, index) => (
              <TableRow key={field.id ?? index}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={!!checked[index]}
                    onChange={(e) =>
                      setChecked((prev) => ({
                        ...prev,
                        [index]: e.target.checked,
                      }))
                    }
                  />
                </TableCell>

                {/* 日期 */}
                <TableCell>
                  <RHFDatePicker
                    control={control}
                    name={`${FIELD}.${index}.date`}
                    label=""
                  />
                </TableCell>

                {/* 項目：Autocomplete */}
                <TableCell>
                  <Controller
                    control={control}
                    name={`${FIELD}.${index}.item`}
                    render={({ field }) => (
                      <Autocomplete
                        size="small"
                        fullWidth
                        freeSolo
                        options={feeItemOptions}
                        loading={loadingFeeItems}
                        value={field.value ?? ""}
                        onChange={(_, newValue) => {
                          const v =
                            typeof newValue === "string"
                              ? newValue
                              : (newValue as string) ?? "";
                          field.onChange(v);
                          if (v && !feeItemOptions.includes(v)) {
                            setFeeItemOptions((prev) => [...prev, v]);
                          }
                        }}
                        onInputChange={(_, newInputValue, reason) => {
                          if (reason === "input") field.onChange(newInputValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="選擇或輸入項目"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingFeeItems ? (
                                    <CircularProgress size={16} />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </TableCell>

                {/* 廠商：Autocomplete（maintenanceShop） */}
                <TableCell>
                  <Controller
                    control={control}
                    name={`${FIELD}.${index}.vendor`}
                    render={({ field }) => (
                      <Autocomplete
                        size="small"
                        fullWidth
                        freeSolo
                        options={vendorOptions}
                        loading={loadingVendors}
                        value={field.value ?? ""}
                        onChange={(_, newValue) => {
                          const v =
                            typeof newValue === "string"
                              ? newValue
                              : (newValue as string) ?? "";
                          field.onChange(v);
                          if (v && !vendorOptions.includes(v)) {
                            setVendorOptions((prev) => [...prev, v]);
                          }
                        }}
                        onInputChange={(_, newInputValue, reason) => {
                          if (reason === "input") field.onChange(newInputValue);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="選擇或輸入廠商"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingVendors ? (
                                    <CircularProgress size={16} />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </TableCell>

                {/* 金額 */}
                <TableCell align="right">
                  <RHFDollarTextField
                    control={control}
                    name={`${FIELD}.${index}.amount`}
                    suffix="元"
                    size="small"
                    fullWidth
                  />
                </TableCell>

                {/* 現/票 */}
                <TableCell>
                  <RHFTextField
                    control={control}
                    name={`${FIELD}.${index}.cashOrCheck`}
                    select
                    size="small"
                    fullWidth
                    SelectProps={{ native: true }}
                  >
                    <option value="現">現</option>
                    <option value="票">票</option>
                  </RHFTextField>
                </TableCell>

                {/* 說明 */}
                <TableCell>
                  <RHFTextField
                    control={control}
                    name={`${FIELD}.${index}.note`}
                    size="small"
                    fullWidth
                  />
                </TableCell>

                {/* 經手人 */}
                <TableCell>
                  <RHFTextField
                    control={control}
                    name={`${FIELD}.${index}.handler`}
                    size="small"
                    fullWidth
                  />
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    size="small"
                    aria-label="刪除"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "確認刪除此筆費用？",
                        description: "刪除後無法復原",
                        confirmText: "刪除",
                        cancelText: "保留",
                        confirmColor: "error",
                      });
                      if (ok) remove(index);
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  尚無資料，點「新增」建立一筆費用。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mt: 1 }}
        paddingLeft={2}
        paddingRight={2}
      >
        <Stack direction="row" spacing={1}>
          <Button
            onClick={addRow}
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
          >
            新增
          </Button>
          <Button
            onClick={async () => {
              const ok = await confirm({
                title: "確認刪除勾選？",
                description: "刪除後無法復原",
                confirmText: "刪除",
                cancelText: "保留",
                confirmColor: "error",
              });
              if (ok) deleteChecked();
            }}
            startIcon={<DeleteIcon />}
            variant="outlined"
            size="small"
            color="error"
            disabled={!Object.values(checked).some(Boolean)}
          >
            刪除勾選
          </Button>
        </Stack>

        <Typography variant="body2">
          合計：{totalFee.toLocaleString()} 元
        </Typography>
      </Stack>
    </Box>
  );
}
