// pages/finance.tsx
import * as React from "react";
import { Box, Typography } from "@mui/material";
import CarToolbar from "@/components/CarToolbar";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { zhTW as pickersZhTW } from "@mui/x-date-pickers/locales";

export default function FinancePage() {
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
          { label: "系統作業" },
        ]}
      />
      <Box display="flex" justifyContent="center" alignItems="center">
        <Typography variant="h5" color="textSecondary">
          此頁面尚待開發
        </Typography>
      </Box>
    </LocalizationProvider>
  );
}
