export const BASIC_TAB_INDEX = 0;
export const DOCUMENT_TAB_INDEX = 1;
export const INBOUND_TAB_INDEX = 2;
export const ORIGINAL_OWNER_TAB_INDEX = 3;
export const INSURANCE_TAB_INDEX = 4;
export const NEW_OWNER_TAB_INDEX = 5;
export const PAYMENT_TAB_INDEX = 6;
export const RECEIPT_TAB_INDEX = 7;
export const FEE_TAB_INDEX = 8;

// --- Fixed options ---
export const SERIES_CATEGORIES = [
  "國產",
  "日系",
  "歐系",
  "美系",
  "韓系",
  "其它",
] as const;
export const DEALER_OPTIONS = ["外匯", "貿易商", "總代理", "美規"] as const;

// --- Dynamic options (整備情形、處置) with fallbacks ---
export const DEFAULT_CONDITIONS = [
  "材料",
  "玻璃",
  "美容",
  "音響",
  "鈑噴",
  "隔熱紙",
];
export const DEFAULT_DISPOSITIONS = [
  "188大燈",
  "7專業",
  "GOO刊登",
  "TOP美容",
  "三元",
  "三馬音響",
];

