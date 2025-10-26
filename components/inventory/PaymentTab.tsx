// components/inventory/PaymentTab.tsx
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
import RHFTextField from "@/components/RHFTextField";
import { useConfirm } from "@/components/ConfirmProvider";
import RHFDollarTextField from "../RHFDollarTextField";
import RHFDatePicker from "../RHFDatePicker";

export type PaymentItem = {
  date: string; // YYYY-MM-DD
  amount: number | ""; // 金額
  cashOrCheck: "現" | "票"; // 現/票
  interestStartDate?: string; // YYYY-MM-DD
  note?: string; // 說明
};

const FIELD = "payments" as const;

export default function PaymentTab({
  control,
  errors, // for signature consistency; not used
}: {
  control: Control<any>;
  errors: FieldErrors<any>;
}) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: FIELD,
  });

  const rows = (useWatch({ control, name: FIELD }) || []) as PaymentItem[];
  const [checked, setChecked] = React.useState<Record<number, boolean>>({});
  const { confirm, setBusy } = useConfirm();
  const { showMessage } = useCarSnackbar();

  // 自動帶入：現/票 = 票 時，利息起算日帶入 日期
  React.useEffect(() => {
    rows.forEach((r, i) => {
      const shouldAutofill =
        r?.cashOrCheck === "票" &&
        !!r?.date &&
        (!r?.interestStartDate || r.interestStartDate === "");
      if (shouldAutofill) {
        update(i, { ...r, interestStartDate: r.date });
        showMessage(
          `第 ${i + 1} 筆：已將「利息起算日」自動設為「日期」`,
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
      interestStartDate: "",
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

  const totalPaid = rows.reduce((s, r) => s + (Number(r.amount) || 0), 0);

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
              <TableCell width={160}>利息起算日</TableCell>
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
                  <RHFDatePicker
                    control={control}
                    name={`${FIELD}.${index}.date`}
                    label=""
                  />
                </TableCell>

                {/* 金額（與其他頁一致） */}
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

                {/* 利息起算日 */}
                <TableCell>
                  <RHFDatePicker
                    control={control}
                    name={`${FIELD}.${index}.interestStartDate`}
                    label=""
                  />
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

                <TableCell align="center">
                  <IconButton
                    size="small"
                    aria-label="刪除"
                    onClick={async () => {
                      const ok = await confirm({
                        title: "確認刪除此筆付款？",
                        description: "刪除後記得儲存才會生效",
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
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  尚無資料，點「新增」建立一筆付款。
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
                description: "刪除後記得儲存才會生效",
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
          已付：{totalPaid.toLocaleString()} 元　核至今日利息：0
          元　結算日：／／
        </Typography>
      </Stack>
    </Box>
  );
}
