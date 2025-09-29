// pages/inventory/new.tsx
import * as React from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  TextField,
  Autocomplete,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Parse from "../../lib/parseClient";
import CarToolbar from "@/components/CarToolbar";
import {
  a11yProps,
  ensureBrandByName,
  ensureSeriesByName,
  toDateInput,
  toDateStr,
  useDebounce,
} from "@/utils/helpers";
import OriginalOwnerTab from "@/components/inventory/OriginalOwnerTab";
import NewOwnerTab from "@/components/inventory/NewOwnerTab";
import PaymentTab from "@/components/inventory/PaymentTab";
import ReceiptTab from "@/components/inventory/ReceiptTab";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { zhTW as pickersZhTW } from "@mui/x-date-pickers/locales";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw";
import TabPanel from "@/components/TabPanel";
import { FormValues, formSchema } from "@/schemas/carSchemas";
import BasicTab from "@/components/inventory/BasicTab";
import { DATE_TF_PROPS, SaveButton } from "@/components/mui";

/* ==================== Page ==================== */
export default function InventoryNewPage() {
  const router = useRouter();
  const { carId } = router.query as { carId?: string };
  const [tab, setTab] = React.useState(0);
  const [origOwnerId, setOrigOwnerId] = React.useState<string | null>(null);
  const [newOwnerId, setNewOwnerId] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState<boolean>(!!carId);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      plateNo: "",
      prevPlateNo: "",
      deliverDate: "",
      brandId: "",
      brandName: "",
      seriesId: "",
      seriesName: "",
      style: "",
      buyPriceWan: "",
      sellPriceWan: "",
      factoryYM: "",
      plateYM: "",
      model: "",
      displacementCc: "",
      transmission: "",
      color: "",
      engineNo: "",
      vin: "",
      dealer: "",
      equipment: "",
      remark: "",
      condition: "",
      inboundDate: "",
      promisedDate: "",
      returnDate: "",
      disposition: "",
      origOwnerName: "",
      origOwnerIdNo: "",
      origOwnerBirth: "",
      origOwnerRegAddr: "",
      origOwnerMailAddr: "",
      consignorName: "",
      consignorPhone: "",
      referrerName: "",
      referrerPhone: "",
      purchasedTransferred: "",
      registeredToName: "",
      procurementMethod: "",
      origOwnerNote: "",
      origOwnerPhone: "",
      origContractDate: "",
      origDealPriceWan: "",
      origCommissionWan: "",
      origOwnerRegZip: "",
      origOwnerMailZip: "",
      newOwnerName: "",
      newOwnerPhone: "",
      newContractDate: "",
      newDealPriceWan: "",
      newCommissionWan: "",
      handoverDate: "",
      newOwnerIdNo: "",
      newOwnerBirth: "",
      newOwnerRegAddr: "",
      newOwnerRegZip: "",
      newOwnerMailAddr: "",
      newOwnerMailZip: "",
      buyerAgentName: "",
      buyerAgentPhone: "",
      referrerName2: "",
      referrerPhone2: "",
      salesmanName: "",
      salesCommissionPct: "",
      salesMode: "",
      preferredShop: "",
      newOwnerNote: "",
      /* NEW: arrays */
      payments: [],
      receipts: [],
    },
  });

  // watch brand for series query
  const watchedBrandId = useWatch({ control, name: "brandId" });

  interface Option {
    id: string;
    name: string;
  }
  const [brandOpts, setBrandOpts] = React.useState<Option[]>([]);
  const [brandInput, setBrandInput] = React.useState("");
  const debBrand = useDebounce(brandInput);

  const [seriesOpts, setSeriesOpts] = React.useState<Option[]>([]);
  const [seriesInput, setSeriesInput] = React.useState("");
  const debSeries = useDebounce(seriesInput);

  /* ... (brand & series effects unchanged) ... */

  React.useEffect(() => {
    let active = true;
    (async () => {
      const q = new Parse.Query("Brand");
      if (debBrand) q.matches("name", debBrand, "i");
      q.ascending("name").limit(20);
      const r = await q.find();
      if (active) {
        const arr = r
          .map((x) => ({ id: x.id as string, name: x.get("name") as string }))
          .filter((o) => !!o.id);
        setBrandOpts(arr);
      }
    })();
    return () => {
      active = false;
    };
  }, [debBrand]);

  React.useEffect(() => {
    let active = true;
    (async () => {
      const q = new Parse.Query("Series");
      if (watchedBrandId) {
        const Brand = Parse.Object.extend("Brand");
        q.equalTo("brand", Brand.createWithoutData(watchedBrandId));
      }
      if (debSeries) q.matches("name", debSeries, "i");
      q.ascending("name").limit(20);
      const r = await q.find();
      if (active) {
        const arr = r
          .map((x) => ({ id: x.id || "", name: x.get("name") as string }))
          .filter((o) => o.id !== "");
        setSeriesOpts(arr);
      }
    })();
    return () => {
      active = false;
    };
  }, [debSeries, watchedBrandId]);

  /* --------- prefill if carId --------- */
  React.useEffect(() => {
    if (!carId) return;

    let alive = true;
    (async () => {
      try {
        const Car = Parse.Object.extend("Car");
        const q = new Parse.Query(Car);
        q.include(["brand", "series", "originalOwner", "newOwner"]);
        const o = await q.get(carId);
        if (!alive) return;

        const brandObj = o.get("brand") as Parse.Object | undefined;
        const seriesObj = o.get("series") as Parse.Object | undefined;
        const ownerObj = o.get("originalOwner") as Parse.Object | undefined;
        const buyerObj = o.get("newOwner") as Parse.Object | undefined;

        const brandId = brandObj?.id ?? "";
        const brandName = (brandObj?.get?.("name") as string) ?? "";
        const seriesId = seriesObj?.id ?? "";
        const seriesName = (seriesObj?.get?.("name") as string) ?? "";

        if (brandId && brandName && !brandOpts.find((b) => b.id === brandId)) {
          setBrandOpts((prev) => [{ id: brandId, name: brandName }, ...prev]);
        }
        if (
          seriesId &&
          seriesName &&
          !seriesOpts.find((s) => s.id === seriesId)
        ) {
          setSeriesOpts((prev) => [
            { id: seriesId, name: seriesName },
            ...prev,
          ]);
        }

        const baseValues: FormValues = {
          plateNo: o.get("plateNo") ?? "",
          prevPlateNo: o.get("prevPlateNo") ?? "",
          deliverDate: toDateInput(o.get("deliverDate")),
          brandId,
          brandName,
          seriesId,
          seriesName,
          style: o.get("style") ?? "",
          buyPriceWan: (o.get("buyPriceWan") ?? "").toString(),
          sellPriceWan: (o.get("sellPriceWan") ?? "").toString(),

          factoryYM: o.get("factoryYM") ?? "",
          plateYM: o.get("plateYM") ?? "",
          model: o.get("model") ?? "",
          displacementCc: (o.get("displacementCc") ?? "").toString(),
          transmission: o.get("transmission") ?? "",
          color: o.get("color") ?? "",
          engineNo: o.get("engineNo") ?? "",
          vin: o.get("vin") ?? "",
          dealer: o.get("dealer") ?? "",
          equipment: o.get("equipment") ?? "",
          remark: o.get("remark") ?? "",
          condition: o.get("condition") ?? "",
          inboundDate: toDateInput(o.get("inboundDate")),
          promisedDate: toDateInput(o.get("promisedDate")),
          returnDate: toDateInput(o.get("returnDate")),
          disposition: o.get("disposition") ?? "",

          origOwnerName: "",
          origOwnerPhone: "",
          origOwnerIdNo: "",
          origOwnerBirth: "",
          origContractDate: "",
          origDealPriceWan: "",
          origCommissionWan: "",
          origOwnerRegZip: "",
          origOwnerRegAddr: "",
          origOwnerMailZip: "",
          origOwnerMailAddr: "",
          consignorName: "",
          consignorPhone: "",
          referrerName: "",
          referrerPhone: "",
          purchasedTransferred: "",
          registeredToName: "",
          procurementMethod: "",
          origOwnerNote: "",

          newOwnerName: "",
          newOwnerPhone: "",
          newContractDate: "",
          handoverDate: "",
          newDealPriceWan: "",
          newCommissionWan: "",
          newOwnerIdNo: "",
          newOwnerBirth: "",
          newOwnerRegAddr: "",
          newOwnerRegZip: "",
          newOwnerMailAddr: "",
          newOwnerMailZip: "",
          buyerAgentName: "",
          buyerAgentPhone: "",
          referrerName2: "",
          referrerPhone2: "",
          salesmanName: "",
          salesCommissionPct: "",
          salesMode: "",
          preferredShop: "",
          newOwnerNote: "",

          payments: [],
          receipts: [],
        };

        // original owner prefill
        if (ownerObj) {
          setOrigOwnerId(ownerObj.id ?? "");
          baseValues.origOwnerName = ownerObj.get("name") ?? "";
          baseValues.origOwnerPhone = ownerObj.get("phone") ?? "";
          baseValues.origOwnerIdNo = ownerObj.get("idNo") ?? "";
          baseValues.origOwnerBirth = toDateInput(ownerObj.get("birth"));
          baseValues.origContractDate = toDateInput(
            ownerObj.get("contractDate")
          );
          baseValues.origDealPriceWan = (
            ownerObj.get("dealPriceWan") ?? ""
          ).toString();
          baseValues.origCommissionWan = (
            ownerObj.get("commissionWan") ?? ""
          ).toString();
          baseValues.origOwnerRegZip = ownerObj.get("regZip") ?? "";
          baseValues.origOwnerRegAddr = ownerObj.get("regAddr") ?? "";
          baseValues.origOwnerMailZip = ownerObj.get("mailZip") ?? "";
          baseValues.origOwnerMailAddr = ownerObj.get("mailAddr") ?? "";
          baseValues.consignorName = ownerObj.get("consignorName") ?? "";
          baseValues.consignorPhone = ownerObj.get("consignorPhone") ?? "";
          baseValues.referrerName = ownerObj.get("referrerName") ?? "";
          baseValues.referrerPhone = ownerObj.get("referrerPhone") ?? "";
          baseValues.purchasedTransferred =
            ownerObj.get("purchasedTransferred") ?? "";
          baseValues.registeredToName = ownerObj.get("registeredToName") ?? "";
          baseValues.procurementMethod =
            ownerObj.get("procurementMethod") ?? "";
          baseValues.origOwnerNote = ownerObj.get("note") ?? "";
        } else {
          setOrigOwnerId(null);
        }

        // new owner prefill
        if (buyerObj) {
          setNewOwnerId(buyerObj.id ?? "");
          baseValues.newOwnerName = buyerObj.get("name") ?? "";
          baseValues.newOwnerPhone = buyerObj.get("phone") ?? "";
          baseValues.newContractDate = toDateInput(
            buyerObj.get("contractDate")
          );
          baseValues.newDealPriceWan = (
            buyerObj.get("dealPriceWan") ?? ""
          ).toString();
          baseValues.newCommissionWan = (
            buyerObj.get("commissionWan") ?? ""
          ).toString();
          baseValues.handoverDate = toDateInput(buyerObj.get("handoverDate"));
          baseValues.newOwnerIdNo = buyerObj.get("idNo") ?? "";
          baseValues.newOwnerBirth = toDateInput(buyerObj.get("birth"));
          baseValues.newOwnerRegZip = buyerObj.get("regZip") ?? "";
          baseValues.newOwnerRegAddr = buyerObj.get("regAddr") ?? "";
          baseValues.newOwnerMailZip = buyerObj.get("mailZip") ?? "";
          baseValues.newOwnerMailAddr = buyerObj.get("mailAddr") ?? "";
          baseValues.buyerAgentName = buyerObj.get("buyerAgentName") ?? "";
          baseValues.buyerAgentPhone = buyerObj.get("buyerAgentPhone") ?? "";
          baseValues.referrerName2 = buyerObj.get("referrerName2") ?? "";
          baseValues.referrerPhone2 = buyerObj.get("referrerPhone2") ?? "";
          baseValues.salesmanName = buyerObj.get("salesmanName") ?? "";
          baseValues.salesCommissionPct = (
            buyerObj.get("salesCommissionPct") ?? ""
          ).toString();
          baseValues.salesMode = buyerObj.get("salesMode") ?? "";
          baseValues.preferredShop = buyerObj.get("preferredShop") ?? "";
          baseValues.newOwnerNote = buyerObj.get("note") ?? "";
        } else {
          setNewOwnerId(null);
        }

        /* NEW: payments / receipts prefill */
        const paymentsRaw = (o.get("payments") as any[]) || [];
        baseValues.payments = paymentsRaw.map((p) => ({
          date: toDateStr(p?.date),
          amount: p?.amount ?? "",
          cashOrCheck: p?.cashOrCheck === "票" ? "票" : "現",
          interestStartDate: toDateStr(p?.interestStartDate),
          note: p?.note ?? "",
        }));

        const receiptsRaw = (o.get("receipts") as any[]) || [];
        baseValues.receipts = receiptsRaw.map((r) => ({
          date: toDateStr(r?.date),
          amount: r?.amount ?? "",
          cashOrCheck: r?.cashOrCheck === "票" ? "票" : "現",
          exchangeDate: toDateStr(r?.exchangeDate),
          note: r?.note ?? "",
        }));

        reset(baseValues);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carId]);

  /* --------- submit (create or update) --------- */
  const onSubmit = async (v: FormValues) => {
    // Ensure Brand/Series exist (unchanged)
    let brandId = v.brandId;
    if (!brandId && v.brandName) {
      brandId = await ensureBrandByName(v.brandName);
      setValue("brandId", brandId || "");
    }
    let seriesId = v.seriesId;
    if (!seriesId && v.seriesName && brandId) {
      seriesId = await ensureSeriesByName(v.seriesName, brandId);
      setValue("seriesId", seriesId || "");
    }

    const Car = Parse.Object.extend("Car");
    const car = carId ? Car.createWithoutData(carId) : new Car();

    // pointers
    if (brandId) {
      const Brand = Parse.Object.extend("Brand");
      car.set("brand", Brand.createWithoutData(brandId));
    } else {
      car.unset("brand");
    }
    if (seriesId) {
      const Series = Parse.Object.extend("Series");
      car.set("series", Series.createWithoutData(seriesId));
    } else {
      car.unset("series");
    }

    // top fixed fields
    car.set("plateNo", v.plateNo);
    car.set("prevPlateNo", v.prevPlateNo || null);
    car.set("deliverDate", v.deliverDate ? new Date(v.deliverDate) : null);
    car.set("style", v.style || null);
    car.set("buyPriceWan", v.buyPriceWan ? Number(v.buyPriceWan) : null);
    car.set("sellPriceWan", v.sellPriceWan ? Number(v.sellPriceWan) : null);

    // 基本 tab fields
    car.set("factoryYM", v.factoryYM || null);
    car.set("plateYM", v.plateYM || null);
    car.set("model", v.model || null);
    car.set(
      "displacementCc",
      v.displacementCc ? Number(v.displacementCc) : null
    );
    car.set("transmission", v.transmission || null);
    car.set("color", v.color || null);
    car.set("engineNo", v.engineNo || null);
    car.set("vin", v.vin || null);
    car.set("dealer", v.dealer || null);
    car.set("equipment", v.equipment || null);
    car.set("remark", v.remark || null);
    car.set("condition", v.condition || null);
    car.set("inboundDate", v.inboundDate ? new Date(v.inboundDate) : null);
    car.set("promisedDate", v.promisedDate ? new Date(v.promisedDate) : null);
    car.set("returnDate", v.returnDate ? new Date(v.returnDate) : null);
    car.set("disposition", v.disposition || null);

    // optional: scope by user
    const u = Parse.User.current();
    if (u) car.set("user", u);

    // default status on create
    if (!carId) car.set("status", "active");

    // Tabs 3 / 5: save Owner pointers (unchanged)
    if (tab === ORIGINAL_OWNER_TAB_INDEX) {
      const Owner = Parse.Object.extend("Owner");
      const owner = origOwnerId
        ? Owner.createWithoutData(origOwnerId)
        : new Owner();

      owner.set("name", v.origOwnerName || null);
      owner.set("idNo", v.origOwnerIdNo || null);
      owner.set("birth", v.origOwnerBirth ? new Date(v.origOwnerBirth) : null);
      owner.set("regAddr", v.origOwnerRegAddr || null);
      owner.set("mailAddr", v.origOwnerMailAddr || null);
      owner.set("consignorName", v.consignorName || null);
      owner.set("consignorPhone", v.consignorPhone || null);
      owner.set("referrerName", v.referrerName || null);
      owner.set("referrerPhone", v.referrerPhone || null);
      owner.set("purchasedTransferred", v.purchasedTransferred || null);
      owner.set("registeredToName", v.registeredToName || null);
      owner.set("procurementMethod", v.procurementMethod || null);
      owner.set("note", v.origOwnerNote || null);
      owner.set(
        "contractDate",
        v.origContractDate ? new Date(v.origContractDate) : null
      );
      owner.set(
        "dealPriceWan",
        v.origDealPriceWan ? Number(v.origDealPriceWan) : null
      );
      owner.set(
        "commissionWan",
        v.origCommissionWan ? Number(v.origCommissionWan) : null
      );
      owner.set("phone", v.origOwnerPhone || null);
      if (u) owner.set("user", u);

      await owner.save();
      car.set("originalOwner", owner);
      await car.save();

      if (!origOwnerId) setOrigOwnerId(owner.id);
      alert(origOwnerId ? "✅ 原車主資料已更新" : "✅ 原車主資料已建立");
      router.push("/dashboard");
      return;
    } else if (tab === NEW_OWNER_TAB_INDEX) {
      const Owner = Parse.Object.extend("Owner");
      const buyer = newOwnerId
        ? Owner.createWithoutData(newOwnerId)
        : new Owner();

      buyer.set("name", v.newOwnerName || null);
      buyer.set("phone", v.newOwnerPhone || null);
      buyer.set(
        "contractDate",
        v.newContractDate ? new Date(v.newContractDate) : null
      );
      buyer.set(
        "dealPriceWan",
        v.newDealPriceWan ? Number(v.newDealPriceWan) : null
      );
      buyer.set(
        "commissionWan",
        v.newCommissionWan ? Number(v.newCommissionWan) : null
      );
      buyer.set(
        "handoverDate",
        v.handoverDate ? new Date(v.handoverDate) : null
      );
      buyer.set("idNo", v.newOwnerIdNo || null);
      buyer.set("birth", v.newOwnerBirth ? new Date(v.newOwnerBirth) : null);
      buyer.set("regAddr", v.newOwnerRegAddr || null);
      buyer.set("regZip", v.newOwnerRegZip || null);
      buyer.set("mailAddr", v.newOwnerMailAddr || null);
      buyer.set("mailZip", v.newOwnerMailZip || null);
      buyer.set("buyerAgentName", v.buyerAgentName || null);
      buyer.set("buyerAgentPhone", v.buyerAgentPhone || null);
      buyer.set("referrerName2", v.referrerName2 || null);
      buyer.set("referrerPhone2", v.referrerPhone2 || null);
      buyer.set("salesmanName", v.salesmanName || null);
      buyer.set(
        "salesCommissionPct",
        v.salesCommissionPct ? Number(v.salesCommissionPct) : null
      );
      buyer.set("salesMode", v.salesMode || null);
      buyer.set("preferredShop", v.preferredShop || null);
      buyer.set("note", v.newOwnerNote || null);
      if (u) buyer.set("user", u);

      await buyer.save();
      car.set("newOwner", buyer);
      await car.save();

      if (!newOwnerId) setNewOwnerId(buyer.id);
      alert(newOwnerId ? "✅ 新車主資料已更新" : "✅ 新車主資料已建立");
      router.push("/dashboard");
      return;
    }

    /* NEW: save payments / receipts with main car save */
    const payments = (v.payments || []).map((p) => ({
      date: p.date || null,
      amount: p.amount === "" || p.amount == null ? 0 : Number(p.amount),
      cashOrCheck: p.cashOrCheck,
      interestStartDate: p.interestStartDate || null,
      note: p.note || null,
    }));
    const receipts = (v.receipts || []).map((r) => ({
      date: r.date || null,
      amount: r.amount === "" || r.amount == null ? 0 : Number(r.amount),
      cashOrCheck: r.cashOrCheck,
      exchangeDate: r.exchangeDate || null,
      note: r.note || null,
    }));
    car.set("payments", payments);
    car.set("receipts", receipts);

    await car.save();
    alert(carId ? "✅ 已更新車籍資料" : "✅ 已新建立車籍資料");
    router.push("/dashboard");
  };

  // UI helpers for Autocomplete values (unchanged)
  const brandValue = React.useMemo(() => {
    const id = getValues("brandId");
    const name = getValues("brandName");
    return id ? brandOpts.find((o) => o.id === id) ?? null : name || null;
  }, [brandOpts, getValues("brandId"), getValues("brandName")]);

  const seriesValue = React.useMemo(() => {
    const id = getValues("seriesId");
    const name = getValues("seriesName");
    return id ? seriesOpts.find((o) => o.id === id) ?? null : name || null;
  }, [seriesOpts, getValues("seriesId"), getValues("seriesName")]);

  /* -------------------- render -------------------- */
  return (
    <LocalizationProvider
      dateAdapter={AdapterDayjs}
      adapterLocale="zh-tw"
      localeText={
        pickersZhTW.components.MuiLocalizationProvider.defaultProps.localeText
      }
    >
      <CarToolbar
        breadcrumbs={[
          { label: "首頁", href: "/dashboard", showHomeIcon: true },
          { label: "車籍資料" },
        ]}
      />

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* ... 上方固定欄位區塊（原樣） ... */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 2,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="plateNo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="車號"
                    required
                    fullWidth
                    error={!!errors.plateNo}
                    helperText={errors.plateNo?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="prevPlateNo"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="原車號" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="deliverDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="交車日（年/月/日）"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(v) =>
                      field.onChange(v ? v.format("YYYY-MM-DD") : "")
                    }
                    slotProps={{ textField: DATE_TF_PROPS }}
                  />
                )}
              />
            </Grid>

            {/* 車系 */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="seriesName"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    options={seriesOpts}
                    getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
                    value={seriesValue as any}
                    onInputChange={(_, v) => {
                      field.onChange(v);
                      setSeriesInput(v);
                      setValue("seriesId", "");
                    }}
                    onChange={(_, v) => {
                      if (typeof v === "string") {
                        setValue("seriesName", v);
                        setValue("seriesId", "");
                      } else if (v) {
                        setValue("seriesName", v.name);
                        setValue("seriesId", v.id);
                      } else {
                        setValue("seriesName", "");
                        setValue("seriesId", "");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="車系" fullWidth />
                    )}
                  />
                )}
              />
            </Grid>

            {/* --- 2nd row --- */}
            {/* 廠牌 */}
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="brandName"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    options={brandOpts}
                    getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
                    value={brandValue as any}
                    onInputChange={(_, v) => {
                      field.onChange(v);
                      setBrandInput(v);
                      setValue("brandId", "");
                      // reset series when brand changes
                      setValue("seriesId", "");
                      setValue("seriesName", "");
                    }}
                    onChange={(_, v) => {
                      if (typeof v === "string") {
                        setValue("brandName", v);
                        setValue("brandId", "");
                        setValue("seriesId", "");
                        setValue("seriesName", "");
                      } else if (v) {
                        setValue("brandName", v.name);
                        setValue("brandId", v.id);
                        setValue("seriesId", "");
                        setValue("seriesName", "");
                      } else {
                        setValue("brandName", "");
                        setValue("brandId", "");
                        setValue("seriesId", "");
                        setValue("seriesName", "");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="廠牌"
                        required
                        error={!!errors.brandName}
                        helperText={errors.brandName?.message}
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="style"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="型式" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="buyPriceWan"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="進（萬）"
                    inputProps={{ inputMode: "decimal" }}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Controller
                name="sellPriceWan"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="賣（萬）"
                    inputProps={{ inputMode: "decimal" }}
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs */}
        <Paper
          variant="outlined"
          sx={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
          }}
        >
          <Box component="form" id="inv-form" onSubmit={handleSubmit(onSubmit)}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="基本" {...a11yProps(0)} />
              <Tab label="證件" {...a11yProps(1)} />
              <Tab label="入車" {...a11yProps(2)} />
              <Tab label="原車主" {...a11yProps(3)} />
              <Tab label="保險/貸款" {...a11yProps(4)} />
              <Tab label="新車主" {...a11yProps(5)} />
              <Tab label="付款" {...a11yProps(6)} />
              <Tab label="收款" {...a11yProps(7)} />
              <Tab label="費用" {...a11yProps(8)} />
            </Tabs>

            <TabPanel value={tab} index={0}>
              <BasicTab control={control} errors={errors} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <div />
            </TabPanel>
            <TabPanel value={tab} index={2}>
              <div />
            </TabPanel>

            <TabPanel value={tab} index={3}>
              <OriginalOwnerTab control={control} errors={errors} />
            </TabPanel>

            <TabPanel value={tab} index={4}>
              <div />
            </TabPanel>

            <TabPanel value={tab} index={5}>
              <NewOwnerTab control={control} errors={errors} />
            </TabPanel>

            <TabPanel value={tab} index={6}>
              <PaymentTab control={control} errors={errors} />
            </TabPanel>

            <TabPanel value={tab} index={7}>
              <ReceiptTab control={control} errors={errors} />
            </TabPanel>

            <TabPanel value={tab} index={8}>
              <div />
            </TabPanel>

            {/* Sticky footer Save */}
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                p: 2,
                display: "flex",
                justifyContent: "flex-end",
                bgcolor: "background.paper",
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                zIndex: 1,
              }}
            >
              <SaveButton
                type="submit"
                variant="contained"
                disabled={isSubmitting || loading}
              >
                儲存
              </SaveButton>
            </Box>
          </Box>
        </Paper>
      </Container>

      {loading && (
        <Stack
          alignItems="center"
          sx={{ position: "fixed", inset: 0, pointerEvents: "none" }}
        >
          <CircularProgress />
        </Stack>
      )}
    </LocalizationProvider>
  );
}
