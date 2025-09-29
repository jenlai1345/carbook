// schemas/carSchemas.ts
import { z } from "zod";

/* header */
export const headerSchema = z.object({
  plateNo: z.string().min(1, "必填"),
  prevPlateNo: z.string().optional().or(z.literal("")),
  deliverDate: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  brandName: z.string().min(1, "必填"),
  seriesId: z.string().optional().or(z.literal("")),
  seriesName: z.string().optional().or(z.literal("")),
  style: z.string().optional().or(z.literal("")),
  buyPriceWan: z.string().optional().or(z.literal("")),
  sellPriceWan: z.string().optional().or(z.literal("")),
});

/* basic */
export const basicSchema = z.object({
  factoryYM: z.string().optional().or(z.literal("")),
  plateYM: z.string().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  displacementCc: z.string().optional().or(z.literal("")),
  transmission: z.enum(["A", "M", ""]).optional().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  engineNo: z.string().optional().or(z.literal("")),
  vin: z.string().optional().or(z.literal("")),
  dealer: z.string().optional().or(z.literal("")),
  equipment: z.string().optional().or(z.literal("")),
  remark: z.string().optional().or(z.literal("")),
  condition: z.string().optional().or(z.literal("")),
  inboundDate: z.string().optional().or(z.literal("")),
  promisedDate: z.string().optional().or(z.literal("")),
  returnDate: z.string().optional().or(z.literal("")),
  disposition: z.string().optional().or(z.literal("")),
});

/* owners */
export const originalOwnerSchema = z.object({
  origOwnerName: z.string().optional().or(z.literal("")),
  origOwnerPhone: z.string().optional().or(z.literal("")),
  origOwnerIdNo: z.string().optional().or(z.literal("")),
  origOwnerBirth: z.string().optional().or(z.literal("")),
  origContractDate: z.string().optional().or(z.literal("")),
  origDealPriceWan: z.string().optional().or(z.literal("")),
  origCommissionWan: z.string().optional().or(z.literal("")),
  origOwnerRegZip: z.string().optional().or(z.literal("")),
  origOwnerRegAddr: z.string().optional().or(z.literal("")),
  origOwnerMailZip: z.string().optional().or(z.literal("")),
  origOwnerMailAddr: z.string().optional().or(z.literal("")),
  consignorName: z.string().optional().or(z.literal("")),
  consignorPhone: z.string().optional().or(z.literal("")),
  referrerName: z.string().optional().or(z.literal("")),
  referrerPhone: z.string().optional().or(z.literal("")),
  purchasedTransferred: z.string().optional().or(z.literal("")),
  registeredToName: z.string().optional().or(z.literal("")),
  procurementMethod: z.string().optional().or(z.literal("")),
  origOwnerNote: z.string().optional().or(z.literal("")),
});

export const newOwnerSchema = z.object({
  newOwnerName: z.string().optional().or(z.literal("")),
  newOwnerPhone: z.string().optional().or(z.literal("")),
  newContractDate: z.string().optional().or(z.literal("")),
  newDealPriceWan: z.string().optional().or(z.literal("")),
  newCommissionWan: z.string().optional().or(z.literal("")),
  handoverDate: z.string().optional().or(z.literal("")),
  newOwnerIdNo: z.string().optional().or(z.literal("")),
  newOwnerBirth: z.string().optional().or(z.literal("")),
  newOwnerRegAddr: z.string().optional().or(z.literal("")),
  newOwnerRegZip: z.string().optional().or(z.literal("")),
  newOwnerMailAddr: z.string().optional().or(z.literal("")),
  newOwnerMailZip: z.string().optional().or(z.literal("")),
  buyerAgentName: z.string().optional().or(z.literal("")),
  buyerAgentPhone: z.string().optional().or(z.literal("")),
  referrerName2: z.string().optional().or(z.literal("")),
  referrerPhone2: z.string().optional().or(z.literal("")),
  salesmanName: z.string().optional().or(z.literal("")),
  salesCommissionPct: z.string().optional().or(z.literal("")),
  salesMode: z.string().optional().or(z.literal("")),
  preferredShop: z.string().optional().or(z.literal("")),
  newOwnerNote: z.string().optional().or(z.literal("")),
});

/* finance rows */
export const paymentItemSchema = z.object({
  date: z.string().optional().default(""),
  amount: z.union([z.number(), z.string()]).optional(),
  cashOrCheck: z.enum(["現", "票"]),
  interestStartDate: z.string().optional().default(""),
  note: z.string().optional().default(""),
});

export const receiptItemSchema = z.object({
  date: z.string().optional().default(""),
  amount: z.union([z.number(), z.string()]).optional(),
  cashOrCheck: z.enum(["現", "票"]),
  exchangeDate: z.string().optional().default(""),
  note: z.string().optional().default(""),
});

export const feeItemSchema = z.object({
  date: z.string().optional().default(""), // 日期
  item: z.string().optional().default(""), // 項目
  vendor: z.string().optional().default(""), // 廠商
  amount: z.union([z.number(), z.string()]).optional(), // 金額
  cashOrCheck: z.enum(["現", "票"]), // 現/票
  note: z.string().optional().default(""), // 說明
  handler: z.string().optional().default(""), // 經手人
});

export const financeSchema = z.object({
  payments: z.array(paymentItemSchema).default([]),
  receipts: z.array(receiptItemSchema).default([]),
  fees: z.array(feeItemSchema).default([]),
});

/* merged */
export const formSchema = headerSchema
  .and(basicSchema)
  .and(originalOwnerSchema)
  .and(newOwnerSchema)
  .and(financeSchema);

export type FormValues = z.infer<typeof formSchema>;
