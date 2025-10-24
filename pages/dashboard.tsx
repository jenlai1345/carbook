// pages/dashboard.tsx
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
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SellIcon from "@mui/icons-material/Sell";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import SystemIcon from "@mui/icons-material/Monitor";
import SettingsIcon from "@mui/icons-material/Settings";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  useDebounce,
  matchesKeyword,
  fetchCars,
  deleteCarById,
  setCarStatus,
} from "../utils/helpers";
import { useConfirm } from "@/components/ConfirmProvider";

/* -------------------- internal helpers -------------------- */
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

function CarCard({
  car,
  onDelete,
  onMarkSold,
  onMarkActive,
  busy,
}: {
  car: Car;
  onDelete: (car: Car) => void;
  onMarkSold: (car: Car) => void;
  onMarkActive: (car: Car) => void;
  busy?: boolean;
}) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { confirm, setBusy } = useConfirm();

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
        opacity: busy ? 0.6 : 1,
        pointerEvents: busy ? "none" : "auto",
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
            alt={`${car.brand ?? ""} ${car.style ?? ""}`}
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
                {car.brand ?? "—"} {car.style ?? "—"}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusChip status={car.status} />
                <IconButton
                  size="small"
                  aria-label="actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnchorEl(e.currentTarget);
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {/* 車號 */}
            <Typography variant="body2" color="text.secondary" noWrap>
              車號：{(car as any).carNo ?? (car as any).plateNo ?? "—"}
            </Typography>

            {/* 出廠日 / 領牌日 / 顏色 */}
            <Typography variant="body2" color="text.secondary" noWrap>
              {car.factoryYM ?? "—"} / {car.plateYM ?? "—"} / {car.color ?? "—"}
            </Typography>

            {/* 車身碼（VIN） */}
            <Typography variant="body2" color="text.secondary" noWrap>
              車身碼：{car.vin ?? "—"}
            </Typography>

            {/* 進（萬） */}
            {typeof (car as any).buyPriceWan === "number" ? (
              <Typography variant="h6" sx={{ pt: 0.5 }}>
                {(car as any).buyPriceWan.toLocaleString()} 萬
              </Typography>
            ) : (
              <Typography variant="h6" sx={{ pt: 0.5, color: "text.disabled" }}>
                —
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>

      {/* Menu lives outside CardActionArea to avoid accidental navigation */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {car.status === "active" ? (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(null);
              onMarkSold(car);
            }}
          >
            標記為已售出
          </MenuItem>
        ) : car.status === "sold" ? (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              setAnchorEl(null);
              onMarkActive(car);
            }}
          >
            移回在庫
          </MenuItem>
        ) : null}
        <MenuItem
          sx={{ color: "error.main" }}
          onClick={async (e) => {
            e.stopPropagation(); // avoid row click
            setAnchorEl(null); // close the menu first

            const ok = await confirm({
              title: "確認刪除車輛？",
              description: "此動作無法復原",
              confirmText: "刪除",
              cancelText: "保留",
              confirmColor: "error",
            });
            if (!ok) return;

            try {
              setBusy(true); // optional: lock dialog if still open
              await onDelete(car); // your existing delete handler (server + UI)
            } finally {
              setBusy(false);
            }
          }}
        >
          刪除
        </MenuItem>
      </Menu>
    </Card>
  );
}

/* -------------------- page -------------------- */
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

  // action UI state
  const [busyId, setBusyId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    severity: "success" | "error";
    msg: string;
  }>({
    open: false,
    severity: "success",
    msg: "",
  });

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

  // ------- local state helpers -------
  const updateLocalCar = (id: string, patch: Partial<Car>) => {
    setCars((prev) =>
      prev
        ? prev.map((c) => (c.objectId === id ? { ...c, ...patch } : c))
        : prev
    );
  };
  const removeLocalCar = (id: string) => {
    setCars((prev) => (prev ? prev.filter((c) => c.objectId !== id) : prev));
  };

  // ------- actions -------
  const onDelete = async (car: Car) => {
    if (
      !confirm(
        `確定要刪除「${car.brand ?? ""} ${
          car.model ?? ""
        }」嗎？此操作無法復原。`
      )
    )
      return;
    setBusyId(car.objectId);
    const prev = cars;
    removeLocalCar(car.objectId); // optimistic
    try {
      await deleteCarById(car.objectId);
      setSnack({ open: true, severity: "success", msg: "已刪除車輛。" });
    } catch (e: any) {
      setCars(prev || null); // rollback
      setSnack({
        open: true,
        severity: "error",
        msg: `刪除失敗：${e?.message ?? e}`,
      });
    } finally {
      setBusyId(null);
    }
  };

  const onMarkSold = async (car: Car) => {
    setBusyId(car.objectId);
    const oldStatus = car.status;
    updateLocalCar(car.objectId, { status: "sold" as CarStatus }); // optimistic
    try {
      await setCarStatus(car.objectId, "sold");
      setSnack({ open: true, severity: "success", msg: "已標記為已售出。" });
    } catch (e: any) {
      updateLocalCar(car.objectId, { status: oldStatus }); // rollback
      setSnack({
        open: true,
        severity: "error",
        msg: `更新失敗：${e?.message ?? e}`,
      });
    } finally {
      setBusyId(null);
    }
  };

  const onMarkActive = async (car: Car) => {
    setBusyId(car.objectId);
    const oldStatus = car.status;
    updateLocalCar(car.objectId, { status: "active" as CarStatus }); // optimistic
    try {
      await setCarStatus(car.objectId, "active");
      setSnack({ open: true, severity: "success", msg: "已移回在庫。" });
    } catch (e: any) {
      updateLocalCar(car.objectId, { status: oldStatus }); // rollback
      setSnack({
        open: true,
        severity: "error",
        msg: `更新失敗：${e?.message ?? e}`,
      });
    } finally {
      setBusyId(null);
    }
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
                    <CarCard
                      car={car}
                      busy={busyId === car.objectId}
                      onDelete={onDelete}
                      onMarkSold={onMarkSold}
                      onMarkActive={onMarkActive}
                    />
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
                    <CarCard
                      car={car}
                      busy={busyId === car.objectId}
                      onDelete={onDelete}
                      onMarkSold={onMarkSold}
                      onMarkActive={onMarkActive}
                    />
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

      <Snackbar
        open={snack.open}
        autoHideDuration={2800}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
