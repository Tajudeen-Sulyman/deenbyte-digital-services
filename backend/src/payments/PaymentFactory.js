const env = require('../config/env');
const PaystackProvider = require('./PaystackProvider');
const MonnifyProvider = require('./MonnifyProvider');
const FlutterwaveProvider = require('./FlutterwaveProvider');
const StripeProvider = require('./StripeProvider');

/**
 * PaymentFactory - single source of truth for which payment gateway is active.
 * Switching providers requires ONLY changing PAYMENT_PROVIDER in .env — no code changes.
 */
const registry = {
  paystack: PaystackProvider,
  monnify: MonnifyProvider,
  flutterwave: FlutterwaveProvider,
  stripe: StripeProvider
};

let cachedInstance = null;
let cachedProviderName = null;

function getPaymentProvider() {
  const providerName = env.payment.activeProvider;

  if (cachedInstance && cachedProviderName === providerName) {
    return cachedInstance;
  }

  const ProviderClass = registry[providerName];
  if (!ProviderClass) {
    throw new Error(
      `Unknown PAYMENT_PROVIDER "${providerName}". Valid options: ${Object.keys(registry).join(', ')}`
    );
  }

  cachedInstance = new ProviderClass();
  cachedProviderName = providerName;
  return cachedInstance;
}

/** Get a specific provider by name (used e.g. to route a webhook regardless of the currently active provider). */
function getProviderByName(name) {
  const ProviderClass = registry[name];
  if (!ProviderClass) throw new Error(`Unknown payment provider "${name}"`);
  return new ProviderClass();
}

module.exports = { getPaymentProvider, getProviderByName };
