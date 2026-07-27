/**
 * PaymentProvider - abstract interface every payment gateway adapter must implement.
 * Do NOT put gateway-specific logic anywhere outside of a class that extends this.
 *
 * Contract:
 *  - initializePayment({ amount, email, reference, metadata }) -> { authorizationUrl, accessCode, reference }
 *  - verifyPayment(reference) -> { status: 'success'|'failed'|'pending', amount, currency, reference, raw }
 *  - refundPayment({ reference, amount }) -> { status, raw }
 *  - webhook(rawBody, headers) -> { event, reference, status, amount, raw } | null if signature invalid
 */
class PaymentProvider {
  async initializePayment(_params) {
    throw new Error('initializePayment() must be implemented by the payment provider adapter');
  }

  async verifyPayment(_reference) {
    throw new Error('verifyPayment() must be implemented by the payment provider adapter');
  }

  async refundPayment(_params) {
    throw new Error('refundPayment() must be implemented by the payment provider adapter');
  }

  async webhook(_rawBody, _headers) {
    throw new Error('webhook() must be implemented by the payment provider adapter');
  }
}

module.exports = PaymentProvider;
