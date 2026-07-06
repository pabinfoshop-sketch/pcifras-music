// Edge Function: mp-webhook
// Recebe notificações do Mercado Pago e atualiza a assinatura do usuário.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const MP_TOKEN = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function activatePremium(userId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);
  const { error } = await admin
    .from("profiles")
    .update({
      subscription_status: "premium",
      subscription_expires_at: expiresAt.toISOString(),
    })
    .eq("id", userId);
  if (error) console.error("profiles update error:", error);
  else console.log(`Premium ativado para ${userId}`);
}

async function handlePayment(paymentId: string) {
  const r = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${MP_TOKEN}` },
  });
  if (!r.ok) {
    console.error("MP payment fetch failed:", r.status, await r.text());
    return;
  }
  const p = await r.json();
  console.log("payment status:", p.status, "ext_ref:", p.external_reference);
  if (p.status === "approved" && p.external_reference) {
    await activatePremium(p.external_reference);
  }
}

async function handlePreapproval(preapprovalId: string) {
  const r = await fetch(
    `https://api.mercadopago.com/preapproval/${preapprovalId}`,
    { headers: { Authorization: `Bearer ${MP_TOKEN}` } },
  );
  if (!r.ok) {
    console.error("MP preapproval fetch failed:", r.status, await r.text());
    return;
  }
  const p = await r.json();
  console.log("preapproval status:", p.status, "ext_ref:", p.external_reference);
  if ((p.status === "authorized" || p.status === "active") && p.external_reference) {
    await activatePremium(p.external_reference);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, x-signature, x-request-id",
      },
    });
  }


  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const url = new URL(req.url);
    const rawBody = await req.text();
    let body: any = {};
    try { body = rawBody ? JSON.parse(rawBody) : {}; } catch { /* ignore */ }

    console.log("mp-webhook received:", { query: Object.fromEntries(url.searchParams), body });

    // MP envia tanto via query (?type=&data.id=) quanto via body ({type, data:{id}, topic, resource})
    const type =
      url.searchParams.get("type") ||
      url.searchParams.get("topic") ||
      body?.type ||
      body?.topic;

    const dataId =
      url.searchParams.get("data.id") ||
      url.searchParams.get("id") ||
      body?.data?.id ||
      body?.id;

    if (type === "payment" && dataId) {
      await handlePayment(String(dataId));
    } else if ((type === "preapproval" || type === "subscription_preapproval") && dataId) {
      await handlePreapproval(String(dataId));
    } else if (body?.resource && typeof body.resource === "string") {
      // formato antigo (topic + resource URL)
      const idFromUrl = body.resource.split("/").pop();
      if (body.topic === "payment" && idFromUrl) await handlePayment(idFromUrl);
      if (body.topic === "preapproval" && idFromUrl) await handlePreapproval(idFromUrl);
    } else {
      console.log("evento ignorado:", type, dataId);
    }

    // Sempre 200 para o MP não reenviar em loop.
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("mp-webhook error:", err);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
