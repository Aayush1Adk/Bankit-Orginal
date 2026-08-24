const express = require("express");
const authController = require("../controllers/authController.js");
const authMiddleware = require("../middleware/middleware.js");
const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage()
})

const router = express.Router();

router.post("/register", upload.single("profile"),authController.registerUser);
router.post("/register/verifyEmail", authController.verifyEmail);
router.post("/login", authController.loginUser, authMiddleware);
router.post("/login/verifyOTP", authController.verifyLoginOTP,authMiddleware);


module.exports = router