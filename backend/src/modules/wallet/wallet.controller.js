const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');
const walletService = require('./wallet.service');
const prisma = require('../../config/db');

const getWalletHandler = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user.id);
  return success(res, 200, 'Wallet retrieved.', wallet);
});

const getHistoryHandler = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, status } = req.query;
  const result = await walletService.getTransactionHistory(req.user.id, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    type,
    status
  });
  return success(res, 200, 'Transaction history retrieved.', result.items, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages
  });
});

const fundWalletHandler = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  const result = await walletService.initiateFunding(req.user.id, Number(amount), user.email);
  return success(res, 200, 'Payment initialized.', result);
});

const confirmFundingHandler = asyncHandler(async (req, res) => {
  const { reference } = req.body;
  const transaction = await walletService.confirmFunding(reference);
  return success(res, 200, 'Wallet funded successfully.', transaction);
});

module.exports = {
  getWalletHandler,
  getHistoryHandler,
  fundWalletHandler,
  confirmFundingHandler
};
