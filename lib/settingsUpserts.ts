// lib/settingsUpserts.ts
import { getParse } from "../lib/parseClient";

type UpsertBrandInput = {
  id?: string;
  name: string;
  active?: boolean;
  dealerId?: string; // ✅ new
};

type UpsertSettingInput = {
  id?: string;
  name: string;
  order?: number;
  active?: boolean;
  dealerId?: string; // ✅ new
};

// helper to normalize token to the exact type Parse expects
const getToken = (user: any): string | undefined =>
  (user?.getSessionToken?.() ?? undefined) as string | undefined;

function dealerPtr(Parse: any, dealerId: string) {
  const Dealer = Parse.Object.extend("Dealer");
  const d = new Dealer();
  d.id = dealerId;
  return d;
}

function getUserDealerOrThrow(user: any, dealerId?: string) {
  const Parse = getParse();
  if (dealerId) return dealerPtr(Parse, dealerId);
  const dealer = user?.get?.("dealer");
  if (!dealer?.id)
    throw new Error("Missing dealer: pass dealerId or bind dealer to user.");
  return dealer;
}

/**
 * Create/update Brand under a dealer.
 * - Create: sets dealer + name (+ active)
 * - Update: loads by id with sessionToken and updates fields
 */
export async function upsertBrand(input: UpsertBrandInput) {
  const Parse = getParse();
  const user = await Parse.User.currentAsync();
  if (!user) throw new Error("Not authenticated");

  const sessionToken = getToken(user);
  const Brand = Parse.Object.extend("Brand");

  if (input.id) {
    // Update existing
    const obj = await new Parse.Query(Brand).get(input.id, { sessionToken });
    obj.set("name", input.name);
    if (typeof input.active === "boolean") obj.set("active", input.active);
    await obj.save(null, { sessionToken });
    return;
  }

  // Create new
  const obj = new Brand();
  const dealer = getUserDealerOrThrow(user, input.dealerId);
  obj.set("dealer", dealer); // ✅ dealer ownership
  obj.set("name", input.name);
  if (typeof input.active === "boolean") obj.set("active", input.active);
  await obj.save(null, { sessionToken });
}

/**
 * Create/update Setting under a dealer.
 * - Create: sets dealer + type + name (+ order/active)
 * - Update: loads by id with sessionToken and updates fields
 */
export async function upsertSetting(type: string, input: UpsertSettingInput) {
  const Parse = getParse();
  const user = await Parse.User.currentAsync();
  if (!user) throw new Error("Not authenticated");

  const sessionToken = getToken(user);
  const Setting = Parse.Object.extend("Setting");

  if (input.id) {
    // Update existing
    const obj = await new Parse.Query(Setting).get(input.id, { sessionToken });
    obj.set("name", input.name);
    if (typeof input.order === "number") obj.set("order", input.order);
    if (typeof input.active === "boolean") obj.set("active", input.active);
    await obj.save(null, { sessionToken });
    return;
  }

  // Create new
  const obj = new Setting();
  const dealer = getUserDealerOrThrow(user, input.dealerId);
  obj.set("dealer", dealer); // ✅ dealer ownership
  obj.set("type", type);
  obj.set("name", input.name);
  if (typeof input.order === "number") obj.set("order", input.order);
  if (typeof input.active === "boolean") obj.set("active", input.active);
  await obj.save(null, { sessionToken });
}
