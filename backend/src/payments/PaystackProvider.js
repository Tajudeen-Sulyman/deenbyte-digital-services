const crypto = require('crypto');
const PaymentProvider = require('./PaymentProvider');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Live implementation for Paystack.
 * Docs: https://paystack.com/docs/api/
 */
class PaystackProvider extends PaymentProvider {
  constructor() {
    super();
    this.secretKey = env.payment.paystack.secretKey;
    this.baseUrl = env.payment.paystack.baseUrl;
  }

  _headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json'
    };
  }

  async initializePayment({ amount, email, reference, metadata = {} }) {
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify({
        amount: Math.round(amount * 100), // kobo
        email,
        reference,
        currency: 'NGN',
        callback_url: `${env.clientUrl}/wallet/fund/callback`,
        metadata
      })
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      logger.error('Paystack initializePayment failed', { data });
      throw new Error(data.message || 'Failed to initialize Paystack payment');
    }

    return {
      authorizationUrl: data.data.authorization_url,
      accessCode: data.data.access_code,
      reference: data.data.reference
    };
  }

  async verifyPayment(reference) {
    const response = await fetch(`${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: this._headers()
    });

    const data = await response.json();
    if (!response.ok) {
      logger.error('Paystack verifyPayment failed', { data });
      throw new Error(data.message || 'Failed to verify Paystack payment');
    }

    const tx = data.data;
    let status = 'pending';
    if (tx.status === 'success') status = 'success';
    else if (['failed', 'abandoned'].includes(tx.status)) status = 'failed';

    return {
      status,
      amount: tx.amount / 100,
      currency: tx.currency,
      reference: tx.reference,
      raw: tx
    };
  }

  async refundPayment({ reference, amount }) {
    const body = { transaction: reference };
    if (amount) body.amount = Math.round(amount * 100);

    const response = await fetch(`${this.baseUrl}/refund`, {
      method: 'POST',
      headers: this._headers(),
      body: JSON.stringify(body)
    });

    const data = await response.json();
    if (!response.ok || !data.status) {
      logger.error('Paystack refundPayment failed', { data });
      throw new Error(data.message || 'Failed to process Paystack refund');
    }

    return { status: data.data.status || 'processed', raw: data.data };
  }

  /**
   * Verifies Paystack webhook signature using HMAC SHA512 of the raw body.
   * rawBody must be the raw (unparsed) request body buffer/string.
   */
  async webhook(rawBody, headers) {
    const signature = headers['x-paystack-signature'];
    const hash = crypto.createHmac('sha512', this.secretKey).update(rawBody).digest('hex');

    if (hash !== signature) {
      logger.warn('Invalid Paystack webhook signature');
      return null;
    }

    const event = JSON.parse(rawBody.toString());
    const status = event.data?.status === 'success' ? 'success' : 'failed';

    return {
      event: event.event,
      reference: event.data?.reference,
      status,
      amount: event.data?.amount ? event.data.amount / 100 : null,
      raw: event
    };
  }
}

module.exports = PaystackProvider;
