const swaggerJsdoc = require('swagger-jsdoc');
const env = require('../config/env');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DeenByte Digital Services API',
      version: '1.0.0',
      description:
        'REST API for DeenByte Digital Services — wallet, payments, and digital service purchases (airtime, data, electricity, cable TV, NIN/BVN verification, CAC, WAEC/NECO/JAMB).'
    },
    servers: [{ url: `${env.appUrl}/api`, description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
    tags: [
      { name: 'Auth' },
      { name: 'User' },
      { name: 'Wallet' },
      { name: 'Services' },
      { name: 'Notifications' },
      { name: 'Admin' },
      { name: 'Payments' }
    ]
  },
  apis: ['./src/modules/**/*.routes.js', './src/payments/*.routes.js']
};

module.exports = swaggerJsdoc(options);
