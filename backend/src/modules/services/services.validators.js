const { z } = require('zod');

const purchaseSchema = z.object({
  serviceCode: z.string().min(1, 'Service code is required'),
  amount: z.number().positive('Amount must be greater than zero').optional(),
  inputPayload: z.record(z.any()).refine((val) => Object.keys(val).length > 0, {
    message: 'At least one input field is required'
  })
});

module.exports = { purchaseSchema };
