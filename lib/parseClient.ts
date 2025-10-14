import Parse from "parse"; // types work because we import the typed entry

export const APP_ID = process.env.NEXT_PUBLIC_PARSE_APP_ID!;
export const JS_KEY = process.env.NEXT_PUBLIC_PARSE_JS_KEY!;
export const SERVER_URL = (
  process.env.NEXT_PUBLIC_PARSE_SERVER_URL || ""
).replace(/\/$/, "");

if (!APP_ID || !JS_KEY || !SERVER_URL) {
  throw new Error(
    `[Parse init] Missing envs. APP_ID=${!!APP_ID} JS_KEY=${!!JS_KEY} SERVER_URL=${SERVER_URL}`
  );
}

if (!Parse.applicationId) {
  Parse.initialize(APP_ID, JS_KEY);
  Parse.serverURL = SERVER_URL;
  if (process.env.NODE_ENV === "production") {
    // eslint-disable-next-line no-console
    console.log("[Parse] serverURL:", Parse.serverURL);
  }
}

export default Parse;
