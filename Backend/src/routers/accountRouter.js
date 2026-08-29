const accountCreation = require("../controllers/accountController.js");
const { authMiddleware } = require("../middleware/middleware.js");
const express = require("express");
const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage()
})

const router = express.Router();

router.post("/create", upload.single("profile"), accountCreation.accountCreation, authMiddleware);

module.exports = router