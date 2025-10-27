// components/CarToolbar.tsx
import dynamic from "next/dynamic";
export default dynamic(() => Promise.resolve(CarToolbarImpl), { ssr: false });

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import NextLink from "next/link";
import type { UrlObject } from "url";
import Parse from "../lib/parseClient";
import { COLOR_ADMIN, COLOR_STAFF } from "@/utils/constants";
import { getCurrentDealer } from "@/utils/helpers";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface BreadcrumbItem {
  label: string;
  href?: string; // leave undefined for the current page
  showHomeIcon?: boolean;
}

export interface HLToolbarProps {
  breadcrumbs: BreadcrumbItem[];
  rightSlot?: React.ReactNode;
  sx?: SxProps<Theme>;
}

const toUrlObject = (href: string): UrlObject => ({ pathname: href });

const CarToolbarImpl: React.FC<HLToolbarProps> = ({
  breadcrumbs,
  rightSlot,
  sx,
}) => {
  const [dealerName, setDealerName] = React.useState<string>("");
  const [userName, setUserName] = React.useState<string>("");
  const [hasUser, setHasUser] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useLocalStorage("isAdmin", false);

  React.useEffect(() => {
    const init = async () => {
      const user = await Parse.User.currentAsync();
      if (!user) {
        setHasUser(false);
        setIsAdmin(false);
        setUserName("");
        setDealerName("");
        return;
      }
      setHasUser(true);
      // user display name (prefer "name", fallback to "username" or "email")
      const uName =
        (user.get("name") as string) ||
        (user.get("username") as string) ||
        (user.get("email") as string) ||
        "";
      setUserName(uName);

      const dealer = await getCurrentDealer();
      setDealerName((dealer?.get("name") as string) || "");
      setIsAdmin(!!user.get("isAdmin"));
    };
    void init();
  }, [setIsAdmin]);

  const handleLogout = async () => {
    try {
      await Parse.User.logOut();
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  // Build the right-side label:
  // - "Dealer — User（管理者）" if admin
  // - "Dealer — User" otherwise
  // - If dealer missing: "User（管理者）" or "User"
  // - If user missing (shouldn't happen when logged in): just dealer
  const pieces = [
    dealerName || null,
    userName ? `${userName}${isAdmin ? "（管理者）" : ""}` : null,
  ].filter(Boolean);
  const decoratedTitle = pieces.join(" — ");

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        ...sx,
        bgcolor: isAdmin ? COLOR_ADMIN : COLOR_STAFF,
        color: "common.white",
        mb: 2,
      }}
    >
      <Toolbar sx={{ minHeight: 64, gap: 1 }}>
        {/* Middle: breadcrumbs */}
        <Breadcrumbs
          aria-label="breadcrumb"
          separator={
            <ChevronRightRoundedIcon sx={{ fontSize: 20, color: "inherit" }} />
          }
          sx={{
            flex: 1,
            color: "inherit",
            fontSize: 18,
            "& a, & .MuiTypography-root": {
              color: "inherit",
              fontSize: "inherit",
              fontWeight: 600,
              lineHeight: 1.8,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              textDecoration: "none",
            },
          }}
        >
          {breadcrumbs.map((bc, i) => {
            const isLast = i === breadcrumbs.length - 1;
            const content = (
              <>
                {bc.showHomeIcon && <HomeRoundedIcon sx={{ fontSize: 20 }} />}
                {bc.label}
              </>
            );

            if (!isLast && bc.href) {
              const href: UrlObject = toUrlObject(bc.href);
              return (
                <MuiLink
                  key={`${bc.label}-${i}`}
                  component={NextLink}
                  href={href}
                  underline="hover"
                  color="inherit"
                >
                  {content}
                </MuiLink>
              );
            }

            return (
              <Typography
                key={`${bc.label}-${i}`}
                color="inherit"
                component="span"
              >
                {content}
              </Typography>
            );
          })}
        </Breadcrumbs>

        {/* Optional right-side slot (e.g., buttons) */}
        {rightSlot ? <Box sx={{ ml: 1 }}>{rightSlot}</Box> : null}

        {/* Dealer/User display → /account + Logout */}
        {(hasUser || dealerName) && (
          <Box
            sx={{
              ml: 3,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexShrink: 0,
            }}
          >
            <MuiLink
              component={NextLink}
              href="/account"
              underline="hover"
              sx={{
                color: "inherit",
                fontSize: decoratedTitle ? 18 : 16,
                fontWeight: 600,
                lineHeight: 1.8,
                whiteSpace: "nowrap",
                maxWidth: 360, // widened a bit to fit "Dealer — User"
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer",
                "&:hover": { color: "grey.200" },
              }}
              title={decoratedTitle || "帳號"}
            >
              {decoratedTitle || "帳號"}
            </MuiLink>

            <Button
              color="inherit"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: 16,
                ml: 0.5,
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              登出
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
