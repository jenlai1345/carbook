// components/inventory/ReceiptTab.tsx
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
import { Controller, useFieldArray, useWatch, Control } from "react-hook-form";

export type ReceiptItem = {
  date: string; // 日期 (YYYY-MM-DD)
  amount: number | ""; // 金額
  cashOrCheck: "現" | "票"; // 現/票
  exchangeDate?: string; // 票換日期
  note?: string; // 說明
};

type Props<T extends Record<string, any>> = {
  control: Control<T>;
  name: keyof T & string; // e.g. "receipts"
};

export default function ReceiptTab<T extends Record<string, any>>({
  control,
  name,
}: Props<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as any,
  });

  // current rows (no need for form.watch)
  const rows = (useWatch({ control, name: name as any }) ||
    []) as ReceiptItem[];

  const [checked, setChecked] = React.useState<Record<number, boolean>>({});

  const addRow = () =>
    append({
      date: "",
      amount: "",
      cashOrCheck: "現",
      exchangeDate: "",
      note: "",
    } as any);

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
              <TableCell width={140} align="right">
                金額
              </TableCell>
              <TableCell width={90}>現/票</TableCell>
              <TableCell width={160}>票換日期</TableCell>
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
                    control={control}
                    name={`${name}.${index}.date` as any}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </TableCell>

                {/* 金額 */}
                <TableCell align="right">
                  <Controller
                    control={control}
                    name={`${name}.${index}.amount` as any}
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
                    name={`${name}.${index}.cashOrCheck` as any}
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

                {/* 票換日期 */}
                <TableCell>
                  <Controller
                    control={control}
                    name={`${name}.${index}.exchangeDate` as any}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </TableCell>

                {/* 說明 */}
                <TableCell>
                  <Controller
                    control={control}
                    name={`${name}.${index}.note` as any}
                    render={({ field }) => (
                      <TextField {...field} size="small" fullWidth />
                    )}
                  />
                </TableCell>

                {/* 刪除單列 */}
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
