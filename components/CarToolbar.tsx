// components/HLToolbar.tsx
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import NextLink from "next/link";
import type { UrlObject } from "url";

export interface BreadcrumbItem {
  label: string;
  href?: string; // leave undefined for the current page
  showHomeIcon?: boolean;
}

export interface HLToolbarProps {
  breadcrumbs: BreadcrumbItem[]; // e.g. [{label:'首頁', href:'/dashboard', showHomeIcon:true}, {label:'新增車籍'}]
  logo?: React.ReactNode; // optional: your logo node
  logoHref?: string; // click logo to navigate
  rightSlot?: React.ReactNode; // optional: put buttons on the right
  sx?: SxProps<Theme>; // style override for AppBar
}

const toUrlObject = (href: string): UrlObject => ({ pathname: href });

const CarToolbar: React.FC<HLToolbarProps> = ({
  breadcrumbs,
  logo,
  logoHref = "/",
  rightSlot,
  sx,
}) => {
  const logoUrl: UrlObject = toUrlObject(logoHref);

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
              fontSize: "inherit",
              fontWeight: 600,
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

        {/* Right: actions (optional) */}
        {rightSlot && <Box sx={{ ml: 1 }}>{rightSlot}</Box>}
      </Toolbar>
    </AppBar>
  );
};

export default CarToolbar;
