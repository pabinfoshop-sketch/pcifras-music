import { createFileRoute } from '@tanstack/react-router';
import type { MercadoPagoWebhookPayload } from '@/lib/mercado-pago';
import { validateMercadoPagoSignatureInternal } from '@/lib/mercado-pago';
import { supabaseAdmin } from '@/integrations/supabase/client.server';
import type { Json } from '@/integrations/supabase/types';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Signature',
};

interface WebhookLogEntry {
  timestamp: string;
  event_id: string | number;
  event_type: string;
  status: string;
  user_id?: string;
  error?: string;
}

async function logWebhookEvent(entry: WebhookLogEntry): Promise<void> {
  console.log('[MercadoPago Webhook Log]', JSON.stringify(entry));
}

async function handlePaymentApproved(
  payload: MercadoPagoWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  const payment = payload.payment;
  if (!payment) {
    return { success: false, error: 'No payment data in payload' };
  }

  // Extract user_id from metadata or payer
  const userId =
    payment.metadata?.user_id ||
    payment.payer?.id ||
    payload.user_id;

  if (!userId) {
    return { success: false, error: 'No user_id found in payment data' };
  }

  try {
    // Calculate subscription expiration (1 month from now by default)
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Update user profile to premium status
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'premium',
        premium: true,
        premium_until: expiresAt.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[MercadoPago] Failed to update profile:', error);
      return { success: false, error: error.message };
    }

    // Optionally, log the payment in the payments table
    await supabaseAdmin.from('payments').insert({
      user_id: userId,
      provider: 'mercadopago',
      provider_payment_id: String(payment.id),
      kind: 'subscription',
      status: 'approved',
      amount: payment.transaction_amount,
      currency: payment.currency || 'BRL',
      raw: JSON.parse(JSON.stringify(payment)) as Json,
    });

    await logWebhookEvent({
      timestamp: new Date().toISOString(),
      event_id: payment.id,
      event_type: 'payment.approved',
      status: 'processed',
      user_id: userId,
    });

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[MercadoPago] Error processing payment:', error);
    return { success: false, error };
  }
}

async function handleSubscriptionApproved(
  payload: MercadoPagoWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  const subscription = payload.subscription;
  if (!subscription) {
    return { success: false, error: 'No subscription data in payload' };
  }

  const payerId = subscription.payer_id || subscription.payer?.id || payload.user_id;
  if (!payerId) {
    return { success: false, error: 'No payer_id found in subscription data' };
  }

  try {
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'premium',
        premium: true,
        premium_until: expiresAt.toISOString(),
        subscription_expires_at: expiresAt.toISOString(),
      })
      .eq('id', payerId);

    if (error) {
      console.error('[MercadoPago] Failed to update profile:', error);
      return { success: false, error: error.message };
    }

    await supabaseAdmin.from('subscriptions').upsert({
      user_id: payerId,
      provider: 'mercadopago',
      provider_ref: subscription.id,
      status: subscription.status,
      updated_at: new Date().toISOString(),
    });

    await logWebhookEvent({
      timestamp: new Date().toISOString(),
      event_id: subscription.id,
      event_type: 'subscription.approved',
      status: 'processed',
      user_id: payerId,
    });

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[MercadoPago] Error processing subscription:', error);
    return { success: false, error };
  }
}

async function handleSubscriptionCanceled(
  payload: MercadoPagoWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  const subscription = payload.subscription;
  if (!subscription) {
    return { success: false, error: 'No subscription data in payload' };
  }

  const payerId = subscription.payer_id || subscription.payer?.id || payload.user_id;
  if (!payerId) {
    return { success: false, error: 'No payer_id found in subscription data' };
  }

  try {
    // Set subscription as canceled but keep premium until expiration date
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'canceled',
      })
      .eq('id', payerId);

    if (error) {
      console.error('[MercadoPago] Failed to update profile:', error);
      return { success: false, error: error.message };
    }

    await supabaseAdmin.from('subscriptions').upsert({
      user_id: payerId,
      provider: 'mercadopago',
      provider_ref: subscription.id,
      status: 'canceled',
      updated_at: new Date().toISOString(),
    });

    await logWebhookEvent({
      timestamp: new Date().toISOString(),
      event_id: subscription.id,
      event_type: 'subscription.canceled',
      status: 'processed',
      user_id: payerId,
    });

    return { success: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[MercadoPago] Error processing cancellation:', error);
    return { success: false, error };
  }
}

export const Route = createFileRoute('/api/webhook/mercado-pago')({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),

      POST: async ({ request }) => {
        // Get the raw body as text for signature validation
        const rawBody = await request.text();

        // Validate webhook signature
        const webhookSecret = process.env.MP_WEBHOOK_SECRET || process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';
        const signature = request.headers.get('X-Signature');
        const signatureValid = validateMercadoPagoSignatureInternal(
          signature,
          rawBody,
          webhookSecret
        );

        // In development without secret, allow the request but log warning
        if (!webhookSecret) {
          console.warn('[MercadoPago] WARNING: No webhook secret configured. Set MP_WEBHOOK_SECRET env var.');
        } else if (!signatureValid) {
          console.error('[MercadoPago] Invalid webhook signature');
          return new Response(
            JSON.stringify({ error: 'Invalid signature' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...CORS } }
          );
        }

        // Parse the payload
        let payload: MercadoPagoWebhookPayload;
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON payload' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...CORS } }
          );
        }

        // Log incoming webhook
        console.log('[MercadoPago] Webhook received:', {
          type: payload.type,
          action: payload.action,
          payment_id: payload.payment?.id,
          subscription_id: payload.subscription?.id,
        });

        try {
          // Handle based on event type
          const eventType = payload.type;
          const action = payload.action;

          // Payment events
          if (eventType === 'payment') {
            const paymentStatus = payload.payment?.status;

            if (action === 'payment.created' || paymentStatus === 'approved') {
              const result = await handlePaymentApproved(payload);
              if (!result.success) {
                return new Response(
                  JSON.stringify({ error: result.error }),
                  { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
                );
              }
            }
            // Handle other payment statuses if needed (e.g., 'pending', 'rejected')
          }

          // Subscription events (preapproval)
          if (eventType === 'preapproval' || eventType === 'subscription') {
            const subscriptionStatus = payload.subscription?.status || payload.preapproval?.status;

            if (subscriptionStatus === 'active' || action === 'subscription.activated') {
              const result = await handleSubscriptionApproved(payload);
              if (!result.success) {
                return new Response(
                  JSON.stringify({ error: result.error }),
                  { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
                );
              }
            }

            if (subscriptionStatus === 'canceled' || action === 'subscription.canceled') {
              const result = await handleSubscriptionCanceled(payload);
              if (!result.success) {
                return new Response(
                  JSON.stringify({ error: result.error }),
                  { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
                );
              }
            }
          }

          // Return success - Mercado Pago expects 200 OK
          return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...CORS } }
          );
        } catch (err) {
          const error = err instanceof Error ? err.message : 'Unknown error';
          console.error('[MercadoPago] Error processing webhook:', error);
          await logWebhookEvent({
            timestamp: new Date().toISOString(),
            event_id: payload.id,
            event_type: payload.type || 'unknown',
            status: 'error',
            error,
          });
          return new Response(
            JSON.stringify({ error }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...CORS } }
          );
        }
      },
    },
  },
});
