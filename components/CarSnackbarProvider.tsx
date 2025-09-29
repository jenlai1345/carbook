import * as React from "react";
import CarSnackbar from "./CarSnackbar";

type Sev = "error" | "warning" | "info" | "success";

type Ctx = {
  showMessage: (msg: string, sev?: Sev, dur?: number) => void;
};

const CarSnackbarContext = React.createContext<Ctx | null>(null);

export function CarSnackbarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [severity, setSeverity] = React.useState<Sev>("info");
  const [duration, setDuration] = React.useState<number>(2000);

  const showMessage = (msg: string, sev: Sev = "info", dur = 2000) => {
    setMessage(msg);
    setSeverity(sev);
    setDuration(dur);
    setOpen(true);
  };

  return (
    <CarSnackbarContext.Provider value={{ showMessage }}>
      {children}
      <CarSnackbar
        open={open}
        message={message}
        severity={severity}
        duration={duration}
        onClose={() => setOpen(false)}
      />
    </CarSnackbarContext.Provider>
  );
}

export function useCarSnackbar() {
  const ctx = React.useContext(CarSnackbarContext);
  if (!ctx) {
    throw new Error("useCarSnackbar must be used within CarSnackbarProvider");
  }
  return ctx;
}
