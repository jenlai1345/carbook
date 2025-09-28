import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Parse from "../lib/parseClient"; // ✅ use centralized parseClient
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await Parse.User.logIn(username.trim(), password);
      if (user) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Paper
        component="form"
        onSubmit={handleLogin}
        elevation={3}
        sx={{ p: 4, width: "100%", overflow: "hidden" }}
      >
        {/* Header illustration */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Box sx={{ width: 360, height: 240, position: "relative" }}>
            <Image
              src="/used-car-illustration.svg"
              alt="中古車進存銷系統 示意圖"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </Box>
          <Typography variant="h5" fontWeight={700} textAlign="center" mt={1}>
            中古車進存銷系統
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box display="grid" gap={2}>
          <TextField
            label="帳號"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            fullWidth
          />
          <TextField
            type="password"
            label="密碼"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            fullWidth
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={22} /> : "登入"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
