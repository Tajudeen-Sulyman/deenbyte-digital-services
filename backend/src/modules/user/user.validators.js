const { z } = require('zod');

const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().datetime().optional().or(z.literal('')),
  gender: z.enum(['male', 'female', 'other']).optional()
});

module.exports = { updateProfileSchema };
