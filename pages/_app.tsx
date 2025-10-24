// pages/_app.tsx
import type { AppProps } from "next/app";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import theme from "../lib/theme";
import "../styles/globals.css";
import { ConfirmProvider } from "@/components/ConfirmProvider";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* 頂端半透明的玻璃感 App 區塊（可拿掉） */}
      <GlobalStyles
        styles={{
          ".glass": {
            background: "rgba(15,23,42,0.75)",
            backdropFilter: "saturate(140%) blur(10px)",
            border: "1px solid rgba(148,163,184,0.2)",
          },
        }}
      />
      <ConfirmProvider>
        <Component {...pageProps} />
      </ConfirmProvider>
    </ThemeProvider>
  );
}
