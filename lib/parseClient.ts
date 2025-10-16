// /lib/parseClient.ts
import Parse from "parse"; // types OK; client bundle will use browser build via webpack alias

// Expose values (may be empty on the server)
export const APP_ID = process.env.NEXT_PUBLIC_PARSE_APP_ID || "";
export const JS_KEY = process.env.NEXT_PUBLIC_PARSE_JS_KEY || "";
export const SERVER_URL = (
  process.env.NEXT_PUBLIC_PARSE_SERVER_URL || ""
).replace(/\/$/, "");

// Lazy, client-only initialization
let inited = false;

export function getParse() {
  // Do not initialize on the server (SSR). We only need Parse in the browser.
  if (typeof window === "undefined") return Parse;

  if (!inited && !Parse.applicationId) {
    if (!APP_ID || !JS_KEY || !SERVER_URL) {
      // Don’t throw during SSR; but in browser we want a clear diagnostic.
      // Use console.error instead of throwing to avoid hard crash of the page shell.
      // You can switch to `throw new Error(...)` if you prefer hard fail in browser.
      // eslint-disable-next-line no-console
      console.error(
        `[Parse init] Missing envs. APP_ID=${!!APP_ID} JS_KEY=${!!JS_KEY} SERVER_URL=${SERVER_URL}`
      );
    } else {
      Parse.initialize(APP_ID, JS_KEY);
      Parse.serverURL = SERVER_URL;
      if (process.env.NODE_ENV === "production") {
        // eslint-disable-next-line no-console
        console.log("[Parse] serverURL:", Parse.serverURL);
      }
    }
    inited = true;
  }

  return Parse;
}

const InitializedParse = getParse();
export default InitializedParse;
