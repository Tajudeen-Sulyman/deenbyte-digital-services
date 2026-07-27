const crypto = require('crypto');
const PaymentProvider = require('./PaymentProvider');
const env = require('../config/env');
const logger = require('../config/logger');

/** Flutterwave adapter. Docs: https://developer.flutterwave.com/ */
class FlutterwaveProvider extends PaymentProvider {
  constructor() {
    super();
    this.secretKey = env.payment.flutterwave.secretKey;
    this.baseUrl = env.payment.flutterwave.baseUrl;
  }

  _headers() {
    return { Authorization: `Bearer ${this.secretKey}`, 'Content-Type': 'application/json' };
  }

  async initializePayment({ amount, email, reference, metadata = {} }) {
    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({
        tx_ref: reference,
        amount,
        currency: 'NGN',
        redirect_url: `${env.clientUrl}/wallet/fund/callback`,
        customer: { email },
        meta: metadata
      })
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      logger.error('Flutterwave initializePayment failed', { data });
      throw new Error(data.message || 'Failed to initialize Flutterwave payment');
    }
    return { authorizationUrl: data.data.link, accessCode: reference, reference };
  }

  async verifyPayment(reference) {
    const response = await fetch(
      `${this.baseUrl}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
      { headers: this._headers() }
    );
    const data = await response.json();
    if (!response.ok) {
      logger.error('Flutterwave verifyPayment failed', { data });
      throw new Error(data.message || 'Failed to verify Flutterwave payment');
    }
    const tx = data.data;
    let status = 'pending';
    if (tx.status === 'successful') status = 'success';
    else if (['failed', 'cancelled'].includes(tx.status)) status = 'failed';

    return { status, amount: tx.amount, currency: tx.currency, reference: tx.tx_ref, raw: tx };
  }

  async refundPayment({ reference, amount }) {
    // Flutterwave refunds require the numeric transaction id (fetch via verify first if only ref is known).
    const response = await fetch(`${this.baseUrl}/transactions/${reference}/refund`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(amount ? { amount } : {})
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      logger.error('Flutterwave refundPayment failed', { data });
      throw new Error(data.message || 'Failed to process Flutterwave refund');
    }
    return { status: 'processed', raw: data.data };
  }

  async webhook(rawBody, headers) {
    const signature = headers['verif-hash'];
    if (!signature || signature !== env.payment.flutterwave.webhookHash) {
      logger.warn('Invalid Flutterwave webhook signature');
      return null;
    }
    const event = JSON.parse(rawBody.toString());
    const status = event.data?.status === 'successful' ? 'success' : 'failed';
    return { event: event.event, reference: event.data?.tx_ref, status, amount: event.data?.amount, raw: event };
  }
}

module.exports = FlutterwaveProvider;
