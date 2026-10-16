// WalletMV: "Delete my account" (Settings → Delete my account).
// Deletes the signed-in person's WalletMV records, then their login.
// The login is kept if the same person also has Laari data in this Supabase project (both apps share sign-in),
// so deleting WalletMV never wipes someone's Laari account.
// Runs with the project's built-in service role key; no secrets are stored in this file.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED = [
  /^https:\/\/(www\.)?walletmv\.com$/,
  /^https:\/\/walletmv-[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];
const WALLETMV_TABLES = [
  "walletmv_transactions", // before walletmv_accounts (it points to accounts)
  "walletmv_accounts",
  "walletmv_grocery_lists",
  "walletmv_settings",
  "walletmv_app_state",
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
  const { data: who, error: whoErr } = await admin.auth.getUser(jwt);
  const user = who?.user;
  if (whoErr || !user) return reply({ ok: false, error: "Not signed in" }, 401);

  for (const table of WALLETMV_TABLES) {
    const { error } = await admin.from(table).delete().eq("user_id", user.id);
    if (error) return reply({ ok: false, error: "Could not delete " + table }, 500);
  }

  const { data: laari, error: laariErr } = await admin.from("laari_state").select("user_id").eq("user_id", user.id).maybeSingle();
  if (laariErr) return reply({ ok: false, error: "Could not check other apps" }, 500);
  if (laari) return reply({ ok: true, loginKept: true });

  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return reply({ ok: false, error: "Could not delete login" }, 500);
  return reply({ ok: true, loginKept: false });
});
