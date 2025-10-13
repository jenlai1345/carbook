// pages/api/settingsUpserts.ts
import Parse from "@/lib/parseClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.status(405).json({ ok: false, error: "Method Not Allowed" });
    return;
  }

  try {
    // TODO: your upsert logic here; return something JSON-y
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}

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
