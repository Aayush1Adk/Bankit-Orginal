const express = require("express");
const authController = require("../controllers/authController.js");
const authMiddleware

const router = express.Router();

router.post("/register", authMiddleware ,authController.registerUser);