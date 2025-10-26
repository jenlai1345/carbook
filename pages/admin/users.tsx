// pages/users.tsx
import * as React from "react";
import { useEffect, useMemo, useState, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Parse from "../../lib/parseClient";
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Snackbar,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import {
  Add,
  Refresh,
  Save,
  Edit,
  Logout as LogoutIcon,
  Block,
  Email as Invite,
} from "@mui/icons-material";
import CarToolbar from "@/components/CarToolbar";
import { useConfirm } from "@/components/ConfirmProvider";
import {
  CarSnackbarProvider,
  useCarSnackbar,
} from "@/components/CarSnackbarProvider";

/** ====== Types ====== */
type UserRow = {
  objectId?: string;
  email: string;
  username: string; // 顯示於「登入帳號」
  name: string;
  isAdmin: boolean;
  deviceLimit: number;
  deviceCount?: number;
  lastLoginAt?: string;
  isActive: boolean;
};

const emptyUser: UserRow = {
  email: "",
  username: "",
  name: "",
  isAdmin: false,
  deviceLimit: 1,
  isActive: true,
};

const CF = {
  LIST: "users_list",
  INVITE: "users_invite",
  UPDATE: "users_update",
  TOGGLE: "users_toggleActive",
  FORCE_LOGOUT: "users_forceLogout",
};

/** ====== Helpers ====== */
async function tryCloud<T = any>(
  name: string,
  params?: Record<string, any>
): Promise<{ ok: boolean; data?: T; error?: Error }> {
  try {
    const res = await Parse.Cloud.run(name, params ?? {});
    return { ok: true, data: res as T };
  } catch (err: any) {
    return { ok: false, error: err };
  }
}

/** Read-only fallback: list users under the same dealer (requires CLP allowing read) */
async function fallbackListUsers(): Promise<UserRow[]> {
  const me = await Parse.User.currentAsync();
  if (!me) return [];
  const dealer = me.get("dealer");
  const q = new Parse.Query(Parse.User);
  if (dealer) q.equalTo("dealer", dealer);
  q.limit(1000);
  q.ascending("name", "isActive");
  const rows = await q.find(); // works only if CLP permits user read
  return rows.map((u) => ({
    objectId: u.id,
    email: u.get("email") ?? u.get("username") ?? "",
    username: u.get("username") ?? "",
    name: u.get("name") ?? "",
    isAdmin: !!u.get("isAdmin"),
    deviceLimit: Number(u.get("deviceLimit") ?? 1),
    deviceCount: 0,
    lastLoginAt: u.get("lastLoginAt") ?? undefined,
    isActive: u.get("isActive") !== false,
  }));
}

/** ====== Page ====== */
function UsersContent() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<UserRow[]>([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<UserRow>(emptyUser);
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });
  const { confirm, setBusy } = useConfirm();
  const { showMessage } = useCarSnackbar();

  const showMsg = useCallback((msg: string) => {
    setSnack({ open: true, msg });
  }, []);

  const ensureLoggedIn = useCallback(async () => {
    const me = await Parse.User.currentAsync();
    if (!me) {
      router.replace("/login");
      return false;
    }
    return true;
  }, [router]);

  const load = useCallback(async () => {
    const ok = await ensureLoggedIn();
    if (!ok) return;

    setLoading(true);
    const cloud = await tryCloud<any[]>(CF.LIST, {});
    if (cloud.ok && Array.isArray(cloud.data)) {
      const normalized: UserRow[] = cloud.data.map((u: any) => ({
        objectId: u.objectId,
        email: u.email ?? u.username ?? "",
        username: u.username ?? u.email ?? "",
        name: u.name ?? "",
        isAdmin: !!(u.isAdmin ?? (u.role === "admin" || u.role === "owner")),
        deviceLimit: Number(u.deviceLimit ?? 1),
        deviceCount: Number(u.deviceCount ?? 0),
        lastLoginAt: u.lastLoginAt ?? undefined,
        isActive: u.isActive !== false,
      }));
      setRows(normalized);
      setLoading(false);
      return;
    }
    try {
      const list = await fallbackListUsers();
      setRows(list);
    } catch (err: any) {
      showMsg(err?.message ?? "載入使用者失敗");
    } finally {
      setLoading(false);
    }
  }, [ensureLoggedIn, showMsg]);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setEditing(emptyUser);
    setOpenEdit(true);
  };

  const startEdit = (u: UserRow) => {
    setEditing({ ...u });
    setOpenEdit(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        objectId: editing.objectId,
        email: editing.email.trim(),
        name: editing.name.trim(),
        isAdmin: !!editing.isAdmin,
        deviceLimit: Math.max(1, Number(editing.deviceLimit || 1)),
      };

      if (!payload.email || !payload.name) {
        showMsg("請輸入姓名與 Email");
        return;
      }

      setLoading(true);

      if (!editing.objectId) {
        const cloud = await tryCloud<UserRow>(CF.INVITE, payload);
        if (!cloud.ok || !cloud.data)
          throw cloud.error || new Error("邀請失敗");
        setRows((prev) => [cloud.data!, ...prev]);
        showMsg("已送出邀請／新增成功");
      } else {
        const cloud = await tryCloud<UserRow>(CF.UPDATE, payload);
        if (!cloud.ok || !cloud.data)
          throw cloud.error || new Error("更新失敗");
        const updated = cloud.data!;
        setRows((prev) =>
          prev.map((r) => (r.objectId === updated.objectId ? updated : r))
        );
        showMsg("已更新使用者資訊");
      }

      setOpenEdit(false);
    } catch (err: any) {
      showMsg(err?.message ?? "儲存失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (u: UserRow, next: boolean) => {
    try {
      setLoading(true);
      const cloud = await tryCloud<UserRow>(CF.TOGGLE, {
        objectId: u.objectId,
        isActive: next,
      });
      if (!cloud.ok || !cloud.data) throw cloud.error || new Error("切換失敗");
      const updated = cloud.data!;
      setRows((prev) =>
        prev.map((r) => (r.objectId === updated.objectId ? updated : r))
      );
      showMsg(next ? "已啟用使用者" : "已停用使用者");
    } catch (err: any) {
      showMsg(err?.message ?? "操作失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async (u: UserRow) => {
    try {
      setLoading(true);
      const cloud = await tryCloud(CF.FORCE_LOGOUT, { objectId: u.objectId });
      if (!cloud.ok) throw cloud.error || new Error("強制登出失敗");
      showMsg("已強制登出該使用者的所有裝置");
      await load();
    } catch (err: any) {
      showMsg(err?.message ?? "強制登出失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ background: "#f7f9fc", minHeight: "100vh" }}>
      <Head>
        <title>使用者與裝置管理</title>
      </Head>

      <CarToolbar
        breadcrumbs={[
          { label: "首頁", href: "/dashboard", showHomeIcon: true },
          { label: "使用者與裝置管理" },
        ]}
      />

      <Container maxWidth="lg">
        <Box mt={2} />
        <Paper elevation={0} sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            使用者清單
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>姓名</TableCell>
                  <TableCell>登入帳號</TableCell>
                  <TableCell>狀態</TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button startIcon={<Invite />} onClick={startCreate}>
                        邀請/新增
                      </Button>
                      <Button startIcon={<Refresh />} onClick={load}>
                        重新整理
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((u) => (
                  <TableRow
                    key={u.objectId ?? `${u.email}-${u.username}`}
                    hover
                  >
                    <TableCell>{u.name || "-"}</TableCell>
                    <TableCell>{u.username || u.email || "-"}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={u.isActive ? "啟用" : "停用"}
                          color={u.isActive ? "success" : "default"}
                          variant="outlined"
                        />
                        {u.isAdmin ? (
                          <Chip
                            size="small"
                            label="管理者"
                            color="primary"
                            variant="outlined"
                          />
                        ) : null}
                        {typeof u.deviceCount === "number" ? (
                          <Chip
                            size="small"
                            label={`裝置 ${u.deviceCount}/${u.deviceLimit}`}
                            variant="outlined"
                          />
                        ) : null}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => startEdit(u)}
                        >
                          編輯
                        </Button>

                        <Button
                          size="small"
                          startIcon={<LogoutIcon />}
                          onClick={async () => {
                            const ok = await confirm({
                              title: "確認強制登出？",
                              description: "登出後該使用者可重新登入系統",
                              confirmText: "登出",
                              cancelText: "取消",
                              confirmColor: "error",
                            });
                            if (ok) handleForceLogout(u);
                          }}
                        >
                          強制登出
                        </Button>

                        <Button
                          size="small"
                          color={u.isActive ? "error" : "inherit"}
                          startIcon={<Block />}
                          onClick={async () => {
                            if (u.objectId === Parse.User.current()?.id) {
                              showMessage("無法停用自己");
                              return;
                            }

                            const ok = await confirm({
                              title: `確認${
                                u.isActive ? "停用" : "啟用"
                              }此用戶？`,
                              description: u.isActive
                                ? "停用後該使用者將無法登入系統"
                                : "啟用後該使用者即可登入系統",
                              confirmText: u.isActive ? "停用" : "啟用",
                              cancelText: "取消",
                              confirmColor: "error",
                            });
                            if (ok) handleToggleActive(u, !u.isActive);
                          }}
                        >
                          {u.isActive ? "停用" : "啟用"}
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Container>

      {/* 編輯／新增 Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editing.objectId ? "編輯使用者" : "邀請／新增使用者"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 1,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              label="姓名"
              value={editing.name}
              onChange={(e) =>
                setEditing((s) => ({ ...s, name: e.target.value }))
              }
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={editing.email}
              onChange={(e) =>
                setEditing((s) => ({ ...s, email: e.target.value }))
              }
              variant="outlined"
              fullWidth
              disabled={Boolean(editing.objectId)}
            />
          </Box>

          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", px: { md: 1 } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!editing.isAdmin}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, isAdmin: e.target.checked }))
                    }
                  />
                }
                label="管理者（Admin）"
              />
            </Box>

            <TextField
              label="裝置限制（同時登入上限）"
              type="number"
              inputProps={{ min: 1, step: 1 }}
              value={editing.deviceLimit}
              onChange={(e) =>
                setEditing((s) => ({
                  ...s,
                  deviceLimit: Math.max(1, Number(e.target.value || 1)),
                }))
              }
              variant="outlined"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>取消</Button>
          {editing.objectId ? (
            <Button
              color="primary"
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
            >
              儲存
            </Button>
          ) : (
            <Button
              color="primary"
              variant="contained"
              startIcon={<Invite />}
              onClick={handleSave}
            >
              邀請
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        message={snack.msg}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </Box>
  );
}

export default function UsersPage() {
  return (
    <CarSnackbarProvider>
      <UsersContent />
    </CarSnackbarProvider>
  );
}
