const express = require("express");
const transactionController = require("../controllers/transactionController.js");
const authMiddleware = require("../middleware/middleware.js");

const router = express.Router();

router.post("/create", authMiddleware, transactionController.createTransaction);

module.exports = router