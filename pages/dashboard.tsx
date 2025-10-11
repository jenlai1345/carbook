import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import CarToolbar from "../components/CarToolbar";
import type { Car, CarStatus } from "../models";

import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Stack,
  Badge,
  CircularProgress,
  CardActionArea,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SellIcon from "@mui/icons-material/Sell";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import SystemIcon from "@mui/icons-material/Monitor";
import SettingsIcon from "@mui/icons-material/Settings";

import { useDebounce, matchesKeyword, fetchCars } from "../utils/helpers";

function a11yProps(index: number) {
  return { id: `dash-tab-${index}`, "aria-controls": `dash-tabpanel-${index}` };
}

function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dash-tabpanel-${index}`}
      aria-labelledby={`dash-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

function StatusChip({ status }: { status: CarStatus }) {
  const map: Record<
    CarStatus,
    { label: string; color: "default" | "success" | "warning" | "error" }
  > = {
    active: { label: "在庫", color: "success" },
    sold: { label: "已售", color: "default" },
    transferred: { label: "已調出", color: "warning" },
  };
  const s = map[status];
  return (
    <Chip
      label={s.label}
      color={s.color}
      size="small"
      variant={status === "sold" ? "outlined" : "filled"}
    />
  );
}

function CarCard({ car }: { car: Car }) {
  const router = useRouter();

  const goEdit = () => {
    router.push({ pathname: "/inventory/new", query: { carId: car.objectId } });
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
      }}
    >
      <CardActionArea
        onClick={goEdit}
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}
      >
        {car.coverUrl && (
          <CardMedia
            component="img"
            image={car.coverUrl}
            alt={`${car.brand ?? ""} ${car.seriesCategory ?? car.model ?? ""}`}
            sx={{ height: 160, objectFit: "cover" }}
          />
        )}
        <CardContent sx={{ flexGrow: 1, width: "100%" }}>
          <Stack spacing={0.5}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1" fontWeight={700} noWrap>
                {car.brand ?? "—"} {car.model ?? ""}
              </Typography>
              <StatusChip status={car.status} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {car.factoryYM ?? car.plateYM ?? "—"} · {car.color ?? "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              VIN: {car.vin ?? "—"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              引擎號: {car.engineNo ?? "—"}
            </Typography>
            {car.location && (
              <Typography variant="body2" color="text.secondary" noWrap>
                門市：{car.location}
              </Typography>
            )}
            {typeof car.sellPriceWan === "number" && (
              <Typography variant="h6" sx={{ pt: 0.5 }}>
                {car.sellPriceWan.toLocaleString()} 萬
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

function NavTile({
  href,
  title,
  iconName,
}: {
  href: string;
  title: string;
  iconName:
    | "DirectionsCar"
    | "AccountBalanceWallet"
    | "Sell"
    | "TrendingUp"
    | "People"
    | "System"
    | "Settings";
}) {
  const Icon = {
    DirectionsCar: DirectionsCarIcon,
    AccountBalanceWallet: AccountBalanceWalletIcon,
    Sell: SellIcon,
    TrendingUp: TrendingUpIcon,
    People: PeopleIcon,
    System: SystemIcon,
    Settings: SettingsIcon,
  }[iconName];
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardActionArea
        href={href}
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Icon sx={{ fontSize: 40 }} />
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
      </CardActionArea>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const qParam = (router.query.q as string) ?? "";
  const tabParam = (router.query.tab as string) ?? "active";

  const [query, setQuery] = useState(qParam);
  const debouncedQuery = useDebounce(query, 250);

  const [tabIndex, setTabIndex] = useState(tabParam === "archive" ? 1 : 0);
  useEffect(() => {
    setTabIndex(tabParam === "archive" ? 1 : 0);
    setQuery(qParam);
  }, [qParam, tabParam]);

  const [cars, setCars] = useState<Car[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchCars();
        if (alive) setCars(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = cars ?? [];
    return list.filter((c) => matchesKeyword(c, debouncedQuery));
  }, [cars, debouncedQuery]);

  const activeCars = useMemo(
    () => filtered.filter((c) => c.status === "active"),
    [filtered]
  );
  const archivedCars = useMemo(
    () => filtered.filter((c) => c.status !== "active"),
    [filtered]
  );

  const breadcrumbs = [
    { label: "首頁", href: "/dashboard", showHomeIcon: true },
  ];

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    const tab = newValue === 0 ? "active" : "archive";
    router.replace(
      {
        pathname: "/dashboard",
        query: { ...router.query, tab, q: debouncedQuery || undefined },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    const tab = tabIndex === 0 ? "active" : "archive";
    router.replace(
      {
        pathname: "/dashboard",
        query: { ...router.query, tab, q: v || undefined },
      },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#fafafa" }}>
      <CarToolbar breadcrumbs={breadcrumbs} />

      <Box sx={{ maxWidth: 1280, mx: "auto", px: 2, py: 2 }}>
        {/* Big navigation tiles */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <NavTile
              href="/inventory/new"
              title="新增車輛"
              iconName="DirectionsCar"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NavTile
              href="/finance"
              title="收支"
              iconName="AccountBalanceWallet"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NavTile href="/sales" title="銷售" iconName="Sell" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NavTile href="/profit" title="成本利潤" iconName="TrendingUp" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NavTile href="/customers" title="客戶管理" iconName="People" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NavTile href="/system" title="系統作業" iconName="System" />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <NavTile href="/settings" title="設定" iconName="Settings" />
          </Grid>
        </Grid>

        {/* Tabs first, then Search */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2, flexWrap: "wrap" }}
        >
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            aria-label="cars-tabs"
            variant="scrollable"
            allowScrollButtonsMobile
          >
            <Tab
              label={
                <Stack direction="row" spacing={2} alignItems="center">
                  <span>在庫</span>
                  <Badge
                    color="primary"
                    badgeContent={activeCars.length}
                    max={999}
                    showZero
                  />
                </Stack>
              }
              {...a11yProps(0)}
            />
            <Tab
              label={
                <Stack direction="row" spacing={2} alignItems="center">
                  <span>已售/已調出</span>
                  <Badge
                    color="secondary"
                    badgeContent={archivedCars.length}
                    max={999}
                    showZero
                  />
                </Stack>
              }
              {...a11yProps(1)}
            />
          </Tabs>

          <TextField
            value={query}
            onChange={handleSearchChange}
            placeholder="搜尋車輛（車號、品牌、車系、型號、引擎號、VIN、顏色、備註…）"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            size="small"
            sx={{ width: { xs: "100%", sm: 600 } }}
          />
        </Stack>

        {loading && (
          <Stack direction="row" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
          </Stack>
        )}

        {!loading && (
          <>
            <TabPanel value={tabIndex} index={0}>
              <Grid container spacing={2}>
                {activeCars.map((car) => (
                  <Grid key={car.objectId} size={{ xs: 12, md: 3 }}>
                    <CarCard car={car} />
                  </Grid>
                ))}
                {activeCars.length === 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        py: 6,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      沒有符合條件的在庫車。
                    </Box>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabIndex} index={1}>
              <Grid container spacing={2}>
                {archivedCars.map((car) => (
                  <Grid key={car.objectId} size={{ xs: 12, md: 3 }}>
                    <CarCard car={car} />
                  </Grid>
                ))}
                {archivedCars.length === 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Box
                      sx={{
                        py: 6,
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      沒有符合條件的歷史車輛。
                    </Box>
                  </Grid>
                )}
              </Grid>
            </TabPanel>
          </>
        )}
      </Box>
    </Box>
  );
}
