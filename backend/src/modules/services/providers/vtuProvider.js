const BaseServiceProvider = require('./BaseServiceProvider');
const env = require('../../../config/env');
const logger = require('../../../config/logger');

/**
 * Generic VTU adapter for Airtime, Data, Electricity, and Cable TV.
 * Dispatches to the configured VTU aggregator (e.g. VTpass, Baxi, ClubKonnect style APIs).
 * Plug real endpoint paths/params per your chosen vendor's documentation.
 */
class VtuProvider extends BaseServiceProvider {
  constructor() {
    super();
    this.baseUrl = env.services.vtu.baseUrl;
    this.apiKey = env.services.vtu.apiKey;
  }

  async purchase(service, inputPayload, order) {
    try {
      const response = await fetch(`${this.baseUrl}/purchase`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: service.category,
          serviceCode: service.code,
          reference: order.reference,
          ...inputPayload
        })
      });
      const data = await response.json();

      if (!response.ok || data.status === 'failed') {
        return { success: false, providerRef: data.reference || null, token: null, raw: data };
      }

      return {
        success: true,
        providerRef: data.reference || data.transactionId || null,
        token: data.token || data.pin || null, // electricity token, etc.
        raw: data
      };
    } catch (err) {
      logger.error(`VTU provider purchase failed: ${err.message}`);
      return { success: false, providerRef: null, token: null, raw: { error: err.message } };
    }
  }
}

module.exports = VtuProvider;
