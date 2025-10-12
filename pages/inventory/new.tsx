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
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Parse from "../../lib/parseClient";
import CarToolbar from "@/components/CarToolbar";
import {
  a11yProps,
  ensureBrandByName,
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
import {
  BASIC_TAB_INDEX,
  DOCUMENT_TAB_INDEX,
  INBOUND_TAB_INDEX,
  ORIGINAL_OWNER_TAB_INDEX,
  NEW_OWNER_TAB_INDEX,
  PAYMENT_TAB_INDEX,
  RECEIPT_TAB_INDEX,
  FEE_TAB_INDEX,
  INSURANCE_TAB_INDEX,
  SERIES_CATEGORIES,
} from "@/utils/constants";
import {
  CarSnackbarProvider,
  useCarSnackbar,
} from "@/components/CarSnackbarProvider";
import FeeTab from "@/components/FeeTab";
import DocumentTab from "@/components/inventory/DocumentTab";
import InBoundTab from "@/components/inventory/InboundTab";
import InsuranceTab from "@/components/inventory/InsuranceTab";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function InventoryNewPage() {
  return (
    <CarSnackbarProvider>
      <InventoryNewContent />
    </CarSnackbarProvider>
  );
}
/* ==================== Page ==================== */
function InventoryNewContent() {
  const { showMessage } = useCarSnackbar();
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
  } = useForm<FormValues, any, any>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      plateNo: "",
      prevPlateNo: "",
      deliverDate: "",
      brandId: "",
      brandName: "",
      seriesCategory: "",
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

      payments: [],
      receipts: [],
      fees: [],

      document: {
        audioCode: "",
        spareKey: "",
        certOk: "", // "無" | "有" | "缺"
        license: "", // "無" | "有"
        application: "", // "無" | "有" | "缺(米)"
        transferPaper: "", // "無" | "有"
        payoffProof: "", // "無" | "有"
        inspectDate: "", // "YYYY-MM-DD"
        taxCert: "", // "無" | "有" | "影本"
        factoryCert: "", // "無" | "有" | "缺(△)"
        copyFlag: "", // "無" | "有"
        plate: "", // "無" | "有" | "缺(Φ)"
        taxStatus: "", // "已繳" | "缺"
        remark: "",
      },

      inbound: {
        orderNo: "",
        keyNo: "",
        purchaseMode: "",
        purchaser: "",
        listPriceWan: "",
        note: "",
        noteAmountWan: "",
        purchaseBonusPct: "",
        newCarPriceWan: "",
        changeDate: "",
        changeMethod: "",
        originalMileageKm: "",
        adjustedMileageKm: "", // was arrivalMileageKm
      },

      insurance: {
        insuranceType: "",
        expireDate: "",
        insuranceCompany: "",
        loanCompany: "",
        contactName: "",
        contactPhone: "",
        amount: "",
        installments: "",
        baseAmount: "",
        promissoryNote: "",
        personalName: "",
        collection: "",
      },
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

  React.useEffect(() => {
    let active = true;
    (async () => {
      const q = new Parse.Query("Brand");
      q.equalTo("owner", Parse.User.current());
      if (debBrand) q.matches("name", debBrand, "i");
      q.ascending("name");
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

  // React.useEffect(() => {
  //   let active = true;
  //   (async () => {
  //     const q = new Parse.Query("Series");
  //     if (watchedBrandId) {
  //       const Brand = Parse.Object.extend("Brand");
  //       q.equalTo("brand", Brand.createWithoutData(watchedBrandId));
  //     }
  //     if (debSeries) q.matches("name", debSeries, "i");
  //     q.ascending("name").limit(20);
  //     const r = await q.find();
  //     if (active) {
  //       const arr = r
  //         .map((x) => ({ id: x.id || "", name: x.get("name") as string }))
  //         .filter((o) => o.id !== "");
  //       setSeriesOpts(arr);
  //     }
  //   })();
  //   return () => {
  //     active = false;
  //   };
  // }, [debSeries, watchedBrandId]);

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
        const ownerObj = o.get("originalOwner") as Parse.Object | undefined;
        const buyerObj = o.get("newOwner") as Parse.Object | undefined;

        const brandId = brandObj?.id ?? "";
        const brandName = (brandObj?.get?.("name") as string) ?? "";

        if (brandId && brandName && !brandOpts.find((b) => b.id === brandId)) {
          setBrandOpts((prev) => [{ id: brandId, name: brandName }, ...prev]);
        }

        // ✅ Declare baseValues as Partial<FormValues> so you can add nested keys safely
        const baseValues: Partial<FormValues> = {
          plateNo: o.get("plateNo") ?? "",
          prevPlateNo: o.get("prevPlateNo") ?? "",
          deliverDate: toDateInput(o.get("deliverDate")),
          brandId,
          brandName,
          seriesCategory: o.get("seriesCategory") ?? "",
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
          fees: [],

          // ✅ Nest document under its own key (matches Zod & defaultValues)
          document: {
            audioCode: "",
            spareKey: "",
            certOk: "",
            license: "",
            application: "",
            transferPaper: "",
            payoffProof: "",
            inspectDate: "",
            taxCert: "",
            factoryCert: "",
            copyFlag: "",
            plate: "",
            taxStatus: "",
            remark: "",
          },
        };

        // ✅ Prefill document if available
        const doc = (o.get("document") as any) || {};
        baseValues.document = {
          audioCode: doc?.audioCode ?? "",
          spareKey: doc?.spareKey ?? "",
          certOk: doc?.certOk ?? "",
          license: doc?.license ?? "",
          application: doc?.application ?? "",
          transferPaper: doc?.transferPaper ?? "",
          payoffProof: doc?.payoffProof ?? "",
          inspectDate: toDateStr(doc?.inspectDate),
          taxCert: doc?.taxCert ?? "",
          factoryCert: doc?.factoryCert ?? "",
          copyFlag: doc?.copyFlag ?? "",
          plate: doc?.plate ?? "",
          taxStatus: doc?.taxStatus ?? "",
          remark: doc?.remark ?? "",
        };

        const inbound = (o.get("inbound") as any) || {};
        (baseValues as any).inbound = {
          orderNo: inbound?.orderNo ?? "",
          keyNo: inbound?.keyNo ?? inbound?.wheelNo ?? "", // support old field
          purchaseMode: inbound?.purchaseMode ?? "",
          purchaser: inbound?.purchaser ?? "",
          listPriceWan: (inbound?.listPriceWan ?? "").toString(),
          note: inbound?.note ?? "",
          noteAmountWan: (inbound?.noteAmountWan ?? "").toString(),
          purchaseBonusPct: (inbound?.purchaseBonusPct ?? "").toString(),
          newCarPriceWan: (inbound?.newCarPriceWan ?? "").toString(),
          changeDate: toDateStr(inbound?.changeDate),
          changeMethod: inbound?.changeMethod ?? "",
          originalMileageKm: (inbound?.originalMileageKm ?? "").toString(),
          adjustedMileageKm: (
            inbound?.adjustedMileageKm ??
            inbound?.arrivalMileageKm ??
            ""
          ).toString(),
        };

        const ins = (o.get("insurance") as any) || {};
        (baseValues as any).insurance = {
          insuranceType: ins?.insuranceType ?? "",
          expireDate: toDateStr(ins?.expireDate),
          insuranceCompany: ins?.insuranceCompany ?? "",
          loanCompany: ins?.loanCompany ?? "",
          contactName: ins?.contactName ?? "",
          contactPhone: ins?.contactPhone ?? "",
          amount: (ins?.amount ?? "").toString(),
          installments: (ins?.installments ?? "").toString(),
          baseAmount: (ins?.baseAmount ?? "").toString(),
          promissoryNote: ins?.promissoryNote ?? "",
          personalName: ins?.personalName ?? "",
          collection: ins?.collection ?? "",
        };

        // ✅ Finally reset form with typed defaults
        reset(baseValues as FormValues);

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

        const feesRaw = (o.get("fees") as any[]) || [];
        baseValues.fees = feesRaw.map((f) => ({
          date: toDateStr(f?.date),
          item: f?.item ?? "",
          vendor: f?.vendor ?? "",
          amount: f?.amount ?? "",
          cashOrCheck: f?.cashOrCheck === "票" ? "票" : "現",
          note: f?.note ?? "",
          handler: f?.handler ?? "",
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
    // Ensure Brand exist (unchanged)
    let brandId = v.brandId;
    if (!brandId && v.brandName) {
      brandId = await ensureBrandByName(v.brandName);
      setValue("brandId", brandId || "");
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

    // top fixed fields
    car.set("plateNo", v.plateNo);
    car.set("prevPlateNo", v.prevPlateNo || null);
    car.set("deliverDate", v.deliverDate ? new Date(v.deliverDate) : null);
    car.set("style", v.style || null);
    car.set("buyPriceWan", v.buyPriceWan ? Number(v.buyPriceWan) : null);
    car.set("sellPriceWan", v.sellPriceWan ? Number(v.sellPriceWan) : null);
    car.set("seriesCategory", v.seriesCategory || null);

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
      showMessage(origOwnerId ? "✅ 原車主資料已更新" : "✅ 原車主資料已建立");
      router.push("/dashboard");
      return;
    } else if (tab === DOCUMENT_TAB_INDEX) {
      const d = v.document || {};

      // Normalize empty strings -> null (optional but keeps DB clean)
      const norm = (x: any) => (x === "" || x == null ? null : x);

      const docOut = {
        audioCode: norm(d.audioCode),
        spareKey: norm(d.spareKey),
        certOk: norm(d.certOk),
        license: norm(d.license),
        application: norm(d.application),
        transferPaper: norm(d.transferPaper),
        payoffProof: norm(d.payoffProof),
        inspectDate: norm(d.inspectDate), // keep as 'YYYY-MM-DD' like other tabs
        taxCert: norm(d.taxCert),
        factoryCert: norm(d.factoryCert),
        copyFlag: norm(d.copyFlag),
        plate: norm(d.plate),
        taxStatus: norm(d.taxStatus),
        remark: norm(d.remark),
      };

      car.set("document", docOut);
      await car.save();
      showMessage("✅ 已更新證件資料");
      return;
    } else if (tab === INBOUND_TAB_INDEX) {
      const d = v.inbound || {};
      const n = (x: any) => (x === "" || x == null ? null : x);

      const inboundOut = {
        orderNo: n(d.orderNo),
        keyNo: n(d.keyNo),
        purchaseMode: n(d.purchaseMode),
        purchaser: n(d.purchaser),
        listPriceWan: d.listPriceWan ? Number(d.listPriceWan) : null,
        note: n(d.note),
        noteAmountWan: d.noteAmountWan ? Number(d.noteAmountWan) : null,
        purchaseBonusPct: d.purchaseBonusPct
          ? Number(d.purchaseBonusPct)
          : null,
        newCarPriceWan: d.newCarPriceWan ? Number(d.newCarPriceWan) : null,
        changeDate: n(d.changeDate),
        changeMethod: n(d.changeMethod),
        originalMileageKm: d.originalMileageKm
          ? Number(d.originalMileageKm)
          : null,
        adjustedMileageKm: d.adjustedMileageKm
          ? Number(d.adjustedMileageKm)
          : null,
      };

      car.set("inbound", inboundOut);
      await car.save();
      showMessage("✅ 已更新入車資料");
      return;
    } else if (tab === INSURANCE_TAB_INDEX) {
      const d = v.insurance || {};
      const n = (x: any) => (x === "" || x == null ? null : x);

      const insuranceOut = {
        insuranceType: n(d.insuranceType),
        expireDate: n(d.expireDate), // keep as 'YYYY-MM-DD' string
        insuranceCompany: n(d.insuranceCompany),
        loanCompany: n(d.loanCompany),
        contactName: n(d.contactName),
        contactPhone: n(d.contactPhone),
        amount: d.amount ? Number(d.amount) : null,
        installments: d.installments ? Number(d.installments) : null,
        baseAmount: d.baseAmount ? Number(d.baseAmount) : null,
        promissoryNote: n(d.promissoryNote), // "無" | "有"
        personalName: n(d.personalName),
        collection: n(d.collection),
      };

      car.set("insurance", insuranceOut);
      await car.save();
      showMessage("✅ 已更新保險/貸款資料");
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
      showMessage(newOwnerId ? "✅ 新車主資料已更新" : "✅ 新車主資料已建立");
      router.push("/dashboard");
      return;
    } else if (tab === PAYMENT_TAB_INDEX) {
      const payments = (v.payments || []).map((p) => ({
        date: p.date || null,
        amount: p.amount === "" || p.amount == null ? 0 : Number(p.amount),
        cashOrCheck: p.cashOrCheck,
        interestStartDate: p.interestStartDate || null,
        note: p.note || null,
      }));
      car.set("payments", payments);

      await car.save();
      showMessage("✅ 已更新付款資料");
      return;
    } else if (tab === RECEIPT_TAB_INDEX) {
      const receipts = (v.receipts || []).map((r) => ({
        date: r.date || null,
        amount: r.amount === "" || r.amount == null ? 0 : Number(r.amount),
        cashOrCheck: r.cashOrCheck,
        exchangeDate: r.exchangeDate || null,
        note: r.note || null,
      }));

      car.set("receipts", receipts);

      await car.save();
      showMessage("✅ 已更新收款資料");
      return;
    } else if (tab === FEE_TAB_INDEX) {
      // Map FeeTab rows to a compact, Parse-friendly shape
      const fees = (v.fees || []).map((f) => ({
        date: f.date || null, // keep as string or null (same as payments/receipts)
        item: f.item || null,
        vendor: f.vendor || null,
        amount: f.amount === "" || f.amount == null ? 0 : Number(f.amount),
        cashOrCheck: f.cashOrCheck, // "現" | "票"
        note: f.note || null,
        handler: f.handler || null,
      }));

      car.set("fees", fees);

      await car.save();
      showMessage("✅ 已更新費用資料");
      return;
    }

    router.push("/dashboard");
  };

  // UI helpers for Autocomplete values (unchanged)
  const brandValue = React.useMemo(() => {
    const id = getValues("brandId");
    const name = getValues("brandName");
    return id ? brandOpts.find((o) => o.id === id) ?? null : name || null;
  }, [brandOpts, getValues("brandId"), getValues("brandName")]);

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
                name="seriesCategory"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={[...SERIES_CATEGORIES]}
                    value={field.value || null}
                    onChange={(_, v) => field.onChange(v ?? "")}
                    renderInput={(params) => (
                      <TextField {...params} label="車系分類" fullWidth />
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
                    forcePopupIcon={true}
                    popupIcon={<ArrowDropDownIcon />}
                    options={brandOpts}
                    getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
                    value={brandValue as any}
                    onInputChange={(_, v) => {
                      field.onChange(v);
                      setBrandInput(v);
                      setValue("brandId", "");
                    }}
                    onChange={(_, v) => {
                      if (typeof v === "string") {
                        setValue("brandName", v);
                        setValue("brandId", "");
                      } else if (v) {
                        setValue("brandName", v.name);
                        setValue("brandId", v.id);
                      } else {
                        setValue("brandName", "");
                        setValue("brandId", "");
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
              <BasicTab control={control} />
            </TabPanel>

            <TabPanel value={tab} index={1}>
              <DocumentTab control={control} />
            </TabPanel>
            <TabPanel value={tab} index={2}>
              <InBoundTab control={control} errors={errors} />
            </TabPanel>

            <TabPanel value={tab} index={3}>
              <OriginalOwnerTab control={control} errors={errors} />
            </TabPanel>

            <TabPanel value={tab} index={4}>
              <InsuranceTab control={control} errors={errors} />
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
              <FeeTab control={control} errors={errors} />
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
