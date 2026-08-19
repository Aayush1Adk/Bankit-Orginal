const express = require("express");
const authController = require("../controllers/authController.js");
const authMiddleware = require("../middleware/middleware.js");
const multer = require("multer")

const upload = multer({
    storage: multer.memoryStorage()
})




const router = express.Router();

router.post("/register", authMiddleware,upload.single(["profile",{maxCount:1}]),authController.registerUser);