import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';

export interface SubscriptionLinkParams {
  userId: string;
  userEmail: string;
  planName?: string;
  planDescription?: string;
  amount?: number;
  currency?: string;
  frequency?: number;
  frequencyUnit?: 'months' | 'days' | 'weeks';
  backUrl?: string;
}

export interface SubscriptionLinkResult {
  success: boolean;
  initPoint?: string;
  sandboxInitPoint?: string;
  preapprovalId?: string;
  error?: string;
}

interface PreApprovalResponse {
  id?: string;
  status?: string;
  init_point?: string;
  sandbox_init_point?: string;
  [key: string]: unknown;
}

/**
 * Create a Mercado Pago pre-approval subscription link
 */
export async function createSubscriptionLink(
  params: SubscriptionLinkParams
): Promise<SubscriptionLinkResult> {
  if (!MP_ACCESS_TOKEN) {
    console.error('[MercadoPago] Missing MP_ACCESS_TOKEN');
    return { success: false, error: 'Mercado Pago not configured' };
  }

  const {
    userId,
    userEmail,
    planName = 'pCifras Premium',
    amount = 19.9,
    currency = 'BRL',
    frequency = 1,
    frequencyUnit = 'months',
    backUrl = `${process.env.PUBLIC_URL || 'http://localhost:5173'}/planos`,
  } = params;

  const client = new MercadoPagoConfig({
    accessToken: MP_ACCESS_TOKEN,
    options: { timeout: 10000 },
  });

  const preApproval = new PreApproval(client);

  try {
    const response = await preApproval.create({
      body: {
        payer_email: userEmail,
        back_url: backUrl,
        reason: planName,
        external_reference: userId,
        auto_recurring: {
          frequency: frequency,
          frequency_type: frequencyUnit,
          transaction_amount: amount,
          currency_id: currency,
        },
      },
    }) as unknown as PreApprovalResponse;

    // Handle both sandbox and production environments
    const initPoint = response.init_point || response.sandbox_init_point;
    const sandboxInitPoint = response.sandbox_init_point;

    if (!initPoint) {
      console.error('[MercadoPago] No init_point in response:', JSON.stringify(response));
      return { success: false, error: 'Failed to create subscription link' };
    }

    return {
      success: true,
      initPoint,
      sandboxInitPoint,
      preapprovalId: response.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[MercadoPago] Error creating subscription:', message);
    return { success: false, error: message };
  }
}

/**
 * Get subscription status from Mercado Pago
 */
export async function getSubscriptionStatus(
  preapprovalId: string
): Promise<{ success: boolean; status?: string; error?: string }> {
  if (!MP_ACCESS_TOKEN) {
    return { success: false, error: 'Mercado Pago not configured' };
  }

  const client = new MercadoPagoConfig({
    accessToken: MP_ACCESS_TOKEN,
    options: { timeout: 10000 },
  });

  const preApproval = new PreApproval(client);

  try {
    const response = await preApproval.get({ id: preapprovalId }) as unknown as PreApprovalResponse;
    return {
      success: true,
      status: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

/**
 * Cancel a subscription by pausing it
 * Note: Mercado Pago PreApproval doesn't have a direct cancel method,
 * you need to pause the subscription via the API
 */
export async function cancelSubscription(
  preapprovalId: string
): Promise<{ success: boolean; error?: string }> {
  if (!MP_ACCESS_TOKEN) {
    return { success: false, error: 'Mercado Pago not configured' };
  }

  const client = new MercadoPagoConfig({
    accessToken: MP_ACCESS_TOKEN,
    options: { timeout: 10000 },
  });

  const preApproval = new PreApproval(client);

  try {
    // Use update to pause/cancel the subscription
    await preApproval.update({
      id: preapprovalId,
      body: {
        status: 'paused',
      },
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
