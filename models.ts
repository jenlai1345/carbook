// src/models.ts

// --------------------
// Core Enums & Types
// --------------------
export type CarStatus = "active" | "sold" | "transferred";
export interface Option {
  id: string;
  name: string;
}
// --------------------
// Car
// --------------------
export interface Car {
  objectId: string;

  user?: string; // Pointer<User> (dealer of the car)

  // 主表
  plateNo?: string;
  prevPlateNo?: string;
  deliverDate?: string | Date | null;

  brand?: string; // Pointer<Brand> resolved to name
  series?: string; // Pointer<Series> resolved to name

  style?: string;
  buyPriceWan?: number;
  sellPriceWan?: number;

  // 基本
  factoryYM?: string; // YYYY-MM
  plateYM?: string; // YYYY-MM
  model?: string;
  displacementCc?: number;
  transmission?: string; // "A" | "M"
  color?: string;
  engineNo?: string;
  vin?: string;
  dealer?: string;
  equipment?: string;
  remark?: string;
  condition?: string;
  inboundDate?: string | Date | null;
  promisedDate?: string | Date | null;
  returnDate?: string | Date | null;
  disposition?: string;

  // Optional UI fields
  coverUrl?: string;
  location?: string;

  // Derived
  status: CarStatus;
}

// --------------------
// Brand
// --------------------
export interface Brand {
  objectId: string;
  name: string; // unique
}

// --------------------
// Series
// --------------------
export interface Series {
  objectId: string;
  name: string;
  brand?: string; // resolved brand name
}

// --------------------
// Owner
// --------------------
export interface Owner {
  objectId: string;
  name: string;
  phone: string;
  idNo?: string;
  birth?: string; // YYYY-MM-DD

  contractDate?: string; // YYYY-MM-DD
  dealPriceWan?: number;
  commissionWan?: number;

  regZip?: string;
  regAddr?: string;
  mailZip?: string;
  mailAddr?: string;

  consignorName?: string;
  consignorPhone?: string;
  referrerName?: string;
  referrerPhone?: string;

  purchasedTransferred?: string; // "是" / "否"
  registeredToName?: string;
  procurementMethod?: string;

  note?: string;
}

// --------------------
// Payment
// --------------------
export type PaymentKind = "pay" | "receive";

export interface Payment {
  objectId: string;
  carId: string; // Pointer<Car>
  kind: PaymentKind;
  date: string | Date;
  amount: number;
  method?: string;
  note?: string;
  refNo?: string;
}

// --------------------
// Expense
// --------------------
export interface Expense {
  objectId: string;
  carId: string; // Pointer<Car>
  date: string | Date;
  item: string;
  amount: number;
  note?: string;
}
