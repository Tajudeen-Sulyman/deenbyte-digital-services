const crypto = require('crypto');
const PaymentProvider = require('./PaymentProvider');
const env = require('../config/env');
const logger = require('../config/logger');

/** Stripe adapter using raw REST calls (no SDK dependency required). Docs: https://stripe.com/docs/api */
class StripeProvider extends PaymentProvider {
  constructor() {
    super();
    this.secretKey = env.payment.stripe.secretKey;
    this.baseUrl = 'https://api.stripe.com/v1';
  }

  _headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  async initializePayment({ amount, email, reference, metadata = {} }) {
    const params = new URLSearchParams();
    params.append('mode', 'payment');
    params.append('success_url', `${env.clientUrl}/wallet/fund/callback?ref=${reference}`);
    params.append('cancel_url', `${env.clientUrl}/wallet/fund/callback?ref=${reference}&cancelled=true`);
    params.append('customer_email', email);
    params.append('client_reference_id', reference);
    params.append('line_items[0][price_data][currency]', 'usd');
    params.append('line_items[0][price_data][product_data][name]', 'Wallet Funding - DeenByte');
    params.append('line_items[0][price_data][unit_amount]', Math.round(amount * 100));
    params.append('line_items[0][quantity]', '1');
    Object.entries(metadata).forEach(([k, v]) => params.append(`metadata[${k}]`, String(v)));

    const response = await fetch(`${this.baseUrl}/checkout/sessions`, {
      method: 'POST',
      headers: this._headers(),
      body: params
    });
    const data = await response.json();
    if (!response.ok) {
      logger.error('Stripe initializePayment failed', { data });
      throw new Error(data.error?.message || 'Failed to initialize Stripe payment');
    }
    return { authorizationUrl: data.url, accessCode: data.id, reference };
  }

  async verifyPayment(reference) {
    const response = await fetch(
      `${this.baseUrl}/checkout/sessions?client_reference_id=${encodeURIComponent(reference)}`,
      { headers: this._headers() }
    );
    const data = await response.json();
    if (!response.ok) {
      logger.error('Stripe verifyPayment failed', { data });
      throw new Error(data.error?.message || 'Failed to verify Stripe payment');
    }
    const session = data.data?.[0];
    if (!session) return { status: 'pending', amount: null, currency: 'usd', reference, raw: null };

    let status = 'pending';
    if (session.payment_status === 'paid') status = 'success';
    else if (session.status === 'expired') status = 'failed';

    return { status, amount: session.amount_total / 100, currency: session.currency, reference, raw: session };
  }

  async refundPayment({ reference, amount }) {
    const params = new URLSearchParams();
    params.append('payment_intent', reference);
    if (amount) params.append('amount', Math.round(amount * 100));

    const response = await fetch(`${this.baseUrl}/refunds`, {
      method: 'POST',
      headers: this._headers(),
      body: params
    });
    const data = await response.json();
    if (!response.ok) {
      logger.error('Stripe refundPayment failed', { data });
      throw new Error(data.error?.message || 'Failed to process Stripe refund');
    }
    return { status: data.status, raw: data };
  }

  async webhook(rawBody, headers) {
    const signatureHeader = headers['stripe-signature'];
    if (!signatureHeader) return null;

    const parts = Object.fromEntries(signatureHeader.split(',').map((p) => p.split('=')));
    const signedPayload = `${parts.t}.${rawBody.toString()}`;
    const expected = crypto
      .createHmac('sha256', env.payment.stripe.webhookSecret)
      .update(signedPayload)
      .digest('hex');

    if (expected !== parts.v1) {
      logger.warn('Invalid Stripe webhook signature');
      return null;
    }

    const event = JSON.parse(rawBody.toString());
    const obj = event.data?.object;
    const status = event.type === 'checkout.session.completed' ? 'success' : 'pending';

    return { event: event.type, reference: obj?.client_reference_id, status, amount: obj?.amount_total ? obj.amount_total / 100 : null, raw: event };
  }
}

module.exports = StripeProvider;
