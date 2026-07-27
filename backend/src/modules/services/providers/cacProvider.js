const BaseServiceProvider = require('./BaseServiceProvider');
const env = require('../../../config/env');
const logger = require('../../../config/logger');

/**
 * CAC Business Registration adapter. Plug real vendor endpoint/params once credentials are issued.
 */
class CacProvider extends BaseServiceProvider {
  constructor() {
    super();
    this.baseUrl = env.services.cac.baseUrl;
    this.apiKey = env.services.cac.apiKey;
  }

  async purchase(service, inputPayload, order) {
    try {
      const response = await fetch(`${this.baseUrl}/verify`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: order.reference, ...inputPayload })
      });
      const data = await response.json();

      if (!response.ok || data.status === 'failed') {
        return { success: false, providerRef: data.reference || null, token: null, raw: data };
      }

      return {
        success: true,
        providerRef: data.reference || data.transactionId || null,
        token: data.pin || data.token || null,
        raw: data
      };
    } catch (err) {
      logger.error(`CAC Business Registration provider purchase failed: ${err.message}`);
      return { success: false, providerRef: null, token: null, raw: { error: err.message } };
    }
  }
}

module.exports = CacProvider;
