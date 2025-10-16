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
import type { UploadedImage } from "@/schemas/carSchemas";
import { useRouter } from "next/router";
import { Controller, useForm, useWatch, FormProvider } from "react-hook-form";
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
import { useBrandOptions } from "@/hooks/useBrandOptions";

export default function InventoryNewPage() {
  return (
    <CarSnackbarProvider>
      <InventoryNewContent />
    </CarSnackbarProvider>
  );
}

const normalizeImages = (raw: any): UploadedImage[] => {
  if (!raw || !Array.isArray(raw)) return [];

  // Already {id,url,name}[]
  if (
    raw.length &&
    typeof raw[0] === "object" &&
    "url" in raw[0] &&
    "id" in raw[0]
  ) {
    return raw as UploadedImage[];
  }

  // Parse.File[]
  if (
    raw.length &&
    typeof raw[0] === "object" &&
    typeof raw[0].url === "function"
  ) {
    const items = raw
      .map((pf: any) => {
        const url: string | undefined = pf.url?.();
        const id: string | undefined = pf.name?.();
        const name: string | undefined = pf._name || pf.name?.();
        if (!url || !id) return null;
        return { id, url, name: name || id };
      })
      .filter((x): x is UploadedImage => x !== null); // <-- type guard
    return items;
  }

  // string[] (urls)
  if (raw.length && typeof raw[0] === "string") {
    return (raw as string[]).map((u, i) => ({
      id: `img_${i}_${u.match(/[^/]+$/)?.[0] ?? "file"}`,
      url: u,
      name: u.match(/[^/]+$/)?.[0] ?? "file",
    }));
  }

  return [];
};

/* ==================== Page ==================== */
function InventoryNewContent() {
  const { showMessage } = useCarSnackbar();
  const router = useRouter();
  const { carId } = router.query as { carId?: string };
  const [tab, setTab] = React.useState(0);
  const [origOwnerId, setOrigOwnerId] = React.useState<string | null>(null);
  const [newOwnerId, setNewOwnerId] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState<boolean>(!!carId);

  // RHF form (wrap with FormProvider later)
  const form = useForm<FormValues, any, any>({
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
        images: [],
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
        adjustedMileageKm: "",
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

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // watch brand for series query
  const watchedBrandId = useWatch({ control, name: "brandId" });

  interface Option {
    id: string;
    name: string;
  }

  // Brand options with localStorage + SWR
  const [brandInput, setBrandInput] = React.useState("");
  const debBrand = useDebounce(brandInput);
  const user = Parse.User.current();
  const {
    options: brandOpts,
    setOptions: setBrandOpts,
    loading: brandLoading,
  } = useBrandOptions(user?.id ?? "", debBrand);

  // brand value derive
  const brandValue = React.useMemo(() => {
    const id = getValues("brandId");
    const name = getValues("brandName");
    return id ? brandOpts.find((o) => o.id === id) ?? null : name || null;
  }, [brandOpts, getValues]);

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
        const buyerObj = o.get("newOwner") as Parse.Object | undefined; // ← declare ONCE here

        const brandId = brandObj?.id ?? "";
        const brandName = (brandObj?.get?.("name") as string) ?? "";

        if (brandId && brandName && !brandOpts.find((b) => b.id === brandId)) {
          setBrandOpts((prev: Option[]) => [
            { id: brandId, name: brandName },
            ...prev,
          ]);
        }

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
          payments: [],
          receipts: [],
          fees: [],
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
            images: [],
          },
        };

        // document
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
          images: normalizeImages(doc?.images),
        };

        // inbound
        const inbound = (o.get("inbound") as any) || {};
        (baseValues as any).inbound = {
          orderNo: inbound?.orderNo ?? "",
          keyNo: inbound?.keyNo ?? inbound?.wheelNo ?? "",
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

        // insurance
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

        // original owner
        if (ownerObj) {
          setOrigOwnerId(ownerObj.id ?? "");
          (baseValues as any).origOwnerName = ownerObj.get("name") ?? "";
          (baseValues as any).origOwnerPhone = ownerObj.get("phone") ?? "";
          (baseValues as any).origOwnerIdNo = ownerObj.get("idNo") ?? "";
          (baseValues as any).origOwnerBirth = toDateInput(
            ownerObj.get("birth")
          );
          (baseValues as any).origContractDate = toDateInput(
            ownerObj.get("contractDate")
          );
          (baseValues as any).origDealPriceWan = (
            ownerObj.get("dealPriceWan") ?? ""
          ).toString();
          (baseValues as any).origCommissionWan = (
            ownerObj.get("commissionWan") ?? ""
          ).toString();
          (baseValues as any).origOwnerRegZip = ownerObj.get("regZip") ?? "";
          (baseValues as any).origOwnerRegAddr = ownerObj.get("regAddr") ?? "";
          (baseValues as any).origOwnerMailZip = ownerObj.get("mailZip") ?? "";
          (baseValues as any).origOwnerMailAddr =
            ownerObj.get("mailAddr") ?? "";
          (baseValues as any).consignorName =
            ownerObj.get("consignorName") ?? "";
          (baseValues as any).consignorPhone =
            ownerObj.get("consignorPhone") ?? "";
          (baseValues as any).referrerName = ownerObj.get("referrerName") ?? "";
          (baseValues as any).referrerPhone =
            ownerObj.get("referrerPhone") ?? "";
          (baseValues as any).purchasedTransferred =
            ownerObj.get("purchasedTransferred") ?? "";
          (baseValues as any).registeredToName =
            ownerObj.get("registeredToName") ?? "";
          (baseValues as any).procurementMethod =
            ownerObj.get("procurementMethod") ?? "";
          (baseValues as any).origOwnerNote = ownerObj.get("note") ?? "";
        } else {
          setOrigOwnerId(null);
        }

        // new owner — reuse buyerObj (NO redeclare)
        if (buyerObj) {
          setNewOwnerId(buyerObj.id ?? "");
          (baseValues as any).newOwnerName = buyerObj.get("name") ?? "";
          (baseValues as any).newOwnerPhone = buyerObj.get("phone") ?? "";
          (baseValues as any).newContractDate = toDateInput(
            buyerObj.get("contractDate")
          );
          (baseValues as any).newDealPriceWan = (
            buyerObj.get("dealPriceWan") ?? ""
          ).toString();
          (baseValues as any).newCommissionWan = (
            buyerObj.get("commissionWan") ?? ""
          ).toString();
          (baseValues as any).handoverDate = toDateInput(
            buyerObj.get("handoverDate")
          );
          (baseValues as any).newOwnerIdNo = buyerObj.get("idNo") ?? "";
          (baseValues as any).newOwnerBirth = toDateInput(
            buyerObj.get("birth")
          );
          (baseValues as any).newOwnerRegZip = buyerObj.get("regZip") ?? "";
          (baseValues as any).newOwnerRegAddr = buyerObj.get("regAddr") ?? "";
          (baseValues as any).newOwnerMailZip = buyerObj.get("mailZip") ?? "";
          (baseValues as any).newOwnerMailAddr = buyerObj.get("mailAddr") ?? "";
          (baseValues as any).buyerAgentName =
            buyerObj.get("buyerAgentName") ?? "";
          (baseValues as any).buyerAgentPhone =
            buyerObj.get("buyerAgentPhone") ?? "";
          (baseValues as any).referrerName2 =
            buyerObj.get("referrerName2") ?? "";
          (baseValues as any).referrerPhone2 =
            buyerObj.get("referrerPhone2") ?? "";
          (baseValues as any).salesmanName = buyerObj.get("salesmanName") ?? "";
          (baseValues as any).salesCommissionPct = (
            buyerObj.get("salesCommissionPct") ?? ""
          ).toString();
          (baseValues as any).salesMode = buyerObj.get("salesMode") ?? "";
          (baseValues as any).preferredShop =
            buyerObj.get("preferredShop") ?? "";
          (baseValues as any).newOwnerNote = buyerObj.get("note") ?? "";
        } else {
          setNewOwnerId(null);
        }

        // payments / receipts / fees (unchanged)
        const paymentsRaw = (o.get("payments") as any[]) || [];
        (baseValues as any).payments = paymentsRaw.map((p) => ({
          date: toDateStr(p?.date),
          amount: p?.amount ?? "",
          cashOrCheck: p?.cashOrCheck === "票" ? "票" : "現",
          interestStartDate: toDateStr(p?.interestStartDate),
          note: p?.note ?? "",
        }));

        const receiptsRaw = (o.get("receipts") as any[]) || [];
        (baseValues as any).receipts = receiptsRaw.map((r) => ({
          date: toDateStr(r?.date),
          amount: r?.amount ?? "",
          cashOrCheck: r?.cashOrCheck === "票" ? "票" : "現",
          exchangeDate: toDateStr(r?.exchangeDate),
          note: r?.note ?? "",
        }));

        const feesRaw = (o.get("fees") as any[]) || [];
        (baseValues as any).fees = feesRaw.map((f) => ({
          date: toDateStr(f?.date),
          item: f?.item ?? "",
          vendor: f?.vendor ?? "",
          amount: f?.amount ?? "",
          cashOrCheck: f?.cashOrCheck === "票" ? "票" : "現",
          note: f?.note ?? "",
          handler: f?.handler ?? "",
        }));

        reset(baseValues as FormValues);
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

    // IMPORTANT: keep as strings (schema expects String)
    car.set("deliverDate", v.deliverDate || null);

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

    // keep as strings
    car.set("inboundDate", v.inboundDate || null);
    car.set("promisedDate", v.promisedDate || null);
    car.set("returnDate", v.returnDate || null);

    car.set("disposition", v.disposition || null);

    // optional: scope by user
    const u = Parse.User.current();
    if (u) car.set("owner", u);

    // default status on create
    if (!carId) car.set("status", "active");

    if (tab === BASIC_TAB_INDEX) {
      await car.save();
      showMessage(carId ? "✅ 基本資料已更新" : "✅ 車輛已建立");
      return;
    } else if (tab === ORIGINAL_OWNER_TAB_INDEX) {
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
      if (u) owner.set("owner", u);

      await owner.save();
      car.set("originalOwner", owner);
      await car.save();

      if (!origOwnerId) setOrigOwnerId(owner.id);
      showMessage(origOwnerId ? "✅ 原車主資料已更新" : "✅ 原車主資料已建立");
      router.push("/dashboard");
      return;
    } else if (tab === DOCUMENT_TAB_INDEX) {
      const d = v.document || {};
      const n = (x: any) => (x === "" || x == null ? null : x);

      const docOut = {
        audioCode: n(d.audioCode),
        spareKey: n(d.spareKey),
        certOk: n(d.certOk),
        license: n(d.license),
        application: n(d.application),
        transferPaper: n(d.transferPaper),
        payoffProof: n(d.payoffProof),
        inspectDate: n(d.inspectDate), // 'YYYY-MM-DD' string
        taxCert: n(d.taxCert),
        factoryCert: n(d.factoryCert),
        copyFlag: n(d.copyFlag),
        plate: n(d.plate),
        taxStatus: n(d.taxStatus),
        remark: n(d.remark),
        images: Array.isArray(d.images) ? (d.images as UploadedImage[]) : [],
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
        expireDate: n(d.expireDate), // 'YYYY-MM-DD' string
        insuranceCompany: n(d.insuranceCompany),
        loanCompany: n(d.loanCompany),
        contactName: n(d.contactName),
        contactPhone: n(d.contactPhone),
        amount: d.amount ? Number(d.amount) : null,
        installments: d.installments ? Number(d.installments) : null,
        baseAmount: d.baseAmount ? Number(d.baseAmount) : null,
        promissoryNote: n(d.promissoryNote),
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
      if (u) buyer.set("owner", u);

      await buyer.save();
      car.set("newOwner", buyer);
      await car.save();

      if (!newOwnerId) setNewOwnerId(buyer.id);
      showMessage(newOwnerId ? "✅ 新車主資料已更新" : "✅ 新車主資料已建立");
      router.push("/dashboard");
      return;
    } else if (tab === PAYMENT_TAB_INDEX) {
      const payments = (v.payments || []).map((p) => ({
        date: p.date || null, // keep as string
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
      const fees = (v.fees || []).map((f) => ({
        date: f.date || null,
        item: f.item || null,
        vendor: f.vendor || null,
        amount: f.amount === "" || f.amount == null ? 0 : Number(f.amount),
        cashOrCheck: f.cashOrCheck,
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
        {/* 上方固定欄位 */}
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
                    forcePopupIcon
                    popupIcon={<ArrowDropDownIcon />}
                    options={brandOpts}
                    loading={brandLoading}
                    value={brandValue as any} // Option | string | null
                    inputValue={field.value ?? ""} // keep input synced with RHF
                    onOpen={() => setBrandInput("")} // show full list on open
                    onInputChange={(_, v) => {
                      field.onChange(v);
                      setBrandInput(v);
                      setValue("brandId", "");
                    }}
                    onChange={(_, v) => {
                      if (typeof v === "string") {
                        field.onChange(v);
                        setValue("brandName", v);
                        setValue("brandId", "");
                      } else if (v) {
                        field.onChange(v.name);
                        setValue("brandName", v.name);
                        setValue("brandId", v.id);
                      } else {
                        field.onChange("");
                        setValue("brandName", "");
                        setValue("brandId", "");
                      }
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (!value) return false;
                      if (typeof value === "string")
                        return option.name === value;
                      return option.id === value.id;
                    }}
                    getOptionLabel={(o) => (typeof o === "string" ? o : o.name)}
                    filterOptions={(options, state) => {
                      if (!state.inputValue) return options;
                      return options.filter((o) =>
                        o.name
                          .toLowerCase()
                          .includes(state.inputValue.toLowerCase())
                      );
                    }}
                    noOptionsText={
                      field.value ? "沒有符合的品牌" : "尚未有品牌"
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="廠牌"
                        required
                        error={!!errors.brandName}
                        helperText={errors.brandName?.message}
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {brandLoading ? (
                                <CircularProgress size={18} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                          inputMode: "text",
                        }}
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
          {/* ✅ Provide RHF context to all tab children */}
          <FormProvider {...form}>
            <Box
              component="form"
              id="inv-form"
              onSubmit={handleSubmit(onSubmit)}
            >
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
                <OriginalOwnerTab
                  control={control}
                  errors={errors}
                  setValue={setValue}
                  getValues={getValues}
                />
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
          </FormProvider>
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
