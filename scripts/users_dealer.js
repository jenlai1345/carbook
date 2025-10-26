/* cloud/users_dealer.js */
/* eslint-disable no-undef */

// ---------- Helpers ----------
function ptr(className, objectId) {
  return { __type: "Pointer", className, objectId };
}

async function resolveDealer(req) {
  const { user, params = {} } = req;
  if (!user) throw new Parse.Error(Parse.Error.SCRIPT_FAILED, "Not logged in");

  // 1) Prefer explicit dealerId from params (supports multiple shapes)
  const dealerId =
    params.dealerId || params.dealer?.id || params.dealerIdRaw;
  if (dealerId) {
    return Parse.Object.extend("Dealer").createWithoutData(String(dealerId));
  }

  const me = await user.fetch({ useMasterKey: true });
  const dealer = me.get("dealer");

  if (dealer && dealer.id) {
    return dealer;
  }

  throw new Parse.Error(
    Parse.Error.SCRIPT_FAILED,
    "This user has no dealer bound"
  );
}

function assertLogin(req) {
  if (!req.user) throw new Error("Not logged in");
}
function assertAdmin(req) {
  assertLogin(req);
  const isAdmin = !!req.user.get("isAdmin");
  if (!isAdmin) throw new Error("Permission denied");
}

async function listActiveSessions(user) {
  const now = new Date();
  const Session = Parse.Object.extend("_Session");
  const q = new Parse.Query(Session);
  q.equalTo("user", user);
  q.greaterThan("expiresAt", now);
  q.ascending("createdAt");
  q.limit(1000);
  return await q.find({ useMasterKey: true });
}

async function destroyAllSessions(user) {
  const sessions = await listActiveSessions(user);
  if (sessions.length) {
    await Parse.Object.destroyAll(sessions, { useMasterKey: true });
  }
}

function userToDTO(u, deviceCount = 0) {
  return {
    objectId: u.id,
    email: u.get("email") ?? u.get("username") ?? "",
    username: u.get("username") ?? "",
    name: u.get("name") ?? "",
    isAdmin: !!u.get("isAdmin"),
    deviceLimit: Number(u.get("deviceLimit") ?? 1),
    deviceCount,
    lastLoginAt: u.get("lastLoginAt") ?? null,
    isActive: u.get("isActive") !== false,
  };
}

// ---------- Functions (replace members_* with users_* to reflect _User) ----------

/** List users in my dealer (admin/owner by default; relax if needed) */
Parse.Cloud.define("users_list", async (req) => {
  assertAdmin(req);
  const dealer = await resolveDealer(req);
  const q = new Parse.Query(Parse.User);
  q.equalTo("dealer", dealer);
  q.ascending("name").limit(1000);
  const rows = await q.find({ useMasterKey: true });
  const out = [];
  for (const u of rows) {
    const sessions = await listActiveSessions(u);
    out.push(userToDTO(u, sessions.length));
  }
  return out;
});

/** Invite or create a new user under the same dealer */
Parse.Cloud.define("users_invite", async (req) => {
  assertAdmin(req); // only admins can invite/create users

  const dealer = await resolveDealer(req);
  const { email, name, isAdmin = false, deviceLimit = 1 } = req.params || {};
  if (!email || !name) throw new Error("Missing email or name");

  const username = String(email).toLowerCase();

  // Find existing by username/email
  const uQ = new Parse.Query(Parse.User);
  uQ.equalTo("username", username);
  let u = await uQ.first({ useMasterKey: true });

  if (u) {
    // must be in the same dealer
    const sameDealer = u.get("dealer")?.id === dealer.id;
    if (!sameDealer) throw new Error("User exists under a different dealer");

    // revive/update fields
    u.set("name", name);
    u.set("isAdmin", !!isAdmin); // ✅ boolean admin flag
    u.set("deviceLimit", Math.max(1, Number(deviceLimit || 1)));
    u.set("isActive", true);
    await u.save(null, { useMasterKey: true });
  } else {
    // create fresh
    u = new Parse.User();
    u.set("username", username);
    u.set("email", username);
    u.set("name", name);
    u.set("isAdmin", !!isAdmin); // ✅ boolean admin flag
    u.set("deviceLimit", Math.max(1, Number(deviceLimit || 1)));
    u.set("isActive", true);
    u.set("dealer", dealer);

    // random temp password; you can force reset email later
    const tempPassword = Math.random().toString(36).slice(2) + Date.now();
    u.set("password", tempPassword);
    await u.signUp(null, { useMasterKey: true });

    // optional reset email
    try {
      await Parse.User.requestPasswordReset(username, { useMasterKey: true });
    } catch (e) {
      console.log("[users_invite] password reset email not sent:", e.message);
    }
  }

  const sessions = await listActiveSessions(u);
  return userToDTO(u, sessions.length);
});

/** Update name/deviceLimit for a user in the same dealer */
Parse.Cloud.define("users_update", async (req) => {
  assertAdmin(req);

  const dealer = await resolveDealer(req);
  const { objectId, name, isAdmin = false, deviceLimit } = req.params || {};
  if (!objectId) throw new Error("Missing objectId");

  const u = await new Parse.Query(Parse.User).get(objectId, {
    useMasterKey: true,
  });
  if (u.get("dealer")?.id !== dealer.id)
    throw new Error("Cross-dealer update not allowed");

  if (name != null) u.set("name", String(name));
  u.set("isAdmin", !!isAdmin); // ✅ boolean admin flag
  if (deviceLimit != null)
    u.set("deviceLimit", Math.max(1, Number(deviceLimit)));
  await u.save(null, { useMasterKey: true });

  const sessions = await listActiveSessions(u);
  return userToDTO(u, sessions.length);
});

/** Enable/disable a user (and force logout on disable) */
Parse.Cloud.define("users_toggleActive", async (req) => {
  assertAdmin(req);

  const dealer = await resolveDealer(req);
  const { objectId, isActive } = req.params || {};
  if (!objectId || typeof isActive !== "boolean")
    throw new Error("Missing parameters");

  const u = await new Parse.Query(Parse.User).get(objectId, {
    useMasterKey: true,
  });
  if (u.get("dealer")?.id !== dealer.id)
    throw new Error("Cross-dealer update not allowed");

  u.set("isActive", !!isActive);
  await u.save(null, { useMasterKey: true });

  if (!isActive) await destroyAllSessions(u);

  const sessions = await listActiveSessions(u);
  return userToDTO(u, sessions.length);
});

/** Force logout all sessions for a user */
Parse.Cloud.define("users_forceLogout", async (req) => {
  assertAdmin(req);

  const dealer = await resolveDealer(req);
  const { objectId } = req.params || {};
  if (!objectId) throw new Error("Missing objectId");

  const u = await new Parse.Query(Parse.User).get(objectId, {
    useMasterKey: true,
  });
  if (u.get("dealer")?.id !== dealer.id)
    throw new Error("Cross-dealer update not allowed");

  await destroyAllSessions(u);
  return { ok: true };
});

