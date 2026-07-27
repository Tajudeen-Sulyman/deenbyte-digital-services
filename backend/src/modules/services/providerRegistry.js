const VtuProvider = require('./providers/vtuProvider');
const NimcProvider = require('./providers/nimcProvider');
const BvnProvider = require('./providers/bvnProvider');
const CacProvider = require('./providers/cacProvider');
const WaecProvider = require('./providers/waecProvider');
const NecoProvider = require('./providers/necoProvider');
const JambProvider = require('./providers/jambProvider');

/**
 * Maps the `provider` column on the Service model to the adapter that handles it.
 * Add new services by inserting a Service row and, if it's a new provider, an adapter here.
 */
const registry = {
  vtu: new VtuProvider(),
  nimc: new NimcProvider(),
  bvn: new BvnProvider(),
  cac: new CacProvider(),
  waec: new WaecProvider(),
  neco: new NecoProvider(),
  jamb: new JambProvider()
};

function getServiceProvider(providerKey) {
  const provider = registry[providerKey];
  if (!provider) throw new Error(`No service provider adapter registered for "${providerKey}"`);
  return provider;
}

module.exports = { getServiceProvider };
