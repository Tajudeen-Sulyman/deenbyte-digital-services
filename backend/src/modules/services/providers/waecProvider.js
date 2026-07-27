const BaseServiceProvider = require('./BaseServiceProvider');
const env = require('../../../config/env');
const logger = require('../../../config/logger');

/**
 * WAEC Result Checker PIN adapter. Plug real vendor endpoint/params once credentials are issued.
 */
class WaecProvider extends BaseServiceProvider {
  constructor() {
    super();
    this.baseUrl = env.services.waec.baseUrl;
    this.apiKey = env.services.waec.apiKey;
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
      logger.error(`WAEC Result Checker PIN provider purchase failed: ${err.message}`);
      return { success: false, providerRef: null, token: null, raw: { error: err.message } };
    }
  }
}

module.exports = WaecProvider;
