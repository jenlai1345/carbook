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
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Parse from "@/lib/parseClient";

export type FeeItem = {
  date: string; // 日期 (YYYY-MM-DD)
  item: string; // 項目 (如：加油、停車、維修…)
  vendor: string; // 廠商
  amount: number | ""; // 金額
  cashOrCheck: "現" | "票"; // 現/票
  note?: string; // 說明
  handler?: string; // 經手人
};

const FIELD = "fees" as const;

/** 讀取 Setting.type = "feeItem" 的選項名稱 */
async function fetchFeeItemOptions(): Promise<string[]> {
  const Setting = Parse.Object.extend("Setting");
  const q = new Parse.Query(Setting);
  q.equalTo("owner", Parse.User.current());
  q.equalTo("type", "feeItem");
  q.equalTo("active", true);
  q.ascending("order").addAscending("name");
  q.limit(1000);
  const rows = await q.find();

  const names = rows
    .map((r) => (r.get("name") ?? "").toString().trim())
    .filter(Boolean);
  return Array.from(new Set(names));
}

export default function FeeTab({
  control,
  errors, // 介面一致；此表未使用
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

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingFeeItems(true);
        const opts = await fetchFeeItemOptions();
        if (mounted) setFeeItemOptions(opts);
      } catch (e) {
        // 可加上你的 Snackbar
        console.error("Load feeItem options failed:", e);
      } finally {
        if (mounted) setLoadingFeeItems(false);
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
            <col style={{ width: 48 }} /> {/* checkbox */}
            <col style={{ width: 180 }} /> {/* 日期 */}
            <col style={{ width: 180 }} /> {/* 項目 (wider) */}
            <col style={{ width: 140 }} /> {/* 廠商 */}
            <col style={{ width: 120 }} /> {/* 金額 */}
            <col style={{ width: 100 }} /> {/* 現/票 */}
            <col /> {/* 說明 (flex/remaining) */}
            <col style={{ width: 140 }} /> {/* 經手人 */}
            <col style={{ width: 56 }} /> {/* 刪除 */}
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
              <TableCell >項目</TableCell>
              <TableCell>廠商</TableCell>
              <TableCell>金額</TableCell>
              <TableCell>現/票</TableCell>
              <TableCell>說明</TableCell>
              <TableCell >經手人</TableCell>
              <TableCell align="center">
                刪除
              </TableCell>
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
                  <Controller
                    name={`${FIELD}.${index}.date`}
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(v) =>
                          field.onChange(v ? v.format("YYYY-MM-DD") : "")
                        }
                        slotProps={{ textField: { size: "small" } }}
                      />
                    )}
                  />
                </TableCell>

                {/* 項目：Autocomplete + 下拉，來源 Setting(type=feeItem) */}
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
                        // 讓 Autocomplete 以受控方式顯示目前值
                        value={field.value ?? ""}
                        onChange={(_, newValue) => {
                          const v =
                            typeof newValue === "string"
                              ? newValue
                              : (newValue as string) ?? "";
                          field.onChange(v);

                          // 使用者輸入新字詞後挑選時，加入到 options（僅前端暫存）
                          if (v && !feeItemOptions.includes(v)) {
                            setFeeItemOptions((prev) => [...prev, v]);
                          }
                        }}
                        onInputChange={(_, newInputValue, reason) => {
                          // 打字時同步到 RHF 欄位（freeSolo）
                          if (reason === "input") {
                            field.onChange(newInputValue);
                          }
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

                {/* 廠商 */}
                <TableCell>
                  <Controller
                    control={control}
                    name={`${FIELD}.${index}.vendor`}
                    render={({ field }) => (
                      <TextField {...field} size="small" fullWidth />
                    )}
                  />
                </TableCell>

                {/* 金額 */}
                <TableCell align="right">
                  <Controller
                    control={control}
                    name={`${FIELD}.${index}.amount`}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        inputProps={{ step: "1", min: "0" }}
                        fullWidth
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
                    )}
                  />
                </TableCell>

                {/* 現/票 */}
                <TableCell>
                  <Controller
                    control={control}
                    name={`${FIELD}.${index}.cashOrCheck`}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        size="small"
                        fullWidth
                        SelectProps={{ native: true }}
                      >
                        <option value="現">現</option>
                        <option value="票">票</option>
                      </TextField>
                    )}
                  />
                </TableCell>

                {/* 說明 */}
                <TableCell>
                  <Controller
                    control={control}
                    name={`${FIELD}.${index}.note`}
                    render={({ field }) => (
                      <TextField {...field} size="small" fullWidth />
                    )}
                  />
                </TableCell>

                {/* 經手人 */}
                <TableCell>
                  <Controller
                    control={control}
                    name={`${FIELD}.${index}.handler`}
                    render={({ field }) => (
                      <TextField {...field} size="small" fullWidth />
                    )}
                  />
                </TableCell>

                <TableCell align="center">
                  <IconButton onClick={() => remove(index)} size="small">
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
            onClick={deleteChecked}
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
