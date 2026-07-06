import crypto from 'crypto';

const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET || process.env.MERCADO_PAGO_WEBHOOK_SECRET || '';

/**
 * Validate the X-Signature header from Mercado Pago webhook.
 * Mercado Pago sends the signature in the format: id;timestamp;secret
 * where secret = HMAC-SHA256(id + ";" + timestamp, webhook_secret)
 */
export function validateMercadoPagoSignature(
  signature: string | null,
  body: string
): boolean {
  if (!signature || !MP_WEBHOOK_SECRET) {
    console.warn('[MercadoPago] Missing signature or webhook secret');
    return false;
  }

  try {
    const parts = signature.split(';');
    if (parts.length !== 3) {
      console.warn('[MercadoPago] Invalid signature format');
      return false;
    }

    const [, timestamp, expectedSignature] = parts;

    // Mercado Pago requires that the timestamp is not older than 5 minutes
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 5 * 60;
    const webhookTimestamp = parseInt(timestamp, 10);

    if (isNaN(webhookTimestamp) || webhookTimestamp < fiveMinutesAgo) {
      console.warn('[MercadoPago] Webhook timestamp is too old');
      return false;
    }

    // Compute expected signature: HMAC-SHA256(id + ";" + timestamp, secret)
    // The signature sent is the raw hex digest (without base64 encoding)
    const computedSignature = crypto
      .createHmac('sha256', MP_WEBHOOK_SECRET)
      .update(`${body}`)
      .digest('hex');

    // Compare signatures in constant time to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
  } catch (error) {
    console.error('[MercadoPago] Signature validation error:', error);
    return false;
  }
}

/**
 * Alternative validation using the X-Signature-Internal header (testing/development)
 */
export function validateMercadoPagoSignatureInternal(
  signature: string | null,
  body: string,
  webhookSecret: string
): boolean {
  if (!signature || !webhookSecret) {
    return false;
  }

  try {
    const parts = signature.split(';');
    if (parts.length !== 3) {
      return false;
    }

    const [id, timestamp, expectedSignature] = parts;

    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 5 * 60;
    const webhookTimestamp = parseInt(timestamp, 10);

    if (isNaN(webhookTimestamp) || webhookTimestamp < fiveMinutesAgo) {
      return false;
    }

    const dataToSign = `${id};${timestamp}`;
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(dataToSign)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(computedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

export interface MercadoPagoWebhookPayload {
  id: number;
  live_mode: boolean;
  type: string;
  date_created: string;
  user_id?: string;
  api_version?: string;
  action?: string;
  data?: {
    id?: string;
  };
  payment?: {
    id: number;
    status: string;
    status_detail: string;
    transaction_amount: number;
    currency: string;
    payer?: {
      email?: string;
      id?: string;
      identification?: {
        type?: string;
        number?: string;
      };
    };
    metadata?: {
      user_id?: string;
      subscription_id?: string;
    };
    point_ofInteraction?: {
      transaction_data?: {
        ticketUrl?: string;
        bankTransfer?: {
          bankInfo?: {
            payer_id?: string;
          };
        };
      };
    };
  };
  subscription?: {
    id: string;
    status: string;
    preapproval_id?: string;
    payer_id?: string;
    payer?: {
      email?: string;
      id?: string;
    };
  };
  preapproval?: {
    id: string;
    status: string;
    payer_email?: string;
    payer_id?: string;
  };
}

/**
 * Extract the user ID from webhook payload
 */
export function extractUserIdFromPayload(payload: MercadoPagoWebhookPayload): string | null {
  // Try metadata first
  if (payload.payment?.metadata?.user_id) {
    return payload.payment.metadata.user_id;
  }
  if (payload.subscription?.payer_id) {
    return payload.subscription.payer_id;
  }
  if (payload.subscription?.payer?.id) {
    return payload.subscription.payer.id;
  }
  if (payload.preapproval?.payer_id) {
    return payload.preapproval.payer_id;
  }
  if (payload.user_id) {
    return payload.user_id;
  }
  return null;
}

/**
 * Extract the payer email from webhook payload
 */
export function extractPayerEmail(payload: MercadoPagoWebhookPayload): string | null {
  if (payload.payment?.payer?.email) {
    return payload.payment.payer.email;
  }
  if (payload.subscription?.payer?.email) {
    return payload.subscription.payer.email;
  }
  if (payload.preapproval?.payer_email) {
    return payload.preapproval.payer_email;
  }
  return null;
}
