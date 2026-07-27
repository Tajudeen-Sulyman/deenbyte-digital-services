const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

function generateReference(prefix = 'DB') {
  const ts = Date.now().toString(36).toUpperCase();
  return `${prefix}-${ts}-${nanoid()}`;
}

module.exports = { generateReference };
