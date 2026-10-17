// WalletMV AI helper, run through ChatGPT (OpenAI). Brought over from Laari's AI service (which used Gemini).
// Jobs: "plan_day" (suggest tasks for a day from the person's own figures), "ask" (answer a money question
// from those figures) and "status" (is ChatGPT switched on?). Signed-in WalletMV users only.
//
// Switch it on: Supabase → Edge Functions → Secrets → add OPENAI_API_KEY (and optionally OPENAI_MODEL).
// Without the key it answers { off: true } and the app uses its built-in suggestions instead.
// The key stays in Supabase; it is never sent to the browser or written in the code.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED = [
  /^https:\/\/(www\.)?walletmv\.com$/,
  /^https:\/\/walletmv-[a-z0-9-]+\.vercel\.app$/,
  /^http:\/\/localhost(:\d+)?$/,
];
const KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
const MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-5-mini";
const FALLBACK_MODEL = "gpt-4.1-mini";

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

class AiError extends Error { code = ""; status = 0; }

async function chat(model: string, system: string, user: string, json: boolean): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      max_completion_tokens: 2000,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const e = new AiError(body?.error?.message ?? `ChatGPT returned ${res.status}`);
    e.code = String(body?.error?.code ?? "");
    e.status = res.status;
    throw e;
  }
  return String(body?.choices?.[0]?.message?.content ?? "");
}

async function ask(system: string, user: string, json: boolean): Promise<string> {
  try {
    return await chat(MODEL, system, user, json);
  } catch (e) {
    const err = e as AiError;
    const modelProblem = err.code === "model_not_found" || err.status === 404 || /model/i.test(err.message);
    if (MODEL !== FALLBACK_MODEL && modelProblem) return await chat(FALLBACK_MODEL, system, user, json);
    throw e;
  }
}

const PLAN_PROMPT = `You are the daily planner inside WalletMV, a budgeting app for people in the Maldives.
Using ONLY the figures given, suggest 3 to 5 small, practical tasks for the day to plan. Focus on: paying bills that are due or overdue,
staying inside the safe-to-spend amount, adding to savings goals, logging spending and buying listed groceries.
Write each title as a short action under 60 characters in plain, friendly words, for example "Pay the electricity bill (MVR 450)".
Amounts are Maldivian rufiyaa written like "MVR 1,240". Never invent a number that is not in the figures. Never give investment, loan or tax advice.
Do not repeat tasks that are already planned for that day.
Return ONLY JSON: {"tasks":[{"title":"...","why":"one short sentence"}]}`;

const ASK_PROMPT = `You are WalletMV, a budgeting app for people in the Maldives. Answer the question using ONLY the figures given.
Amounts are Maldivian rufiyaa, written like "MVR 1,240". Two or three sentences at most, plain words, no bullet points, no headings.
If the figures don't contain the answer, say so in one sentence and suggest what the person could record to get it.
Never invent a number that is not in the figures. Never give investment, loan or tax advice.`;

Deno.serve(async (req: Request) => {
  const h = headersFor(req.headers.get("Origin"));
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: h });
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return reply({ ok: false, error: "Use POST" }, 405);

  // Signed-in people only, so nobody else can spend the ChatGPT credit.
  const jwt = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!jwt) return reply({ ok: false, error: "Not signed in" }, 401);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: who } = await admin.auth.getUser(jwt);
  if (!who?.user) return reply({ ok: false, error: "Not signed in" }, 401);

  let payload: Record<string, unknown> = {};
  try { payload = await req.json(); } catch { return reply({ ok: false, error: "Send JSON" }, 400); }
  const action = String(payload.action ?? "");

  if (action === "status") return reply({ ok: true, on: !!KEY });
  if (!KEY) return reply({ ok: false, off: true });

  const figures = String(payload.figures ?? "").slice(0, 6000);
  try {
    if (action === "plan_day") {
      const text = await ask(PLAN_PROMPT, `FIGURES:\n${figures}`, true);
      let parsed: { tasks?: Array<{ title?: unknown; why?: unknown }> } = {};
      try { parsed = JSON.parse(text.replace(/^```(?:json)?|```$/g, "").trim()); } catch { return reply({ ok: false, error: "Could not read the plan" }, 502); }
      const tasks = (Array.isArray(parsed.tasks) ? parsed.tasks : [])
        .map((t) => ({ title: String(t?.title ?? "").trim().slice(0, 80), why: String(t?.why ?? "").trim().slice(0, 140) }))
        .filter((t) => t.title)
        .slice(0, 5);
      return reply({ ok: true, tasks });
    }
    if (action === "ask") {
      const question = String(payload.question ?? "").slice(0, 300).trim();
      if (!question) return reply({ ok: false, error: "Ask something" }, 400);
      const answer = await ask(ASK_PROMPT, `FIGURES:\n${figures}\n\nQUESTION: ${question}`, false);
      return reply({ ok: true, answer: answer.trim().slice(0, 700) });
    }
    return reply({ ok: false, error: "Unknown action" }, 400);
  } catch (e) {
    return reply({ ok: false, error: e instanceof Error ? e.message : "Something went wrong" }, 502);
  }
});
