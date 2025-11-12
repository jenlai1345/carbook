// cloud/main.js
/* eslint-disable no-undef */

// ============== Load user/dealer management (no member table) ==============
require("./users_dealer");

// ============== DEFAULTS (per dealer) available to users_dealer.js =========
global.DEFAULTS = {
  brands: [
    // JP
    "Toyota",
    "Lexus",
    "Honda",
    "Acura",
    "Nissan",
    "Infiniti",
    "Mazda",
    "Subaru",
    "Mitsubishi",
    "Suzuki",
    "Daihatsu",
    // KR
    "Hyundai",
    "Kia",
    "Genesis",
    // DE
    "BMW",
    "Mercedes-Benz",
    "Audi",
    "Volkswagen",
    "Porsche",
    "MINI",
    "Opel",
    "Smart",
    // Nordics
    "Volvo",
    "Polestar",
    "Saab",
    // IT
    "Alfa Romeo",
    "Fiat",
    "Maserati",
    "Ferrari",
    "Lamborghini",
    // FR
    "Peugeot",
    "Citroën",
    "DS",
    "Renault",
    // UK
    "Jaguar",
    "Land Rover",
    "Aston Martin",
    "Bentley",
    "Rolls-Royce",
    "Lotus",
    "McLaren",
    // US
    "Ford",
    "Chevrolet",
    "GMC",
    "Cadillac",
    "Buick",
    "Chrysler",
    "Dodge",
    "Jeep",
    "Ram",
    "Lincoln",
    "Tesla",
    // CN / TW & others
    "BYD",
    "MG",
    "Luxgen",
  ],
  settings: {
    importStyle: [],
    purchaser: [],
    purchaseMethod: [
      "一般",
      "介紹",
      "公司買回",
      "同行（盤）",
      "回籠",
      "回籠換車",
      "來店",
    ],
    moveMethod: ["新增", "調價", "整備", "保留", "出清", "備註", "其他"],
    insuranceType: [
      "強制險",
      "任意險",
      "第三責任",
      "車體險",
      "竊盜險",
      "乘客險",
      "駕駛人傷害險",
      "天災險",
      "代步車",
      "其他",
    ],
    insuranceCompany: [
      "富邦產險",
      "國泰產險",
      "新光產險",
      "和泰產物",
      "華南產物",
      "台灣產物",
      "明台產物",
      "兆豐產物",
      "第一產物",
      "安達產險",
      "新安東京海上",
      "三井住友海上",
      "華泰產物",
      "泰安產物",
      "中信產險",
      "其他",
    ],
    loanCompany: [
      "裕融",
      "中租",
      "和運",
      "合作金庫",
      "玉山",
      "台新",
      "國泰世華",
      "中國信託",
      "第一銀行",
      "華南銀行",
      "兆豐銀行",
      "永豐銀行",
      "渣打銀行",
      "台灣企銀",
      "聯邦銀行",
      "遠東商銀",
      "星展銀行",
      "凱基銀行",
      "日盛銀行",
      "其他",
    ],
    salesperson: [],
    registeredToName: [],
    salesMethod: [
      "8891刊登",
      "ABC網路",
      "FB社團",
      "SAVE",
      "TAVA介紹",
      "U-CAR網路",
    ],
    saleStyle: [
      "小賣",
      "小賣分紅",
      "小賣換車",
      "分紅",
      "同行",
      "自售",
      "行將棄標",
    ],
    preferredShop: [
      "GOO",
      "SAVE認證",
      "上全零件",
      "久億電機",
      "大富電機",
      "友成玻璃",
      "王冠音響",
    ],
    maintenanceShop: [],
    condition: [
      "待估",
      "排程",
      "進行中",
      "完成",
      "引擎/變速箱",
      "底盤/避震",
      "鈑噴",
      "內裝",
      "外觀美容",
      "鍍膜",
      "玻璃",
      "輪胎/鋁圈",
      "音響",
      "隔熱紙",
    ],
    equipment: [
      "倒車顯影",
      "盲點偵測(BSD)",
      "ACC主動定速",
      "車道維持",
      "天窗",
      "全景天窗",
      "皮椅",
      "電動座椅",
      "Keyless",
      "Push Start",
      "360環景",
      "Apple CarPlay",
      "Android Auto",
      "自動停車",
      "電動尾門",
      "抬頭顯示(HUD)",
      "LED頭燈",
      "自動遠近光",
      "全速域跟車",
    ],
    feeItem: [
      "過戶規費",
      "牌照稅",
      "燃料稅",
      "維修費",
      "整備費",
      "美容清潔費",
      "代辦費",
      "保險費",
      "驗車/檢驗費",
      "拍賣手續費",
      "運送費",
      "行銷費",
      "廣告費",
      "其他",
    ],
    disposal: [],
    otherFeeItem: ["茶水費", "雜項", "補差額", "折讓", "其他"],
  },
};

// ============== Utilities (dealer model) ===================================
function ptr(className, objectId) {
  return { __type: "Pointer", className, objectId };
}
function mkKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "-");
}

async function resolveDealer(reqOrUser) {
  // Case 1: got a _User or any Parse.Object-like with .get()
  if (
    reqOrUser?.className === "_User" ||
    typeof reqOrUser?.get === "function"
  ) {
    const dealer = reqOrUser.get("dealer");
    if (!dealer?.id) throw new Error("User has no dealer assigned");
    return dealer; // pointer is fine for equality in queries
  }

  // Case 2: got a Cloud Code request
  const req = reqOrUser;
  const { user, params = {}, master } = req || {};

  // ✅ Prefer explicit dealerId from params (works for master/no-session calls)
  const dealerId =
    params.dealerId ||
    params.dealer?.id ||
    params.dealerIdRaw ||
    params.dealerObjectId;
  if (dealerId) {
    return ptr("Dealer", String(dealerId)); // your helper that returns a pointer
  }

  // Fall back to req.user (when present)
  if (user && typeof user.get === "function") {
    const dealer = user.get("dealer");
    if (!dealer?.id) throw new Error("User has no dealer assigned");
    return dealer;
  }

  // If master but no dealerId was provided, be explicit:
  if (master) {
    throw new Error(
      "dealerId is required when calling without a logged-in user"
    );
  }

  // Otherwise, truly “not logged in”
  throw new Error("Not logged in");
}

Parse.Cloud.define("whoAmI", async (req) => {
  const u = req.user;
  if (!u)
    return { userId: null, dealerId: null, isAdmin: false, role: "viewer" };
  const dealer = u.get("dealer") || null;
  const role = u.get("role") || "viewer";
  const isAdmin = !!u.get("isAdmin") || role === "owner" || role === "admin";
  return {
    userId: u.id,
    email: u.get("email") ?? u.get("username") ?? null,
    name: u.get("name") ?? null,
    role,
    dealerId: dealer?.id ?? null,
    isAdmin,
  };
});

// ============== Example car seeding per dealer (used by users_dealer.js) ===
global.createExampleCarForDealer = async function createExampleCarForDealer(
  dealer,
  user
) {
  try {
    const Car = Parse.Object.extend("Car");
    const n = await new Parse.Query(Car)
      .equalTo("dealer", dealer)
      .count({ useMasterKey: true });
    if (n > 0) return;

    // ensure Toyota exists for this dealer
    try {
      const sessionToken = user?.getSessionToken?.();
      await Parse.Cloud.run(
        "upsertBrand",
        { name: "Toyota", dealerId: dealer.id },
        sessionToken ? { sessionToken } : {}
      );
    } catch (e) {
      console.error(
        "[createExampleCarForDealer] upsertBrand Toyota failed:",
        e
      );
    }

    const Brand = Parse.Object.extend("Brand");
    const toyota = await new Parse.Query(Brand)
      .equalTo("dealer", dealer)
      .equalTo("nameKey", "toyota")
      .first({ useMasterKey: true });

    const car = new Car();
    car.set("dealer", dealer);
    car.set("isExample", true);
    car.set("model", "2024");
    car.set("status", "active");
    car.set("buyPriceWan", 63);
    car.set("sellPriceWan", 70);
    car.set("transmission", "A");
    car.set("inboundDate", "2025/08/12");
    car.set("color", "白");
    car.set("engineNo", "SR33BK-248628");
    car.set("plateNo", "CAR-1688");
    car.set("displacementCc", 1798);
    car.set("vin", "JTR20912FG094J");
    car.set("factoryYM", "2024/06");
    car.set("plateYM", "2024/10");
    car.set("style", "(範例)Corolla Cross");
    car.set("seriesCategory", "日系");
    if (toyota) car.set("brand", toyota);

    await car.save(null, { useMasterKey: true });
  } catch (e) {
    console.error("[createExampleCarForDealer] failed:", e);
  }
};

// ---------- Login enforcement (no member table) ----------

if (Parse.Cloud.beforeLogin) {
  Parse.Cloud.beforeLogin(async (req) => {
    const u = req.object;
    if (!u) {
      throw new Parse.Error(101, "無法登入"); // 或 141，都可
    }
    if (u.get("isActive") === false) throw new Error("帳號已被停用");
    const dealerPtr = u.get("dealer");
    if (!dealerPtr?.id) throw new Error("用戶沒有歸屬的車商");

    const dealer = await dealerPtr.fetch({ useMasterKey: true });

    if (dealer && dealer.get("isActive") === false) {
      throw new Parse.Error(101, "車商帳號停用中");
    }
  });
}

if (Parse.Cloud.afterLogin) {
  Parse.Cloud.afterLogin(async (req) => {
    const u = req.object;
    if (!u) return;

    // write lastLoginAt
    try {
      u.set("lastLoginAt", new Date());
      await u.save(null, { useMasterKey: true });
    } catch (e) {
      console.error("[afterLogin] save lastLoginAt failed:", e);
    }

    // deviceLimit
    try {
      const limit = Math.max(1, Number(u.get("deviceLimit") ?? 1));
      const sessions = await listActiveSessions(u); // your helper
      const overflow = sessions.length - limit;
      if (overflow > 0) {
        await Parse.Object.destroyAll(sessions.slice(0, overflow), {
          useMasterKey: true,
        });
      }
    } catch (e) {
      console.error("[afterLogin] deviceLimit enforcement failed:", e);
    }

    // ---- Seeding ----
    if (process.env.DISABLE_SEED === "1") return;
    if (!global.DEFAULTS) {
      console.warn("[afterLogin] DEFAULTS not loaded; skip seeding.");
      return;
    }

    try {
      const dealerPtr = u.get("dealer");
      if (!dealerPtr?.id) {
        console.warn("[afterLogin] user has no dealer; skip seeding.");
        return;
      }

      // fetch the dealer to be safe (and to pass CLP)
      const dealer = await dealerPtr.fetch({ useMasterKey: true });
      const dealerId = dealer.id;

      // ---- Seed Brands (only if none) ----
      const Brand = Parse.Object.extend("Brand");
      const brandCount = await new Parse.Query(Brand)
        .equalTo("dealer", dealer) // pointer equality is fine
        .count({ useMasterKey: true });

      if (brandCount === 0) {
        for (const name of global.DEFAULTS.brands || []) {
          try {
            await Parse.Cloud.run(
              "upsertBrand",
              { name, dealerId },
              { useMasterKey: true } // ← IMPORTANT
            );
          } catch (e) {
            console.error(`[afterLogin] upsertBrand(${name}) failed:`, e);
          }
        }
      }

      // ---- Seed Settings by type (only if none) ----
      const Setting = Parse.Object.extend("Setting");
      const entries = Object.entries(global.DEFAULTS.settings || {});
      for (const [type, list] of entries) {
        const cnt = await new Parse.Query(Setting)
          .equalTo("dealer", dealer)
          .equalTo("type", type)
          .count({ useMasterKey: true });
        if (cnt > 0) continue;

        let order = 1;
        for (const name of Array.isArray(list) ? list : []) {
          try {
            await Parse.Cloud.run(
              "upsertSetting",
              { type, name, order: order++, dealerId },
              { useMasterKey: true } // ← IMPORTANT
            );
          } catch (e) {
            console.error(
              `[afterLogin] upsertSetting(${type}, ${name}) failed:`,
              e
            );
          }
        }
      }

      // ---- Example Car (optional) ----
      if (typeof global.createExampleCarForDealer === "function") {
        try {
          await global.createExampleCarForDealer(dealer, u);
        } catch (e) {
          console.error("[afterLogin] createExampleCarForDealer failed:", e);
        }
      }
    } catch (e) {
      console.error("[afterLogin] per-dealer seeding failed:", e);
    }
  });
}

// ============== Hooks: Brand / Setting (per dealer uniqueness) =============
Parse.Cloud.beforeSave("Brand", async (req) => {
  const o = req.object;
  const dealer = o.get("dealer") || (await resolveDealer(req));
  const raw = (o.get("name") || "").trim();
  if (!raw) throw new Error("品牌名稱不可為空白");

  o.set("dealer", dealer);
  o.set("name", raw);
  o.set("nameKey", mkKey(raw));
  if (o.get("active") === undefined) o.set("active", true);

  const q = new Parse.Query("Brand")
    .equalTo("dealer", dealer)
    .equalTo("nameKey", o.get("nameKey"));
  if (o.id) q.notEqualTo("objectId", o.id);

  const dup = await q.first({ useMasterKey: true });
  if (dup && dup.get("active") !== false && o.get("active") !== false) {
    throw new Error("相同品牌已存在（同 dealer）");
  }
});

Parse.Cloud.beforeSave("Setting", async (req) => {
  const o = req.object;
  const dealer = o.get("dealer") || (await resolveDealer(req));
  const type = (o.get("type") || "").trim();
  const raw = (o.get("name") || "").trim();
  if (!type) throw new Error("Setting.type 不可為空白");
  if (!raw) throw new Error("Setting.name 不可為空白");

  o.set("dealer", dealer);
  o.set("type", type);
  o.set("name", raw);
  o.set("nameKey", mkKey(raw));
  if (o.get("active") === undefined) o.set("active", true);
  if (o.get("order") === undefined) o.set("order", 999);

  const q = new Parse.Query("Setting")
    .equalTo("dealer", dealer)
    .equalTo("type", type)
    .equalTo("nameKey", o.get("nameKey"));
  if (o.id) q.notEqualTo("objectId", o.id);

  const dup = await q.first({ useMasterKey: true });
  if (dup && dup.get("active") !== false && o.get("active") !== false) {
    throw new Error("同類型下相同名稱已存在（同 dealer）");
  }
});

// ============== Upserts: Brand / Setting (per dealer) ======================
Parse.Cloud.define(
  "upsertBrand",
  async (req) => {
    const { params, user, master } = req;
    const dealer = await resolveDealer(req);
    const name = (params?.name || "").trim();
    if (!name) throw "Missing brand name";

    const Brand = Parse.Object.extend("Brand");
    const nameKey = mkKey(name);

    const exist = await new Parse.Query(Brand)
      .equalTo("dealer", dealer)
      .equalTo("nameKey", nameKey)
      .first({ useMasterKey: true });

    if (exist) {
      exist.set("name", name);
      exist.set("active", true);
      await exist.save(null, { useMasterKey: true });
      return { id: exist.id, revived: true };
    }

    const b = new Brand();
    b.set("dealer", dealer);
    b.set("name", name);
    b.set("nameKey", nameKey);
    b.set("active", true);
    await b.save(null, { useMasterKey: true });
    return { id: b.id, revived: false };
  },
  { requireUser: false }
);

Parse.Cloud.define(
  "upsertSetting",
  async (req) => {
    const { params, user, master } = req;
    const dealer = await resolveDealer(req);
    const type = (params?.type || "").trim();
    const name = (params?.name || "").trim();
    const order = params?.order;
    if (!type || !name) throw "Missing type/name";

    const Setting = Parse.Object.extend("Setting");
    const nameKey = mkKey(name);

    const exist = await new Parse.Query(Setting)
      .equalTo("dealer", dealer)
      .equalTo("type", type)
      .equalTo("nameKey", nameKey)
      .first({ useMasterKey: true });

    if (exist) {
      exist.set("name", name);
      exist.set("active", true);
      if (typeof order === "number") exist.set("order", order);
      await exist.save(null, { useMasterKey: true });
      return { id: exist.id, revived: true };
    }

    const s = new Setting();
    s.set("dealer", dealer);
    s.set("type", type);
    s.set("name", name);
    s.set("nameKey", nameKey);
    s.set("active", true);
    s.set("order", typeof order === "number" ? order : 999);
    await s.save(null, { useMasterKey: true });
    return { id: s.id, revived: false };
  },
  { requireUser: false }
);
