// lib/settingsUpserts.ts
import { getParse } from "../lib/parseClient";

type UpsertBrandInput = { id?: string; name: string; active?: boolean };
type UpsertSettingInput = {
  id?: string;
  name: string;
  order?: number;
  active?: boolean;
};

// helper to normalize token to the exact type Parse expects
const getToken = (user: any): string | undefined =>
  (user?.getSessionToken?.() ?? undefined) as string | undefined;

export async function upsertBrand(input: UpsertBrandInput) {
  const Parse = getParse();
  const user = await Parse.User.currentAsync();
  if (!user) throw new Error("Not authenticated");

  const sessionToken = getToken(user); // <-- normalize null -> undefined
  const Brand = Parse.Object.extend("Brand");

  const obj = input.id
    ? await new Parse.Query(Brand).get(input.id, { sessionToken })
    : new Brand();

  if (!input.id) obj.set("owner", user);
  obj.set("name", input.name);
  if (typeof input.active === "boolean") obj.set("active", input.active);

  await obj.save(null, { sessionToken });
}

export async function upsertSetting(type: string, input: UpsertSettingInput) {
  const Parse = getParse();
  const user = await Parse.User.currentAsync();
  if (!user) throw new Error("Not authenticated");

  const sessionToken = getToken(user); // <-- normalize here too
  const Setting = Parse.Object.extend("Setting");

  const obj = input.id
    ? await new Parse.Query(Setting).get(input.id, { sessionToken })
    : new Setting();

  if (!input.id) {
    obj.set("owner", user);
    obj.set("type", type);
  }
  obj.set("name", input.name);
  if (typeof input.order === "number") obj.set("order", input.order);
  if (typeof input.active === "boolean") obj.set("active", input.active);

  await obj.save(null, { sessionToken });
}
