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

/** Brand color (tweak if you want) */
const HL_BLUE = "#1e88e5";

/** Unified pill Input styles (no floating label used) */
const PILL_INPUT_SX = {
  color: "#fff",
  "& .MuiOutlinedInput-root": {
    borderRadius: 9999,
    backgroundColor: "rgba(255,255,255,0.08)",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.24)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(255,255,255,0.42)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: HL_BLUE,
      borderWidth: 2,
    },
    // Autofill fix
    "& input:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 1000px rgba(255,255,255,0.08) inset",
      WebkitTextFillColor: "#fff",
      caretColor: "#fff",
    },
    // Height like your screenshot
    "& .MuiOutlinedInput-input": { py: 1.8, px: 2.2, fontSize: 18 },
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

  useEffect(() => {
    const last = localStorage.getItem("carbook:lastUsername");
    if (last) setUsername(last);
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await Parse.User.logIn(username.trim(), password);
      if (user) {
        if (remember)
          localStorage.setItem("carbook:lastUsername", username.trim());
        else localStorage.removeItem("carbook:lastUsername");
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
        background:
          `radial-gradient(1200px 600px at -10% -20%, ${HL_BLUE}26 0%, ${HL_BLUE}0D 60%, transparent 100%),` +
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
                background: `linear-gradient(135deg, ${HL_BLUE}e6, #7c4dffe6)`,
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
              <Link
                href="#"
                underline="hover"
                sx={{ color: "#90caf9", fontSize: 14 }}
                onClick={(e) => e.preventDefault()}
              >
                忘記密碼？
              </Link>
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
                boxShadow: `0 10px 22px ${HL_BLUE}66`,
                background: `linear-gradient(135deg, ${HL_BLUE} 0%, #7c4dff 100%)`,
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
              <Link href="#" underline="hover" sx={{ color: "#9fa8da" }}>
                聯絡管理員
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

function HeroIllustrationMinimal() {
  const HL_BLUE = "#1e88e5";
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
            <stop offset="0%" stopColor={HL_BLUE} stopOpacity="0.95" />
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
