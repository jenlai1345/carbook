import * as React from "react";
import { Snackbar, Alert, AlertColor } from "@mui/material";

export interface CarSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor; // "error" | "warning" | "info" | "success"
  duration?: number; // in ms, default 2000
  onClose: () => void;
}

export default function CarSnackbar({
  open,
  message,
  severity = "info",
  duration = 2000, // default 2 seconds
  onClose,
}: CarSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        sx={{ width: "100%" }}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
