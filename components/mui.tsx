// components/mui.tsx
import { styled } from "@mui/material/styles";
import { Button } from "@mui/material";

export const SaveButton = styled(Button)(({ theme }) => ({
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
  width: "100%",
  [theme.breakpoints.up("sm")]: { width: "50%" },
  textTransform: "none",
  fontWeight: 700,
  fontSize: 20,
  borderRadius: 10,
  "&:hover": { boxShadow: theme.shadows[4], transform: "translateY(-1px)" },
}));

export const DATE_TF_PROPS = {
  fullWidth: true,
  size: "medium" as const,
  variant: "outlined" as const,
  sx: {
    "& .MuiOutlinedInput-root": { height: 56 },
    "& .MuiOutlinedInput-input": { py: 0 },
  },
};
