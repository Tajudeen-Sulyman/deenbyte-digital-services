const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SERVICES = [
  {
    code: 'AIRTIME_ALL',
    name: 'Airtime Top-Up',
    category: 'AIRTIME',
    provider: 'vtu',
    feePercent: 0,
    minAmount: 50,
    maxAmount: 50000,
    fieldsSchema: {
      fields: [
        { name: 'network', label: 'Network', type: 'select', options: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'], required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true }
      ]
    }
  },
  {
    code: 'DATA_ALL',
    name: 'Data Bundle',
    category: 'DATA',
    provider: 'vtu',
    feePercent: 0,
    minAmount: 100,
    maxAmount: 50000,
    fieldsSchema: {
      fields: [
        { name: 'network', label: 'Network', type: 'select', options: ['MTN', 'GLO', 'AIRTEL', '9MOBILE'], required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'plan', label: 'Data Plan', type: 'select', options: ['1GB - 30 Days', '2GB - 30 Days', '5GB - 30 Days', '10GB - 30 Days'], required: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true }
      ]
    }
  },
  {
    code: 'ELECTRICITY_ALL',
    name: 'Electricity Bill',
    category: 'ELECTRICITY',
    provider: 'vtu',
    feeFlat: 50,
    minAmount: 500,
    maxAmount: 200000,
    fieldsSchema: {
      fields: [
        { name: 'disco', label: 'Distribution Company', type: 'select', options: ['IKEDC', 'EKEDC', 'AEDC', 'PHED', 'KEDCO'], required: true },
        { name: 'meterType', label: 'Meter Type', type: 'select', options: ['PREPAID', 'POSTPAID'], required: true },
        { name: 'meterNumber', label: 'Meter Number', type: 'text', required: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true }
      ]
    }
  },
  {
    code: 'CABLE_TV_ALL',
    name: 'Cable TV Subscription',
    category: 'CABLE_TV',
    provider: 'vtu',
    feeFlat: 0,
    minAmount: 500,
    maxAmount: 100000,
    fieldsSchema: {
      fields: [
        { name: 'provider_name', label: 'Provider', type: 'select', options: ['DSTV', 'GOTV', 'STARTIMES'], required: true },
        { name: 'smartCardNumber', label: 'Smart Card / IUC Number', type: 'text', required: true },
        { name: 'plan', label: 'Bouquet', type: 'text', required: true },
        { name: 'amount', label: 'Amount', type: 'number', required: true }
      ]
    }
  },
  {
    code: 'NIN_VERIFICATION',
    name: 'NIN Verification',
    category: 'NIN_VERIFICATION',
    provider: 'nimc',
    feeFlat: 200,
    fieldsSchema: {
      fields: [
        { name: 'nin', label: 'NIN Number', type: 'text', required: true },
        { name: 'fullName', label: 'Full Name (as on NIN)', type: 'text', required: true }
      ]
    }
  },
  {
    code: 'BVN_VERIFICATION',
    name: 'BVN Verification',
    category: 'BVN_VERIFICATION',
    provider: 'bvn',
    feeFlat: 150,
    fieldsSchema: {
      fields: [
        { name: 'bvn', label: 'BVN Number', type: 'text', required: true }
      ]
    }
  },
  {
    code: 'CAC_REGISTRATION',
    name: 'CAC Business Registration',
    category: 'CAC_REGISTRATION',
    provider: 'cac',
    feeFlat: 15000,
    fieldsSchema: {
      fields: [
        { name: 'businessName', label: 'Proposed Business Name', type: 'text', required: true },
        { name: 'businessType', label: 'Business Type', type: 'select', options: ['Business Name', 'Limited Liability Company'], required: true },
        { name: 'ownerFullName', label: 'Owner Full Name', type: 'text', required: true }
      ]
    }
  },
  {
    code: 'WAEC_PIN',
    name: 'WAEC Result Checker PIN',
    category: 'WAEC_PIN',
    provider: 'waec',
    feeFlat: 3500,
    fieldsSchema: { fields: [{ name: 'quantity', label: 'Quantity', type: 'number', required: true }] }
  },
  {
    code: 'NECO_PIN',
    name: 'NECO Result Checker PIN',
    category: 'NECO_PIN',
    provider: 'neco',
    feeFlat: 1200,
    fieldsSchema: { fields: [{ name: 'quantity', label: 'Quantity', type: 'number', required: true }] }
  },
  {
    code: 'JAMB_PIN',
    name: 'JAMB ePIN',
    category: 'JAMB',
    provider: 'jamb',
    feeFlat: 5700,
    fieldsSchema: {
      fields: [
        { name: 'pinType', label: 'PIN Type', type: 'select', options: ['UTME', 'DE'], required: true },
        { name: 'profileCode', label: 'JAMB Profile Code', type: 'text', required: false }
      ]
    }
  }
];

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('Admin@12345', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@deenbyte.com' },
    update: {},
    create: {
      email: 'admin@deenbyte.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isEmailVerified: true,
      profile: { create: { firstName: 'DeenByte', lastName: 'Admin' } },
      wallet: { create: { balance: 0 } }
    }
  });
  console.log('Admin user:', admin.email);

  const customerPassword = await bcrypt.hash('Customer@12345', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@deenbyte.com' },
    update: {},
    create: {
      email: 'customer@deenbyte.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      isEmailVerified: true,
      profile: { create: { firstName: 'Test', lastName: 'Customer' } },
      wallet: { create: { balance: 5000 } }
    }
  });
  console.log('Customer user:', customer.email);

  for (const svc of SERVICES) {
    await prisma.service.upsert({
      where: { code: svc.code },
      update: svc,
      create: svc
    });
  }
  console.log(`Seeded ${SERVICES.length} services`);

  await prisma.setting.upsert({
    where: { key: 'site_name' },
    update: {},
    create: { key: 'site_name', value: 'DeenByte Digital Services' }
  });
  await prisma.setting.upsert({
    where: { key: 'maintenance_mode' },
    update: {},
    create: { key: 'maintenance_mode', value: 'false' }
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
