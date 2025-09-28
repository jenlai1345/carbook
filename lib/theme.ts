// lib/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#2563eb" }, // crisp blue accents
    secondary: { main: "#f59e0b" },
    background: {
      default: "#f8fafc", // light page background
      paper: "#ffffff", // cards/panels stay white
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif',
    h5: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      // subtle dotted background for the whole page (very faint)
      styleOverrides: {
        body: {
          backgroundImage: `radial-gradient(rgba(2,6,23,0.04) 1px, transparent 1px),
             radial-gradient(rgba(2,6,23,0.03) 1px, transparent 1px)`,
          backgroundSize: "28px 28px, 28px 28px",
          backgroundPosition: "0 0, 14px 14px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(2,6,23,0.06)",
          boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 10 },
      },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 3, borderRadius: 3 } },
    },
    // Keep TextFields clean/white and readable
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
          "& fieldset": { borderColor: "rgba(2,6,23,0.12)" },
          "&:hover fieldset": { borderColor: "#2563eb" },
          "&.Mui-focused fieldset": { borderColor: "#2563eb" },
        },
      },
    },
    MuiInputLabel: {
      // back to normal (no white chip needed on light theme)
      styleOverrides: { root: { color: "#64748b" } },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: { backgroundColor: "#fff" },
        option: { color: "#0f172a" },
      },
    },
  },
});

export default theme;
