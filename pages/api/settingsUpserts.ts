// pages/api/settingsUpserts.ts
import { getParse } from "../../lib/parseClient";

type UpsertBrandInput = {
  id?: string;
  name: string;
  active?: boolean;
};

type UpsertSettingInput = {
  id?: string;
  name: string;
  order?: number;
  active?: boolean;
};

/**
 * Upsert Brand by id (if provided) or create new. Scopes to current user.
 */
export async function upsertBrand(input: UpsertBrandInput) {
  const Parse = getParse();
  const user = await Parse.User.currentAsync();
  if (!user) throw new Error("Not authenticated");

  const sessionToken = user.getSessionToken?.();
  const Brand = Parse.Object.extend("Brand");

  let obj: Parse.Object;

  if (input.id) {
    // update existing
    obj = await new Parse.Query(Brand).get(input.id, { sessionToken });
  } else {
    // create new
    obj = new Brand();
    obj.set("owner", user);
  }

  obj.set("name", input.name);
  if (typeof input.active === "boolean") obj.set("active", input.active);

  await obj.save(null, { sessionToken });
}

/**
 * Upsert Setting by id (if provided) or create new. Scopes to current user + type.
 * @param type one of your Setting "type" values (e.g., 'feeItem', 'maintenanceShop', ...)
 */
export async function upsertSetting(type: string, input: UpsertSettingInput) {
  const Parse = getParse();
  const user = await Parse.User.currentAsync();
  if (!user) throw new Error("Not authenticated");

  const sessionToken = user.getSessionToken?.();
  const Setting = Parse.Object.extend("Setting");

  let obj: Parse.Object;

  if (input.id) {
    // update existing row by id
    obj = await new Parse.Query(Setting).get(input.id, { sessionToken });
  } else {
    // create new
    obj = new Setting();
    obj.set("owner", user);
    obj.set("type", type);
  }

  obj.set("name", input.name);
  if (typeof input.order === "number") obj.set("order", input.order);
  if (typeof input.active === "boolean") obj.set("active", input.active);

  await obj.save(null, { sessionToken });
}
