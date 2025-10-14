// /lib/parseClient.ts
let ParseLib: any;
if (typeof window !== "undefined") {
  // Force browser build on the client
  ParseLib = require("parse/dist/parse.min.js");
} else {
  // Node build on SSR/API
  ParseLib = require("parse/node");
}
const Parse = ParseLib.default ?? ParseLib;

const APP_ID = process.env.NEXT_PUBLIC_PARSE_APP_ID!;
const JS_KEY = process.env.NEXT_PUBLIC_PARSE_JS_KEY!;
const SERVER_URL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL!; // e.g. https://parseapi.back4app.com

if (!APP_ID || !JS_KEY || !SERVER_URL) {
  // Fail fast in prod so we don’t silently call /login on our own site
  throw new Error(
    `[Parse init] Missing envs. ` +
      `APP_ID=${!!APP_ID} JS_KEY=${!!JS_KEY} SERVER_URL=${
        SERVER_URL || "(empty)"
      }`
  );
}

if (!Parse.applicationId) {
  Parse.initialize(APP_ID, JS_KEY);
  Parse.serverURL = SERVER_URL;
  if (process.env.NODE_ENV === "production") {
    console.log("[Parse] serverURL:", Parse.serverURL);
  }
}

export { APP_ID, JS_KEY, SERVER_URL };
export default Parse;
