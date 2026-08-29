const express = require("express");
const authController = require("../controllers/authController.js");



const router = express.Router();

router.post("/register",authController.registerUser);
router.post("/register/verifyEmail", authController.verifyEmail);
router.post("/register/sendOTP", authController.sendOTP);
router.post("/login", authController.loginUser);
router.post("/forgetPassword", authController.forgetPassword);
router.post("/resetPassword", authController.resetPassword);
router.post("/logout", authController.logoutUser);


module.exports = router