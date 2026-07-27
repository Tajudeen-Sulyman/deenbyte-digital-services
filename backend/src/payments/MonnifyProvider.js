const PaymentProvider = require('./PaymentProvider');
const env = require('../config/env');
const logger = require('../config/logger');

/**
 * Monnify adapter. Implements the full contract using Monnify's REST API.
 * Docs: https://developers.monnify.com/api/
 */
class MonnifyProvider extends PaymentProvider {
  constructor() {
    super();
    this.apiKey = env.payment.monnify.apiKey;
    this.secretKey = env.payment.monnify.secretKey;
    this.contractCode = env.payment.monnify.contractCode;
    this.baseUrl = env.payment.monnify.baseUrl;
    this._token = null;
    this._tokenExpiry = 0;
  }

  async _getAccessToken() {
    if (this._token && Date.now() < this._tokenExpiry) return this._token;

    const credentials = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString('base64');
    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { Authorization: `Basic ${credentials}`, 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    if (!response.ok || !data.requestSuccessful) {
      logger.error('Monnify auth failed', { data });
      throw new Error('Failed to authenticate with Monnify');
    }
    this._token = data.responseBody.accessToken;
    this._tokenExpiry = Date.now() + 55 * 60 * 1000;
    return this._token;
  }

  async initializePayment({ amount, email, reference, metadata = {} }) {
    const token = await this._getAccessToken();
    const response = await fetch(`${this.baseUrl}/api/v1/merchant/transactions/init-transaction`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        customerName: metadata.fullName || email,
        customerEmail: email,
        paymentReference: reference,
        paymentDescription: 'Wallet funding - DeenByte',
        currencyCode: 'NGN',
        contractCode: this.contractCode,
        redirectUrl: `${env.clientUrl}/wallet/fund/callback`,
        metaData: metadata
      })
    });
    const data = await response.json();
    if (!response.ok || !data.requestSuccessful) {
      logger.error('Monnify initializePayment failed', { data });
      throw new Error(data.responseMessage || 'Failed to initialize Monnify payment');
    }
    return {
      authorizationUrl: data.responseBody.checkoutUrl,
      accessCode: data.responseBody.transactionReference,
      reference: data.responseBody.paymentReference
    };
  }

  async verifyPayment(reference) {
    const token = await this._getAccessToken();
    const response = await fetch(
      `${this.baseUrl}/api/v2/transactions/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();
    if (!response.ok) {
      logger.error('Monnify verifyPayment failed', { data });
      throw new Error(data.responseMessage || 'Failed to verify Monnify payment');
    }
    const body = data.responseBody;
    let status = 'pending';
    if (body.paymentStatus === 'PAID') status = 'success';
    else if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(body.paymentStatus)) status = 'failed';

    return { status, amount: body.amountPaid, currency: 'NGN', reference: body.paymentReference, raw: body };
  }

  async refundPayment({ reference, amount }) {
    const token = await this._getAccessToken();
    const response = await fetch(`${this.baseUrl}/api/v1/refunds/initiate-refund`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionReference: reference,
        refundAmount: amount,
        refundReason: 'Customer requested refund'
      })
    });
    const data = await response.json();
    if (!response.ok || !data.requestSuccessful) {
      logger.error('Monnify refundPayment failed', { data });
      throw new Error(data.responseMessage || 'Failed to process Monnify refund');
    }
    return { status: data.responseBody.refundStatus || 'processed', raw: data.responseBody };
  }

  async webhook(rawBody, _headers) {
    // Monnify signs webhooks with a transaction hash computed from clientKey/secretKey + payload.
    // Implement per https://developers.monnify.com/docs/webhooks when credentials are live.
    const event = JSON.parse(rawBody.toString());
    const status = event.eventData?.paymentStatus === 'PAID' ? 'success' : 'failed';
    return {
      event: event.eventType,
      reference: event.eventData?.paymentReference,
      status,
      amount: event.eventData?.amountPaid,
      raw: event
    };
  }
}

module.exports = MonnifyProvider;
