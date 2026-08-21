const express = require("express");
const multer = require("multer");
const cookieParser = require("cookie-parser")

const authRouter = require("../src/routers/authRouter.js");

const app = express();



app.use(express.json());
app.use(cookieParser())
app.use("/api/auth", authRouter);

module.exports = app;