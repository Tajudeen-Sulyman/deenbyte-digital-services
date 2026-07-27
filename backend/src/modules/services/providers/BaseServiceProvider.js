/**
 * BaseServiceProvider - contract every VTU/verification adapter must implement.
 * purchase() must return: { success: boolean, providerRef, token, raw }
 */
class BaseServiceProvider {
  async purchase(_service, _inputPayload, _order) {
    throw new Error('purchase() must be implemented by the service provider adapter');
  }
}

module.exports = BaseServiceProvider;
