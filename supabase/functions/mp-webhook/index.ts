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

    // Verify Mercado Pago webhook signature (HMAC-SHA256).
    // Docs: https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks
    const webhookSecret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
    if (webhookSecret) {
      const sigHeader = req.headers.get("x-signature") || "";
      const requestId = req.headers.get("x-request-id") || "";
      const dataIdForSig =
        url.searchParams.get("data.id") ||
        url.searchParams.get("id") ||
        body?.data?.id ||
        body?.id ||
        "";

      // x-signature is a CSV like "ts=1700000000,v1=abcdef..."
      const parts = Object.fromEntries(
        sigHeader.split(",").map((p) => {
          const [k, ...rest] = p.trim().split("=");
          return [k, rest.join("=")];
        }),
      ) as Record<string, string>;
      const ts = parts["ts"];
      const v1 = parts["v1"];

      if (!ts || !v1) {
        console.warn("mp-webhook: missing x-signature parts");
        return new Response("Invalid signature", { status: 401 });
      }

      const manifest = `id:${dataIdForSig};request-id:${requestId};ts:${ts};`;
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sigBuf = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(manifest),
      );
      const expected = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Timing-safe compare
      let ok = expected.length === v1.length;
      for (let i = 0; i < expected.length && i < v1.length; i++) {
        ok = (expected.charCodeAt(i) === v1.charCodeAt(i)) && ok;
      }
      if (!ok) {
        console.warn("mp-webhook: invalid signature");
        return new Response("Invalid signature", { status: 401 });
      }
    } else {
      console.warn(
        "mp-webhook: MERCADO_PAGO_WEBHOOK_SECRET not set — skipping signature verification. " +
        "Set this secret to the value from the Mercado Pago webhook config to enforce verification.",
      );
    }



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
