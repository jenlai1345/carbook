// pages/account.tsx
import * as React from "react";
import Parse from "../lib/parseClient";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import dayjs from "dayjs";
import CarToolbar from "@/components/CarToolbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { zhTW as pickersZhTW } from "@mui/x-date-pickers/locales";

type SnackState = {
  open: boolean;
  msg: string;
  sev: "success" | "error";
};

function toDateInput(d?: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function daysBetween(a: Date, b: Date) {
  // a - target, b - today
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AccountPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [snack, setSnack] = React.useState<SnackState>({
    open: false,
    msg: "",
    sev: "success",
  });

  // flags
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);

  // dealer state (admin only)
  const [dealerId, setDealerId] = React.useState<string | null>(null);
  const [dealerForm, setDealerForm] = React.useState({
    name: "",
    phone: "",
    address: "",
    expiration: "",
  });

  // user state
  const [userForm, setUserForm] = React.useState({
    name: "",
    email: "", // also username
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  // derived expiration display (read-only field)
  const expDate = dealerForm.expiration
    ? dayjs(dealerForm.expiration, "YYYY-MM-DD", true).toDate()
    : null;
  const today = new Date();
  const isExpired = expDate
    ? expDate.getTime() <
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    : false;
  const dLeft = expDate
    ? daysBetween(expDate, today) * (isExpired ? -1 : 1)
    : undefined;

  // init
  React.useEffect(() => {
    (async () => {
      const cur = await Parse.User.currentAsync();
      if (!cur) {
        window.location.href = "/login";
        return;
      }
      try {
        const fresh = await cur.fetch(); // get latest
        const admin = !!fresh.get("isAdmin");
        setIsAdmin(admin);

        // load user fields
        setUserForm({
          name: fresh.get("name") || "",
          email: fresh.get("email") || fresh.get("username") || "",
          phone: fresh.get("phone") || "",
          newPassword: "",
          confirmPassword: "",
        });

        // load dealer if admin & pointer exists
        if (admin) {
          const dealerPtr: Parse.Object | undefined = fresh.get("dealer");
          if (dealerPtr && dealerPtr.id) {
            const d = await dealerPtr.fetch();
            setDealerId(d.id ?? null);
            setDealerForm({
              name: d.get("name") || "",
              phone: d.get("phone") || "",
              address: d.get("address") || "",
              expiration: d.get("expiration")
                ? dayjs(d.get("expiration")).format("YYYY-MM-DD")
                : "",
            });
          } else {
            // admin but no dealer bound
            setDealerId(null);
            setDealerForm({ name: "", phone: "", address: "", expiration: "" });
          }
        }
      } catch (e) {
        console.error("Fetch current user failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // handlers
  const handleDealerChange =
    (key: keyof typeof dealerForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setDealerForm((s) => ({ ...s, [key]: e.target.value }));
    };

  const handleUserChange =
    (key: keyof typeof userForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setUserForm((s) => ({ ...s, [key]: e.target.value }));
    };

  const handleSave = async () => {
    const user = await Parse.User.currentAsync();
    if (!user) {
      setSnack({ open: true, msg: "尚未登入", sev: "error" });
      return;
    }

    if (userForm.newPassword || userForm.confirmPassword) {
      if (userForm.newPassword.length < 6) {
        setSnack({ open: true, msg: "密碼至少 6 碼", sev: "error" });
        return;
      }
      if (userForm.newPassword !== userForm.confirmPassword) {
        setSnack({ open: true, msg: "兩次輸入的密碼不一致", sev: "error" });
        return;
      }
    }

    setSaving(true);
    try {
      // Save user
      user.set("name", userForm.name.trim());
      user.set("phone", userForm.phone.trim());
      // keep email = username
      const emailTrim = userForm.email.trim();
      user.set("email", emailTrim);
      user.set("username", emailTrim);

      if (userForm.newPassword) {
        user.setPassword(userForm.newPassword);
        // If you keep a plaintext pw mirror (not recommended), set it here:
        user.set("pw", userForm.newPassword);
      }
      await user.save();

      // Save dealer (admin only, if bound)
      if (isAdmin && dealerId) {
        const Dealer = Parse.Object.extend("Dealer");
        const d = new Dealer();
        d.id = dealerId;
        d.set("name", dealerForm.name.trim());
        d.set("phone", dealerForm.phone.trim());
        d.set("address", dealerForm.address.trim());
        await d.save();
      }

      setSnack({ open: true, msg: "已儲存！", sev: "success" });
      setUserForm((s) => ({ ...s, newPassword: "", confirmPassword: "" }));
    } catch (e: any) {
      console.error(e);
      setSnack({ open: true, msg: e?.message || "儲存失敗", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const user = await Parse.User.currentAsync();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      const fresh = await user.fetch();
      const admin = !!fresh.get("isAdmin");
      setIsAdmin(admin);

      const expiration: Date | null = fresh.get("expiration") ?? null;
      setUserForm({
        name: fresh.get("name") || "",
        email: fresh.get("email") || fresh.get("username") || "",
        phone: fresh.get("phone") || "",
        newPassword: "",
        confirmPassword: "",
      });

      if (admin) {
        const dealerPtr: Parse.Object | undefined = fresh.get("dealer");
        if (dealerPtr && dealerPtr.id) {
          const d = await dealerPtr.fetch();
          setDealerId(d.id ?? null);
          setDealerForm({
            name: d.get("name") || "",
            phone: d.get("phone") || "",
            address: d.get("address") || "",
            expiration: d.get("expiration")
              ? dayjs(d.get("expiration")).format("YYYY-MM-DD")
              : "",
          });
        } else {
          setDealerId(null);
          setDealerForm({ name: "", phone: "", address: "", expiration: "" });
        }
      } else {
        setDealerId(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress />
        </Paper>
      </Container>
    );
  }

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
          { label: "帳戶" },
        ]}
      />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            帳戶設定
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            編輯您的基本資料與（若具管理員身分）車商資訊。
          </Typography>

          {/* Admin: Dealer Section */}
          {isAdmin && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" fontWeight={700} gutterBottom>
                車商資訊
              </Typography>
              {!dealerId ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  尚未綁定車商資料。請至後台建立或綁定 Dealer 物件後再回來編輯。
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="車商名稱"
                      value={dealerForm.name}
                      onChange={handleDealerChange("name")}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="電話"
                      value={dealerForm.phone}
                      onChange={handleDealerChange("phone")}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="地址"
                      value={dealerForm.address}
                      onChange={handleDealerChange("address")}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="帳戶有效期限"
                      type="date"
                      value={dealerForm.expiration}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ readOnly: true }}
                      helperText={
                        expDate
                          ? isExpired
                            ? `已到期（過期 ${Math.abs(dLeft!)} 天）`
                            : `有效（剩餘 ${Math.abs(dLeft!)} 天）`
                          : "尚未設定"
                      }
                    />
                  </Grid>
                </Grid>
              )}
            </>
          )}

          {/* User Section */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" fontWeight={700} gutterBottom>
            使用者資訊
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="姓名"
                value={userForm.name}
                onChange={handleUserChange("name")}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="帳號/Email"
                value={userForm.email}
                onChange={handleUserChange("email")}
                inputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="電話"
                value={userForm.phone}
                onChange={handleUserChange("phone")}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Password Section */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" gutterBottom fontWeight={700}>
            變更密碼
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="新密碼"
                type="password"
                value={userForm.newPassword}
                onChange={handleUserChange("newPassword")}
                fullWidth
                autoComplete="new-password"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="再次輸入新密碼"
                type="password"
                value={userForm.confirmPassword}
                onChange={handleUserChange("confirmPassword")}
                fullWidth
                autoComplete="new-password"
              />
            </Grid>
          </Grid>

          <Box
            sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}
          >
            <Button variant="outlined" onClick={handleReset} disabled={saving}>
              重新載入
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              {saving ? "儲存中…" : "儲存"}
            </Button>
          </Box>
        </Paper>

        <Snackbar
          open={snack.open}
          autoHideDuration={3000}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snack.sev}
            onClose={() => setSnack((s) => ({ ...s, open: false }))}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}
