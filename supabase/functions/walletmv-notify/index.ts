// WalletMV owner alerts: sends a phone notification (ntfy app) to the owner when
//  - a customer sends a payment ("payment"),
//  - a new customer signs up with Google / Gmail ("signin"),
//  - a customer reports a problem ("problem").
// The ntfy topic lives only in the Supabase secret NTFY_TOPIC — never in this file.
// Each event is checked on the server (it must belong to the signed-in customer and be new),
// and is sent once only, so nobody can use this to spam the owner.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED = [
  /^https:\/\/(www\.)?walletmv\.com$/,
  /^https:\/\/walletmv[a-z0-9-]*\.vercel\.app$/,
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
const PLAN: Record<string, string> = { veli: "Veli", starter: "Boli", plus: "Muraka", family: "Atholhu", mvshop: "Dhoni", mvtax: "MVTAX" };
const clip = (v: unknown, n = 120) => String(v ?? "").replace(/[\r\n]+/g, " ").slice(0, n);

async function push(title: string, message: string, tags: string, priority = "high") {
  const topic = Deno.env.get("NTFY_TOPIC");
  if (!topic) return false;
  const r = await fetch("https://ntfy.sh/" + encodeURIComponent(topic), {
    method: "POST",
    body: message,
    headers: { "Title": title, "Tags": tags, "Priority": priority, "Click": "https://walletmv.com/?staff=1" },
  });
  return r.ok;
}

Deno.serve(async (req: Request) => {
  const h = headersFor(req.headers.get("Origin"));
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: h });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return reply({ ok: false }, 405);

  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: who } = await admin.auth.getUser(jwt);
  const me = who?.user;
  if (!me) return reply({ ok: false }, 401);

  let body: { kind?: string; id?: string; ref?: string } = {};
  try { body = await req.json(); } catch { /* empty */ }
  const kind = String(body.kind || "");
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  if (kind === "payment") {
    const id = String(body.id || "");
    if (!/^[0-9a-f-]{36}$/.test(id)) return reply({ ok: false }, 400);
    // Claim it once: only a new, pending request that belongs to this customer.
    const { data: row } = await admin.from("walletmv_payment_requests")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", id).eq("user_id", me.id).eq("status", "pending").is("notified_at", null).gte("created_at", since)
      .select("plan,period,amount,method_name,method,reference,email,name,slip_path").maybeSingle();
    if (!row) return reply({ ok: true, sent: false });
    const sent = await push(
      `Payment waiting: ${PLAN[row.plan] || row.plan} · MVR ${Number(row.amount).toLocaleString("en-GB")}`,
      `${clip(row.name) || "Customer"} (${clip(row.email, 200)})\n${clip(row.method_name || row.method)} · ref ${clip(row.reference) || "—"}${row.period === "year" ? " · yearly" : ""}\n${row.slip_path ? "Slip attached." : "No slip."} Check your bank, then approve in the staff area.`,
      "moneybag",
    );
    return reply({ ok: true, sent });
  }

  if (kind === "problem") {
    const ref = String(body.ref || "");
    if (!/^ISS-\d{4,10}$/.test(ref)) return reply({ ok: false }, 400);
    const { data: row } = await admin.from("walletmv_problem_reports")
      .update({ notified_at: new Date().toISOString() })
      .eq("ref", ref).eq("user_id", me.id).is("notified_at", null).gte("created_at", since)
      .select("category,message,page,email,name").maybeSingle();
    if (!row) return reply({ ok: true, sent: false });
    const sent = await push(`Problem ${ref}: ${clip(row.category, 60)}`, `${clip(row.name) || "Customer"} (${clip(row.email, 200)}) on ${clip(row.page, 60)}\n${clip(row.message, 600)}`, "warning");
    return reply({ ok: true, sent });
  }

  if (kind === "signin") {
    const providers = ((me.app_metadata?.providers as string[]) || [me.app_metadata?.provider as string]).filter(Boolean);
    const isNew = !!me.created_at && Date.now() - new Date(me.created_at).getTime() < 24 * 3600 * 1000;
    if (!providers.includes("google") || !isNew || me.app_metadata?.walletmv_signup_alert) return reply({ ok: true, sent: false });
    await admin.auth.admin.updateUserById(me.id, { app_metadata: { ...me.app_metadata, walletmv_signup_alert: true } });
    const name = clip((me.user_metadata?.full_name as string) || "");
    const sent = await push("New customer signed in with Gmail", `${name ? name + " · " : ""}${clip(me.email, 200)}`, "wave", "default");
    return reply({ ok: true, sent });
  }
  return reply({ ok: false }, 400);
});
