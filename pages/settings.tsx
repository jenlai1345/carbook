// pages/settings.tsx
import * as React from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Grid,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import ClearIcon from "@mui/icons-material/Clear";
import Parse from "../lib/parseClient";
import { useForm, Controller } from "react-hook-form";
import CarToolbar from "@/components/CarToolbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { zhTW as pickersZhTW } from "@mui/x-date-pickers/locales";
import { upsertBrand, upsertSetting } from "./api/settingsUpserts";

// --------- 類型定義與對應 ---------
type CategoryKey =
  | "brand" // 廠牌設定 -> Brand 資料表
  | "importStyle" // 進貨模式設定
  | "purchaser" // 採購員設定
  | "purchaseMethod" // 採購方式設定
  | "moveMethod" // 異動方式設定
  | "maintenanceShop" // 保養廠設定
  | "insuranceType" // 保險類別設定
  | "insuranceCompany" // 保險公司設定
  | "salesperson" // 銷售員設定
  | "salesMethod" // 銷售方式設定
  | "saleStyle" // 銷貨模式設定
  | "preferredShop" // 特約廠設定
  | "loanCompany" // 貸款公司設定
  | "feeItem" // 費用項目設定
  | "otherFeeItem" // 其它費用項目設定
  | "reconditionStatus" // 整備情形設定
  | "disposal" // 處置設定（你要求新增）
  | "commonEquip"; // 常用配備設定

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "brand", label: "廠牌設定" },
  { key: "importStyle", label: "進貨模式設定" },
  { key: "purchaser", label: "採購員設定" },
  { key: "purchaseMethod", label: "採購方式設定" },
  { key: "moveMethod", label: "異動方式設定" },
  { key: "maintenanceShop", label: "保養廠設定" },
  { key: "insuranceType", label: "保險類別設定" },
  { key: "insuranceCompany", label: "保險公司設定" },
  { key: "salesperson", label: "銷售員設定" },
  { key: "salesMethod", label: "銷售方式設定" },
  { key: "saleStyle", label: "銷貨模式設定" },
  { key: "preferredShop", label: "特約廠設定" },
  { key: "loanCompany", label: "貸款公司設定" },
  { key: "feeItem", label: "費用項目設定" },
  { key: "otherFeeItem", label: "其它費用項目設定" },
  { key: "reconditionStatus", label: "整備情形設定" },
  { key: "disposal", label: "處置設定" },
  { key: "commonEquip", label: "常用配備設定" },
];

type SettingRow = {
  id: string;
  name: string;
  order?: number | null;
  active?: boolean | null;
};

// --------- 表單型別 ---------
type FormValues = {
  id?: string;
  name: string;
  order?: number | "";
  active?: boolean;
};

// --------- 主頁面 ---------
export default function SettingsPage() {
  const [current, setCurrent] = React.useState<CategoryKey>("brand");
  const [rows, setRows] = React.useState<SettingRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: { name: "", order: "", active: true },
  });

  const isBrand = current === "brand";

  // 讀取資料
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      if (isBrand) {
        const q = new Parse.Query("Brand");
        q.ascending("name");
        const list = await q.find();
        setRows(
          list.map((o) => ({
            id: o.id!,
            name: o.get("name") ?? "",
            order: null,
            active: o.get("active") ?? true, // ← read active
          }))
        );
      } else {
        const q = new Parse.Query("Setting");
        q.equalTo("type", current);
        // ✅ 正確的多欄位排序
        q.ascending("order").addAscending("createdAt");
        const list = await q.find();
        setRows(
          list.map((o) => ({
            id: o.id!,
            name: o.get("name") ?? "",
            order: o.get("order") ?? null,
            active: o.get("active") ?? true, // ← read active
          }))
        );
      }
    } catch (e) {
      console.error(e);
      alert("讀取資料發生錯誤");
    } finally {
      setLoading(false);
      setEditingId(null);
      reset({ name: "", order: "", active: true });
    }
  }, [current, isBrand, reset]);

  React.useEffect(() => {
    load();
  }, [load]);

  // 新增或更新
  const onSubmit = handleSubmit(async (data) => {
    try {
      const name = data.name?.trim();
      if (!name) {
        alert("請輸入名稱");
        return;
      }

      if (isBrand) {
        await upsertBrand(name);
      } else {
        const orderNum =
          data.order !== "" && data.order !== undefined
            ? Number(data.order)
            : undefined;
        await upsertSetting(current, name, orderNum);
      }

      await load();
    } catch (e) {
      console.error(e);
      alert("儲存失敗");
    }
  });

  // 編輯
  const startEdit = (r: SettingRow) => {
    setEditingId(r.id);
    setValue("id", r.id);
    setValue("name", r.name);
    setValue("order", (r.order as number | undefined) ?? "");
    setValue("active", !!r.active);
  };

  // 刪除
  const remove = async (id: string) => {
    if (!confirm("確定刪除？")) return;
    try {
      if (isBrand) {
        const Brand = Parse.Object.extend("Brand");
        const obj = new Brand();
        obj.id = id;
        obj.set("active", false); // ✅ soft delete
        await obj.save(null, { useMasterKey: false });
      } else {
        const Setting = Parse.Object.extend("Setting");
        const obj = new Setting();
        obj.id = id;
        obj.set("active", false); // ✅ soft delete
        await obj.save(null, { useMasterKey: false });
      }
      await load();
    } catch (e) {
      console.error(e);
      alert("刪除失敗");
    }
  };

  // 清除表單
  const clearForm = () => {
    setEditingId(null);
    reset({ name: "", order: "", active: true });
  };

  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="zh-tw"
      localeText={
        pickersZhTW.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      <CarToolbar
        breadcrumbs={[
          { label: "首頁", href: "/dashboard", showHomeIcon: true },
          { label: "設定" },
        ]}
      />
      <Container maxWidth="lg">
        <Paper variant="outlined">
          <Grid container>
            {/* 左側種類清單 */}
            <Grid
              size={{ xs: 12, md: 3 }}
              sx={{ borderRight: { md: "1px solid #eee" } }}
            >
              <List dense>
                {CATEGORIES.map((c) => (
                  <ListItemButton
                    key={c.key}
                    selected={c.key === current}
                    onClick={() => setCurrent(c.key)}
                  >
                    <ListItemText primary={c.label} />
                  </ListItemButton>
                ))}
              </List>
            </Grid>

            {/* 右側內容 */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {CATEGORIES.find((c) => c.key === current)?.label}
                </Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <form onSubmit={onSubmit}>
                    {/* ✅ 改用 Grid2 使按鈕寬且與 TextField 同高 */}
                    <Grid container spacing={2} alignItems="stretch">
                      {/* 名稱 */}
                      <Grid sx={{ flexGrow: 1 }}>
                        <Controller
                          name="name"
                          control={control}
                          render={({ field }) => (
                            <TextField {...field} label="名稱" fullWidth />
                          )}
                        />
                      </Grid>

                      {/* 排序（非 brand 顯示） */}
                      {!isBrand && (
                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                          <Controller
                            name="order"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                type="number"
                                label="排序（選填）"
                                fullWidth
                              />
                            )}
                          />
                        </Grid>
                      )}

                      {/* 狀態切換（非 brand 顯示） */}
                      {!isBrand && (
                        <Grid
                          size={{ xs: 12, sm: 6, md: 2 }}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            px: { md: 1 },
                          }}
                        >
                          <Controller
                            name="active"
                            control={control}
                            render={({ field }) => (
                              <Stack
                                direction="row"
                                alignItems="center"
                                sx={{ width: "100%" }}
                              >
                                <Typography>停用</Typography>
                                <Switch
                                  checked={!!field.value}
                                  onChange={(e) =>
                                    field.onChange(e.target.checked)
                                  }
                                />
                                <Typography>啟用</Typography>
                              </Stack>
                            )}
                          />
                        </Grid>
                      )}

                      {/* 儲存/新增 按鈕 */}
                      <Grid size={{ xs: 4, md: 2 }}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          startIcon={editingId ? <SaveIcon /> : <AddIcon />}
                          sx={{ height: 56 }} // 同 TextField 高度
                        >
                          {editingId ? "儲存修改" : "新增"}
                        </Button>
                      </Grid>

                      {/* 取消編輯 按鈕（僅編輯時顯示） */}
                      <Grid size={{ xs: 4, md: 2 }}>
                        {editingId ? (
                          <Button
                            onClick={clearForm}
                            fullWidth
                            variant="outlined"
                            color="inherit"
                            startIcon={<ClearIcon />}
                            sx={{ height: 56 }}
                          >
                            取消編輯
                          </Button>
                        ) : (
                          <Box sx={{ height: 56 }} />
                        )}
                      </Grid>
                    </Grid>
                  </form>
                </Paper>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>名稱</TableCell>
                        {!isBrand && (
                          <TableCell sx={{ width: 120 }}>排序</TableCell>
                        )}
                        {!isBrand && (
                          <TableCell sx={{ width: 120 }}>狀態</TableCell>
                        )}
                        <TableCell align="right" sx={{ width: 120 }}>
                          動作
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((r) => (
                        <TableRow key={r.id} hover>
                          <TableCell>{r.name}</TableCell>
                          {!isBrand && <TableCell>{r.order ?? ""}</TableCell>}
                          {!isBrand && (
                            <TableCell>
                              {r.active === false ? "停用" : "啟用"}
                            </TableCell>
                          )}
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => startEdit(r)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => remove(r.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!loading && rows.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={isBrand ? 2 : 4}>
                            <Box
                              textAlign="center"
                              py={3}
                              color="text.secondary"
                            >
                              尚無資料
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {loading && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography color="text.secondary">載入中…</Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
