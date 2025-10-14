// The example below shows you how a cloud code function looks like.

/* Parse Server 3.x
 * Parse.Cloud.define("hello", (request) => {
 * 	return("Hello world!");
 * });
 */

/* Parse Server 2.x
 * Parse.Cloud.define("hello", function(request, response){
 * 	response.success("Hello world!");
 * });
 */

// To see it working, you only need to call it through SDK or REST API.
// Here is how you have to call it via REST API:

/** curl -X POST \
 * -H "X-Parse-Application-Id: lxGFw0aXt28sXA40SdNFP2bri4jWxag7C3LOueVj" \
 * -H "X-Parse-REST-API-Key: 7AUx2fYHvmYdHtapj9KtDIZSt8yh86E8bKp7fuI5" \
 * -H "Content-Type: application/json" \
 * -d "{}" \
 * https://parseapi.back4app.com/functions/hello
 */

// ===== DEFAULTS (per-user) =====
const DEFAULTS = {
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
    // SE / Nordics
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
    // 進貨模式
    importStyle: [],

    // 採購員
    purchaser: ["王小明"],

    // 採購方式
    purchaseMethod: [
      "一般",
      "介紹",
      "公司買回",
      "同行（盤）",
      "回籠",
      "回籠換車",
      "來店",
    ],

    // 異動方式
    moveMethod: ["新增", "調價", "整備", "保留", "出清", "備註", "其他"],

    // 保險類別
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

    // 保險公司（台灣常見產險，依實務調整）
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

    // 貸款公司 / 銀行（常見）
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

    // 銷售員（示例，可自行修改）
    salesperson: ["王小明"],

    // 過戶名下
    registeredToName: ["王小明"],

    // 銷售方式（付款 / 承作方式）
    salesMethod: [
      "8891刊登",
      "ABC網路",
      "FB社團",
      "SAVE",
      "TAVA介紹",
      "U-CAR網路",
    ],

    // 銷貨模式（salesMode）
    saleStyle: [
      "小賣",
      "小賣分紅",
      "小賣換車",
      "分紅",
      "同行",
      "自售",
      "行將棄標",
    ],

    // 特約廠
    specialShop: [
      "GOO",
      "SAVE認證",
      "上全零件",
      "久億電機",
      "大富電機",
      "友成玻璃",
      "王冠音響",
    ],

    // 保養廠
    maintenanceShop: [],

    // 整備情形 / 狀態
    reconditionStatus: [
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

    // 常用配備（下拉使用）
    commonEquip: [
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

    // 費用項目
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

    // 其它費用項目
    otherFeeItem: ["茶水費", "雜項", "補差額", "折讓", "其他"],
  },
};

function mkKey(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// ─── 安全版 hasAny：用 count() + try/catch ─────────────────────────────────────
const hasAny = async (className, where = {}) => {
  try {
    const q = new Parse.Query(className);
    for (const [k, v] of Object.entries(where)) q.equalTo(k, v);
    const n = await q.count({ useMasterKey: true });
    return n > 0;
  } catch (err) {
    console.error(`[hasAny] ${className} failed:`, err);
    // 把錯誤吞掉，避免影響 login；回傳 false 表示「當作沒有資料」
    return false;
  }
};

// ─── createExampleCarForUser：用 count() 並包 try/catch ─────────────────────────
async function createExampleCarForUser(user) {
  try {
    const Car = Parse.Object.extend("Car");
    const n = await new Parse.Query(Car)
      .equalTo("owner", user)
      .count({ useMasterKey: true });
    if (n > 0) return;

    const toyota = await getOrCreateToyotaFor(user).catch((e) => {
      console.error("[createExampleCarForUser] getOrCreateToyotaFor:", e);
      return null;
    });

    const car = new Car();
    car.set("owner", user);
    car.set("isExample", true);
    car.set("model", "(範例)Corolla Cross");
    car.set("status", "active");
    car.set("buyPriceWan", 63);
    car.set("sellPriceWan", 68);
    car.set("transmission", "A");
    car.set("inboundDate", "2025-08-12");
    car.set("color", "白");
    car.set("engineNo", "SR33BK-248628");
    car.set("plateNo", "CAR-1688");
    car.set("displacementCc", 1798);
    car.set("vin", "JTR20912FG094J");
    car.set("factoryYM", "2024-06");
    car.set("style", "SUV");
    car.set("seriesCategory", "日系");
    if (toyota) car.set("brand", toyota);

    await car.save(null, { useMasterKey: true });
  } catch (e) {
    console.error("[createExampleCarForUser] failed:", e);
  }
}

async function getOrCreateToyotaFor(user) {
  try {
    const sessionToken = user.getSessionToken?.();
    await Parse.Cloud.run(
      "upsertBrand",
      { name: "Toyota" },
      sessionToken ? { sessionToken } : {}
    );

    const Brand = Parse.Object.extend("Brand");
    const toyota = await new Parse.Query(Brand)
      .equalTo("owner", user)
      .equalTo("nameKey", "toyota")
      .first({ useMasterKey: true });
    return toyota || null;
  } catch (e) {
    console.error("[getOrCreateToyotaFor] failed:", e);
    return null;
  }
}

// ─── afterLogin：任何一段出錯都不會中斷整個登入流程 ───────────────────────────
Parse.Cloud.afterLogin(async (request) => {
  const user = request.user;
  if (!user) return;

  // 可用環境變數快速停用 seeding（若要先確認錯誤來源）
  if (process.env.DISABLE_SEED === "1") {
    console.log("[afterLogin] Seeding disabled by env");
    return;
  }

  try {
    // brands: seed only if none
    const hasBrand = await hasAny("Brand", { owner: user });
    if (!hasBrand) {
      const sessionToken = user.getSessionToken?.();
      for (const name of DEFAULTS.brands || []) {
        try {
          await Parse.Cloud.run(
            "upsertBrand",
            { name },
            sessionToken ? { sessionToken } : {}
          );
        } catch (e) {
          console.error(`[afterLogin] upsertBrand(${name}) failed:`, e);
        }
      }
    }

    // settings: type-by-type seed only if empty
    const entries = Object.entries(DEFAULTS.settings || {});
    for (const [type, list] of entries) {
      try {
        const exists = await hasAny("Setting", { owner: user, type });
        if (exists) continue;

        const arr = Array.isArray(list) ? list : [];
        const sessionToken = user.getSessionToken?.();
        let i = 1;
        for (const name of arr) {
          try {
            await Parse.Cloud.run(
              "upsertSetting",
              { type, name, order: i++ },
              sessionToken ? { sessionToken } : {}
            );
          } catch (e) {
            console.error(`[afterLogin] upsertSetting(${type}, ${name}) failed:`, e);
          }
        }
      } catch (e) {
        console.error(`[afterLogin] seeding type=${type} failed:`, e);
      }
    }

    await createExampleCarForUser(user);
  } catch (e) {
    console.error("[afterLogin] top-level failed:", e);
    // 不 throw，避免影響登入
  }
});














Parse.Cloud.beforeSave("Brand", async (req) => {
  const o = req.object;
  const user = req.user || o.get("owner");
  if (!user) throw new Error("Not logged in");

  const raw = (o.get("name") || "").trim();
  if (!raw) throw new Error("品牌名稱不可為空白");

  o.set("owner", user);
  o.set("name", raw);
  o.set("nameKey", mkKey(raw));
  if (o.get("active") === undefined) o.set("active", true);

  const q = new Parse.Query("Brand")
    .equalTo("owner", user)
    .equalTo("nameKey", o.get("nameKey"));
  if (o.id) q.notEqualTo("objectId", o.id);
  const dup = await q.first({ useMasterKey: true });
  if (dup && dup.get("active") !== false && o.get("active") !== false) {
    throw new Error("相同品牌已存在");
  }
});

Parse.Cloud.beforeSave("Setting", async (req) => {
  const o = req.object;
  const user = req.user || o.get("owner");
  if (!user) throw new Error("Not logged in");

  const type = (o.get("type") || "").trim();
  const raw = (o.get("name") || "").trim();
  if (!type) throw new Error("Setting.type 不可為空白");
  if (!raw) throw new Error("Setting.name 不可為空白");

  o.set("owner", user);
  o.set("type", type);
  o.set("name", raw);
  o.set("nameKey", mkKey(raw));
  if (o.get("active") === undefined) o.set("active", true);
  if (o.get("order") === undefined) o.set("order", 999);

  const q = new Parse.Query("Setting")
    .equalTo("owner", user)
    .equalTo("type", type)
    .equalTo("nameKey", o.get("nameKey"));
  if (o.id) q.notEqualTo("objectId", o.id);
  const dup = await q.first({ useMasterKey: true });
  if (dup && dup.get("active") !== false && o.get("active") !== false) {
    throw new Error("同類型下相同名稱已存在");
  }
});

Parse.Cloud.define("upsertBrand", async (req) => {
  const user = req.user;
  if (!user) throw "Not logged in";
  const name = (req.params?.name || "").trim();
  if (!name) throw "Missing brand name";

  const Brand = Parse.Object.extend("Brand");
  const nameKey = mkKey(name);

  const exist = await new Parse.Query(Brand)
    .equalTo("owner", user)
    .equalTo("nameKey", nameKey)
    .first({ useMasterKey: true });

  if (exist) {
    exist.set("name", name);
    exist.set("active", true);
    await exist.save(null, { useMasterKey: true });
    return { id: exist.id, revived: true };
  }

  const b = new Brand();
  b.set("owner", user);
  b.set("name", name);
  b.set("nameKey", nameKey);
  b.set("active", true);
  await b.save(null, { useMasterKey: true });
  return { id: b.id, revived: false };
});

Parse.Cloud.define("upsertSetting", async (req) => {
  const user = req.user;
  if (!user) throw "Not logged in";
  const type = (req.params?.type || "").trim();
  const name = (req.params?.name || "").trim();
  const order = req.params?.order;
  if (!type || !name) throw "Missing type/name";

  const Setting = Parse.Object.extend("Setting");
  const nameKey = mkKey(name);

  const exist = await new Parse.Query(Setting)
    .equalTo("owner", user)
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
  s.set("owner", user);
  s.set("type", type);
  s.set("name", name);
  s.set("nameKey", nameKey);
  s.set("active", true);
  s.set("order", typeof order === "number" ? order : 999);
  await s.save(null, { useMasterKey: true });
  return { id: s.id, revived: false };
});

