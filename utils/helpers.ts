// utils/helpers.ts
import { TW_ZIP3_TO_PREFIX } from "@/data/TW_ZIP3_TO_PREFIX";
import Parse from "../lib/parseClient";
import type { Car, CarStatus } from "../models";
import dayjs, { Dayjs } from "dayjs";

/** Debounce hook */
export function useDebounce<T>(value: T, delay = 250) {
  const React = require("react") as typeof import("react");
  const { useEffect, useState } = React;

  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced as T;
}

export type Option = { id: string; name: string };

export async function ensureBrandByName(name: string): Promise<string> {
  const q = new Parse.Query("Brand");
  if (!Parse.User.current()?.get("dealer")) return "";
  q.equalTo("dealer", Parse.User.current()?.get("dealer"));
  q.equalTo("name", name.trim());
  const exist = await q.first();
  if (exist) return exist.id ?? "";
  const Brand = Parse.Object.extend("Brand");
  const b = new Brand();
  b.set("name", name.trim());
  const saved = await b.save(); // make sure CLP allows create for logged-in users
  return saved.id;
}

export async function getCurrentDealer(
  useMasterKey = false
): Promise<Parse.Object | null> {
  const user = await Parse.User.currentAsync();
  if (!user) return null;

  // Re-fetch with master key if requested or if the dealer field may be protected
  const me = useMasterKey
    ? await user.fetch({ useMasterKey: true })
    : await user.fetch();

  const dealerPtr = me.get("dealer");
  if (!dealerPtr || !dealerPtr.id) return null;

  try {
    // Fetch the actual dealer object
    const dealer = await dealerPtr.fetch({ useMasterKey });
    return dealer;
  } catch (err) {
    console.error("Failed to fetch dealer:", err);
    return null;
  }
}

/** Which text fields we search against for the keyword box */
const SEARCHABLE_KEYS: (keyof Car)[] = [
  "plateNo",
  "prevPlateNo",
  "brand", // assuming your Car model stores brand name as string
  "seriesCategory",
  "model",
  "style",
  "vin",
  "engineNo",
  "color",
  "dealer",
  "equipment",
  "remark",
  "disposition",
  "location",
];

/** Client-side keyword filter (keeps UI snappy). Switch to server-side OR queries if dataset grows. */
export function matchesKeyword(car: Car, kw: string) {
  if (!kw) return true;
  const needle = kw.trim().toLowerCase();
  if (!needle) return true;

  // text fields
  const textBlob = SEARCHABLE_KEYS.map((k) => (car[k] ?? "").toString())
    .join(" \n ")
    .toLowerCase();

  if (textBlob.includes(needle)) return true;

  // numeric-ish fields (buy/sell price, displacement)
  const numericBlob = [car.buyPriceWan, car.sellPriceWan, car.displacementCc]
    .filter((v) => v !== undefined && v !== null)
    .join(" ");

  if (numericBlob && numericBlob.includes(needle)) return true;

  // year/month strings
  const ymBlob = [car.factoryYM, car.plateYM].filter(Boolean).join(" ");
  if (ymBlob && ymBlob.toLowerCase().includes(needle)) return true;

  return false;
}

// ---------- helpers----------
export function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function daysInMonth(y: number, m: number) {
  // m: 1..12
  return new Date(y, m, 0).getDate();
}

export const toNum = (v: unknown) => {
  if (v === "" || v === null || v === undefined) return NaN;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
};

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const strEq = (a: unknown, b: unknown) =>
  String(a ?? "") === String(b ?? "");

/** Safely convert unknown date-like values to `YYYY-MM-DD` or "" */
export function toDateInput(value: any): string {
  if (!value) return "";
  // if already a string like "2025-10-26"
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  // if it's a Date object or Parse.Date
  const d = dayjs(value);
  return d.isValid() ? d.format("YYYY-MM-DD") : "";
}

const toDateFromUnknown = (x: unknown): string => {
  if (x instanceof Date) return toDateInput(x);
  if (typeof x === "string") return x; // assume already YYYY-MM-DD
  return "";
};

/** Parse → Car[] mapper */
export async function fetchCars(): Promise<Car[]> {
  // Assumes Parse is already initialized in your app (e.g., in _app.tsx or a Parse client module)
  const CarClass = Parse.Object.extend("Car");
  const q = new Parse.Query(CarClass);
  const currentUser = Parse.User.current();
  const dealer = currentUser?.get("dealer");
  if (dealer) q.equalTo("dealer", dealer);
  q.limit(1000);
  q.include(["brand"]); // resolve pointer names

  const results = await q.find();

  const mapped: Car[] = results.map((o) => {
    // brand may be a pointer (included); read name safely without relying on pointer id typing
    const brandObj =
      (o.get("brand") as Parse.Object<Parse.Attributes> | undefined) ??
      undefined;
    const brandName = (brandObj?.get("name") as string | undefined) ?? "";

    const partial: Partial<Car> = {
      objectId: o.id,
      plateNo: (o.get("plateNo") as string) ?? "",
      prevPlateNo: (o.get("prevPlateNo") as string) ?? "",
      deliverDate: toDateFromUnknown(o.get("deliverDate")),

      // store brand name into your Car model's `brand` string field
      brand: brandName,

      style: (o.get("style") as string) ?? "",
      buyPriceWan: o.get("buyPriceWan"),
      sellPriceWan: o.get("sellPriceWan"),

      factoryYM: (o.get("factoryYM") as string) ?? "",
      plateYM: (o.get("plateYM") as string) ?? "",
      model: (o.get("model") as string) ?? "",
      displacementCc: o.get("displacementCc"),
      transmission: (o.get("transmission") as string) ?? "",
      color: (o.get("color") as string) ?? "",
      engineNo: (o.get("engineNo") as string) ?? "",
      vin: (o.get("vin") as string) ?? "",
      dealer: (o.get("dealer") as string) ?? "",
      seriesCategory: (o.get("seriesCategory") as string) ?? "",
      equipment: (o.get("equipment") as string) ?? "",
      remark: (o.get("remark") as string) ?? "",
      condition: (o.get("condition") as string) ?? "",
      inboundDate: toDateFromUnknown(o.get("inboundDate")),
      promisedDate: toDateFromUnknown(o.get("promisedDate")),
      returnDate: toDateFromUnknown(o.get("returnDate")),
      disposition: (o.get("disposition") as string) ?? "",

      coverUrl: (o.get("coverUrl") as string) ?? "",
      location: (o.get("location") as string) ?? "",

      status: (o.get("status") as CarStatus) ?? "active",
    };

    return partial as Car;
  });

  return mapped;
}

export function a11yProps(i: number) {
  return { id: `inv-tab-${i}`, "aria-controls": `inv-tabpanel-${i}` };
}

/** Keep existing API: coerce unknown into a date string (YYYY-MM-DD) or "" */
export const toDateStr = (x: unknown): string =>
  x instanceof Date ? toDateInput(x) : typeof x === "string" ? x : "";

export async function loadSettingsType(type: string): Promise<string[]> {
  if (!Parse.User.current()?.get("dealer")) return [""];
  const Setting = Parse.Object.extend("Setting");
  const q = new Parse.Query(Setting);
  q.equalTo("type", type);
  q.equalTo("active", true);
  q.equalTo("dealer", Parse.User.current()?.get("dealer"));
  q.ascending("order").addAscending("name");
  const list = await q.find();
  return [""].concat(
    list.map((o) => String(o.get("name") ?? "")).filter(Boolean)
  );
}

/** Delete a Car by id */
export async function deleteCarById(objectId: string): Promise<void> {
  const Car = Parse.Object.extend("Car");
  const o = new Car();
  o.id = objectId;
  await o.destroy();
}

/** Set Car.status */
export async function setCarStatus(
  objectId: string,
  status: CarStatus
): Promise<void> {
  const Car = Parse.Object.extend("Car");
  const o = new Car();
  o.id = objectId;
  o.set("status", status);
  await o.save(null, { useMasterKey: false });
}

export const applyZipPrefix = (zip?: string, addr?: string) => {
  const z3 = (zip ?? "").slice(0, 3);
  const prefix = TW_ZIP3_TO_PREFIX[z3];
  if (!prefix) return addr ?? "";

  const curr = (addr ?? "").trim();
  const knownPrefixes = Object.values(TW_ZIP3_TO_PREFIX);
  const existing = knownPrefixes.find((p) => curr.startsWith(p));
  if (existing) {
    if (existing === prefix) return curr;
    return `${prefix}${curr.slice(existing.length)}`.trim();
  }
  return `${prefix}${curr ? " " + curr : ""}`;
};
