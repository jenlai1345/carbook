// components/CarToolbar.tsx
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { SxProps, Theme } from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import NextLink from "next/link";
import type { UrlObject } from "url";
import Parse from "../lib/parseClient";

export interface BreadcrumbItem {
  label: string;
  href?: string; // leave undefined for the current page
  showHomeIcon?: boolean;
}

export interface HLToolbarProps {
  breadcrumbs: BreadcrumbItem[]; // e.g. [{label:'首頁', href:'/dashboard', showHomeIcon:true}, {label:'新增車籍'}]
  logo?: React.ReactNode; // optional: left-most logo node
  logoHref?: string; // click logo to navigate
  rightSlot?: React.ReactNode; // optional: put buttons on the right (before user badge)
  sx?: SxProps<Theme>; // style override for AppBar
}

const toUrlObject = (href: string): UrlObject => ({ pathname: href });

const CarToolbar: React.FC<HLToolbarProps> = ({
  breadcrumbs,
  logoHref = "/",
  rightSlot,
  sx,
}) => {
  const logoUrl: UrlObject = toUrlObject(logoHref);

  const [userTitle, setUserTitle] = React.useState<string>("");
  const [userLogoUrl, setUserLogoUrl] = React.useState<string>("");
  const [hasUser, setHasUser] = React.useState<boolean>(false);
  const [logo, setLogo] = React.useState<Parse.File | null>();

  React.useEffect(() => {
    const init = async () => {
      const user = await Parse.User.currentAsync();
      if (!user) {
        setHasUser(false);
        return;
      }
      setHasUser(true);
      setUserTitle(user.get("title") || "");
      setUserLogoUrl(user.get("logo") ?? null);
    };
    void init();
  }, []);

  const handleLogout = async () => {
    try {
      await Parse.User.logOut();
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "grey.900",
        color: "common.white",
        borderBottom: "1px solid",
        borderColor: "grey.800",
        mb: 2,
        ...sx,
      }}
    >
      <Toolbar sx={{ minHeight: 64, gap: 1 }}>
        {/* Left: logo (optional) */}
        {logo && (
          <NextLink href={logoUrl} legacyBehavior passHref>
            <IconButton
              component="a"
              color="inherit"
              edge="start"
              sx={{ mr: 1 }}
            >
              {logo}
            </IconButton>
          </NextLink>
        )}

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
              fontSize: "inherit", // same size as "首頁"
              fontWeight: 600, // same weight as "首頁"
              lineHeight: 1.8,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            },
          }}
        >
          {breadcrumbs.map((bc, i) => {
            const node = (
              <>
                {bc.showHomeIcon && <HomeRoundedIcon sx={{ fontSize: 20 }} />}
                {bc.label}
              </>
            );

            const isLast = i === breadcrumbs.length - 1;

            if (!isLast && bc.href) {
              const href: UrlObject = toUrlObject(bc.href);
              return (
                <NextLink
                  key={`${bc.label}-${i}`}
                  href={href}
                  legacyBehavior
                  passHref
                >
                  <MuiLink underline="hover" color="inherit">
                    {node}
                  </MuiLink>
                </NextLink>
              );
            }

            return (
              <Typography key={`${bc.label}-${i}`} color="inherit">
                {node}
              </Typography>
            );
          })}
        </Breadcrumbs>

        {/* Optional right-side slot (e.g., buttons) */}
        {rightSlot && <Box sx={{ ml: 1 }}>{rightSlot}</Box>}

        {/* User title + logo + logout (far right) */}
        {(hasUser || userTitle || userLogoUrl) && (
          <Box
            sx={{
              ml: 3,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexShrink: 0,
            }}
          >
            {/* Title same style as “首頁” */}
            {userTitle && (
              <Typography
                sx={{
                  color: "inherit",
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.8,
                  whiteSpace: "nowrap",
                  maxWidth: 220,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={userTitle}
              >
                {userTitle}
              </Typography>
            )}

            {/* Vertical divider */}
            <Box
              sx={{
                width: 1,
                height: 24,
                bgcolor: "grey.700",
                borderRadius: 0.5,
                mx: 0.5,
              }}
            />

            {/* Logo image (contain, not cropped) */}
            {userLogoUrl && (
              <Box
                component="img"
                src={userLogoUrl}
                alt="logo"
                onError={(e: any) => {
                  // hide if broken
                  e.currentTarget.style.display = "none";
                }}
                sx={{
                  height: 32, // tweak to 28/36 to taste
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  // Optional: keep a clean “chip” behind the logo for contrast
                  // p: 0.5,
                  // bgcolor: "common.white",
                  // borderRadius: 1,
                }}
              />
            )}

            {/* Logout */}
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
                "&:hover": { bgcolor: "grey.800" },
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

export default CarToolbar;
