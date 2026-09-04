const express = require("express");
const transactionController = require("../controllers/transactionController.js");
const authMiddleware = require("../middleware/middleware.js");

const router = express.Router();

router.post("/transfer", authMiddleware.authMiddleware, authMiddleware.transferMiddleware ,transactionController.createTransfer);
router.post("/deposit", authMiddleware.authMiddleware, authMiddleware.depositMiddleware ,transactionController.createDeposit);
router.post("/withdrawal", authMiddleware.authMiddleware, authMiddleware.createWithdrawalMiddleware ,transactionController.createWithdrawal);

module.exports = router