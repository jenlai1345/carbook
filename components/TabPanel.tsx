// components/TabPanel.tsx
import * as React from "react";
import { Box } from "@mui/material";

export default function TabPanel({
  children,
  value,
  index,
}: {
  children?: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div
      hidden={value !== index}
      id={`inv-tabpanel-${index}`}
      aria-labelledby={`inv-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}
