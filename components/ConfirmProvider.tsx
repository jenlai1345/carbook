import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

type ConfirmOptions = {
  title?: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?:
    | "primary"
    | "error"
    | "inherit"
    | "secondary"
    | "success"
    | "info"
    | "warning";
  // If your delete handler is async, show a spinner state inside the dialog
  busy?: boolean;
};

type Resolver = (v: boolean) => void;

type Ctx = {
  confirm: (opts?: ConfirmOptions) => Promise<boolean>;
  setBusy: (busy: boolean) => void;
};

const ConfirmContext = React.createContext<Ctx | null>(null);

export const useConfirm = () => {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
};

export const ConfirmProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [open, setOpen] = React.useState(false);
  const [opts, setOpts] = React.useState<ConfirmOptions>({});
  const [resolver, setResolver] = React.useState<Resolver | null>(null);
  const [busy, setBusyState] = React.useState(false);

  const confirm = React.useCallback((next?: ConfirmOptions) => {
    setOpts(next ?? {});
    setOpen(true);
    setBusyState(next?.busy ?? false);
    return new Promise<boolean>((resolve) => setResolver(() => resolve));
  }, []);

  const close = (result: boolean) => {
    if (busy) return; // prevent closing while busy
    setOpen(false);
    resolver?.(result);
    setResolver(null);
    setBusyState(false);
  };

  const setBusy = (v: boolean) => setBusyState(v);

  return (
    <ConfirmContext.Provider value={{ confirm, setBusy }}>
      {children}
      <Dialog
        open={open}
        onClose={() => close(false)}
        fullScreen={fullScreen}
        aria-labelledby="confirm-title"
      >
        <DialogTitle id="confirm-title">
          {opts.title ?? "確認刪除？"}
        </DialogTitle>
        {!!opts.description && (
          <DialogContent>
            {typeof opts.description === "string" ? (
              <DialogContentText>{opts.description}</DialogContentText>
            ) : (
              opts.description
            )}
          </DialogContent>
        )}
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => close(false)} disabled={busy}>
            {opts.cancelText ?? "取消"}
          </Button>
          <Button
            variant="contained"
            color={opts.confirmColor ?? "error"}
            onClick={() => close(true)}
            disabled={busy}
            autoFocus
          >
            {busy ? "處理中…" : opts.confirmText ?? "刪除"}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};
