import Parse from "@/lib/parseClient";

export async function upsertBrand(name: string) {
  const trimmed = name?.trim();
  if (!trimmed) throw new Error("Missing brand name");
  return Parse.Cloud.run("upsertBrand", { name: trimmed });
}

export async function upsertSetting(
  type: string,
  name: string,
  order?: number
) {
  const t = type?.trim();
  const n = name?.trim();
  if (!t || !n) throw new Error("Missing type/name");
  const payload: any = { type: t, name: n };
  if (typeof order === "number") payload.order = order;
  return Parse.Cloud.run("upsertSetting", payload);
}
