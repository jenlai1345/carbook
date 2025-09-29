// utils/helpers.ts
import Parse from "../lib/parseClient";
import type { Car, CarStatus } from "../models";

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
  q.equalTo("name", name.trim());
  const exist = await q.first();
  if (exist) return exist.id ?? "";
  const Brand = Parse.Object.extend("Brand");
  const b = new Brand();
  b.set("name", name.trim());
  const saved = await b.save(); // make sure CLP allows create for logged-in users
  return saved.id;
}

export async function ensureSeriesByName(
  name: string,
  brandId: string
): Promise<string> {
  const Brand = Parse.Object.extend("Brand");
  const brandPtr = Brand.createWithoutData(brandId);
  const q = new Parse.Query("Series");
  q.equalTo("name", name.trim());
  q.equalTo("brand", brandPtr);
  const exist = await q.first();
  if (exist) return exist.id ?? "";
  const Series = Parse.Object.extend("Series");
  const s = new Series();
  s.set("name", name.trim());
  s.set("brand", brandPtr);
  const saved = await s.save();
  return saved.id;
}

/** Compute list/tab status from your schema fields */
// export function computeStatus(car: Partial<Car>): CarStatus {
//   const disp = (car.disposition ?? "").toString().toLowerCase();
//   if (car.deliverDate) return "sold";
//   if (
//     ["transferred", "transfer", "調出", "外調", "移轉"].some((k) =>
//       disp.includes(k)
//     )
//   ) {
//     return "transferred";
//   }
//   return "active";
// }

/** Which text fields we search against for the keyword box */
const SEARCHABLE_KEYS: (keyof Car)[] = [
  "plateNo",
  "prevPlateNo",
  "brand",
  "series",
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

/** Parse → Car[] mapper */
export async function fetchCars(): Promise<Car[]> {
  // Assumes Parse is already initialized in your app (e.g., in _app.tsx or a Parse client module)
  const CarClass = Parse.Object.extend("Car");
  const q = new Parse.Query(CarClass);
  q.equalTo("user", Parse.User.current()!);
  q.limit(1000);
  q.include(["brand", "series"]); // resolve pointer names

  const results = await q.find();

  const get = (o: Parse.Object, key: string) => o.get(key);
  const toISOorNull = (d: unknown) =>
    d instanceof Date
      ? d.toISOString()
      : (d as string | null | undefined) ?? null;

  const mapped: Car[] = results.map((o) => {
    const brandPtr = get(o, "brand") as Parse.Object | undefined;
    const seriesPtr = get(o, "series") as Parse.Object | undefined;

    const partial: Partial<Car> = {
      objectId: o.id,
      plateNo: get(o, "plateNo"),
      prevPlateNo: get(o, "prevPlateNo"),
      deliverDate: toISOorNull(get(o, "deliverDate")),
      brand: brandPtr?.get?.("name"),
      series: seriesPtr?.get?.("name"),
      style: get(o, "style"),
      buyPriceWan: get(o, "buyPriceWan"),
      sellPriceWan: get(o, "sellPriceWan"),

      factoryYM: get(o, "factoryYM"),
      plateYM: get(o, "plateYM"),
      model: get(o, "model"),
      displacementCc: get(o, "displacementCc"),
      transmission: get(o, "transmission"),
      color: get(o, "color"),
      engineNo: get(o, "engineNo"),
      vin: get(o, "vin"),
      dealer: get(o, "dealer"),
      equipment: get(o, "equipment"),
      remark: get(o, "remark"),
      condition: get(o, "condition"),
      inboundDate: toISOorNull(get(o, "inboundDate")),
      promisedDate: toISOorNull(get(o, "promisedDate")),
      returnDate: toISOorNull(get(o, "returnDate")),
      disposition: get(o, "disposition"),

      coverUrl: get(o, "coverUrl"), // optional if you store one
      location: get(o, "location"),

      status: get(o, "status"),
    };
    return { ...(partial as Car) };
  });

  return mapped;
}

export function a11yProps(i: number) {
  return { id: `inv-tab-${i}`, "aria-controls": `inv-tabpanel-${i}` };
}

export const toDateInput = (d?: Date | null): string =>
  d instanceof Date ? d.toISOString().slice(0, 10) : "";

export const toDateStr = (x: any): string =>
  x instanceof Date ? toDateInput(x) : typeof x === "string" ? x : "";
