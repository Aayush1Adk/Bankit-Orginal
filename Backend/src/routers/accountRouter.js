const express = require("express");
const multer = require("multer")
const accountController = require("../controllers/accountController.js");
const authMiddleware = require("../middleware/middleware.js");

const upload = multer({
    storage: multer.memoryStorage()
})

const router = express.Router();

router.post("/create", authMiddleware, upload.single("profile"), accountController.accountCreation);
router.get("/get", authMiddleware, accountController.getAccount);
router.get("/get",authMiddleware, accountController.getBalance);

module.exports = router