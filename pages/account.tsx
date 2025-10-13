// pages/account.tsx
import * as React from "react";
import Parse from "../lib/parseClient";
import {
  Box,
  Container,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import dayjs from "dayjs";
import CarToolbar from "@/components/CarToolbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { zhTW as pickersZhTW } from "@mui/x-date-pickers/locales";

function toDateInput(d?: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function daysBetween(a: Date, b: Date) {
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default function AccountPage() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [snack, setSnack] = React.useState<{
    open: boolean;
    msg: string;
    sev: "success" | "error";
  }>({
    open: false,
    msg: "",
    sev: "success",
  });

  const [form, setForm] = React.useState({
    title: "", // 車商名稱
    address: "",
    phone: "",
    email: "",
    expiration: "", // yyyy-MM-dd
    newPassword: "",
    confirmPassword: "",
  });

  const expDate = form.expiration
    ? dayjs(form.expiration, "YYYY-MM-DD", true).toDate()
    : null;
  const today = new Date();
  const isExpired = expDate
    ? expDate.getTime() <
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    : false;
  const dLeft = expDate
    ? daysBetween(expDate, today) * (isExpired ? -1 : 1)
    : undefined;

  React.useEffect(() => {
    const init = async () => {
      const user = await Parse.User.currentAsync();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      try {
        const fresh = await user.fetch(); // ← get latest from DB
        setForm({
          title: fresh.get("title") || "",
          address: fresh.get("address") || "",
          phone: fresh.get("phone") || "",
          email: fresh.get("email") || "",
          // Use dayjs to avoid off-by-one due to TZ
          expiration: fresh.get("expiration")
            ? dayjs(fresh.get("expiration")).format("YYYY-MM-DD")
            : "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (e) {
        console.error("Fetch current user failed:", e);
      } finally {
        setLoading(false);
      }
    };
    void init();
  }, []);

  const handleChange =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
    };

  const handleSave = async () => {
    const user = await Parse.User.currentAsync();
    if (!user) {
      setSnack({ open: true, msg: "尚未登入", sev: "error" });
      return;
    }

    if (form.newPassword || form.confirmPassword) {
      if (form.newPassword.length < 6) {
        setSnack({ open: true, msg: "密碼至少 6 碼", sev: "error" });
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setSnack({ open: true, msg: "兩次輸入的密碼不一致", sev: "error" });
        return;
      }
    }

    setSaving(true);
    try {
      user.set("title", form.title.trim());
      user.set("address", form.address.trim());
      user.set("phone", form.phone.trim());
      user.set("email", form.email.trim());

      if (form.newPassword) {
        user.setPassword(form.newPassword);
        user.set("pw", form.newPassword);
      }

      await user.save();

      setSnack({ open: true, msg: "已儲存！", sev: "success" });
      setForm((s) => ({ ...s, newPassword: "", confirmPassword: "" }));
    } catch (e: any) {
      console.error(e);
      setSnack({ open: true, msg: e?.message || "儲存失敗", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reload from server values
    setLoading(true);
    (async () => {
      const user = await Parse.User.currentAsync();
      if (user) {
        setForm({
          title: user.get("title") || "",
          address: user.get("address") || "",
          phone: user.get("phone") || "",
          email: user.get("email") || "",
          expiration: toDateInput(user.get("expiration")),
          newPassword: "",
          confirmPassword: "",
        });
      }
      setLoading(false);
    })();
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
            編輯您的基本資料與帳戶有效期限。
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="車商名稱（Dealer / Title）"
                value={form.title}
                onChange={handleChange("title")}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="E-mail"
                value={form.email}
                onChange={handleChange("email")}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="電話 (Phone)"
                value={form.phone}
                onChange={handleChange("phone")}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="帳戶有效期限 (Expiration)"
                type="date"
                value={form.expiration}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ readOnly: true }}
                disabled
                helperText={
                  expDate
                    ? isExpired
                      ? `已到期（過期 ${Math.abs(dLeft!)} 天）`
                      : `有效（剩餘 ${Math.abs(dLeft!)} 天）`
                    : "尚未設定"
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 12 }}>
              <TextField
                label="地址 (Address)"
                value={form.address}
                onChange={handleChange("address")}
                fullWidth
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom fontWeight={700}>
            變更密碼
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="新密碼"
                type="password"
                value={form.newPassword}
                onChange={handleChange("newPassword")}
                fullWidth
                autoComplete="new-password"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="再次輸入新密碼"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
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
              sx={{
                textTransform: "none",
                fontWeight: 700,
              }}
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
