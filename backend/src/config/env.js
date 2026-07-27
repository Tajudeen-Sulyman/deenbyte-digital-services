require('dotenv').config();

function required(name, fallback = undefined) {
  const val = process.env[name] ?? fallback;
  return val;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  appName: process.env.APP_NAME || 'DeenByte Digital Services',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
    refreshExpiresRemember: process.env.JWT_REFRESH_EXPIRES_REMEMBER || '30d'
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'DeenByte <no-reply@deenbyte.com>'
  },

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxMb: parseInt(process.env.MAX_UPLOAD_MB || '5', 10)
  },

  payment: {
    activeProvider: process.env.PAYMENT_PROVIDER || 'paystack',
    paystack: {
      secretKey: process.env.PAYSTACK_SECRET_KEY,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      baseUrl: process.env.PAYSTACK_BASE_URL || 'https://api.paystack.co',
      webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET
    },
    monnify: {
      apiKey: process.env.MONNIFY_API_KEY,
      secretKey: process.env.MONNIFY_SECRET_KEY,
      contractCode: process.env.MONNIFY_CONTRACT_CODE,
      baseUrl: process.env.MONNIFY_BASE_URL || 'https://sandbox.monnify.com'
    },
    flutterwave: {
      secretKey: process.env.FLUTTERWAVE_SECRET_KEY,
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
      baseUrl: process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
      webhookHash: process.env.FLUTTERWAVE_WEBHOOK_HASH
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
    }
  },

  services: {
    vtu: { baseUrl: process.env.VTU_PROVIDER_BASE_URL, apiKey: process.env.VTU_PROVIDER_API_KEY },
    nimc: { baseUrl: process.env.NIMC_API_BASE_URL, apiKey: process.env.NIMC_API_KEY },
    bvn: { baseUrl: process.env.BVN_API_BASE_URL, apiKey: process.env.BVN_API_KEY },
    cac: { baseUrl: process.env.CAC_API_BASE_URL, apiKey: process.env.CAC_API_KEY },
    waec: { baseUrl: process.env.WAEC_API_BASE_URL, apiKey: process.env.WAEC_API_KEY },
    neco: { baseUrl: process.env.NECO_API_BASE_URL, apiKey: process.env.NECO_API_KEY },
    jamb: { baseUrl: process.env.JAMB_API_BASE_URL, apiKey: process.env.JAMB_API_KEY }
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '200', 10)
  }
};
