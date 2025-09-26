"use client";
import Parse from "parse";

let initialized = false;

export function initParse() {
  if (initialized) return Parse;
  const serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL!;
  const appId = process.env.NEXT_PUBLIC_PARSE_APP_ID!;
  const jsKey = process.env.NEXT_PUBLIC_PARSE_JS_KEY!;

  if (!serverURL || !appId || !jsKey) {
    // 在開發時期協助提醒設定
    console.warn("Missing Parse env vars. Check .env.local");
  }

  Parse.initialize(appId, jsKey);
  (Parse as any).serverURL = serverURL;
  initialized = true;
  return Parse;
}

export default Parse;
