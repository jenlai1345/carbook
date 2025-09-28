import Parse from "parse";

// Initialize once
if (!Parse.applicationId) {
  Parse.initialize(
    process.env.NEXT_PUBLIC_PARSE_APP_ID!,
    process.env.NEXT_PUBLIC_PARSE_JS_KEY!
  );
  (Parse as any).serverURL = process.env.NEXT_PUBLIC_PARSE_SERVER_URL!;
}

export default Parse;
