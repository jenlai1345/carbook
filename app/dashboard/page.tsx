"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initParse } from "../lib/parseClient";
import { Box, Button, Container, Paper, Typography } from "@mui/material";

export default function DashboardPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const Parse = initParse();
    const current = Parse.User.current();
    if (!current) {
      router.replace("/login");
      return;
    }
    setUsername(current.getUsername?.() ?? current.get("username"));
  }, [router]);

  async function handleLogout() {
    const Parse = initParse();
    await Parse.User.logOut();
    router.replace("/login");
  }

  return (
    <Container
      maxWidth="md"
      sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
    >
      <Paper sx={{ p: 4, width: "100%" }} elevation={3}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Dashboard
        </Typography>
        <Typography sx={{ mb: 2 }}>Hi, {username}</Typography>
        <Box>
          <Button variant="outlined" onClick={handleLogout}>
            登出
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
