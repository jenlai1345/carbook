// pages/login.tsx
import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Parse from "../lib/parseClient";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Eye, EyeOff, CarFront, ShieldCheck } from "lucide-react";
import { Snackbar } from "@mui/material";

/** Brand color (tweak if you want) */
const CARBOOK_BLUE = "#1e88e5";

/** Unified pill Input styles (no floating label used) */
const PILL_INPUT_SX = {
  // Input text + placeholder → black
  "& .MuiOutlinedInput-input": {
    color: "#000",
    "::placeholder": { color: "rgba(0,0,0,0.55)", opacity: 1 },
    py: 1.8,
    px: 2.2,
    fontSize: 18,
  },

  "& .MuiOutlinedInput-root": {
    borderRadius: 9999,
    backgroundColor: "#fff", // light field so black text has contrast
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.20)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(0,0,0,0.40)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: CARBOOK_BLUE,
      borderWidth: 2,
    },

    // Autofill fix → keep black text on white bg
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px #fff inset",
      WebkitTextFillColor: "#000",
      caretColor: "#000",
    },

    // Adornment/icon color (e.g., eye/eye-off) → dark
    "& .MuiInputAdornment-root .MuiIconButton-root": {
      color: "rgba(0,0,0,0.7)",
    },
  },
} as const;

/** A tiny helper that renders a fixed label above TextField (no floating label). */
function LabeledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography
        variant="body2"
        sx={{
          mb: 1,
          color: "rgba(255,255,255,0.78)",
          fontWeight: 700,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [remember, setRemember] = useState(true);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);
  const [snackSeverity, setSnackSeverity] = useState<
    "success" | "error" | "info"
  >("info");

  const [forgetLoading, setForgetLoading] = useState(false);

  useEffect(() => {
    const last = localStorage.getItem("carbook:lastUsername");
    if (last) setUsername(last);
  }, []);

 async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
   e.preventDefault();
   setLoading(true);
   setError(null);

   const u = username.trim();
   const p = password;

   try {
     // Primary path: normal SDK login
     const user = await Parse.User.logIn(u, p);
     if (user) {
       if (remember) localStorage.setItem("carbook:lastUsername", u);
       else localStorage.removeItem("carbook:lastUsername");
       router.push("/dashboard");
       return;
     }
   } catch (err: any) {
     // If this is the prod-only bug: TypeError ... (reading 'length'), do REST fallback
     const looksLikeLengthBug =
       err instanceof TypeError &&
       /reading 'length'/.test(String(err?.message || ""));

     if (looksLikeLengthBug) {
       try {
         // --- REST fallback (GET /login) ---
         // Ensure your parseClient exports these or read from env
         const appId =
           (Parse as any)._getApplicationId?.() || Parse.applicationId;
         const jsKey =
           (Parse as any)._getJavascriptKey?.() || (Parse as any).javaScriptKey;
         const serverURL =
           (Parse as any)._getServerURL?.() || (Parse as any).serverURL || "";

         const base = serverURL.replace(/\/$/, "");
         const url =
           `${base}/login?username=${encodeURIComponent(u)}` +
           `&password=${encodeURIComponent(p)}`;

         const resp = await fetch(url, {
           method: "GET",
           headers: {
             "X-Parse-Application-Id": appId,
             "X-Parse-JavaScript-Key": jsKey,
             "Content-Type": "application/json",
           },
         });

         if (!resp.ok) {
           // surface server error nicely
           const data = await resp.json().catch(() => ({}));
           const code = data?.code;
           const message = data?.error || `HTTP ${resp.status}`;
           if (code === 101) {
             setError("帳號或密碼錯誤");
           } else {
             setError(`(${code ?? "?"}) ${message}`);
           }
           return;
         }

         const data = await resp.json();
         const token = data?.sessionToken;
         if (!token) throw new Error("Missing sessionToken from REST login");

         // Adopt the session in the SDK so the rest of your app keeps working normally
         await Parse.User.become(token);

         if (remember) localStorage.setItem("carbook:lastUsername", u);
         else localStorage.removeItem("carbook:lastUsername");
         router.push("/dashboard");
         return;
       } catch (restErr: any) {
         console.error("[Login] REST fallback failed:", restErr);
         // fall through to generic error handling below
       }
     }

     // Normal error handling (wrong password, invalid session, etc.)
     const code = err?.code;
     if (code === 101) {
       setError("帳號或密碼錯誤");
     } else if (code === 209) {
       await Parse.User.logOut().catch(() => {});
       setError("登入狀態已失效，請重新登入。");
     } else {
       setError(`(${code ?? "?"}) ${err?.message || "Login failed"}`);
     }
   } finally {
     setLoading(false);
   }
 }


  async function handleForgot() {
    const email = username.trim();
    const looksLikeEmail = /\S+@\S+\.\S+/.test(email);

    if (!email || !looksLikeEmail) {
      setSnackSeverity("info");
      setSnack("請在「帳號」欄位輸入 Email 才能寄送重設連結");
      return;
    }

    try {
      setForgetLoading(true);
      await Parse.User.requestPasswordReset(email);
      setSnackSeverity("success");
      setSnack("已寄出重設密碼連結，請查收信箱。");
    } catch (e: any) {
      setSnackSeverity("error");
      setSnack(e?.message ?? "送出失敗，請稍後再試。");
    } finally {
      setForgetLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
        background:
          `radial-gradient(1200px 600px at -10% -20%, ${CARBOOK_BLUE}26 0%, ${CARBOOK_BLUE}0D 60%, transparent 100%),` +
          `radial-gradient(900px 500px at 110% 120%, #9c27b01a 0%, #9c27b00a 60%, transparent 100%),` +
          "linear-gradient(120deg, #0f172a 0%, #0b1022 100%)",
        color: "#fff",
      }}
    >
      {/* Left: minimal, professional illustration */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          p: 6,
        }}
      >
        <HeroIllustrationMinimal />
      </Box>

      {/* Right: Title + Login card */}
      <Container
        maxWidth="sm"
        sx={{ display: "flex", alignItems: "center", py: { xs: 6, md: 8 } }}
      >
        <Paper
          component="form"
          onSubmit={handleLogin}
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            backgroundColor: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "inherit",
            boxShadow:
              "0 20px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
            中古車進存銷系統
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                background: `linear-gradient(135deg, ${CARBOOK_BLUE}e6, #7c4dffe6)`,
                boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
              }}
            >
              <CarFront size={24} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                登入你的帳號
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                歡迎回來！請輸入帳號與密碼繼續
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.18)" }} />

          <Box display="grid" gap={2.2}>
            <LabeledField label="帳號">
              <TextField
                placeholder="輸入帳號"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
                fullWidth
                variant="outlined"
                // No label here → no overlap ever
                InputProps={{ sx: PILL_INPUT_SX }}
              />
            </LabeledField>

            <LabeledField label="密碼">
              <TextField
                placeholder="輸入密碼"
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                InputProps={{
                  sx: PILL_INPUT_SX,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPwd((v) => !v)}
                        edge="end"
                        sx={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {showPwd ? <EyeOff /> : <Eye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </LabeledField>

            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      "&.Mui-checked": { color: "#90caf9" },
                    }}
                  />
                }
                label="記住帳號"
              />
              <Button
                onClick={handleForgot}
                variant="text"
                disabled={forgetLoading}
                sx={{
                  color: "#90caf9",
                  textTransform: "none",
                  p: 0,
                  minWidth: 0,
                  gap: 1,
                }}
              >
                {forgetLoading && (
                  <CircularProgress size={16} sx={{ color: "#90caf9" }} />
                )}
                {forgetLoading ? "寄送中…" : "忘記密碼？"}
              </Button>
            </Box>

            {error && (
              <Alert
                severity="error"
                variant="outlined"
                icon={<ShieldCheck />}
                sx={{
                  bgcolor: "rgba(244,67,54,0.08)",
                  borderColor: "rgba(244,67,54,0.35)",
                  color: "#ffebee",
                }}
              >
                {error}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 0.5,
                py: 1.2,
                fontWeight: 800,
                letterSpacing: 0.4,
                borderRadius: 2,
                boxShadow: `0 10px 22px ${CARBOOK_BLUE}66`,
                background: `linear-gradient(135deg, ${CARBOOK_BLUE} 0%, #7c4dff 100%)`,
              }}
              fullWidth
            >
              {loading ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                "登入"
              )}
            </Button>

            <Box
              display="flex"
              alignItems="center"
              gap={1}
              justifyContent="center"
              sx={{ mt: 0.5 }}
            >
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                沒有帳號？
              </Typography>
              <Link
                href="mailto:carbook5858@gmail.com?subject=帳號申請/協助&body=您好，我需要協助開通帳號。"
                underline="hover"
                sx={{ color: "#9fa8da" }}
              >
                聯絡管理員
              </Link>
            </Box>
          </Box>
          <Snackbar
            open={!!snack}
            autoHideDuration={3800}
            onClose={() => setSnack(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnack(null)}
              severity={snackSeverity}
              sx={{ width: "100%" }}
            >
              {snack}
            </Alert>
          </Snackbar>
        </Paper>
      </Container>
    </Box>
  );
}

function HeroIllustrationMinimal() {
  const CARBOOK_BLUE = "#1e88e5";
  return (
    <Box
      aria-hidden
      sx={{
        width: "min(940px, 92%)",
        height: "min(620px, 68vh)",
        borderRadius: 36,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.2)",
      }}
    >
      {/* 👇 Add xmlnsXlink so xlinkHref works */}
      <svg
        viewBox="0 0 1200 800"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={CARBOOK_BLUE} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7c4dff" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.14)" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="1200" height="800" fill="url(#bg)" />

        {/* Top KPI tiles (kept small and high to leave space for car) */}
        <g transform="translate(120,120)">
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 320}, 0)`}>
              <rect width="280" height="160" rx="18" fill="url(#card)" />
              <rect
                x="22"
                y="24"
                width="150"
                height="12"
                rx="6"
                fill="#fff"
                opacity="0.92"
              />
              <rect
                x="22"
                y="48"
                width="220"
                height="10"
                rx="5"
                fill="#fff"
                opacity="0.45"
              />
              <rect
                x="22"
                y="66"
                width="190"
                height="10"
                rx="5"
                fill="#fff"
                opacity="0.35"
              />
              <polyline
                points="28,120 70,105 110,112 150,96 190,104 230,92 258,98"
                fill="none"
                stroke="#c5e1ff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
            </g>
          ))}
        </g>

        {/* Ground shadow */}
        <ellipse cx="600" cy="610" rx="380" ry="24" fill="rgba(0,0,0,0.22)" />

        {/* Car asset — draw LAST so it’s on top */}
        {/* Put your file at /public/assets/car.svg */}
        <g transform="translate(320,480) scale(0.95)">
          {/* Either of these two attributes work in modern browsers; include both for safety */}
          <image
            xlinkHref="/assets/car.svg"
            href="/assets/car.svg"
            width="574" /* natural width from your SVG's viewBox */
            height="252" /* natural height from your SVG's viewBox */
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      </svg>
    </Box>
  );
}
