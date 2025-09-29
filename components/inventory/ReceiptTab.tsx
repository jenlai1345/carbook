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
import { useCarSnackbar } from "../CarSnackbarProvider";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

export type ReceiptItem = {
  date: string; // 日期 (YYYY-MM-DD)
  amount: number | ""; // 金額
  cashOrCheck: "現" | "票"; // 現/票
  exchangeDate?: string; // 票據日期
  note?: string; // 說明
};

const FIELD = "receipts" as const;

export default function ReceiptTab({
  control,
  errors, // for signature consistency; not used here
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: FIELD,
  });

  const rows = (useWatch({ control, name: FIELD }) || []) as ReceiptItem[];
  const [checked, setChecked] = React.useState<Record<number, boolean>>({});
  const { showMessage } = useCarSnackbar();

  // ★ 自動帶入規則：當為「票」且有 date，且 exchangeDate 尚未填，則設定為 date，並顯示 Snackbar
  React.useEffect(() => {
    rows.forEach((r, i) => {
      const shouldAutofill =
        r?.cashOrCheck === "票" &&
        !!r?.date &&
        (!r?.exchangeDate || r.exchangeDate === "");

      if (shouldAutofill) {
        update(i, { ...r, exchangeDate: r.date });
        showMessage(
          `第 ${i + 1} 筆：已將「票據日期」自動設為「日期」`,
          "info",
          2000
        );
      }
    });
  }, [rows, update, showMessage]);

  const addRow = () =>
    append({
      date: "",
      amount: "",
      cashOrCheck: "現",
      exchangeDate: "",
      note: "",
    });

  const deleteChecked = () => {
    Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => +k)
      .sort((a, b) => b - a)
      .forEach((i) => remove(i));
    setChecked({});
  };

  const totalReceived = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
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
              <TableCell width={140}>日期</TableCell>
              <TableCell width={160}>金額</TableCell>
              <TableCell width={120}>現/票</TableCell>
              <TableCell width={160}>票據日期</TableCell>
              <TableCell>說明</TableCell>
              <TableCell width={56} align="center">
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
                        slotProps={{
                          textField: {
                            size: "small",
                          },
                        }}
                      />
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

                {/* 票據日期 */}
                <TableCell>
                  <Controller
                    name={`${FIELD}.${index}.exchangeDate`}
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(v) =>
                          field.onChange(v ? v.format("YYYY-MM-DD") : "")
                        }
                        slotProps={{
                          textField: {
                            size: "small",
                          },
                        }}
                      />
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

                <TableCell align="center">
                  <IconButton onClick={() => remove(index)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  尚無資料，點「新增」建立一筆收款。
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
          已收：{totalReceived.toLocaleString()} 元　售價－底價：0.00 萬
        </Typography>
      </Stack>
    </Box>
  );
}
