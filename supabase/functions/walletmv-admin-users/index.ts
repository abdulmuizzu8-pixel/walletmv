// WalletMV admin: help customers who can't log in (Admin panel → Customer logins).
// Owner only: the caller must be signed in with an email listed in walletmv_admins.
// Actions: "list" (newest logins with the email and how they signed in, e.g. Google/Gmail), "lookup" (does a login exist, is the email confirmed) and "confirm" (mark the email as confirmed).
// Password reset emails are sent from the website with the normal Supabase reset, not from here.
// Runs with the project's built-in service role key; no secrets are stored in this file.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED = [
  /^https:\/\/(www\.)?walletmv\.com$/,
  /^https:\/\/walletmv-[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];

function headersFor(origin: string | null): Record<string, string> {
  const ok = !!origin && ALLOWED.some((r) => r.test(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : "https://walletmv.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json",
  };
}

type AuthUser = { id: string; app_metadata?: { provider?: string; providers?: string[] }; email?: string; email_confirmed_at?: string | null; created_at?: string; last_sign_in_at?: string | null; user_metadata?: Record<string, unknown> };
const info = (u: AuthUser) => ({
  exists: true,
  email: u.email,
  name: (u.user_metadata?.full_name as string) || "",
  confirmed: !!u.email_confirmed_at,
  createdAt: u.created_at || null,
  lastSignIn: u.last_sign_in_at || null,
});

Deno.serve(async (req: Request) => {
  const h = headersFor(req.headers.get("Origin"));
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: h });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return reply({ ok: false, error: "Use POST" }, 405);

  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return reply({ ok: false, error: "Not signed in" }, 401);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: who } = await admin.auth.getUser(jwt);
  const me = who?.user;
  if (!me) return reply({ ok: false, error: "Not signed in" }, 401);
  const { data: owner } = await admin.from("walletmv_admins").select("email").eq("email", (me.email || "").toLowerCase()).maybeSingle();
  if (!owner) return reply({ ok: false, error: "Owner only" }, 403);

  let body: { action?: string; email?: string } = {};
  try { body = await req.json(); } catch { /* empty body */ }
  const action = String(body.action || "");
  if (action === "list") {
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    if (error) return reply({ ok: false, error: "Could not load logins" }, 500);
    const users = (data.users as AuthUser[])
      .sort((a, b) => String(b.last_sign_in_at || b.created_at || "").localeCompare(String(a.last_sign_in_at || a.created_at || "")))
      .slice(0, 100)
      .map((u) => ({ ...info(u), provider: u.app_metadata?.provider || (u.app_metadata?.providers || [])[0] || "email" }));
    return reply({ ok: true, users });
  }
  const email = String(body.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return reply({ ok: false, error: "Enter a valid email" }, 400);

  let found: AuthUser | null = null;
  for (let page = 1; page <= 20 && !found; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return reply({ ok: false, error: "Could not search logins" }, 500);
    found = (data.users as AuthUser[]).find((u) => (u.email || "").toLowerCase() === email) || null;
    if (data.users.length < 1000) break;
  }
  if (!found) return reply({ ok: true, exists: false, email });

  if (action === "lookup") return reply({ ok: true, ...info(found) });
  if (action === "confirm") {
    if (found.email_confirmed_at) return reply({ ok: true, already: true, ...info(found) });
    const { data, error } = await admin.auth.admin.updateUserById(found.id, { email_confirm: true });
    if (error || !data?.user) return reply({ ok: false, error: "Could not confirm the email" }, 500);
    return reply({ ok: true, ...info(data.user as AuthUser) });
  }
  return reply({ ok: false, error: "Unknown action" }, 400);
});
